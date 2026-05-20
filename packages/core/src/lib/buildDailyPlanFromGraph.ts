import type { DailyMetric, DailyPlan, HealthAction } from '../types/health'
import type {
  FirstWeekDay,
  HealthContextGraph,
  HealthContextPlanningRule,
  HealthContextSafetyFlag,
} from '../types/healthContextGraph'

export function buildDailyPlanFromGraph(graph: HealthContextGraph, localDate: string): DailyPlan {
  const day = getGraphDay(graph, localDate)
  const safetyFlags = graph.safetyFlags
  const planningRules = graph.planningRules

  return {
    actions: [
      createNutritionAction(day, planningRules, safetyFlags, localDate),
      createMovementAction(day, planningRules, safetyFlags, localDate),
      createRecoveryAction(day, planningRules, safetyFlags, localDate),
    ],
    focus: createFocus(day, graph),
    localDate,
    metrics: createMetrics(graph),
    weeklyPattern: createWeeklyPattern(graph),
  }
}

function getGraphDay(graph: HealthContextGraph, localDate: string): FirstWeekDay {
  const dailyPlan = graph.firstWeekPlan.dailyPlan
  if (!dailyPlan.length) {
    return {
      dayNumber: 1,
      estimatedTime: graph.firstWeekPlan.estimatedTimeDemand,
      movementFocus: 'Easy walk or mobility',
      nutritionFocus: 'Choose one repeatable meal anchor',
      optionalBonus: 'Save what felt easiest',
      reason: graph.firstWeekPlan.reasoning,
      recoveryFocus: 'Small evening reset',
      title: 'Starter day',
    }
  }

  const generatedDate = getDateOnly(graph.generatedAt)
  const requestedDate = getDateOnly(localDate)
  const dayOffset = generatedDate && requestedDate
    ? Math.max(0, Math.floor((requestedDate.getTime() - generatedDate.getTime()) / 86_400_000))
    : 0
  const dayIndex = Math.min(dayOffset, dailyPlan.length - 1)

  return dailyPlan[dayIndex] ?? dailyPlan[0]
}

function createNutritionAction(
  day: FirstWeekDay,
  planningRules: HealthContextPlanningRule[],
  safetyFlags: HealthContextSafetyFlag[],
  localDate: string,
): HealthAction {
  const restaurantRule = findRule(planningRules, 'restaurant-guidance')
  const noTrackingRule = findRule(planningRules, 'no-tracking-nutrition')
  const restrictionRule = findRule(planningRules, 'avoid-restrictive-dieting')

  if (restrictionRule || hasSafetyCategory(safetyFlags, 'eating_behavior')) {
    return {
      area: 'nutrition',
      cta: 'Pick meal',
      duration: '8-12 min',
      effort: 'low',
      evidence: 'practical',
      id: `graph-nutrition-${localDate}`,
      status: 'ready',
      title: 'Choose a steady meal anchor',
      why: `Use ${day.nutritionFocus.toLowerCase()} without calorie pressure, restriction, or compensation language.`,
    }
  }

  if (restaurantRule) {
    return {
      area: 'nutrition',
      cta: 'Choose order',
      duration: '8-12 min',
      effort: 'low',
      evidence: 'practical',
      id: `graph-nutrition-${localDate}`,
      status: 'ready',
      title: 'Pick one goal-fit restaurant order',
      why: `${restaurantRule.description} Today's food focus: ${day.nutritionFocus}.`,
    }
  }

  if (noTrackingRule) {
    return {
      area: 'nutrition',
      cta: 'Use plate method',
      duration: '8-12 min',
      effort: 'low',
      evidence: 'practical',
      id: `graph-nutrition-${localDate}`,
      status: 'ready',
      title: 'Build one plate-method meal',
      why: `${noTrackingRule.description} Today's food focus: ${day.nutritionFocus}.`,
    }
  }

  return {
    area: 'nutrition',
    cta: 'Choose meal',
    duration: '8-12 min',
    effort: 'low',
    evidence: 'practical',
    id: `graph-nutrition-${localDate}`,
    status: 'ready',
    title: "Choose today's food anchor",
    why: `Keep it simple: ${day.nutritionFocus}. This supports the first-week plan without adding heavy tracking.`,
  }
}

