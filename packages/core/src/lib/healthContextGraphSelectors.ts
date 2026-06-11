import type {
  HealthContextGraph,
  HealthContextSafetyFlag,
  SafetyFlagCategory,
} from '../types/healthContextGraph'

export function hasBlockedRecommendation(graph: HealthContextGraph | null, recommendationType: string) {
  return Boolean(graph?.safetyFlags.some((flag) =>
    flag.blockedRecommendationTypes.includes(recommendationType),
  ))
}

export function hasSafetyCategory(graph: HealthContextGraph | null, category: SafetyFlagCategory) {
  return Boolean(graph?.safetyFlags.some((flag) => flag.category === category))
}

export function hasSafetyFlag(graph: HealthContextGraph | null, flagId: string) {
  return Boolean(graph?.safetyFlags.some((flag) => flag.id === flagId))
}

export function hasEatingBehaviorGuardrail(graph: HealthContextGraph | null) {
  return hasSafetyCategory(graph, 'eating_behavior') ||
    hasBlockedRecommendation(graph, 'calorie_restriction') ||
    hasBlockedRecommendation(graph, 'fasting') ||
    hasBlockedRecommendation(graph, 'weigh_in_pressure')
}

export function hasHighRiskMedicalBoundary(graph: HealthContextGraph | null) {
  return hasSafetyFlag(graph, 'urgent-medical-symptom') ||
    Boolean(graph?.safetyFlags.some((flag) => flag.category === 'medical' && flag.riskLevel === 'high'))
}

export function hasPlanningRule(graph: HealthContextGraph | null, ruleId: string) {
  return Boolean(graph?.planningRules.some((rule) => rule.id === ruleId))
}

export function graphHasFriction(graph: HealthContextGraph | null, frictionId: string) {
  return Boolean(graph?.frictionPoints.some((frictionPoint) => frictionPoint.id === frictionId))
}

export function strongestSafetyFlag(graph: HealthContextGraph | null): HealthContextSafetyFlag | null {
  if (!graph?.safetyFlags.length) return null

  const highRisk = graph.safetyFlags.find((flag) => flag.riskLevel === 'high')
  return highRisk ?? graph.safetyFlags[0] ?? null
}
