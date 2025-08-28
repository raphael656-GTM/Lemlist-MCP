/**
 * Intelligent Task Router for Sub-Agent Architecture
 * Routes tasks to appropriate specialists based on complexity and domain analysis
 */

import { TaskComplexityAnalyzer } from './TaskComplexityAnalyzer.js';

export class TaskRouter {
  constructor(config) {
    this.config = config;
    this.specialists = this.loadSpecialists();
    this.performanceMetrics = new Map();
  }
  
  static route(task, context = {}) {
    const complexity = TaskComplexityAnalyzer.analyzeTask(task);
    const specialist = this.selectSpecialist(task, complexity);
    
    return {
      complexity,
      specialist,
      protocol: this.getProtocol(complexity.tier),
      estimatedTime: this.estimateTime(complexity, specialist),
      qualityChecks: this.getQualityChecks(complexity.tier),
      routing: {
        tier: complexity.tier,
        confidence: complexity.confidence,
        timestamp: new Date().toISOString(),
        context: context
      }
    };
  }
  
  static selectSpecialist(task, complexity) {
    const domain = this.identifyDomain(task);
    const tier = complexity.tier;
    const specialists = this.getSpecialistsForDomain(domain, tier);
    
    return this.selectBestSpecialist(specialists, task, complexity);
  }
  
  static identifyDomain(task) {
    // Primary domain identification
    if (task.domain) return task.domain;
    
    // Infer domain from task characteristics
    const domainKeywords = {
      'data': ['database', 'query', 'analytics', 'etl', 'warehouse', 'lake'],
      'security': ['auth', 'oauth', 'jwt', 'encryption', 'vulnerability', 'compliance'],
      'performance': ['optimization', 'caching', 'scaling', 'latency', 'throughput'],
      'integration': ['api', 'webhook', 'service', 'microservice', 'messaging'],
      'frontend': ['ui', 'ux', 'react', 'vue', 'angular', 'component'],
      'architecture': ['design', 'pattern', 'structure', 'system', 'scalability'],
      'ml': ['machine-learning', 'ai', 'model', 'prediction', 'classification'],
      'testing': ['test', 'qa', 'automation', 'ci/cd', 'deployment']
    };
    
    const taskText = `${task.description} ${task.requirements?.join(' ')} ${task.technologies?.join(' ')}`.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => taskText.includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }
  
  static getSpecialistsForDomain(domain, tier) {
    const specialistMapping = {
      'DIRECT': [],
      'TIER_1': {
        'data': ['data-generalist'],
        'security': ['security-generalist'],
        'performance': ['performance-generalist'],
        'integration': ['integration-generalist'],
        'frontend': ['frontend-generalist'],
        'architecture': ['architecture-generalist'],
        'general': ['architecture-generalist']
      },
      'TIER_2': {
        'data': ['database-specialist'],
        'security': ['auth-systems-specialist'],
        'performance': ['performance-optimization-specialist'],
        'integration': ['api-design-specialist'],
        'ml': ['ml-integration-specialist'],
        'testing': ['testing-strategy-specialist'],
        'general': ['database-specialist', 'api-design-specialist']
      },
      'TIER_3': {
        'data': ['data-architect'],
        'security': ['security-architect'],
        'integration': ['integration-architect'],
        'architecture': ['system-architect'],
        'scale': ['scale-architect'],
        'governance': ['governance-architect'],
        'general': ['system-architect']
      }
    };
    
    return specialistMapping[tier]?.[domain] || specialistMapping[tier]?.['general'] || [];
  }
  
  static selectBestSpecialist(specialists, task, complexity) {
    if (specialists.length === 0) return null;
    if (specialists.length === 1) return specialists[0];
    
    // Score each specialist based on task fit
    const specialistScores = specialists.map(specialist => ({
      specialist,
      score: this.calculateSpecialistScore(specialist, task, complexity)
    }));
    
    // Select highest scoring specialist
    specialistScores.sort((a, b) => b.score - a.score);
    return specialistScores[0].specialist;
  }
  
