/**
 * Task Complexity Analyzer for Sub-Agent Architecture
 * Analyzes task complexity across multiple dimensions to enable intelligent routing
 */

export class TaskComplexityAnalyzer {
  static analyzeTask(task) {
    const complexity = {
      scope: this.analyzeScopeComplexity(task),
      technical: this.analyzeTechnicalComplexity(task),
      domain: this.analyzeDomainComplexity(task),
      risk: this.analyzeRiskLevel(task)
    };
    
    return this.calculateOverallComplexity(complexity);
  }
  
  static analyzeScopeComplexity(task) {
    let score = 1;
    
    // Single function/component changes
    if (task.scope === 'single-function' || task.files?.length === 1) score = 1;
    
    // Multiple file changes
    else if (task.files?.length > 1 && task.files.length <= 5) score = 3;
    
    // System-wide changes
    else if (task.files?.length > 5 || task.scope === 'system-wide') score = 5;
    
    // Cross-system integration
    else if (task.scope === 'cross-system' || task.integrations?.length > 0) score = 8;
    
    // Enterprise architecture
    else if (task.scope === 'enterprise' || task.governance) score = 10;
    
    // Additional scope factors
    if (task.databases?.length > 1) score += 2;
    if (task.apis?.length > 3) score += 2;
    if (task.services?.length > 2) score += 3;
    if (task.crossTeam) score += 2;
    
    return Math.min(score, 10);
  }
  
  static analyzeTechnicalComplexity(task) {
    let score = 1;
    
    // Technology complexity
    const complexTechnologies = ['microservices', 'distributed-systems', 'blockchain', 
                                'machine-learning', 'real-time-processing', 'streaming'];
    if (task.technologies?.some(tech => complexTechnologies.includes(tech))) score += 3;
    
    // Pattern complexity
    const complexPatterns = ['event-sourcing', 'cqrs', 'saga', 'circuit-breaker', 
                           'distributed-transactions', 'consensus-algorithms'];
    if (task.patterns?.some(pattern => complexPatterns.includes(pattern))) score += 4;
    
    // Integration complexity
    if (task.integrations?.length > 0) {
      score += Math.min(task.integrations.length * 2, 6);
    }
    
    // Performance requirements
    if (task.performance?.requirements?.includes('sub-second')) score += 3;
    if (task.performance?.requirements?.includes('high-throughput')) score += 2;
    if (task.performance?.requirements?.includes('real-time')) score += 4;
    
    // Scalability requirements
    if (task.scalability?.includes('horizontal')) score += 2;
    if (task.scalability?.includes('auto-scaling')) score += 3;
    if (task.scalability?.includes('global-distribution')) score += 4;
    
    return Math.min(score, 10);
  }
  
  static analyzeDomainComplexity(task) {
    let score = 1;
    
    // Domain expertise required
    const complexDomains = {
      'financial': 4,
      'healthcare': 5,
      'security': 4,
      'ml-ai': 5,
      'blockchain': 6,
      'embedded': 4,
      'real-time': 4,
      'distributed-systems': 5,
      'data-science': 4
    };
    
    if (task.domain && complexDomains[task.domain]) {
      score += complexDomains[task.domain];
    }
    
    // Compliance requirements
    const complianceComplexity = {
      'gdpr': 3,
      'hipaa': 4,
      'pci-dss': 4,
      'sox': 3,
      'iso-27001': 3,
      'fda': 5
    };
    
    if (task.compliance) {
      task.compliance.forEach(comp => {
        if (complianceComplexity[comp]) {
          score += complianceComplexity[comp];
        }
      });
    }
    
    // Business logic complexity
    if (task.businessLogic?.includes('complex-calculations')) score += 2;
    if (task.businessLogic?.includes('multi-step-workflows')) score += 3;
    if (task.businessLogic?.includes('state-machines')) score += 3;
    if (task.businessLogic?.includes('rule-engines')) score += 4;
    
    return Math.min(score, 10);
  }
  
  static analyzeRiskLevel(task) {
    let score = 1;
    
    // Data risk
    if (task.dataRisk?.includes('pii')) score += 3;
    if (task.dataRisk?.includes('financial')) score += 4;
    if (task.dataRisk?.includes('medical')) score += 4;
    if (task.dataRisk?.includes('sensitive')) score += 2;
    
    // System risk
    if (task.systemRisk?.includes('production-critical')) score += 4;
    if (task.systemRisk?.includes('revenue-impacting')) score += 3;
    if (task.systemRisk?.includes('user-facing')) score += 2;
    if (task.systemRisk?.includes('data-loss-potential')) score += 5;
    
    // Implementation risk
    if (task.implementationRisk?.includes('breaking-changes')) score += 3;
    if (task.implementationRisk?.includes('migration-required')) score += 4;
    if (task.implementationRisk?.includes('rollback-difficult')) score += 3;
    if (task.implementationRisk?.includes('external-dependencies')) score += 2;
    
    // Timeline pressure
    if (task.timeline?.pressure === 'urgent') score += 2;
    if (task.timeline?.pressure === 'critical') score += 4;
    
    return Math.min(score, 10);
  }
  
  static calculateOverallComplexity(complexity) {
    const score = (
      complexity.scope * 0.3 +
      complexity.technical * 0.3 +
      complexity.domain * 0.25 +
      complexity.risk * 0.15
    );
    
    let tier;
    if (score <= 3) tier = 'DIRECT';          // 80% - Direct implementation
    else if (score <= 6) tier = 'TIER_1';    // 15% - Tier 1 consultation
    else if (score <= 8) tier = 'TIER_2';    // 4% - Tier 2 deep analysis
    else tier = 'TIER_3';                    // 1% - Tier 3 coordination
    
    return {
      overallScore: score,
      tier,
      breakdown: complexity,
      confidence: this.calculateConfidence(complexity),
      recommendations: this.generateRecommendations(complexity, tier)
    };
  }
  
  static calculateConfidence(complexity) {
    // Calculate confidence based on how clear the complexity indicators are
    const indicators = Object.values(complexity).filter(score => score > 1);
    const confidence = Math.min(indicators.length * 0.25, 1.0);
    return confidence;
  }
  
  static generateRecommendations(complexity, tier) {
    const recommendations = [];
    
    if (complexity.scope > 7) {
      recommendations.push('Consider breaking down into smaller tasks');
    }
    
    if (complexity.technical > 8) {
      recommendations.push('Require multiple technical specialists');
    }
    
    if (complexity.domain > 6) {
      recommendations.push('Domain expert consultation required');
    }
    
    if (complexity.risk > 7) {
      recommendations.push('Implement comprehensive risk mitigation');
    }
    
    if (tier === 'TIER_3') {
      recommendations.push('Cross-domain architectural review needed');
    }
    
    return recommendations;
  }
}