/**
 * Sub-Agent Orchestrator - Main entry point for the sub-agent architecture
 * Coordinates task routing, specialist consultation, quality assurance, and learning
 */

import { TaskComplexityAnalyzer } from './routing/TaskComplexityAnalyzer.js';
import { TaskRouter } from './routing/TaskRouter.js';
import { SpecialistRegistry } from './specialists/SpecialistRegistry.js';
import { QualityAssurance } from './quality/QualityAssurance.js';
import { ContextManager } from './context/ContextManager.js';
import { ErrorRecoverySystem } from './recovery/ErrorRecoverySystem.js';
import fs from 'fs';
import path from 'path';

export class SubAgentOrchestrator {
  constructor(config = {}) {
    this.config = this.loadConfig(config);
    this.contextManager = new ContextManager(this.config.context);
    this.errorRecovery = new ErrorRecoverySystem(this.config.recovery);
    this.taskHistory = [];
    this.performanceMetrics = new Map();
  }

  async initialize() {
    console.error('[SubAgent] Initializing Sub-Agent Architecture...');
    
    // Load project context
    await this.contextManager.updateProjectContext({
      state: { initialized: true },
      objectives: ['lemlist-mcp-integration', 'email-campaign-automation'],
      constraints: ['api-rate-limits', 'data-privacy']
    });
    
    console.error('[SubAgent] Sub-Agent Architecture initialized successfully');
    return true;
  }

  async processTask(task, options = {}) {
    const taskId = this.generateTaskId();
    const startTime = Date.now();
    
    try {
      console.error(`[SubAgent] Processing task ${taskId}: ${task.description || 'Unknown task'}`);
      
      // Step 1: Analyze task complexity
      const complexityAnalysis = TaskComplexityAnalyzer.analyzeTask(task);
      console.error(`[SubAgent] Task complexity: ${complexityAnalysis.tier} (score: ${complexityAnalysis.overallScore.toFixed(2)})`);
      
      // Step 2: Route to appropriate specialist(s)
      const routing = TaskRouter.route(task, {
        projectContext: await this.contextManager.getProjectContext(),
        taskId,
        ...options
      });
      console.error(`[SubAgent] Routed to: ${routing.specialist || routing.complexity.tier}`);
      
      // Step 3: Check cache for similar tasks
      const cachedResult = await this.contextManager.retrieveSpecialistCache(task, routing.specialist);
      if (cachedResult && options.useCache !== false) {
        console.error(`[SubAgent] Cache hit for task ${taskId}`);
        return this.formatCachedResult(cachedResult, taskId);
      }
      
      // Step 4: Execute task through appropriate tier
      let result;
      let consultation = null;
      
      if (complexityAnalysis.tier === 'DIRECT') {
        result = await this.executeDirectImplementation(task, routing);
      } else {
        consultation = await this.executeSpecialistConsultation(task, routing);
        result = consultation.result;
      }
      
      // Step 5: Quality assurance validation
      if (consultation) {
        const qualityValidation = QualityAssurance.validateSpecialistRecommendation(
          consultation.specialist,
          consultation.recommendation,
          task
        );
        
        console.error(`[SubAgent] Quality score: ${qualityValidation.score.toFixed(2)} (${qualityValidation.qualityGrade})`);
        
        if (!qualityValidation.passed && qualityValidation.escalationNeeded) {
          console.error(`[SubAgent] Quality validation failed, attempting escalation...`);
          return await this.handleQualityFailure(task, consultation, qualityValidation);
        }
        
        consultation.quality = qualityValidation;
      }
      
      // Step 6: Update context and cache
      if (consultation) {
        await this.contextManager.cacheSpecialistConsultation(consultation);
      }
      
      // Step 7: Record success pattern
      const outcome = {
        successful: true,
        result: result,
        executionTime: Date.now() - startTime,
        qualityScore: consultation?.quality?.score || 0.9,
        userSatisfaction: 0.9 // Would be updated with actual feedback
      };
      
      if (consultation) {
        await this.contextManager.storeSuccessPattern(consultation, outcome);
      }
      
      // Step 8: Update performance metrics
      this.updatePerformanceMetrics(taskId, {
        complexity: complexityAnalysis.overallScore,
        tier: complexityAnalysis.tier,
        executionTime: outcome.executionTime,
        qualityScore: outcome.qualityScore,
        success: true
      });
      
      console.error(`[SubAgent] Task ${taskId} completed successfully in ${outcome.executionTime}ms`);
      
      return {
        taskId,
        success: true,
        result: result,
        metadata: {
          complexity: complexityAnalysis,
          routing: routing,
          quality: consultation?.quality,
          executionTime: outcome.executionTime,
          cacheUsed: false
        }
      };
      
    } catch (error) {
      console.error(`[SubAgent] Task ${taskId} failed:`, error.message);
      return await this.handleTaskFailure(taskId, task, error, startTime);
    }
  }