  static calculateSpecialistScore(specialist, task, complexity) {
    let score = 0;
    
    // Base score from specialist capabilities
    const specialistCapabilities = this.getSpecialistCapabilities(specialist);
    
    // Domain alignment
    if (specialistCapabilities.domains?.includes(this.identifyDomain(task))) {
      score += 10;
    }
    
    // Technology alignment
    if (task.technologies) {
      const techMatch = task.technologies.filter(tech => 
        specialistCapabilities.technologies?.includes(tech)
      ).length;
      score += techMatch * 2;
    }
    
    // Complexity alignment
    if (complexity.overallScore >= specialistCapabilities.minComplexity && 
        complexity.overallScore <= specialistCapabilities.maxComplexity) {
      score += 5;
    }
    
    // Historical performance (if available)
    const performance = this.getSpecialistPerformance(specialist);
    if (performance) {
      score += performance.successRate * 5;
    }
    
    return score;
  }
  
  static getSpecialistCapabilities(specialist) {
    const capabilities = {
      'architecture-generalist': {
        domains: ['architecture', 'design', 'system'],
        technologies: ['microservices', 'design-patterns', 'scalability'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'security-generalist': {
        domains: ['security', 'auth'],
        technologies: ['oauth', 'jwt', 'encryption'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'performance-generalist': {
        domains: ['performance', 'optimization'],
        technologies: ['caching', 'monitoring', 'profiling'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'data-generalist': {
        domains: ['data', 'database'],
        technologies: ['sql', 'nosql', 'analytics'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'integration-generalist': {
        domains: ['integration', 'api'],
        technologies: ['rest', 'graphql', 'webhooks'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'frontend-generalist': {
        domains: ['frontend', 'ui'],
        technologies: ['react', 'vue', 'angular'],
        minComplexity: 3,
        maxComplexity: 6
      },
      'database-specialist': {
        domains: ['data', 'database'],
        technologies: ['postgresql', 'redis', 'mongodb'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'api-design-specialist': {
        domains: ['integration', 'api'],
        technologies: ['rest', 'graphql', 'openapi'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'auth-systems-specialist': {
        domains: ['security', 'auth'],
        technologies: ['oauth2', 'saml', 'jwt', 'mfa'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'performance-optimization-specialist': {
        domains: ['performance'],
        technologies: ['profiling', 'optimization', 'monitoring'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'ml-integration-specialist': {
        domains: ['ml', 'ai'],
        technologies: ['tensorflow', 'pytorch', 'ml-apis'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'testing-strategy-specialist': {
        domains: ['testing', 'qa'],
        technologies: ['jest', 'cypress', 'ci-cd'],
        minComplexity: 6,
        maxComplexity: 8
      },
      'system-architect': {
        domains: ['architecture', 'system'],
        technologies: ['enterprise', 'distributed-systems'],
        minComplexity: 8,
        maxComplexity: 10
      },
      'integration-architect': {
        domains: ['integration'],
        technologies: ['service-mesh', 'event-driven'],
        minComplexity: 8,
        maxComplexity: 10
      },
      'scale-architect': {
        domains: ['scale', 'performance'],
        technologies: ['horizontal-scaling', 'distributed-systems'],
        minComplexity: 8,
        maxComplexity: 10
      },
      'security-architect': {
        domains: ['security'],
        technologies: ['enterprise-security', 'compliance'],
        minComplexity: 8,
        maxComplexity: 10
      },
      'data-architect': {
        domains: ['data'],
        technologies: ['data-lakes', 'warehouses', 'governance'],
        minComplexity: 8,
        maxComplexity: 10
      },
      'governance-architect': {
        domains: ['governance'],
        technologies: ['compliance', 'policy-enforcement'],
        minComplexity: 8,
        maxComplexity: 10
      }
    };
    
    return capabilities[specialist] || {};
  }
  
  static getProtocol(tier) {
    const protocols = {
      'DIRECT': 'direct-implementation',
      'TIER_1': 'quick-consultation',
      'TIER_2': 'deep-analysis',
      'TIER_3': 'architectural-coordination'
    };
    
    return protocols[tier];
  }
  
  static estimateTime(complexity, specialist) {
    const baseTime = {
      'DIRECT': 30,      // 30 minutes
      'TIER_1': 120,     // 2 hours
      'TIER_2': 480,     // 8 hours
      'TIER_3': 1440     // 24 hours
    };
    
    const tierTime = baseTime[complexity.tier] || baseTime['DIRECT'];
    
    // Adjust based on complexity score
    const complexityMultiplier = 1 + (complexity.overallScore / 10);
    
    return Math.round(tierTime * complexityMultiplier);
  }
  
  static getQualityChecks(tier) {
    const qualityChecks = {
      'DIRECT': ['syntax-check', 'basic-test'],
      'TIER_1': ['syntax-check', 'unit-tests', 'code-review'],
      'TIER_2': ['syntax-check', 'unit-tests', 'integration-tests', 'code-review', 'security-scan'],
      'TIER_3': ['syntax-check', 'unit-tests', 'integration-tests', 'e2e-tests', 'code-review', 
                'security-scan', 'performance-test', 'architectural-review']
    };
    
    return qualityChecks[tier] || qualityChecks['DIRECT'];
  }
  
  static getSpecialistPerformance(specialist) {
    // This would be implemented with actual performance tracking
    // For now, return null to indicate no historical data
    return null;
  }
  
  // Routing optimization methods
  static optimizeRouting(feedbackData) {
    const optimizations = {
      thresholdAdjustments: this.analyzeThresholdPerformance(feedbackData),
      specialistSelection: this.optimizeSpecialistSelection(feedbackData),
      domainMapping: this.refineDomainMapping(feedbackData)
    };
    
    return optimizations;
  }
  
  static analyzeThresholdPerformance(feedbackData) {
    // Analyze if current complexity thresholds are optimal
    const thresholdAnalysis = {
      tier1Accuracy: this.calculateTierAccuracy(feedbackData, 'TIER_1'),
      tier2Accuracy: this.calculateTierAccuracy(feedbackData, 'TIER_2'),
      tier3Accuracy: this.calculateTierAccuracy(feedbackData, 'TIER_3')
    };
    
    return thresholdAnalysis;
  }
  
  static calculateTierAccuracy(feedbackData, tier) {
    const tierFeedback = feedbackData.filter(f => f.routingTier === tier);
    if (tierFeedback.length === 0) return 1.0;
    
    const successful = tierFeedback.filter(f => f.outcome === 'successful').length;
    return successful / tierFeedback.length;
  }
  
  static optimizeSpecialistSelection(feedbackData) {
    const specialistPerformance = new Map();
    
    feedbackData.forEach(feedback => {
      if (!specialistPerformance.has(feedback.specialist)) {
        specialistPerformance.set(feedback.specialist, {
          total: 0,
          successful: 0,
          avgSatisfaction: 0
        });
      }
      
      const perf = specialistPerformance.get(feedback.specialist);
      perf.total += 1;
      if (feedback.outcome === 'successful') perf.successful += 1;
      perf.avgSatisfaction = (perf.avgSatisfaction + feedback.satisfaction) / 2;
    });
    
    return Object.fromEntries(specialistPerformance);
  }
  
  static refineDomainMapping(feedbackData) {
    // Analyze if domain identification is accurate
    const domainAccuracy = new Map();
    
    feedbackData.forEach(feedback => {
      const identifiedDomain = feedback.identifiedDomain;
      const actualDomain = feedback.actualDomain;
      
      if (!domainAccuracy.has(identifiedDomain)) {
        domainAccuracy.set(identifiedDomain, { correct: 0, total: 0 });
      }
      
      const accuracy = domainAccuracy.get(identifiedDomain);
      accuracy.total += 1;
      if (identifiedDomain === actualDomain) accuracy.correct += 1;
    });
    
    return Object.fromEntries(domainAccuracy);
  }
}