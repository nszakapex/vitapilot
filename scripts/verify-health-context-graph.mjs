import { createServer } from '../apps/prototype/node_modules/vite/dist/node/index.js'

const realisticTestIntake = {
  freeform:
    'I walk most evenings and want high protein meals, but late work creates no time. Stress is high, I eat fast food after meetings, sleep has been poor, and knee pain means I need low impact movement.',
  responses: [
    { answers: ['Time', 'Stress', 'Eating out'], questionId: 'friction' },
    { answers: ['High-protein meals', 'Restaurant orders', 'No tracking'], questionId: 'food-style' },
    { answers: ['Walking', 'Low-impact classes'], questionId: 'movement-style' },
    { answers: ['Poor sleep', 'Stress'], questionId: 'recovery' },
    { answers: ['Analytical'], questionId: 'coach-tone' },
    { answers: ['Injury limitation'], questionId: 'safety' },
  ],
  updatedAt: '2026-05-20T12:00:00.000Z',
}

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
  const graph = buildHealthContextGraph(realisticTestIntake)
  const todayPlan = buildDailyPlanFromGraph(graph, '2026-05-20')

  const checks = [
    ['walking strength', hasId(graph.strengths, 'low-friction-walking')],
    ['protein awareness strength', hasId(graph.strengths, 'protein-awareness')],
    ['time pressure friction', hasId(graph.frictionPoints, 'time-pressure')],
    ['stress friction', hasId(graph.frictionPoints, 'stress-load')],
    ['eating out nutrition friction', hasId(graph.frictionPoints, 'restaurant-dependence')],
    ['poor sleep recovery friction', hasId(graph.frictionPoints, 'poor-sleep')],
    ['knee pain or injury safety flag', hasId(graph.safetyFlags, 'injury-limitation')],
    ['short weekday planning rule', hasId(graph.planningRules, 'short-weekday-actions')],
    ['restaurant planning rule', hasId(graph.planningRules, 'restaurant-guidance')],
    ['low recovery workout cap', hasId(graph.planningRules, 'low-recovery-workout-cap')],
    ['injury-aware movement rule', hasId(graph.planningRules, 'avoid-high-impact')],
    ['first week shifts easier', graph.firstWeekPlan.difficulty === 'easy'],
    [
      'Today movement respects safety',
      todayPlan.actions.some((action) =>
        action.area === 'movement' &&
        action.title.toLowerCase().includes('low-impact') &&
        action.why.toLowerCase().includes('safety'),
      ),
    ],
  ]

  const failedChecks = checks.filter(([, passed]) => !passed)

  console.log('Health Context Graph manual verification')
  console.log(`Strengths: ${graph.strengths.map((item) => item.id).join(', ')}`)
  console.log(`Friction: ${graph.frictionPoints.map((item) => item.id).join(', ')}`)
  console.log(`Safety: ${graph.safetyFlags.map((item) => item.id).join(', ')}`)
  console.log(`Rules: ${graph.planningRules.map((item) => item.id).join(', ')}`)
  console.log(`First-week difficulty: ${graph.firstWeekPlan.difficulty}`)
  console.log(`Today actions: ${todayPlan.actions.map((action) => action.title).join(' | ')}`)

  if (failedChecks.length) {
    console.error(`Failed checks: ${failedChecks.map(([label]) => label).join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('All manual graph checks passed.')
  }
} finally {
  await server.close()
}

function hasId(items, id) {
  return items.some((item) => item.id === id)
}
