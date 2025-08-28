/**
 * Lemlist API Client
 * Comprehensive client for interacting with the Lemlist.com API
 */

import axios from 'axios';

export class LemlistClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseURL = 'https://api.lemlist.com/api';
    
    if (!this.apiKey) {
      throw new Error('LEMLIST_API_KEY is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey
      },
      timeout: 30000
    });

    this.setupRequestInterceptors();
  }

  setupRequestInterceptors() {
    // Request interceptor with retry tracking
    this.client.interceptors.request.use(
      (config) => {
        config.retryCount = config.retryCount || 0;
        console.error(`[Lemlist API] ${config.method?.toUpperCase()} ${config.url} (attempt ${config.retryCount + 1})`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with enhanced error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log rate limit headers if available
        const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
        const rateLimitReset = response.headers['x-ratelimit-reset'];
        
        if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
          console.error(`[Lemlist API] Rate limit warning: ${rateLimitRemaining} requests remaining`);
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        console.error(`[Lemlist API Error] ${status || 'Unknown'}: ${errorMessage}`);
        
        // Handle rate limiting (429)
        if (status === 429 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const retryAfter = error.response.headers['retry-after'] || 60; // Default 60 seconds
          const retryAfterMs = parseInt(retryAfter) * 1000;
          
          console.error(`[Lemlist API] Rate limited, retrying after ${retryAfter}s`);
          await this.waitForRateLimit(retryAfterMs);
          
          return this.client(originalRequest);
        }
        
        // Handle server errors (5xx) with exponential backoff retry
        if (status >= 500 && status < 600 && originalRequest && !originalRequest._serverRetry) {
          originalRequest._serverRetry = true;
          originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
          
          if (originalRequest.retryCount <= 3) {
            const delay = Math.pow(2, originalRequest.retryCount) * 1000; // Exponential backoff
            console.error(`[Lemlist API] Server error, retrying in ${delay}ms`);
            
            await this.delay(delay);
            return this.client(originalRequest);
          }
        }
        
        // Enhance error object with additional context
        const enhancedError = new Error(errorMessage);
        enhancedError.status = status;
        enhancedError.response = error.response;
        enhancedError.isLemlistError = true;
        enhancedError.retryable = this.isRetryableError(status);
        enhancedError.rateLimited = status === 429;
        enhancedError.serverError = status >= 500;
        
        return Promise.reject(enhancedError);
      }
    );
  }

  // === CAMPAIGN MANAGEMENT ===
  
  async getCampaigns(options = {}) {
    const { limit = 100, offset = 0 } = options;
    const response = await this.client.get('/campaigns', {
      params: { limit, offset }
    });
    return response.data;
  }

  async getCampaign(campaignId) {
    const response = await this.client.get(`/campaigns/${campaignId}`);
    return response.data;
  }

  async createCampaign(campaignData) {
    const { name, emails = [], settings = {} } = campaignData;
    
    const payload = {
      name,
      options: {
        trackOpens: settings.trackOpens ?? true,
        trackClicks: settings.trackClicks ?? true,
        ...settings
      }
    };

    const response = await this.client.post('/campaigns', payload);
    const campaign = response.data;

    // Add email sequence if provided
    if (emails.length > 0) {
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        await this.addEmailToCampaign(campaign.id, {
          ...email,
          position: i + 1
        });
      }
    }

    return campaign;
  }

  async updateCampaign(campaignId, updates) {
    const response = await this.client.patch(`/campaigns/${campaignId}`, updates);
    return response.data;
  }

  async deleteCampaign(campaignId) {
    const response = await this.client.delete(`/campaigns/${campaignId}`);
    return { success: true, campaignId };
  }

  async addEmailToCampaign(campaignId, emailData) {
    const { subject, body, delay = 0, position = 1 } = emailData;
    
    const payload = {
      subject,
      body,
      delay,
      position
    };

    const response = await this.client.post(`/campaigns/${campaignId}/emails`, payload);
    return response.data;
  }

  // === LEAD MANAGEMENT ===

  async getLeads(options = {}) {
    const { campaignId, limit = 100, offset = 0 } = options;
    let url = '/leads';
    const params = { limit, offset };

    if (campaignId) {
      url = `/campaigns/${campaignId}/leads`;
    }

    const response = await this.client.get(url, { params });
    return response.data;
  }

  async addLead(leadData) {
    const { campaignId, email, firstName, lastName, companyName, customFields = {} } = leadData;
    
    const payload = {
      email,
      firstName,
      lastName,
      companyName,
      ...customFields
    };

    const response = await this.client.post(`/campaigns/${campaignId}/leads`, payload);
    return response.data;
  }

  async bulkAddLeads(campaignId, leads) {
    console.error(`[Lemlist API] Starting bulk add of ${leads.length} leads to campaign ${campaignId}`);
    
    return await this.handleBulkOperation(
      leads,
      (lead) => this.addLead({ ...lead, campaignId }),
      10, // Batch size
      1000 // Delay between batches
    );
  }

  async updateLead(leadId, updates) {
    const response = await this.client.patch(`/leads/${leadId}`, updates);
    return response.data;
  }

  async deleteLead(leadId) {
    const response = await this.client.delete(`/leads/${leadId}`);
    return { success: true, leadId };
  }

  // === ACTIVITY & ANALYTICS ===

  async getActivities(options = {}) {
    const { campaignId, leadId, type, limit = 100 } = options;
    const params = { limit };

    if (type) params.type = type;
    if (leadId) params.leadId = leadId;

    let url = '/activities';
    if (campaignId) {
      url = `/campaigns/${campaignId}/activities`;
    }

    const response = await this.client.get(url, { params });
    return response.data;
  }

  async getCampaignStats(campaignId) {
    const response = await this.client.get(`/campaigns/${campaignId}/stats`);
    return response.data;
  }

  // === TEAM & ACCOUNT MANAGEMENT ===

  async getTeamMembers() {
    const response = await this.client.get('/team');
    return response.data;
  }

  async getAccountInfo() {
    const response = await this.client.get('/account');
    return response.data;
  }

  // === TEMPLATES ===

  async getTemplates(options = {}) {
    const { limit = 100 } = options;
    const response = await this.client.get('/templates', {
      params: { limit }
    });
    return response.data;
  }

  async createTemplate(templateData) {
    const { name, subject, body, variables = [] } = templateData;
    
    const payload = {
      name,
      subject,
      body,
      variables
    };

    const response = await this.client.post('/templates', payload);
    return response.data;
  }

  // === HIGH-LEVEL WORKFLOW TOOLS ===

  async createCompleteCampaign(campaignData) {
    const { campaignName, emailSequence, leads = [], settings = {} } = campaignData;

    // Step 1: Create campaign
    const campaign = await this.createCampaign({
      name: campaignName,
      emails: emailSequence,
      settings
    });

    // Step 2: Add leads if provided
    let leadResults = null;
    if (leads.length > 0) {
      leadResults = await this.bulkAddLeads(campaign.id, leads);
    }

    // Step 3: Start campaign (if it's not auto-started)
    try {
      await this.startCampaign(campaign.id);
    } catch (error) {
      console.error('Campaign start failed (may already be started):', error.message);
    }

    return {
      campaign,
      leadResults,
      summary: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        emailsInSequence: emailSequence.length,
        leadsAdded: leadResults?.successful || 0,
        leadsFailed: leadResults?.failed || 0
      }
    };
  }

  async startCampaign(campaignId) {
    const response = await this.client.post(`/campaigns/${campaignId}/start`);
    return response.data;
  }

  async pauseCampaign(campaignId) {
    const response = await this.client.post(`/campaigns/${campaignId}/pause`);
    return response.data;
  }

  // === UNSUBSCRIBE MANAGEMENT ===

  async getUnsubscribes(options = {}) {
    const { limit = 100, offset = 0 } = options;
    const response = await this.client.get('/unsubscribes', {
      params: { limit, offset }
    });
    return response.data;
  }

  async addToUnsubscribes(email) {
    const response = await this.client.post('/unsubscribes', { email });
    return response.data;
  }

  async removeFromUnsubscribes(email) {
    const response = await this.client.delete(`/unsubscribes/${encodeURIComponent(email)}`);
    return { success: true, email };
  }

  async unsubscribeFromCampaign(campaignId, leadId) {
    const response = await this.client.delete(`/campaigns/${campaignId}/leads/${leadId}/unsubscribe`);
    return response.data;
  }

  // === ADVANCED ACTIVITIES ===

  async getActivitiesWithFilters(filters = {}) {
    const {
      campaignId,
      leadId,
      type,
      dateFrom,
      dateTo,
      limit = 100,
      offset = 0,
      grouped = false
    } = filters;

    const params = { limit, offset };
    if (campaignId) params.campaignId = campaignId;
    if (leadId) params.leadId = leadId;
    if (type) params.type = type;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (grouped) params.grouped = grouped;

    const response = await this.client.get('/activities', { params });
    return response.data;
  }

  async getActivityTypes() {
    const response = await this.client.get('/activities/types');
    return response.data;
  }

  async getGroupedActivities(campaignId, groupBy = 'type') {
    const response = await this.client.get(`/campaigns/${campaignId}/activities/grouped`, {
      params: { groupBy }
    });
    return response.data;
  }

  // === LEAD IMPORT/EXPORT ===

  async exportLeads(campaignId, format = 'csv') {
    const response = await this.client.get(`/campaigns/${campaignId}/leads/export`, {
      params: { format },
      responseType: format === 'csv' ? 'text' : 'json'
    });
    return response.data;
  }

  async importLeadsFromCSV(campaignId, csvData, options = {}) {
    const formData = new FormData();
    formData.append('file', csvData);
    formData.append('options', JSON.stringify(options));

    const response = await this.client.post(`/campaigns/${campaignId}/leads/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async validateLeadData(leads) {
    const response = await this.client.post('/leads/validate', { leads });
    return response.data;
  }

  // === ENHANCED CAMPAIGN STATISTICS ===

  async getDetailedCampaignStats(campaignId, options = {}) {
    const { 
      dateFrom, 
      dateTo, 
      includeLeadStats = true, 
      includeEmailStats = true,
      includeLinkedInStats = false 
    } = options;

    const params = {
      includeLeadStats,
      includeEmailStats,
      includeLinkedInStats
    };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await this.client.get(`/campaigns/${campaignId}/stats/detailed`, { params });
    return response.data;
  }

  async getCampaignPerformanceMetrics(campaignId) {
    const response = await this.client.get(`/campaigns/${campaignId}/metrics`);
    return response.data;
  }

  async getMultiCampaignStats(campaignIds, dateRange = {}) {
    const response = await this.client.post('/campaigns/stats/bulk', {
      campaignIds,
      ...dateRange
    });
    return response.data;
  }

  // === TEAM MANAGEMENT ===

  async getTeamMemberDetails(memberId) {
    const response = await this.client.get(`/team/${memberId}`);
    return response.data;
  }

  async updateTeamMember(memberId, updates) {
    const response = await this.client.patch(`/team/${memberId}`, updates);
    return response.data;
  }

  async getTeamPermissions() {
    const response = await this.client.get('/team/permissions');
    return response.data;
  }

  // === WEBHOOKS ===

  async createWebhook(webhookData) {
    const { url, events, active = true } = webhookData;
    const response = await this.client.post('/webhooks', {
      targetUrl: url,
      events,
      active
    });
    return response.data;
  }

  async getWebhooks() {
    const response = await this.client.get('/webhooks');
    return response.data;
  }

  async updateWebhook(webhookId, updates) {
    const response = await this.client.patch(`/webhooks/${webhookId}`, updates);
    return response.data;
  }

  async deleteWebhook(webhookId) {
    const response = await this.client.delete(`/webhooks/${webhookId}`);
    return { success: true, webhookId };
  }

  async testWebhook(webhookId) {
    const response = await this.client.post(`/webhooks/${webhookId}/test`);
    return response.data;
  }

  // === LEAD ENRICHMENT ===

  async enrichLead(email, enrichmentOptions = {}) {
    const response = await this.client.post('/leads/enrich', {
      email,
      options: enrichmentOptions
    });
    return response.data;
  }

  async bulkEnrichLeads(emails, enrichmentOptions = {}) {
    const response = await this.client.post('/leads/enrich/bulk', {
      emails,
      options: enrichmentOptions
    });
    return response.data;
  }

  // === ADVANCED SEARCH ===

  async searchLeadsAdvanced(searchQuery) {
    const {
      email,
      firstName,
      lastName,
      companyName,
      campaignId,
      status,
      dateFrom,
      dateTo,
      customFields = {},
      limit = 100,
      offset = 0
    } = searchQuery;

    const params = { limit, offset };
    if (email) params.email = email;
    if (firstName) params.firstName = firstName;
    if (lastName) params.lastName = lastName;
    if (companyName) params.companyName = companyName;
    if (campaignId) params.campaignId = campaignId;
    if (status) params.status = status;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    // Add custom fields to search
    Object.entries(customFields).forEach(([key, value]) => {
      params[`customField.${key}`] = value;
    });

    const response = await this.client.get('/leads/search', { params });
    return response.data;
  }

  async searchCampaigns(searchQuery) {
    const { name, status, dateFrom, dateTo, limit = 100, offset = 0 } = searchQuery;
    const params = { limit, offset };
    
    if (name) params.name = name;
    if (status) params.status = status;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await this.client.get('/campaigns/search', { params });
    return response.data;
  }

  // === RATE LIMITING HELPERS ===

  async getRateLimitStatus() {
    const response = await this.client.get('/rate-limits');
    return response.data;
  }

  async waitForRateLimit(retryAfter = null) {
    const waitTime = retryAfter || 1000; // Default 1 second
    console.error(`[Lemlist API] Rate limit hit, waiting ${waitTime}ms`);
    await this.delay(waitTime);
  }

  // === UTILITY METHODS ===

  async healthCheck() {
    try {
      const accountInfo = await this.getAccountInfo();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        account: {
          id: accountInfo.id,
          email: accountInfo.email,
          planType: accountInfo.planType || 'unknown'
        },
        apiConnection: 'active'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isRetryableError(status) {
    // Determine if an error is retryable
    return status === 429 || // Rate limit
           status === 408 || // Request timeout
           status === 502 || // Bad gateway
           status === 503 || // Service unavailable
           status === 504;   // Gateway timeout
  }

  async executeWithRetry(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!error.isLemlistError || !error.retryable || attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.error(`[Lemlist API] Attempt ${attempt} failed, retrying in ${delay}ms`);
        
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  async handleBulkOperation(items, operation, batchSize = 10, delayBetweenBatches = 1000) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.error(`[Lemlist API] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
      
      const batchPromises = batch.map(async (item, index) => {
        try {
          const result = await this.executeWithRetry(() => operation(item));
          return { success: true, item, result, index: i + index };
        } catch (error) {
          return { 
            success: false, 
            item, 
            error: {
              message: error.message,
              status: error.status,
              retryable: error.retryable
            }, 
            index: i + index 
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < items.length) {
        await this.delay(delayBetweenBatches);
      }
    }
    
    return {
      successful: results.length,
      failed: errors.length,
      total: items.length,
      successfulResults: results,
      errors: errors,
      successRate: results.length / items.length
    };
  }

  // === ADVANCED FEATURES ===

  async searchLeads(query, options = {}) {
    const { campaignId, limit = 100 } = options;
    const params = { query, limit };
    
    let url = '/leads/search';
    if (campaignId) {
      url = `/campaigns/${campaignId}/leads/search`;
    }

    const response = await this.client.get(url, { params });
    return response.data;
  }

  async exportCampaignData(campaignId, format = 'json') {
    const [campaign, leads, stats, activities] = await Promise.all([
      this.getCampaign(campaignId),
      this.getLeads({ campaignId }),
      this.getCampaignStats(campaignId),
      this.getActivities({ campaignId })
    ]);

    const exportData = {
      campaign,
      leads,
      stats,
      activities,
      exportedAt: new Date().toISOString(),
      format
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return exportData;
  }

  convertToCSV(data) {
    // Simplified CSV conversion for leads
    if (!data.leads || data.leads.length === 0) {
      return 'No leads data available';
    }

    const headers = ['Email', 'First Name', 'Last Name', 'Company', 'Status'];
    const rows = data.leads.map(lead => [
      lead.email || '',
      lead.firstName || '',
      lead.lastName || '',
      lead.companyName || '',
      lead.status || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // === ERROR HANDLING & VALIDATION ===

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateCampaignData(campaignData) {
    const errors = [];

    if (!campaignData.name || campaignData.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    if (campaignData.emails) {
      campaignData.emails.forEach((email, index) => {
        if (!email.subject) {
          errors.push(`Email ${index + 1}: Subject is required`);
        }
        if (!email.body) {
          errors.push(`Email ${index + 1}: Body is required`);
        }
      });
    }

    return errors;
  }

  validateLeadData(leadData) {
    const errors = [];

    if (!leadData.email) {
      errors.push('Email is required');
    } else if (!this.validateEmail(leadData.email)) {
      errors.push('Invalid email format');
    }

    if (!leadData.campaignId) {
      errors.push('Campaign ID is required');
    }

    return errors;
  }
}