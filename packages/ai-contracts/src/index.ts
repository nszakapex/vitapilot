export interface DailyPlanRequest {
  userId: string
  localDate: string
  goalContext: string
}

export interface SafetyDecision {
  level: 'green' | 'yellow' | 'red'
  reason: string
  escalationCopy?: string
}
