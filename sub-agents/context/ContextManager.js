/**
 * Context Management System for Sub-Agent Architecture
 * Manages project context, specialist consultations, and learning patterns
 */

export class ContextManager {
  constructor(config = {}) {
    this.config = config;
    this.storage = {
      projectContext: new ProjectContextStorage(),
      specialistCache: new SpecialistCacheStorage(),
      patternLibrary: new PatternLibraryStorage(),
      analyticsLog: new AnalyticsLogStorage()
    };
    this.learningEnabled = config.learningEnabled ?? true;
    this.cacheExpiration = config.cacheExpiration || '24h';
  }

  async updateProjectContext(context) {
    const contextUpdate = {
      architecturalDecisions: context.decisions || [],
      currentState: context.state || {},
      constraints: context.constraints || [],
      objectives: context.objectives || [],
      timestamp: new Date().toISOString(),
      version: await this.getNextContextVersion()
    };

    await this.storage.projectContext.update(contextUpdate);
    
    if (this.learningEnabled) {
      await this.updateLearningPatterns(contextUpdate);
    }

    return contextUpdate;
  }

  async cacheSpecialistConsultation(consultation) {
    const cacheEntry = {
      specialist: consultation.specialist,
      task: consultation.task,
      recommendation: consultation.recommendation,
      outcome: consultation.outcome,
      quality: consultation.quality,
      cacheKey: this.generateCacheKey(consultation),
      expirationTime: this.calculateExpiration(consultation),
      timestamp: new Date().toISOString()
    };

    await this.storage.specialistCache.store(cacheEntry);
    
    // Update specialist performance metrics
    await this.updateSpecialistMetrics(consultation);
    
    return cacheEntry;
  }

  async retrieveSpecialistCache(task, specialist) {
    const cacheKey = this.generateCacheKey({ task, specialist });
    const cachedEntry = await this.storage.specialistCache.get(cacheKey);
    
    if (!cachedEntry) return null;
    if (this.isCacheExpired(cachedEntry)) {
      await this.storage.specialistCache.remove(cacheKey);
      return null;
    }

    // Update cache hit metrics
    await this.recordCacheHit(cacheKey);
    
    return cachedEntry;
  }

  async getProjectContext() {
    return await this.storage.projectContext.getCurrent();
  }