  async executeDirectImplementation(task, routing) {
    console.error('[SubAgent] Executing direct implementation...');
    
    // For direct implementation, we would execute the task immediately
    // This is a simplified version - in practice, this would contain
    // the actual implementation logic
    
    return {
      approach: 'direct-implementation',
      implementation: task.implementation || 'Direct task execution',
      confidence: 0.95,
      estimatedEffort: routing.estimatedTime || 30
    };
  }

  async executeSpecialistConsultation(task, routing) {
    const specialist = routing.specialist;
    const specialistInfo = SpecialistRegistry.getSpecialistCapabilities(specialist);
    
    console.error(`[SubAgent] Consulting ${specialistInfo?.name || specialist}...`);
    
    // Get relevant patterns from context
    const relevantPatterns = await this.contextManager.getRelevantPatterns(task);
    
    // Simulate specialist consultation
    // In a real implementation, this would involve more sophisticated
    // reasoning and possibly external AI model calls
    
    const recommendation = await this.generateSpecialistRecommendation(
      task, 
      specialist, 
      specialistInfo, 
      relevantPatterns
    );
    
    const consultation = {
      specialist,
      task,
      recommendation,
      patterns: relevantPatterns,
      timestamp: new Date().toISOString(),
      result: recommendation
    };
    
    return consultation;
  }

  async generateSpecialistRecommendation(task, specialist, specialistInfo, patterns) {
    // This is a simplified implementation
    // In practice, this would involve more sophisticated AI reasoning
    
    const recommendation = {
      approach: `${specialist}-consultation`,
      implementation: this.generateImplementationPlan(task, specialistInfo, patterns),
      rationale: this.generateRationale(task, specialistInfo),
      risks: this.identifyRisks(task, specialistInfo),
      timeline: this.estimateTimeline(task, specialistInfo),
      resources: this.identifyResources(task, specialistInfo),
      qualityMetrics: this.defineQualityMetrics(task),
      testingStrategy: this.defineTestingStrategy(task),
      confidence: this.calculateConfidence(task, specialistInfo, patterns)
    };
    
    return recommendation;
  }

  async handleQualityFailure(task, consultation, qualityValidation) {
    console.error('[SubAgent] Handling quality failure...');
    
    // Determine escalation strategy
    const escalation = ErrorRecoverySystem.autoEscalateTier(
      consultation.routing?.tier || 'TIER_1',
      {
        primaryCause: 'quality-validation-failure',
        severity: 10 - (qualityValidation.score * 10),
        qualityIssues: qualityValidation.improvements
      }
    );
    
    if (escalation.canEscalate) {
      console.error(`[SubAgent] Escalating to ${escalation.escalation.to}...`);
      
      // Re-route with higher tier
      const newTask = {
        ...task,
        escalation: {
          from: escalation.escalation.from,
          reason: escalation.escalation.reason,
          previousConsultation: consultation
        }
      };
      
      return await this.processTask(newTask, { tier: escalation.escalation.to });
    } else {
      // Cannot escalate further, return with quality issues noted
      return {
        success: false,
        error: 'Quality validation failed and cannot escalate further',
        consultation: consultation,
        qualityIssues: qualityValidation.improvements
      };
    }
  }

