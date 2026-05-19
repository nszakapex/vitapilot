import type { DailyMetric, HealthAction, UserProfile } from '../types/health'

export function buildDailyCoachNote(profile: UserProfile, metrics: DailyMetric[]) {
  const sleepMetric = metrics.find((metric) => metric.label === 'Sleep')
  const readinessMetric = metrics.find((metric) => metric.label === 'Readiness')

  return `${profile.name}, today is a steady-not-perfect day. Your ${sleepMetric?.value ?? 'short'} sleep and ${readinessMetric?.value ?? 'moderate'} readiness point to simple food, moderate movement, and an early wind-down.`
}

export function getSmallestUsefulAction(actions: HealthAction[]): HealthAction {
  return (
    actions.find((action) => action.effort === 'low') ?? {
      id: 'fallback',
      area: 'habit',
      title: 'Drink water and take a 10-minute walk',
      why: 'It is small enough to do on a messy day and useful enough to count.',
      duration: '10 min',
      effort: 'low',
      status: 'ready',
      evidence: 'practical',
      cta: 'Do this',
    }
  )
}

export function getSafetyCopy() {
  return 'Wellness guidance only. For chest pain, fainting, severe symptoms, eating disorder concerns, pregnancy, medication changes, or medical conditions, use a licensed professional.'
}
