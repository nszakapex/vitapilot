import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const prototypeRequire = createRequire(new URL('../apps/prototype/package.json', import.meta.url))
const { createServer } = await import(pathToFileURL(prototypeRequire.resolve('vite')).href)

const localDate = '2026-05-20'

const scenarios = [
  {
    name: 'Busy fat-loss beginner',
    intake: createIntake({
      freeform:
        'I want fat loss and better energy, but I am busy with a packed schedule and no time after long shifts. I am a beginner and need simple workouts.',
      responses: [
        { questionId: 'friction', answers: ['Time'] },
        { questionId: 'food-style', answers: ['High-protein meals'] },
        { questionId: 'movement-style', answers: ['Gym beginner plan', 'Walking'] },
        { questionId: 'coach-tone', answers: ['Gentle'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['time pressure friction', hasId(graph.frictionPoints, 'time-pressure')],
      ({ graph }) => ['short-action planning rule', hasId(graph.planningRules, 'short-weekday-actions')],
      ({ graph }) => ['easy first-week plan', graph.firstWeekPlan.difficulty === 'easy'],
      ({ todayPlan }) => ['short movement action', movementAction(todayPlan).duration.includes('10') || movementAction(todayPlan).duration.includes('15')],
      ({ todayPlan }) => ['no aggressive diet recommendation', !containsAny(planText(todayPlan), ['aggressive diet', 'fasting', 'calorie restriction'])],
    ],
  },
  {
    name: 'Restaurant-heavy no-tracking user',
    intake: createIntake({
      freeform:
        'I eat out most days, grab takeout and doordash after work, and I do not want tracking or calorie math.',
      responses: [
        { questionId: 'friction', answers: ['Eating out'] },
        { questionId: 'food-style', answers: ['Restaurant orders', 'No tracking'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'recovery', answers: ['Stress'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['restaurant friction', hasId(graph.frictionPoints, 'restaurant-dependence')],
      ({ graph }) => ['no-tracking planning rule', hasId(graph.planningRules, 'no-tracking-nutrition')],
      ({ todayPlan }) => ['restaurant nutrition guidance', nutritionAction(todayPlan).title.toLowerCase().includes('restaurant')],
      ({ todayPlan }) => ['no calorie-counting recommendation', !containsAny(actionText(nutritionAction(todayPlan)), ['calorie count', 'calorie-counting', 'macro target'])],
    ],
  },
  {
    name: 'Poor sleep + low energy user',
    intake: createIntake({
      freeform:
        'Bad sleep, late nights, wake up tired, and low energy with an afternoon crash make intense workouts hard.',
      responses: [
        { questionId: 'friction', answers: ['Low energy'] },
        { questionId: 'food-style', answers: ['Pantry meals'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'recovery', answers: ['Poor sleep'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['recovery friction', hasId(graph.frictionPoints, 'poor-sleep')],
      ({ graph }) => ['low-energy friction', hasId(graph.frictionPoints, 'low-energy')],
      ({ graph }) => ['cap-intensity planning rule', hasId(graph.planningRules, 'low-recovery-workout-cap') && hasId(graph.planningRules, 'low-energy-intensity-cap')],
      ({ todayPlan }) => ['Today movement is low or moderate intensity', ['low', 'medium'].includes(movementAction(todayPlan).effort)],
      ({ todayPlan }) => ['Today movement caps intensity', containsAny(actionText(movementAction(todayPlan)), ['cap intensity', 'walking', 'mobility', 'light'])],
    ],
  },
  {
    name: 'Injury limitation user',
    intake: createIntake({
      freeform:
        'I have knee pain and limited mobility after an injury, so jumping and running are not realistic.',
      responses: [
        { questionId: 'friction', answers: ['Time'] },
        { questionId: 'food-style', answers: ['High-protein meals'] },
        { questionId: 'movement-style', answers: ['Low-impact classes', 'Walking'] },
        { questionId: 'safety', answers: ['Injury limitation'] },
      ],
    }),
    checks: [
      ({ graph }) => ['injury safety flag', hasId(graph.safetyFlags, 'injury-limitation')],
      ({ graph }) => ['high-impact blocked recommendation', hasBlocked(graph, 'high_impact_exercise')],
      ({ todayPlan }) => ['low-impact Today movement', containsAny(actionText(movementAction(todayPlan)), ['low-impact', 'gentle'])],
    ],
  },
  {
    name: 'Eating-behavior-sensitive user',
    intake: createIntake({
      freeform:
        'I have an eating disorder history, binge eating concerns, guilt after eating, and I get obsessed with tracking.',
      responses: [
        { questionId: 'food-style', answers: ['No tracking'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'recovery', answers: ['Stress'] },
        { questionId: 'safety', answers: ['Eating disorder history'] },
      ],
    }),
    checks: [
      ({ graph }) => ['eating behavior safety flag', hasId(graph.safetyFlags, 'eating-behavior-risk')],
      ({ graph }) => ['strong disclaimer', graph.safetyFlags.some((flag) => flag.id === 'eating-behavior-risk' && flag.disclaimerLevel === 'strong')],
      ({ graph }) => ['blocked calorie restriction, fasting, and weigh-in pressure', hasBlocked(graph, 'calorie_restriction') && hasBlocked(graph, 'fasting') && hasBlocked(graph, 'weigh_in_pressure')],
      ({ todayPlan }) => ['nutrition action focuses on steady meals', nutritionAction(todayPlan).title.toLowerCase().includes('steady meal')],
      ({ todayPlan }) => ['no restriction language in Today nutrition action', !containsAny(actionText(nutritionAction(todayPlan)), ['calorie', 'restrict', 'fasting', 'weigh'])],
    ],
  },
  {
    name: 'Medical symptom user',
    intake: createIntake({
      freeform:
        'I had chest pain and passed out once. Sometimes I have shortness of breath and severe dizziness.',
      responses: [
        { questionId: 'food-style', answers: ['No tracking'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'recovery', answers: ['Poor sleep'] },
      ],
    }),
    checks: [
      ({ graph }) => ['high-risk medical safety flag', graph.safetyFlags.some((flag) => flag.id === 'urgent-medical-symptom' && flag.riskLevel === 'high')],
      ({ graph }) => ['urgent or emergency care language', containsAny(safetyText(graph), ['urgent', 'emergency medical care'])],
      ({ graph }) => ['intense workouts blocked', hasBlocked(graph, 'intense_workouts')],
      ({ todayPlan }) => ['conservative Today movement', containsAny(actionText(movementAction(todayPlan)), ['conservative', 'avoid intense', 'professional guidance'])],
    ],
  },
  {
    name: 'Sparse intake user',
    intake: createIntake({
      freeform: '',
      responses: [
        { questionId: 'coach-tone', answers: ['Gentle'] },
      ],
    }),
    checks: [
      ({ graph }) => ['graph builds', graph.id.startsWith('health-context-')],
      ({ graph }) => ['confidence is lower', graph.userSnapshot.confidence === 'low'],
      ({ graph }) => ['missing information is populated', graph.confidence.missingInformation.length >= 5],
      ({ graph }) => ['safety follow-up is included', graph.confidence.recommendedFollowUpQuestions.some((question) => question.toLowerCase().includes('injuries'))],
      ({ graph }) => ['first-week plan remains conservative', graph.firstWeekPlan.difficulty === 'moderate' || graph.firstWeekPlan.difficulty === 'easy'],
      ({ graph }) => ['no fake high confidence', graph.confidence.lowConfidenceAssumptions.length >= 5],
    ],
  },
  {
    name: 'Budget-constrained user',
    intake: createIntake({
      freeform:
        'I am on a tight budget, need cheap meals, and expensive groceries make plans hard to follow.',
      responses: [
        { questionId: 'friction', answers: ['Cost'] },
        { questionId: 'food-style', answers: ['Cheap groceries', 'No tracking'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['budget friction', hasId(graph.frictionPoints, 'budget-pressure')],
      ({ graph }) => ['budget meal planning rule', hasId(graph.planningRules, 'budget-meal-anchors')],
      ({ todayPlan }) => ['budget nutrition action', containsAny(actionText(nutritionAction(todayPlan)), ['budget', 'affordable'])],
    ],
  },
  {
    name: 'Travel-heavy user',
    intake: createIntake({
      freeform:
        'I travel a lot for work trips, stay in hotels, and spend many days on the road.',
      responses: [
        { questionId: 'food-style', answers: ['Restaurant orders'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'recovery', answers: ['Travel'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['travel friction', hasId(graph.frictionPoints, 'travel-disruption')],
      ({ graph }) => ['travel-safe planning rule', hasId(graph.planningRules, 'travel-safe-defaults')],
      ({ todayPlan }) => ['travel nutrition action', containsAny(actionText(nutritionAction(todayPlan)), ['travel', 'portable'])],
    ],
  },
  {
    name: 'No-gym inconsistent user',
    intake: createIntake({
      freeform:
        'No gym, no equipment, bodyweight only. I fall off, start and stop, and lose momentum on weekends.',
      responses: [
        { questionId: 'food-style', answers: ['No tracking'] },
        { questionId: 'movement-style', answers: ['Short home workouts'] },
        { questionId: 'recovery', answers: ['Mental fatigue'] },
        { questionId: 'safety', answers: ['None right now'] },
      ],
    }),
    checks: [
      ({ graph }) => ['no-gym friction', hasId(graph.frictionPoints, 'no-gym-access')],
      ({ graph }) => ['inconsistency friction', hasId(graph.frictionPoints, 'inconsistency-pattern')],
      ({ graph }) => ['no-gym movement rule', hasId(graph.planningRules, 'no-gym-movement')],
      ({ graph }) => ['minimum viable habits rule', hasId(graph.planningRules, 'minimum-viable-habits')],
      ({ todayPlan }) => ['no gym-dependent movement action', !containsAny(actionText(movementAction(todayPlan)), ['gym session', 'machine', 'barbell', 'treadmill'])],
    ],
  },
  {
    name: 'Pregnancy/postpartum and medication user',
    intake: createIntake({
      freeform:
        'I am postpartum and taking prescription medication, so I need clinician-cleared movement and no supplement advice.',
      responses: [
        { questionId: 'food-style', answers: ['Pantry meals'] },
        { questionId: 'movement-style', answers: ['Walking'] },
        { questionId: 'safety', answers: ['Pregnancy/postpartum', 'Medication concern'] },
      ],
    }),
    checks: [
      ({ graph }) => ['pregnancy/postpartum safety flag', hasId(graph.safetyFlags, 'pregnancy-postpartum')],
      ({ graph }) => ['medication safety flag', hasId(graph.safetyFlags, 'medication-boundary')],
      ({ graph }) => ['advanced training blocked', hasBlocked(graph, 'advanced_training')],
      ({ graph }) => ['medication advice blocked', hasBlocked(graph, 'medication_advice')],
      ({ todayPlan }) => ['conservative movement action', containsAny(actionText(movementAction(todayPlan)), ['gentle', 'safety', 'low-impact'])],
    ],
  },
]

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  root: process.cwd(),
  server: { middlewareMode: true },
})

try {
  const {
    buildDailyPlanFromGraph,
    buildHealthContextGraph,
  } = await server.ssrLoadModule('/packages/core/src/index.ts')

  const results = scenarios.map((scenario) => {
    const graph = buildHealthContextGraph(scenario.intake)
    const todayPlan = buildDailyPlanFromGraph(graph, localDate)
    const failedChecks = scenario.checks
      .map((check) => check({ graph, todayPlan }))
      .filter(([, passed]) => !passed)
      .map(([label]) => label)

    return {
      failedChecks,
      graph,
      name: scenario.name,
      todayPlan,
    }
  })

  console.log('Health Context Graph scenario verification')

  for (const result of results) {
    const status = result.failedChecks.length ? 'FAIL' : 'PASS'
    console.log(`${status}: ${result.name}`)
    console.log(`  Friction: ${result.graph.frictionPoints.map((item) => item.id).join(', ') || 'none'}`)
    console.log(`  Safety: ${result.graph.safetyFlags.map((item) => item.id).join(', ') || 'none'}`)
    console.log(`  Rules: ${result.graph.planningRules.map((item) => item.id).join(', ') || 'none'}`)
    console.log(`  Confidence: ${result.graph.userSnapshot.confidence}`)
    console.log(`  Today: ${result.todayPlan.actions.map((action) => action.title).join(' | ')}`)

    if (result.failedChecks.length) {
      console.log(`  Failed checks: ${result.failedChecks.join(', ')}`)
    }
  }

  const failedScenarios = results.filter((result) => result.failedChecks.length > 0)

  if (failedScenarios.length) {
    console.error(`Failed graph scenarios: ${failedScenarios.map((result) => result.name).join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('All graph scenario checks passed.')
  }
} finally {
  await server.close()
}

function createIntake({ freeform, responses }) {
  return {
    freeform,
    responses,
    updatedAt: '2026-05-20T12:00:00.000Z',
  }
}

function hasId(items, id) {
  return items.some((item) => item.id === id)
}

function hasBlocked(graph, recommendationType) {
  return graph.safetyFlags.some((flag) =>
    flag.blockedRecommendationTypes.includes(recommendationType),
  )
}

function nutritionAction(plan) {
  return plan.actions.find((action) => action.area === 'nutrition')
}

function movementAction(plan) {
  return plan.actions.find((action) => action.area === 'movement')
}

function actionText(action) {
  return `${action?.title ?? ''} ${action?.why ?? ''} ${action?.cta ?? ''}`.toLowerCase()
}

function planText(plan) {
  return plan.actions.map(actionText).join(' ')
}

function safetyText(graph) {
  return graph.safetyFlags
    .map((flag) => `${flag.appBehaviorRule} ${flag.userFacingLanguage}`)
    .join(' ')
    .toLowerCase()
}

function containsAny(value, phrases) {
  return phrases.some((phrase) => value.toLowerCase().includes(phrase.toLowerCase()))
}