  async handleTaskFailure(taskId, task, error, startTime) {
    const executionTime = Date.now() - startTime;
    
    // Detect failure type
    const failureDetection = ErrorRecoverySystem.detectImplementationFailure(
      { error: error.message, task },
      { expectedSuccess: true }
    );
    
    console.error(`[SubAgent] Failure detected: ${failureDetection.severity}/10 severity`);
    
    // Attempt recovery if possible
    if (failureDetection.recoveryStrategy && !failureDetection.escalationNeeded) {
      console.error('[SubAgent] Attempting automatic recovery...');
      
      try {
        const recoveryResult = await this.executeRecoveryStrategy(
          task, 
          failureDetection.recoveryStrategy
        );
        
        if (recoveryResult.success) {
          console.error('[SubAgent] Recovery successful');
          return recoveryResult;
        }
      } catch (recoveryError) {
        console.error('[SubAgent] Recovery failed:', recoveryError.message);
      }
    }
    
    // Update performance metrics with failure
    this.updatePerformanceMetrics(taskId, {
      executionTime,
      success: false,
      error: error.message,
      severity: failureDetection.severity
    });
    
    // Record failure for learning
    if (this.errorRecovery.learningEnabled) {
      this.errorRecovery.integrateImplementationFailureFeedback(
        { task, error: error.message, severity: failureDetection.severity },
        { attempted: true, successful: false }
      );
    }
    
    return {
      taskId,
      success: false,
      error: error.message,
      failureAnalysis: failureDetection,
      executionTime,
      recoveryAttempted: failureDetection.recoveryStrategy ? true : false
    };
  }

  async executeRecoveryStrategy(task, strategy) {
    // Simplified recovery strategy execution
    console.error(`[SubAgent] Executing recovery strategy: ${strategy.type || 'unknown'}`);
    
    switch (strategy.type) {
      case 'retry':
        return await this.processTask(task, { retry: true });
      case 'simplify':
        const simplifiedTask = { ...task, complexity: Math.max(1, (task.complexity || 5) - 2) };
        return await this.processTask(simplifiedTask);
      default:
        throw new Error('Unknown recovery strategy');
    }
  }

  formatCachedResult(cachedResult, taskId) {
    return {
      taskId,
      success: true,
      result: cachedResult.recommendation,
      metadata: {
        cached: true,
        originalTimestamp: cachedResult.timestamp,
        specialist: cachedResult.specialist,
        cacheAge: Date.now() - new Date(cachedResult.timestamp).getTime()
      }
    };
  }

  // Helper methods for generating recommendations
  generateImplementationPlan(task, specialistInfo, patterns) {
    const relevantPatterns = patterns.slice(0, 3); // Top 3 patterns
    
    return {
      overview: `Implementation plan for ${task.domain || 'general'} task`,
      steps: this.generateImplementationSteps(task, specialistInfo),
      patterns: relevantPatterns.map(p => p.id),
      technologies: specialistInfo?.technologies || [],
      considerations: this.generateConsiderations(task, specialistInfo)
    };
  }

  generateImplementationSteps(task, specialistInfo) {
    const baseSteps = [
      'Analyze requirements and constraints',
      'Design solution architecture',
      'Implement core functionality',
      'Add error handling and validation',
      'Create tests and documentation',
      'Deploy and monitor'
    ];
    
    // Customize steps based on specialist expertise
    if (specialistInfo?.domain?.includes('security')) {
      baseSteps.splice(3, 0, 'Implement security measures');
    }
    
    if (specialistInfo?.domain?.includes('performance')) {
      baseSteps.splice(-1, 0, 'Optimize performance');
    }
    
    return baseSteps;
  }

  generateRationale(task, specialistInfo) {
    return `This approach leverages ${specialistInfo?.name || 'specialist'} expertise in ${specialistInfo?.domain || 'the relevant domain'} to address the specific requirements of the task.`;
  }

  identifyRisks(task, specialistInfo) {
    const risks = [
      { type: 'technical', probability: 0.3, impact: 'medium', mitigation: 'Thorough testing' },
      { type: 'timeline', probability: 0.2, impact: 'low', mitigation: 'Buffer time allocation' }
    ];
    
    if (task.complexity > 7) {
      risks.push({ 
        type: 'complexity', 
        probability: 0.5, 
        impact: 'high', 
        mitigation: 'Break down into smaller components' 
      });
    }
    
    return risks;
  }