function createMovementAction(
  day: FirstWeekDay,
  planningRules: HealthContextPlanningRule[],
  safetyFlags: HealthContextSafetyFlag[],
  localDate: string,
): HealthAction {
  const injuryRule = findRule(planningRules, 'avoid-high-impact')
  const lowRecoveryRule = findRule(planningRules, 'low-recovery-workout-cap')
  const beginnerRule = findRule(planningRules, 'beginner-progressive-workouts')
  const hasMedicalBoundary = hasSafetyCategory(safetyFlags, 'medical')
  const hasPregnancyBoundary = hasSafetyCategory(safetyFlags, 'pregnancy_postpartum')

  if (injuryRule || hasMedicalBoundary || hasPregnancyBoundary) {
    return {
      area: 'movement',
      cta: 'Start gentle',
      duration: '10-20 min',
      effort: 'low',
      evidence: movementEvidence(day),
      id: `graph-movement-${localDate}`,
      status: 'ready',
      title: 'Use a low-impact movement option',
      why: `Safety comes first: ${day.movementFocus}. Stop or swap anything that causes pain, dizziness, or unusual symptoms.`,
    }
  }

  if (lowRecoveryRule) {
    return {
      area: 'movement',
      cta: 'Keep it light',
      duration: '10-20 min',
      effort: 'low',
      evidence: movementEvidence(day),
      id: `graph-movement-${localDate}`,
      status: 'scheduled',
      title: 'Cap intensity today',
      why: `${lowRecoveryRule.description} Today's movement focus: ${day.movementFocus}.`,
    }
  }

  if (beginnerRule) {
    return {
      area: 'movement',
      cta: 'Start plan',
      duration: '15-25 min',
      effort: 'medium',
      evidence: 'practical',
      id: `graph-movement-${localDate}`,
      status: 'scheduled',
      title: 'Do a beginner-progressive session',
      why: `${beginnerRule.description} Today's movement focus: ${day.movementFocus}.`,
    }
  }

  return {
    area: 'movement',
    cta: 'Move today',
    duration: shortDuration(day.estimatedTime),
    effort: 'medium',
    evidence: movementEvidence(day),
    id: `graph-movement-${localDate}`,
    status: 'scheduled',
    title: 'Complete the realistic movement block',
    why: `${day.movementFocus}. ${day.reason}`,
  }
}

function createRecoveryAction(
  day: FirstWeekDay,
  planningRules: HealthContextPlanningRule[],
  safetyFlags: HealthContextSafetyFlag[],
  localDate: string,
): HealthAction {
  const decisionRule = findRule(planningRules, 'reduce-decision-load')
  const scheduleRule = findRule(planningRules, 'short-weekday-actions')
  const hasSafety = safetyFlags.length > 0
  const area = decisionRule || scheduleRule ? 'habit' : 'recovery'

  return {
    area,
    cta: area === 'habit' ? 'Do reset' : 'Protect recovery',
    duration: hasSafety || scheduleRule ? '5-10 min' : '8-15 min',
    effort: 'low',
    evidence: recoveryEvidence(day),
    id: `graph-${area}-${localDate}`,
    status: 'ready',
    title: decisionRule ? 'Do the smallest useful reset' : "Protect tonight's recovery cue",
    why: `${day.recoveryFocus}. Optional bonus: ${day.optionalBonus}.`,
  }
}

function createMetrics(graph: HealthContextGraph): DailyMetric[] {
  return [
    {
      detail: `${formatLabel(graph.userSnapshot.recommendedStartingIntensity)} starting intensity`,
      label: 'Readiness',
      tone: graph.userSnapshot.readinessLevel === 'low' ? 'attention' : 'calm',
      value: formatLabel(graph.userSnapshot.readinessLevel),
    },
    {
      detail: 'Design constraints captured',
      label: 'Friction',
      tone: graph.frictionPoints.length > 0 ? 'attention' : 'good',
      value: String(graph.frictionPoints.length),
    },
    {
      detail: graph.safetyFlags.length > 0 ? 'Use conservative guidance' : 'No major flags',
      label: 'Safety',
      tone: graph.safetyFlags.length > 0 ? 'attention' : 'good',
      value: graph.safetyFlags.length > 0 ? String(graph.safetyFlags.length) : 'Clear',
    },
    {
      detail: 'Graph confidence',
      label: 'Plan fit',
      tone: graph.userSnapshot.confidence === 'high' ? 'good' : 'steady',
      value: formatLabel(graph.userSnapshot.confidence),
    },
  ]
}

function createFocus(day: FirstWeekDay, graph: HealthContextGraph) {
  const safetyPrefix = graph.safetyFlags.length > 0 ? 'Conservative plan: ' : ''
  return `${safetyPrefix}Day ${day.dayNumber}: ${day.title}. ${day.reason}`
}

function createWeeklyPattern(graph: HealthContextGraph) {
  const ruleTitles = graph.planningRules
    .filter((rule) => rule.priority === 'critical' || rule.priority === 'high')
    .slice(0, 3)
    .map((rule) => rule.title.toLowerCase())

  const ruleSummary = ruleTitles.length
    ? `Use ${toReadableList(ruleTitles)}.`
    : 'Start easier than expected and adjust from feedback.'

  return `${ruleSummary} ${graph.firstWeekPlan.reasoning}`
}

function findRule(planningRules: HealthContextPlanningRule[], id: string) {
  return planningRules.find((rule) => rule.id === id)
}

function hasSafetyCategory(
  safetyFlags: HealthContextSafetyFlag[],
  category: HealthContextSafetyFlag['category'],
) {
  return safetyFlags.some((flag) => flag.category === category)
}

function movementEvidence(day: FirstWeekDay): HealthAction['evidence'] {
  return includesAny(day.movementFocus, ['walk', 'walking']) ? 'strong' : 'practical'
}

function recoveryEvidence(day: FirstWeekDay): HealthAction['evidence'] {
  return includesAny(day.recoveryFocus, ['sleep', 'wind-down', 'caffeine']) ? 'strong' : 'practical'
}

function shortDuration(estimatedTime: string) {
  if (estimatedTime.includes('10') || estimatedTime.includes('15') || estimatedTime.includes('20')) {
    return estimatedTime
  }

  return '15-25 min'
}

function includesAny(value: string, needles: string[]) {
  const normalized = value.toLowerCase()
  return needles.some((needle) => normalized.includes(needle))
}

function getDateOnly(value: string) {
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function toReadableList(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? ''
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}
