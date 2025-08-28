/**
 * Specialist Registry for Sub-Agent Architecture
 * Defines all specialist types and their capabilities across tiers
 */

export class SpecialistRegistry {
  static specialists = {
    // TIER 1 - Quick Consultation Specialists (6 total)
    tier1: {
      'architecture-generalist': {
        name: 'Architecture Generalist',
        domain: 'System design, scalability, patterns',
        expertise: [
          'Microservices architecture',
          'Design patterns implementation',
          'Scalability planning',
          'System integration design'
        ],
        consultationTriggers: [
          'Multi-component system changes',
          'Performance architecture decisions',
          'Integration pattern selection',
          'Scalability planning'
        ],
        handoffCriteria: [
          'Complex distributed systems',
          'Enterprise architecture',
          'Cross-domain system integration'
        ],
        technologies: ['microservices', 'design-patterns', 'scalability', 'system-design'],
        estimatedTime: '2-4 hours',
        tier: 1
      },
      
      'security-generalist': {
        name: 'Security Generalist',
        domain: 'Authentication, authorization, data protection',
        expertise: [
          'OAuth/JWT implementation',
          'API security patterns',
          'Data encryption',
          'Basic vulnerability assessment'
        ],
        consultationTriggers: [
          'Authentication system changes',
          'API security implementation',
          'Data protection requirements',
          'Basic security audits'
        ],
        handoffCriteria: [
          'Advanced threat modeling',
          'Compliance requirements',
          'Enterprise security architecture'
        ],
        technologies: ['oauth', 'jwt', 'encryption', 'api-security'],
        estimatedTime: '2-4 hours',
        tier: 1
      },
      
      'performance-generalist': {
        name: 'Performance Generalist',
        domain: 'Optimization, caching, scaling, monitoring',
        expertise: [
          'Query optimization',
          'Caching strategies',
          'Basic performance profiling',
          'Monitoring implementation'
        ],
        consultationTriggers: [
          'Performance bottleneck identification',
          'Caching strategy selection',
          'Basic optimization needs',
          'Monitoring setup'
        ],
        handoffCriteria: [
          'Deep performance analysis',
          'Complex optimization',
          'System-wide performance issues'
        ],
        technologies: ['caching', 'monitoring', 'profiling', 'optimization'],
        estimatedTime: '2-4 hours',
        tier: 1
      },
      
      'data-generalist': {
        name: 'Data Generalist',
        domain: 'Database design, modeling, analytics',
        expertise: [
          'Database schema design',
          'Data modeling',
          'Basic analytics',
          'Data migration planning'
        ],
        consultationTriggers: [
          'Database design decisions',
          'Data modeling requirements',
          'Basic analytics implementation',
          'Data migration planning'
        ],
        handoffCriteria: [
          'Complex data architectures',
          'Advanced analytics',
          'Enterprise data governance'
        ],
        technologies: ['sql', 'nosql', 'data-modeling', 'analytics'],
        estimatedTime: '2-4 hours',
        tier: 1
      },
      
      'integration-generalist': {
        name: 'Integration Generalist',
        domain: 'APIs, third-party services, microservices',
        expertise: [
          'REST/GraphQL API design',
          'Third-party integration',
          'Service communication patterns',
          'Basic event-driven architecture'
        ],
        consultationTriggers: [
          'API design decisions',
          'Third-party service integration',
          'Service communication setup',
          'Basic event handling'
        ],
        handoffCriteria: [
          'Complex integration patterns',
          'Enterprise messaging',
          'Service mesh architecture'
        ],
        technologies: ['rest', 'graphql', 'webhooks', 'microservices'],
        estimatedTime: '2-4 hours',
        tier: 1
      },
      
      'frontend-generalist': {
        name: 'Frontend Generalist',
        domain: 'UI/UX, responsive design, accessibility',
        expertise: [
          'Component architecture',
          'State management',
          'Responsive design',
          'Basic accessibility'
        ],
        consultationTriggers: [
          'UI component design',
          'State management decisions',
          'Responsive design implementation',
          'Basic accessibility requirements'
        ],
        handoffCriteria: [
          'Complex frontend architectures',
          'Advanced UX patterns',
          'Enterprise frontend systems'
        ],
        technologies: ['react', 'vue', 'angular', 'css', 'javascript'],
        estimatedTime: '2-4 hours',
        tier: 1
      }
    },
    
    // TIER 2 - Deep Analysis Specialists (6 total)
    tier2: {
      'database-specialist': {
        name: 'Database Specialist',
        domain: 'PostgreSQL, Redis, performance tuning',
        prerequisites: ['data-generalist'],
        expertise: [
          'Advanced query optimization',
          'Database performance tuning',
          'Complex data modeling',
          'Database clustering/sharding'
        ],
        consultationTriggers: [
          'Complex database performance issues',
          'Advanced data modeling needs',
          'Database scaling requirements',
          'Data consistency challenges'
        ],
        handoffCriteria: [
          'Enterprise data architecture',
          'Cross-system data consistency',
          'Data governance frameworks'
        ],
        technologies: ['postgresql', 'redis', 'mongodb', 'query-optimization'],
        estimatedTime: '8-16 hours',
        tier: 2
      },
      
      'api-design-specialist': {
        name: 'API Design Specialist',
        domain: 'REST, GraphQL, versioning',
        prerequisites: ['integration-generalist'],
        expertise: [
          'Advanced API design patterns',
          'API versioning strategies',
          'Complex GraphQL schemas',
          'API performance optimization'
        ],
        consultationTriggers: [
          'Complex API architecture',
          'Advanced versioning needs',
          'GraphQL optimization',
          'API ecosystem design'
        ],
        handoffCriteria: [
          'Enterprise API governance',
          'Cross-domain API strategy',
          'API platform architecture'
        ],
        technologies: ['rest', 'graphql', 'openapi', 'api-versioning'],
        estimatedTime: '8-16 hours',
        tier: 2
      },
      
      'auth-systems-specialist': {
        name: 'Auth Systems Specialist',
        domain: 'OAuth, JWT, SSO, MFA',
        prerequisites: ['security-generalist'],
        expertise: [
          'Advanced authentication flows',
          'SSO implementation',
          'Multi-factor authentication',
          'Identity federation'
        ],
        consultationTriggers: [
          'Complex authentication requirements',
          'Enterprise SSO integration',
          'Advanced security protocols',
          'Identity management systems'
        ],
        handoffCriteria: [
          'Enterprise identity governance',
          'Compliance frameworks',
          'Zero-trust architecture'
        ],
        technologies: ['oauth2', 'saml', 'jwt', 'mfa', 'sso'],
        estimatedTime: '8-16 hours',
        tier: 2
      },
      
      'performance-optimization-specialist': {
        name: 'Performance Optimization Specialist',
        domain: 'Profiling, memory/CPU optimization',
        prerequisites: ['performance-generalist'],
        expertise: [
          'Advanced profiling techniques',
          'Memory optimization',
          'CPU optimization',
          'Performance monitoring systems'
        ],
        consultationTriggers: [
          'Complex performance bottlenecks',
          'Memory leak investigation',
          'CPU optimization needs',
          'Advanced monitoring requirements'
        ],
        handoffCriteria: [
          'System-wide performance architecture',
          'Enterprise performance governance',
          'Cross-service optimization'
        ],
        technologies: ['profiling', 'memory-optimization', 'monitoring', 'apm'],
        estimatedTime: '8-16 hours',
        tier: 2
      },
      
      'ml-integration-specialist': {
        name: 'ML Integration Specialist',
        domain: 'ML APIs, model serving, AI integration',
        prerequisites: ['data-generalist'],
        expertise: [
          'ML model integration',
          'AI API implementation',
          'Model serving architecture',
          'ML pipeline design'
        ],
        consultationTriggers: [
          'AI/ML feature integration',
          'Model serving requirements',
          'ML pipeline development',
          'AI performance optimization'
        ],
        handoffCriteria: [
          'Enterprise ML architecture',
          'Cross-domain AI strategy',
          'ML governance frameworks'
        ],
        technologies: ['tensorflow', 'pytorch', 'ml-apis', 'model-serving'],
        estimatedTime: '8-16 hours',
        tier: 2
      },
      
      'testing-strategy-specialist': {
        name: 'Testing Strategy Specialist',
        domain: 'Test automation, CI/CD, frameworks',
        prerequisites: ['architecture-generalist'],
        expertise: [
          'Advanced testing strategies',
          'CI/CD pipeline design',
          'Test automation frameworks',
          'Quality assurance processes'
        ],
        consultationTriggers: [
          'Complex testing requirements',
          'CI/CD optimization',
          'Test automation strategies',
          'Quality framework design'
        ],
        handoffCriteria: [
          'Enterprise testing governance',
          'Cross-team QA strategy',
          'Quality platform architecture'
        ],
        technologies: ['jest', 'cypress', 'ci-cd', 'test-automation'],
        estimatedTime: '8-16 hours',
        tier: 2
      }
    },
    
    // TIER 3 - Cross-Domain Coordination Architects (6 total)
    tier3: {
      'system-architect': {
        name: 'System Architect',
        domain: 'Enterprise architecture, cross-domain coordination',
        expertise: [
          'Enterprise architecture patterns',
          'Cross-system integration',
          'Technology strategy',
          'Architectural governance'
        ],
        consultationTriggers: [
          'Enterprise-wide architectural decisions',
          'Cross-domain system integration',
          'Technology standardization',
          'Architectural policy development'
        ],
        technologies: ['enterprise-architecture', 'system-design', 'governance'],
        estimatedTime: '24-48 hours',
        tier: 3
      },
      
      'integration-architect': {
        name: 'Integration Architect',
        domain: 'Service mesh, enterprise integration patterns',
        expertise: [
          'Service mesh architecture',
          'Enterprise integration patterns',
          'Event-driven architecture',
          'Distributed system design'
        ],
        consultationTriggers: [
          'Complex integration architectures',
          'Service mesh implementation',
          'Enterprise messaging systems',
          'Distributed system coordination'
        ],
        technologies: ['service-mesh', 'event-driven', 'distributed-systems'],
        estimatedTime: '24-48 hours',
        tier: 3
      },
      
      'scale-architect': {
        name: 'Scale Architect',
        domain: 'Horizontal scaling, distributed systems',
        expertise: [
          'Horizontal scaling strategies',
          'Distributed system patterns',
          'Load balancing architecture',
          'Fault tolerance design'
        ],
        consultationTriggers: [
          'Large-scale system design',
          'Distributed architecture planning',
          'Scaling strategy development',
          'Fault tolerance requirements'
        ],
        technologies: ['horizontal-scaling', 'load-balancing', 'fault-tolerance'],
        estimatedTime: '24-48 hours',
        tier: 3
      },
      
      'security-architect': {
        name: 'Security Architect',
        domain: 'Security governance, compliance, threat modeling',
        expertise: [
          'Security architecture design',
          'Compliance framework implementation',
          'Advanced threat modeling',
          'Security governance'
        ],
        consultationTriggers: [
          'Enterprise security architecture',
          'Compliance requirements',
          'Advanced threat modeling',
          'Security governance framework'
        ],
        technologies: ['enterprise-security', 'compliance', 'threat-modeling'],
        estimatedTime: '24-48 hours',
        tier: 3
      },
      
      'data-architect': {
        name: 'Data Architect',
        domain: 'Data lakes, warehouses, governance',
        expertise: [
          'Data architecture design',
          'Data governance frameworks',
          'Data lake/warehouse architecture',
          'Master data management'
        ],
        consultationTriggers: [
          'Enterprise data architecture',
          'Data governance requirements',
          'Large-scale data systems',
          'Data quality frameworks'
        ],
        technologies: ['data-lakes', 'data-warehouses', 'data-governance'],
        estimatedTime: '24-48 hours',
        tier: 3
      },
      
      'governance-architect': {
        name: 'Governance Architect',
        domain: 'Compliance, policy enforcement, governance',
        expertise: [
          'Governance framework design',
          'Policy enforcement systems',
          'Compliance automation',
          'Risk management'
        ],
        consultationTriggers: [
          'Governance framework development',
          'Compliance automation',
          'Policy enforcement systems',
          'Risk management frameworks'
        ],
        technologies: ['governance', 'compliance', 'policy-enforcement'],
        estimatedTime: '24-48 hours',
        tier: 3
      }
    }
  };
  