  estimateTimeline(task, specialistInfo) {
    const baseTime = specialistInfo?.estimatedTime || '4-8 hours';
    const complexity = task.complexity || 5;
    
    if (complexity > 7) return `${baseTime} (extended due to complexity)`;
    if (complexity < 3) return `${baseTime} (possibly shorter due to simplicity)`;
    
    return baseTime;
  }

  identifyResources(task, specialistInfo) {
    return {
      personnel: [specialistInfo?.name || 'Specialist'],
      tools: specialistInfo?.technologies || [],
      time: this.estimateTimeline(task, specialistInfo)
    };
  }

  defineQualityMetrics(task) {
    return [
      'Code quality score > 8/10',
      'Test coverage > 80%',
      'Performance benchmarks met',
      'Security scan passes',
      'Documentation completeness'
    ];
  }

  defineTestingStrategy(task) {
    return {
      unit: 'Component-level testing',
      integration: 'API integration testing', 
      e2e: 'End-to-end workflow testing',
      performance: 'Load and stress testing',
      security: 'Security vulnerability testing'
    };
  }

  calculateConfidence(task, specialistInfo, patterns) {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on specialist expertise alignment
    if (specialistInfo && task.domain && specialistInfo.domain.includes(task.domain)) {
      confidence += 0.1;
    }
    
    // Increase confidence based on available patterns
    confidence += Math.min(patterns.length * 0.05, 0.15);
    
    // Decrease confidence based on complexity
    if (task.complexity > 8) confidence -= 0.1;
    
    return Math.min(Math.max(confidence, 0.1), 0.95);
  }

  updatePerformanceMetrics(taskId, metrics) {
    this.performanceMetrics.set(taskId, {
      ...metrics,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent metrics
    if (this.performanceMetrics.size > 1000) {
      const entries = Array.from(this.performanceMetrics.entries());
      const recent = entries.slice(-500);
      this.performanceMetrics.clear();
      recent.forEach(([id, data]) => this.performanceMetrics.set(id, data));
    }
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  loadConfig(providedConfig) {
    let config = {
      routing: {
        distributionTargets: { direct: 80, tier1: 15, tier2: 4, tier3: 1 },
        complexityThresholds: { direct: 3, tier1: 6, tier2: 8, tier3: 10 }
      },
      quality: {
        validationCheckpoints: true,
        consistencyVerification: true,
        performanceTracking: true
      },
      context: {
        storageEnabled: true,
        learningEnabled: true,
        cacheExpiration: '24h'
      },
      recovery: {
        errorDetection: true,
        autoEscalation: true,
        feedbackIntegration: true
      }
    };
    
    // Try to load from config file
    try {
      const configPath = path.resolve('./config/sub-agent-config.json');
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...fileConfig };
      }
    } catch (error) {
      console.error('[SubAgent] Could not load config file, using defaults');
    }
    
    // Merge with provided config
    return { ...config, ...providedConfig };
  }

  // Public API methods
  async getSystemStatus() {
    const recentMetrics = Array.from(this.performanceMetrics.values()).slice(-100);
    const successRate = recentMetrics.filter(m => m.success).length / recentMetrics.length;
    const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length;
    const avgQualityScore = recentMetrics.reduce((sum, m) => sum + (m.qualityScore || 0), 0) / recentMetrics.length;
    
    return {
      status: 'operational',
      performance: {
        successRate: successRate || 0,
        avgExecutionTime: avgExecutionTime || 0,
        avgQualityScore: avgQualityScore || 0,
        totalTasks: this.performanceMetrics.size
      },
      contextManager: await this.contextManager.getContextAnalytics(),
      timestamp: new Date().toISOString()
    };
  }

  async processFeedback(taskId, feedback) {
    const metrics = this.performanceMetrics.get(taskId);
    if (!metrics) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Integrate user feedback
    if (feedback.satisfaction < 0.6) {
      const dissatisfaction = ErrorRecoverySystem.detectUserDissatisfaction(feedback, metrics);
      await this.errorRecovery.integrateUserDissatisfactionFeedback(dissatisfaction, metrics.routing);
    }

    // Update metrics
    metrics.userFeedback = feedback;
    metrics.userSatisfaction = feedback.satisfaction;
    
    return {
      taskId,
      feedbackProcessed: true,
      systemUpdated: feedback.satisfaction < 0.6
    };
  }
}

export default SubAgentOrchestrator;