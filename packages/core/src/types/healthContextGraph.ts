export type ContextConfidence = 'low' | 'medium' | 'high'

export type ReadinessLevel = 'low' | 'moderate' | 'high'

export type StartingIntensity = 'low' | 'moderate' | 'high'

export type FrictionImpactArea =
  | 'nutrition'
  | 'movement'
  | 'recovery'
  | 'stress'
  | 'schedule'
  | 'consistency'
  | 'hydration'
  | 'mindset'
  | 'safety'

export type SafetyFlagCategory =
  | 'injury'
  | 'medical'
  | 'medication'
  | 'pregnancy_postpartum'
  | 'eating_behavior'
  | 'mental_health'
  | 'exercise'
  | 'nutrition'
  | 'unknown'

export type DisclaimerLevel = 'light' | 'standard' | 'strong'

export type PlanningRuleArea =
  | 'meals'
  | 'workouts'
  | 'recovery'
  | 'hydration'
  | 'habits'
  | 'schedule'
  | 'safety'
  | 'motivation'

export type PlanningRulePriority = 'low' | 'medium' | 'high' | 'critical'

export type FirstWeekDifficulty = 'easy' | 'moderate' | 'challenging'

export interface UserSnapshot {
  summary: string
  primaryGoal: string
  currentRoutine: string
  nutritionPattern: string
  movementPattern: string
  recoveryPattern: string
  schedulePressure: string
  motivationStyle: string
  recommendedStartingIntensity: StartingIntensity
  readinessLevel: ReadinessLevel
  confidence: ContextConfidence
}

export interface HealthContextStrength {
  id: string
  title: string
  description: string
  whyItMatters: string
  confidence: ContextConfidence
  relatedInputs: string[]
}

export interface HealthContextFrictionPoint {
  id: string
  title: string
  description: string
  impactArea: FrictionImpactArea
  severity: ContextConfidence
  whyItMatters: string
  suggestedAdjustment: string
  relatedInputs: string[]
}

export interface HealthContextSafetyFlag {
  id: string
  title: string
  description: string
  riskLevel: ContextConfidence
  category: SafetyFlagCategory
  appBehaviorRule: string
  userFacingLanguage: string
  disclaimerLevel: DisclaimerLevel
}

export interface HealthContextPlanningRule {
  id: string
  title: string
  description: string
  appliesTo: PlanningRuleArea
  priority: PlanningRulePriority
  example: string
}

export interface FirstWeekDay {
  dayNumber: number
  title: string
  nutritionFocus: string
  movementFocus: string
  recoveryFocus: string
  optionalBonus: string
  estimatedTime: string
  reason: string
}

export interface FirstWeekPlan {
  overview: string
  difficulty: FirstWeekDifficulty
  estimatedTimeDemand: string
  reasoning: string
  nutritionActions: string[]
  movementActions: string[]
  recoveryActions: string[]
  hydrationAction: string
  reflectionAction: string
  dailyPlan: FirstWeekDay[]
}

export interface HealthContextConfidence {
  highConfidenceInsights: string[]
  lowConfidenceAssumptions: string[]
  missingInformation: string[]
  recommendedFollowUpQuestions: string[]
}

export interface HealthContextGraph {
  id: string
  generatedAt: string
  sourceIntakeUpdatedAt: string
  userSnapshot: UserSnapshot
  strengths: HealthContextStrength[]
  frictionPoints: HealthContextFrictionPoint[]
  safetyFlags: HealthContextSafetyFlag[]
  planningRules: HealthContextPlanningRule[]
  firstWeekPlan: FirstWeekPlan
  confidence: HealthContextConfidence
}