  async getRelevantPatterns(task) {
    const patterns = await this.storage.patternLibrary.search({
      domain: task.domain,
      technologies: task.technologies,
      complexity: task.complexity,
      similarityThreshold: 0.7
    });

    return patterns.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async storeSuccessPattern(consultation, outcome) {
    if (!outcome.successful) return;

    const pattern = {
      id: this.generatePatternId(),
      task: this.normalizeTask(consultation.task),
      specialist: consultation.specialist,
      approach: consultation.recommendation,
      outcome: outcome,
      successMetrics: {
        qualityScore: outcome.qualityScore,
        userSatisfaction: outcome.userSatisfaction,
        implementationTime: outcome.implementationTime
      },
      context: await this.getProjectContext(),
      timestamp: new Date().toISOString(),
      usageCount: 1,
      successRate: 1.0
    };

    await this.storage.patternLibrary.store(pattern);
    return pattern;
  }

  async updatePatternUsage(patternId, outcome) {
    const pattern = await this.storage.patternLibrary.get(patternId);
    if (!pattern) return;

    pattern.usageCount += 1;
    pattern.successRate = (pattern.successRate * (pattern.usageCount - 1) + 
                          (outcome.successful ? 1 : 0)) / pattern.usageCount;
    
    pattern.lastUsed = new Date().toISOString();
    
    if (outcome.successful) {
      pattern.successMetrics = this.updateSuccessMetrics(
        pattern.successMetrics, 
        outcome
      );
    }

    await this.storage.patternLibrary.update(pattern);
    return pattern;
  }

  generateCacheKey(consultation) {
    const { task, specialist } = consultation;
    const taskFingerprint = this.generateTaskFingerprint(task);
    return `${specialist}_${taskFingerprint}`;
  }

  generateTaskFingerprint(task) {
    const key = {
      domain: task.domain,
      technologies: task.technologies?.sort(),
      complexity: Math.floor(task.complexity / 2) * 2, // Group by complexity ranges
      patterns: task.patterns?.sort()
    };
    
    return this.hashObject(key);
  }

  calculateExpiration(consultation) {
    const baseExpiration = this.parseTimeString(this.cacheExpiration);
    const complexity = consultation.task.complexity || 5;
    
    // More complex tasks have longer cache expiration
    const complexityMultiplier = Math.min(complexity / 5, 2);
    const expirationMs = baseExpiration * complexityMultiplier;
    
    return new Date(Date.now() + expirationMs).toISOString();
  }

  isCacheExpired(cacheEntry) {
    return new Date() > new Date(cacheEntry.expirationTime);
  }

  async updateSpecialistMetrics(consultation) {
    const metrics = await this.storage.analyticsLog.getSpecialistMetrics(
      consultation.specialist
    ) || this.initializeSpecialistMetrics();

    metrics.totalConsultations += 1;
    
    if (consultation.outcome?.successful) {
      metrics.successfulConsultations += 1;
    }
    
    metrics.averageQualityScore = this.updateAverage(
      metrics.averageQualityScore,
      consultation.quality?.score || 0.5,
      metrics.totalConsultations
    );
    
    metrics.lastConsultation = new Date().toISOString();
    
    await this.storage.analyticsLog.updateSpecialistMetrics(
      consultation.specialist,
      metrics
    );
  }

  async recordCacheHit(cacheKey) {
    await this.storage.analyticsLog.recordEvent({
      type: 'cache_hit',
      cacheKey,
      timestamp: new Date().toISOString()
    });
  }

  async getNextContextVersion() {
    const current = await this.storage.projectContext.getCurrent();
    return (current?.version || 0) + 1;
  }

  async updateLearningPatterns(contextUpdate) {
    const patterns = await this.identifyNewPatterns(contextUpdate);
    
    for (const pattern of patterns) {
      await this.storage.patternLibrary.store(pattern);
    }
    
    return patterns;
  }

  async identifyNewPatterns(contextUpdate) {
    // Simplified pattern identification
    const patterns = [];
    
    if (contextUpdate.architecturalDecisions?.length > 0) {
      for (const decision of contextUpdate.architecturalDecisions) {
        patterns.push({
          id: this.generatePatternId(),
          type: 'architectural-decision',
          decision: decision,
          context: contextUpdate.currentState,
          timestamp: contextUpdate.timestamp
        });
      }
    }
    
    return patterns;
  }

  normalizeTask(task) {
    return {
      domain: task.domain,
      technologies: task.technologies?.sort() || [],
      complexity: Math.floor((task.complexity || 5) / 2) * 2,
      patterns: task.patterns?.sort() || [],
      requirements: task.requirements?.sort() || []
    };
  }

  updateSuccessMetrics(currentMetrics, outcome) {
    const count = currentMetrics.count || 1;
    const newCount = count + 1;
    
    return {
      qualityScore: this.updateAverage(
        currentMetrics.qualityScore,
        outcome.qualityScore,
        newCount
      ),
      userSatisfaction: this.updateAverage(
        currentMetrics.userSatisfaction,
        outcome.userSatisfaction,
        newCount
      ),
      implementationTime: this.updateAverage(
        currentMetrics.implementationTime,
        outcome.implementationTime,
        newCount
      ),
      count: newCount
    };
  }

  updateAverage(currentAvg, newValue, count) {
    if (count <= 1) return newValue;
    return ((currentAvg * (count - 1)) + newValue) / count;
  }

  generatePatternId() {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashObject(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  parseTimeString(timeStr) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };
    
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours
    
    const [, number, unit] = match;
    return parseInt(number) * units[unit];
  }

  initializeSpecialistMetrics() {
    return {
      totalConsultations: 0,
      successfulConsultations: 0,
      averageQualityScore: 0,
      lastConsultation: null,
      firstConsultation: new Date().toISOString()
    };
  }

  // Analytics and reporting methods
  async getContextAnalytics() {
    const analytics = {
      cacheHitRate: await this.calculateCacheHitRate(),
      patternUsage: await this.getPatternUsageStats(),
      specialistPerformance: await this.getSpecialistPerformanceStats(),
      contextEvolution: await this.getContextEvolutionStats()
    };
    
    return analytics;
  }

  async calculateCacheHitRate() {
    const cacheEvents = await this.storage.analyticsLog.getEventsByType('cache_hit');
    const totalRequests = await this.storage.analyticsLog.getEventsByType('cache_request');
    
    if (totalRequests.length === 0) return 0;
    return cacheEvents.length / totalRequests.length;
  }

  async getPatternUsageStats() {
    const patterns = await this.storage.patternLibrary.getAll();
    
    return {
      totalPatterns: patterns.length,
      activePatterns: patterns.filter(p => p.usageCount > 1).length,
      averageSuccessRate: patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length,
      topPatterns: patterns
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          domain: p.task.domain,
          usageCount: p.usageCount,
          successRate: p.successRate
        }))
    };
  }

  async getSpecialistPerformanceStats() {
    return await this.storage.analyticsLog.getAllSpecialistMetrics();
  }

  async getContextEvolutionStats() {
    const contexts = await this.storage.projectContext.getHistory();
    
    return {
      totalVersions: contexts.length,
      avgDecisionsPerVersion: contexts.reduce((sum, c) => 
        sum + (c.architecturalDecisions?.length || 0), 0) / contexts.length,
      evolutionTrend: this.calculateEvolutionTrend(contexts)
    };
  }

  calculateEvolutionTrend(contexts) {
    if (contexts.length < 2) return 'stable';
    
    const recent = contexts.slice(-5);
    const changeRate = recent.reduce((sum, context, index) => {
      if (index === 0) return sum;
      const prevContext = recent[index - 1];
      const changeCount = this.countChanges(prevContext, context);
      return sum + changeCount;
    }, 0) / (recent.length - 1);
    
    if (changeRate > 10) return 'rapid';
    if (changeRate > 5) return 'moderate';
    return 'stable';
  }

  countChanges(prev, current) {
    let changes = 0;
    
    // Count new architectural decisions
    const prevDecisions = new Set(prev.architecturalDecisions?.map(d => d.id) || []);
    const currentDecisions = current.architecturalDecisions || [];
    
    changes += currentDecisions.filter(d => !prevDecisions.has(d.id)).length;
    
    // Count constraint changes
    const prevConstraints = new Set(prev.constraints || []);
    const currentConstraints = new Set(current.constraints || []);
    
    changes += this.setDifference(currentConstraints, prevConstraints).size;
    changes += this.setDifference(prevConstraints, currentConstraints).size;
    
    return changes;
  }

  setDifference(setA, setB) {
    return new Set([...setA].filter(x => !setB.has(x)));
  }
}