  static getSpecialist(tier, specialistId) {
    return this.specialists[`tier${tier}`]?.[specialistId];
  }
  
  static getAllSpecialists() {
    return {
      ...this.specialists.tier1,
      ...this.specialists.tier2,
      ...this.specialists.tier3
    };
  }
  
  static getSpecialistsByTier(tier) {
    return this.specialists[`tier${tier}`] || {};
  }
  
  static getSpecialistsByDomain(domain) {
    const allSpecialists = this.getAllSpecialists();
    const domainSpecialists = {};
    
    Object.entries(allSpecialists).forEach(([id, specialist]) => {
      if (specialist.domain.toLowerCase().includes(domain.toLowerCase()) ||
          specialist.technologies.some(tech => tech.includes(domain))) {
        domainSpecialists[id] = specialist;
      }
    });
    
    return domainSpecialists;
  }
  
  static getSpecialistCapabilities(specialistId) {
    const allSpecialists = this.getAllSpecialists();
    return allSpecialists[specialistId];
  }
  
  static validateSpecialistExists(specialistId) {
    return specialistId in this.getAllSpecialists();
  }
  
  static getConsultationFlow(specialistId) {
    const specialist = this.getSpecialistCapabilities(specialistId);
    if (!specialist) return null;
    
    const flow = {
      specialist: specialistId,
      tier: specialist.tier,
      prerequisites: specialist.prerequisites || [],
      estimatedTime: specialist.estimatedTime,
      nextSteps: this.getNextSteps(specialist)
    };
    
    return flow;
  }
  