// Storage abstraction classes (would be implemented with actual storage backend)

class ProjectContextStorage {
  constructor() {
    this.contexts = new Map();
    this.currentVersion = 0;
  }

  async update(context) {
    this.currentVersion = context.version;
    this.contexts.set(context.version, context);
    return context;
  }

  async getCurrent() {
    return this.contexts.get(this.currentVersion);
  }

  async getHistory() {
    return Array.from(this.contexts.values()).sort((a, b) => b.version - a.version);
  }
}

class SpecialistCacheStorage {
  constructor() {
    this.cache = new Map();
  }

  async store(entry) {
    this.cache.set(entry.cacheKey, entry);
    return entry;
  }

  async get(cacheKey) {
    return this.cache.get(cacheKey);
  }

  async remove(cacheKey) {
    return this.cache.delete(cacheKey);
  }
}

class PatternLibraryStorage {
  constructor() {
    this.patterns = new Map();
  }

  async store(pattern) {
    this.patterns.set(pattern.id, pattern);
    return pattern;
  }

  async get(patternId) {
    return this.patterns.get(patternId);
  }

  async update(pattern) {
    this.patterns.set(pattern.id, pattern);
    return pattern;
  }

  async search(criteria) {
    const patterns = Array.from(this.patterns.values());
    
    return patterns.filter(pattern => {
      let relevanceScore = 0;
      
      if (pattern.task.domain === criteria.domain) relevanceScore += 10;
      
      const techMatches = criteria.technologies?.filter(tech =>
        pattern.task.technologies?.includes(tech)
      ).length || 0;
      relevanceScore += techMatches * 2;
      
      const complexityDiff = Math.abs((pattern.task.complexity || 5) - (criteria.complexity || 5));
      relevanceScore += Math.max(0, 5 - complexityDiff);
      
      pattern.relevanceScore = relevanceScore;
      return relevanceScore >= (criteria.similarityThreshold || 0.7) * 15;
    });
  }

  async getAll() {
    return Array.from(this.patterns.values());
  }
}

class AnalyticsLogStorage {
  constructor() {
    this.events = [];
    this.specialistMetrics = new Map();
  }

  async recordEvent(event) {
    this.events.push(event);
    return event;
  }

  async getEventsByType(type) {
    return this.events.filter(event => event.type === type);
  }

  async getSpecialistMetrics(specialist) {
    return this.specialistMetrics.get(specialist);
  }

  async updateSpecialistMetrics(specialist, metrics) {
    this.specialistMetrics.set(specialist, metrics);
    return metrics;
  }

  async getAllSpecialistMetrics() {
    return Object.fromEntries(this.specialistMetrics);
  }
}