  static getNextSteps(specialist) {
    const nextSteps = [];
    
    if (specialist.tier === 1 && specialist.handoffCriteria.length > 0) {
      nextSteps.push({
        type: 'potential-escalation',
        criteria: specialist.handoffCriteria,
        targetTier: 2
      });
    }
    
    if (specialist.tier === 2 && specialist.handoffCriteria.length > 0) {
      nextSteps.push({
        type: 'potential-escalation',
        criteria: specialist.handoffCriteria,
        targetTier: 3
      });
    }
    
    return nextSteps;
  }
  
  static getCompatibleSpecialists(currentSpecialist, task) {
    const current = this.getSpecialistCapabilities(currentSpecialist);
    if (!current) return [];
    
    const compatible = [];
    const allSpecialists = this.getAllSpecialists();
    
    Object.entries(allSpecialists).forEach(([id, specialist]) => {
      if (id === currentSpecialist) return;
      
      // Check for complementary expertise
      const hasComplementaryTech = specialist.technologies.some(tech =>
        !current.technologies.includes(tech) &&
        task.technologies?.includes(tech)
      );
      
      if (hasComplementaryTech) {
        compatible.push({
          id,
          name: specialist.name,
          reason: 'complementary-expertise',
          technologies: specialist.technologies.filter(tech =>
            !current.technologies.includes(tech)
          )
        });
      }
    });
    
    return compatible;
  }
}

// Export specialist definitions for external use
export const SPECIALIST_DEFINITIONS = SpecialistRegistry.specialists;