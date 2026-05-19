import { seedLifeIntake } from '../data/mockHealthPlan'
import type { LifeIntake } from '../types/health'
import type {
  FirstWeekDay,
  FirstWeekDifficulty,
  FirstWeekPlan,
  HealthContextConfidence,
  HealthContextFrictionPoint,
  HealthContextGraph,
  HealthContextPlanningRule,
  HealthContextSafetyFlag,
  HealthContextStrength,
  ReadinessLevel,
  StartingIntensity,
  UserSnapshot,
} from '../types/healthContextGraph'

export function buildHealthContextGraph(intake: LifeIntake): HealthContextGraph {
  const answersByQuestionId = getAnswersByQuestionId(intake)
  const strengths = detectStrengths(intake, answersByQuestionId)
  const frictionPoints = detectFrictionPoints(intake, answersByQuestionId)
  const safetyFlags = detectSafetyFlags(intake, answersByQuestionId)
  const planningRules = createPlanningRules(intake, answersByQuestionId, frictionPoints, safetyFlags)
  const firstWeekPlan = createFirstWeekPlan(intake, planningRules, frictionPoints, safetyFlags)
  const confidence = calculateGraphConfidence(intake, strengths, frictionPoints, safetyFlags)
  const userSnapshot = createUserSnapshot(
    intake,
    answersByQuestionId,
    frictionPoints,
    safetyFlags,
    confidence,
  )

  return {
    confidence,
    firstWeekPlan,
    frictionPoints,
    generatedAt: new Date().toISOString(),
    id: `health-context-${stableHash(JSON.stringify(intake))}`,
    planningRules,
    safetyFlags,
    sourceIntakeUpdatedAt: intake.updatedAt,
    strengths,
    userSnapshot,
  }
}

export function getAnswersByQuestionId(intake: LifeIntake): Record<string, string[]> {
  return intake.responses.reduce<Record<string, string[]>>((answersById, response) => {
    answersById[response.questionId] = response.answers
    return answersById
  }, {})
}

export function detectStrengths(
  intake: LifeIntake,
  answersByQuestionId = getAnswersByQuestionId(intake),
): HealthContextStrength[] {
  const strengths: HealthContextStrength[] = []
  const freeform = normalize(intake.freeform)

  if (hasAnswer(answersByQuestionId, 'movement-style', 'Walking') || mentions(freeform, ['walking', 'walks'])) {
    strengths.push({
      confidence: 'high',
      description: 'Walking is already a realistic movement option.',
      id: 'low-friction-walking',
      relatedInputs: relatedInputs(['Walking'], ['walking', 'walks'], freeform),
      title: 'Low-friction movement',
      whyItMatters: 'Walking is easy to scale, recovery-friendly, and useful on busy or low-energy days.',
    })
  }

  if (
    hasAnswer(answersByQuestionId, 'food-style', 'High-protein meals') ||
    mentions(freeform, ['protein', 'high protein'])
  ) {
    strengths.push({
      confidence: 'high',
      description: 'Protein is already part of the user vocabulary.',
      id: 'protein-awareness',
      relatedInputs: relatedInputs(['High-protein meals'], ['protein', 'high protein'], freeform),
      title: 'Protein awareness',
      whyItMatters: 'Protein-forward meals can support satiety and make food choices easier without aggressive tracking.',
    })
  }

  if (hasAnswer(answersByQuestionId, 'coach-tone', 'Analytical')) {
    strengths.push({
      confidence: 'high',
      description: 'The user is likely to respond well to clear reasoning and structured feedback.',
      id: 'structured-feedback',
      relatedInputs: ['Analytical'],
      title: 'Structured feedback fit',
      whyItMatters: 'A more analytical coaching style can explain tradeoffs and increase trust in plan changes.',
    })
  }

  if (mentions(freeform, ['consistency', 'routine'])) {
    strengths.push({
      confidence: 'medium',
      description: 'The user is thinking in terms of repeatable behavior.',
      id: 'routine-awareness',
      relatedInputs: relatedInputs([], ['consistency', 'routine'], freeform),
      title: 'Routine awareness',
      whyItMatters: 'Users who name consistency or routine are good candidates for small repeatable actions.',
    })
  }

  if (mentions(freeform, ['gym', 'strength', 'lifting'])) {
    strengths.push({
      confidence: 'medium',
      description: 'Strength or gym interest is present in the intake.',
      id: 'strength-interest',
      relatedInputs: relatedInputs([], ['gym', 'strength', 'lifting'], freeform),
      title: 'Strength-building interest',
      whyItMatters: 'Strength training can be phased in with simple, beginner-progressive workouts.',
    })
  }

  if (mentions(freeform, ['cooking', 'meal prep', 'meal-prep'])) {
    strengths.push({
      confidence: 'medium',
      description: 'The user may be open to prepared meals or simple cooking systems.',
      id: 'meal-prep-openness',
      relatedInputs: relatedInputs([], ['cooking', 'meal prep', 'meal-prep'], freeform),
      title: 'Meal-prep openness',
      whyItMatters: 'Even one prepared meal can reduce restaurant dependence and decision fatigue.',
    })
  }

  if (mentions(freeform, ['sleep'])) {
    strengths.push({
      confidence: 'medium',
      description: 'The intake already connects sleep to health behavior.',
      id: 'sleep-awareness',
      relatedInputs: relatedInputs([], ['sleep'], freeform),
      title: 'Sleep awareness',
      whyItMatters: 'Sleep awareness helps the app justify lighter training and simpler food on low-recovery days.',
    })
  }

  return uniqueById(strengths)
}

export function detectFrictionPoints(
  intake: LifeIntake,
  answersByQuestionId = getAnswersByQuestionId(intake),
): HealthContextFrictionPoint[] {
  const frictionPoints: HealthContextFrictionPoint[] = []
  const freeform = normalize(intake.freeform)

  if (hasAnswer(answersByQuestionId, 'friction', 'Time') || mentions(freeform, ['no time', 'late work'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'The user reports limited time or late work as a barrier.',
      id: 'time-pressure',
      impactArea: 'schedule',
      relatedInputs: relatedInputs(['Time'], ['no time', 'late work'], freeform),
      severity: 'high',
      suggestedAdjustment: 'Keep weekday health actions short, pre-decided, and easy to swap.',
      title: 'Time pressure',
      whyItMatters: 'Plans that require long uninterrupted blocks are likely to fail.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'friction', 'Stress') || mentions(freeform, ['stress', 'stressed'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'Stress is likely to affect food choices, motivation, and recovery.',
      id: 'stress-load',
      impactArea: 'stress',
      relatedInputs: relatedInputs(['Stress'], ['stress', 'stressed'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Use simpler meals, shorter workouts, and decompression actions on high-stress days.',
      title: 'Stress load',
      whyItMatters: 'Stress often changes follow-through more than knowledge does.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'friction', 'Eating out') ||
    hasAnswer(answersByQuestionId, 'food-style', 'Restaurant orders') ||
    mentions(freeform, ['eating out', 'restaurant', 'fast food'])
  ) {
    frictionPoints.push(createFrictionPoint({
      description: 'Restaurants or fast food are part of the real food environment.',
      id: 'restaurant-dependence',
      impactArea: 'nutrition',
      relatedInputs: relatedInputs(
        ['Eating out', 'Restaurant orders'],
        ['eating out', 'restaurant', 'fast food'],
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Prioritize restaurant-order guidance, protein anchors, and good-enough swaps.',
      title: 'Eating-out friction',
      whyItMatters: 'Home-recipe-only planning will not match the user life context.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'recovery', 'Poor sleep')) {
    frictionPoints.push(createFrictionPoint({
      description: 'Poor sleep should change exercise intensity and craving support.',
      id: 'poor-sleep',
      impactArea: 'recovery',
      relatedInputs: ['Poor sleep'],
      severity: 'high',
      suggestedAdjustment: 'Avoid high-intensity workouts on low-recovery days and simplify evening routines.',
      title: 'Poor sleep risk',
      whyItMatters: 'Low sleep can reduce adherence and increase perceived effort.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'recovery', 'Mental fatigue') || mentions(freeform, ['mental fatigue'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'Mental fatigue may make decision-heavy plans harder to follow.',
      id: 'mental-fatigue',
      impactArea: 'mindset',
      relatedInputs: relatedInputs(['Mental fatigue'], ['mental fatigue'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Offer one-step options and remove unnecessary choices late in the day.',
      title: 'Mental fatigue',
      whyItMatters: 'Decision fatigue can break otherwise reasonable plans.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'friction', 'Cost') || mentions(freeform, ['cost', 'budget', 'expensive'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'Cost or budget pressure appears in the intake.',
      id: 'budget-pressure',
      impactArea: 'nutrition',
      relatedInputs: relatedInputs(['Cost'], ['cost', 'budget', 'expensive'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Favor low-cost staples, leftovers, and affordable restaurant choices.',
      title: 'Budget pressure',
      whyItMatters: 'Premium wellness plans fail when they ignore affordability.',
    }))
  }

  if (mentions(freeform, ['low energy', 'tired', 'exhausted'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'Low energy is likely to affect movement and meal effort.',
      id: 'low-energy',
      impactArea: 'consistency',
      relatedInputs: relatedInputs([], ['low energy', 'tired', 'exhausted'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Use minimum viable actions and recovery-aware movement.',
      title: 'Low-energy follow-through risk',
      whyItMatters: 'Plans should preserve momentum without requiring high motivation.',
    }))
  }

  if (mentions(freeform, ['weekend falloff', 'fall off', 'fell off'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'The user names a pattern of dropping momentum after disruption.',
      id: 'weekend-falloff',
      impactArea: 'consistency',
      relatedInputs: relatedInputs([], ['weekend falloff', 'fall off', 'fell off'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Build an explicit reset flow and avoid streak-based shame.',
      title: 'Re-entry risk',
      whyItMatters: 'The app must help the user restart instead of treating missed days as failure.',
    }))
  }

  if (mentions(freeform, ['travel', 'hotel', 'airport'])) {
    frictionPoints.push(createFrictionPoint({
      description: 'Travel may disrupt routine, food options, and movement access.',
      id: 'travel-disruption',
      impactArea: 'schedule',
      relatedInputs: relatedInputs([], ['travel', 'hotel', 'airport'], freeform),
      severity: 'medium',
      suggestedAdjustment: 'Create travel-safe meal and movement fallbacks.',
      title: 'Travel disruption',
      whyItMatters: 'The app should make the plan portable, not dependent on a perfect home routine.',
    }))
  }

  return uniqueById(frictionPoints)
}

export function detectSafetyFlags(
  intake: LifeIntake,
  answersByQuestionId = getAnswersByQuestionId(intake),
): HealthContextSafetyFlag[] {
  const safetyFlags: HealthContextSafetyFlag[] = []
  const freeform = normalize(intake.freeform)

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Injury limitation') ||
    mentions(freeform, ['knee pain', 'back pain', 'injury', 'injured'])
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Avoid high-impact or pain-provoking movement and offer low-impact alternatives unless the user is cleared by a professional.',
      category: 'injury',
      description: 'The intake suggests an injury limitation or pain pattern.',
      disclaimerLevel: 'standard',
      id: 'injury-limitation',
      riskLevel: 'medium',
      title: 'Injury-aware planning needed',
      userFacingLanguage: 'I will keep movement options joint-friendly and suggest professional guidance for pain or injury questions.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Eating disorder history') ||
    mentions(freeform, ['eating disorder', 'restriction', 'binge'])
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not recommend calorie counting, aggressive restriction, weigh-in pressure, compensatory exercise, or fasting protocols.',
      category: 'eating_behavior',
      description: 'The intake suggests eating-behavior sensitivity.',
      disclaimerLevel: 'strong',
      id: 'eating-behavior-risk',
      riskLevel: 'high',
      title: 'Eating-behavior guardrail',
      userFacingLanguage: 'I will avoid restrictive dieting language and recommend licensed support for eating-disorder concerns.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Medical condition') ||
    mentions(freeform, ['medical condition', 'diabetes', 'chest pain', 'fainting', 'dizziness'])
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not provide medical diagnosis or treatment advice. Escalate urgent symptoms and condition-specific decisions to licensed care.',
      category: 'medical',
      description: 'The intake mentions a medical condition or symptom that should not be handled as ordinary wellness.',
      disclaimerLevel: mentions(freeform, ['chest pain', 'fainting']) ? 'strong' : 'standard',
      id: 'medical-boundary',
      riskLevel: mentions(freeform, ['chest pain', 'fainting']) ? 'high' : 'medium',
      title: 'Medical boundary',
      userFacingLanguage: 'I can support general wellness, but medical symptoms or condition-specific advice should go to a licensed professional.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Pregnancy/postpartum') ||
    mentions(freeform, ['pregnancy', 'pregnant', 'postpartum'])
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Avoid intense or restrictive recommendations and suggest clinician-cleared movement and nutrition choices.',
      category: 'pregnancy_postpartum',
      description: 'The intake mentions pregnancy or postpartum context.',
      disclaimerLevel: 'strong',
      id: 'pregnancy-postpartum',
      riskLevel: 'high',
      title: 'Pregnancy/postpartum guardrail',
      userFacingLanguage: 'I will keep suggestions conservative and recommend clinician guidance for pregnancy or postpartum planning.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Medication concern') ||
    mentions(freeform, ['medication', 'medicine', 'prescription'])
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not advise medication changes or supplement interactions; recommend pharmacist or clinician review.',
      category: 'medication',
      description: 'Medication concerns require professional review.',
      disclaimerLevel: 'strong',
      id: 'medication-boundary',
      riskLevel: 'high',
      title: 'Medication boundary',
      userFacingLanguage: 'I will not advise medication changes and will suggest a clinician or pharmacist for medication questions.',
    }))
  }

  return uniqueById(safetyFlags)
}

export function createPlanningRules(
  intake: LifeIntake,
  answersByQuestionId = getAnswersByQuestionId(intake),
  frictionPoints = detectFrictionPoints(intake, answersByQuestionId),
  safetyFlags = detectSafetyFlags(intake, answersByQuestionId),
): HealthContextPlanningRule[] {
  const rules: HealthContextPlanningRule[] = [
    {
      appliesTo: 'habits',
      description: 'Start with fewer actions than the user thinks they can handle.',
      example: 'Use one food action, one movement action, and one recovery action per day.',
      id: 'start-easier-than-expected',
      priority: 'high',
      title: 'Start easier than expected',
    },
  ]

  if (hasFriction(frictionPoints, 'time-pressure')) {
    rules.push(createPlanningRule({
      appliesTo: 'schedule',
      description: 'Keep weekday actions under 25 minutes.',
      example: 'Use a 12-minute meal decision and a 20-minute workout option.',
      id: 'short-weekday-actions',
      priority: 'high',
      title: 'Short weekday actions',
    }))
  }

  if (hasFriction(frictionPoints, 'restaurant-dependence')) {
    rules.push(createPlanningRule({
      appliesTo: 'meals',
      description: 'Include restaurant-order guidance instead of only home recipes.',
      example: 'Offer a fast-casual bowl order with protein, fiber, and a flexible side.',
      id: 'restaurant-guidance',
      priority: 'high',
      title: 'Restaurant guidance required',
    }))
  }

  if (hasFriction(frictionPoints, 'poor-sleep')) {
    rules.push(createPlanningRule({
      appliesTo: 'workouts',
      description: 'Do not recommend high-intensity workouts on low-recovery days.',
      example: 'Swap intervals for walking, mobility, or moderate strength.',
      id: 'low-recovery-workout-cap',
      priority: 'critical',
      title: 'Cap intensity after poor sleep',
    }))
  }

  if (hasSafetyFlag(safetyFlags, 'injury-limitation')) {
    rules.push(createPlanningRule({
      appliesTo: 'safety',
      description: 'Avoid high-impact movement unless cleared.',
      example: 'Use walking, cycling, mobility, or controlled strength instead of jumping.',
      id: 'avoid-high-impact',
      priority: 'critical',
      title: 'Injury-aware movement',
    }))
  }

  if (hasSafetyFlag(safetyFlags, 'eating-behavior-risk')) {
    rules.push(createPlanningRule({
      appliesTo: 'safety',
      description: 'Avoid calorie-counting, aggressive restriction, or weigh-in pressure.',
      example: 'Use plate-method meals, regular eating rhythm, and neutral food language.',
      id: 'avoid-restrictive-dieting',
      priority: 'critical',
      title: 'Avoid restrictive dieting',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'movement-style', 'Gym beginner plan')) {
    rules.push(createPlanningRule({
      appliesTo: 'workouts',
      description: 'Use beginner-progressive workouts with simple movement patterns.',
      example: 'Squat, hinge, row, push, carry, and walk before complex programming.',
      id: 'beginner-progressive-workouts',
      priority: 'high',
      title: 'Beginner-progressive workouts',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'food-style', 'No tracking')) {
    rules.push(createPlanningRule({
      appliesTo: 'meals',
      description: 'Prefer plate-method and habit-based nutrition.',
      example: 'Anchor meals with protein, plants or fiber, and enough hydration.',
      id: 'no-tracking-nutrition',
      priority: 'high',
      title: 'No-tracking nutrition mode',
    }))
  }

  if (hasFriction(frictionPoints, 'stress-load') || hasFriction(frictionPoints, 'mental-fatigue')) {
    rules.push(createPlanningRule({
      appliesTo: 'motivation',
      description: 'Use fewer choices and smaller reset actions during high stress or mental fatigue.',
      example: 'Offer one best option and one smallest useful action.',
      id: 'reduce-decision-load',
      priority: 'medium',
      title: 'Reduce decision load',
    }))
  }

  return uniqueById(rules)
}

export function createFirstWeekPlan(
  intake: LifeIntake,
  planningRules = createPlanningRules(intake),
  frictionPoints = detectFrictionPoints(intake),
  safetyFlags = detectSafetyFlags(intake),
): FirstWeekPlan {
  const hasSafety = safetyFlags.length > 0
  const hasPoorSleep = hasFriction(frictionPoints, 'poor-sleep')
  const hasTimePressure = hasFriction(frictionPoints, 'time-pressure')
  const hasRestaurantFriction = hasFriction(frictionPoints, 'restaurant-dependence')
  const hasNoTracking = planningRules.some((rule) => rule.id === 'no-tracking-nutrition')
  const difficulty: FirstWeekDifficulty = hasSafety || hasPoorSleep || hasTimePressure ? 'easy' : 'moderate'
  const movementBase = hasSafety
    ? 'Low-impact movement only'
    : hasPoorSleep
      ? 'Walking and moderate strength'
      : 'Short strength plus walking'
  const nutritionBase = hasNoTracking
    ? 'Plate-method meals'
    : hasRestaurantFriction
      ? 'Restaurant-order anchors'
      : 'Protein-forward meals'

  const dailyPlan: FirstWeekDay[] = [
    createFirstWeekDay(1, 'Baseline day', nutritionBase, '10-20 minute walk', 'Early wind-down cue', 'Save one go-to restaurant order', '15-25 min', 'Start with observation and one easy action.'),
    createFirstWeekDay(2, 'Food anchor day', 'Protein-forward breakfast or lunch', movementBase, 'Hydration check by mid-afternoon', 'Prep one backup snack', '20-30 min', 'Food stability makes later choices easier.'),
    createFirstWeekDay(3, 'Movement confidence day', 'Good-enough meal swap', hasSafety ? 'Low-impact mobility' : 'Simple full-body strength', 'Five-minute cooldown', 'Add a local walk route', '20-35 min', 'Build confidence without chasing intensity.'),
    createFirstWeekDay(4, 'Recovery-aware day', 'Simple restaurant or pantry option', 'Walk or rest based on sleep', 'Caffeine cutoff reminder', 'Stretch while watching TV', '10-25 min', 'The app should adapt before the user burns out.'),
    createFirstWeekDay(5, 'Consistency day', "Repeat yesterday's easiest meal win", 'Short workout or walking fallback', 'Stress reset after work', 'Text a friend or save a local event', '15-30 min', 'Repeating a small win is more useful than novelty.'),
    createFirstWeekDay(6, 'Social-life day', hasRestaurantFriction ? 'Restaurant plan before arrival' : 'Flexible meal with protein anchor', 'Outdoor walk or beginner class', 'No-shame evening reset', 'Try a local wellness event', '20-45 min', 'Weekend planning should preserve flexibility.'),
    createFirstWeekDay(7, 'Review day', 'Choose two meals worth repeating', 'Easy walk or mobility', 'Five-minute reflection', 'Build next week from what worked', '15-25 min', 'Reflection turns actions into personalization data.'),
  ]

  return {
    dailyPlan,
    difficulty,
    estimatedTimeDemand: hasTimePressure ? '10-30 minutes per day' : '15-45 minutes per day',
    hydrationAction: 'Pair water with the first meal and check hydration once before mid-afternoon.',
    movementActions: [
      hasSafety ? 'Use low-impact movement until safety context is clearer.' : 'Complete two short movement sessions.',
      'Use walking as the default fallback on low-energy days.',
      'Stop or swap any movement that causes pain, dizziness, or unusual symptoms.',
    ],
    nutritionActions: [
      hasRestaurantFriction ? 'Save two restaurant orders that fit the user goals.' : 'Choose two repeatable protein-forward meals.',
      hasNoTracking ? 'Use plate-method guidance instead of calorie tracking.' : 'Track only simple meal patterns this week.',
      'Avoid aggressive dieting or compensation language.',
    ],
    overview: 'A conservative first week designed to create momentum without overloading the user.',
    reasoning: 'The plan starts easier than expected, respects safety and recovery signals, and prioritizes repeatable decisions over optimization.',
    recoveryActions: [
      hasPoorSleep ? 'Treat poor sleep as a reason to lower intensity, not to skip health entirely.' : 'Add one evening wind-down cue.',
      'Use a small reset after stressful days.',
    ],
    reflectionAction: 'At the end of the week, answer: what was easy, what got in the way, and what should the assistant change?',
  }
}

export function calculateGraphConfidence(
  intake: LifeIntake,
  strengths = detectStrengths(intake),
  frictionPoints = detectFrictionPoints(intake),
  safetyFlags = detectSafetyFlags(intake),
): HealthContextConfidence {
  const answersByQuestionId = getAnswersByQuestionId(intake)
  const answeredQuestionIds = Object.keys(answersByQuestionId).filter(
    (questionId) => (answersByQuestionId[questionId]?.length ?? 0) > 0,
  )
  const hasFreeform = intake.freeform.trim().length > 40

  return {
    highConfidenceInsights: [
      ...strengths.slice(0, 3).map((strength) => strength.title),
      ...frictionPoints.slice(0, 3).map((frictionPoint) => frictionPoint.title),
      ...safetyFlags.slice(0, 2).map((safetyFlag) => safetyFlag.title),
    ],
    lowConfidenceAssumptions: [
      ...(hasFreeform ? [] : ['Freeform life context is limited, so routine details may be incomplete.']),
      ...(answeredQuestionIds.includes('recovery') ? [] : ['Recovery pattern is inferred from limited information.']),
      ...(answeredQuestionIds.includes('food-style') ? [] : ['Nutrition preferences need confirmation.']),
    ],
    missingInformation: [
      ...(answeredQuestionIds.includes('safety') ? [] : ['Safety limitations or medical boundaries']),
      'Typical weekday schedule',
      'Current activity baseline',
      'Food budget and cooking access',
      'Sleep timing and caffeine pattern',
    ],
    recommendedFollowUpQuestions: [
      'What does a normal weekday look like from wake-up to bedtime?',
      'Where do meals usually happen: home, work, school, restaurants, or delivery?',
      'What movement currently feels safe and realistic?',
      'Are there injuries, symptoms, or medical considerations the app should avoid advising on?',
    ],
  }
}

export const seedHealthContextGraph = buildHealthContextGraph(seedLifeIntake)

function createUserSnapshot(
  intake: LifeIntake,
  answersByQuestionId: Record<string, string[]>,
  frictionPoints: HealthContextFrictionPoint[],
  safetyFlags: HealthContextSafetyFlag[],
  confidence: HealthContextConfidence,
): UserSnapshot {
  const frictionTitles = frictionPoints.map((frictionPoint) => frictionPoint.title).join(', ')
  const hasHighSafety = safetyFlags.some((safetyFlag) => safetyFlag.riskLevel === 'high')
  const hasHighFriction = frictionPoints.some((frictionPoint) => frictionPoint.severity === 'high')
  const readinessLevel: ReadinessLevel = hasHighSafety || hasHighFriction ? 'low' : 'moderate'
  const recommendedStartingIntensity: StartingIntensity = readinessLevel === 'low' ? 'low' : 'moderate'

  return {
    confidence: confidence.lowConfidenceAssumptions.length > 2 ? 'medium' : 'high',
    currentRoutine: intake.freeform || 'Routine details are still sparse.',
    motivationStyle: firstAnswer(answersByQuestionId, 'coach-tone') ?? 'Gentle',
    movementPattern: answerSummary(answersByQuestionId, 'movement-style', 'Movement preferences need follow-up.'),
    nutritionPattern: answerSummary(answersByQuestionId, 'food-style', 'Nutrition preferences need follow-up.'),
    primaryGoal: 'Improve health with realistic food, movement, recovery, and consistency actions.',
    readinessLevel,
    recommendedStartingIntensity,
    recoveryPattern: answerSummary(answersByQuestionId, 'recovery', 'Recovery pattern needs follow-up.'),
    schedulePressure: frictionTitles || 'Schedule pressure not yet clear.',
    summary: 'The user needs a practical plan that works around real-life friction instead of assuming an ideal week.',
  }
}

function createFrictionPoint(point: HealthContextFrictionPoint): HealthContextFrictionPoint {
  return point
}

function createSafetyFlag(flag: HealthContextSafetyFlag): HealthContextSafetyFlag {
  return flag
}

function createPlanningRule(rule: HealthContextPlanningRule): HealthContextPlanningRule {
  return rule
}

function createFirstWeekDay(
  dayNumber: number,
  title: string,
  nutritionFocus: string,
  movementFocus: string,
  recoveryFocus: string,
  optionalBonus: string,
  estimatedTime: string,
  reason: string,
): FirstWeekDay {
  return {
    dayNumber,
    estimatedTime,
    movementFocus,
    nutritionFocus,
    optionalBonus,
    reason,
    recoveryFocus,
    title,
  }
}

function hasAnswer(
  answersByQuestionId: Record<string, string[]>,
  questionId: string,
  answer: string,
) {
  return answersByQuestionId[questionId]?.includes(answer) ?? false
}

function hasFriction(frictionPoints: HealthContextFrictionPoint[], id: string) {
  return frictionPoints.some((frictionPoint) => frictionPoint.id === id)
}

function hasSafetyFlag(safetyFlags: HealthContextSafetyFlag[], id: string) {
  return safetyFlags.some((safetyFlag) => safetyFlag.id === id)
}

function firstAnswer(answersByQuestionId: Record<string, string[]>, questionId: string) {
  return answersByQuestionId[questionId]?.[0]
}

function answerSummary(
  answersByQuestionId: Record<string, string[]>,
  questionId: string,
  fallback: string,
) {
  const answers = answersByQuestionId[questionId]
  return answers?.length ? answers.join(', ') : fallback
}

function normalize(value: string) {
  return value.toLowerCase()
}

function mentions(normalizedText: string, phrases: string[]) {
  return phrases.some((phrase) => normalizedText.includes(phrase.toLowerCase()))
}

function relatedInputs(answerInputs: string[], phrases: string[], normalizedText: string) {
  const phraseInputs = phrases.filter((phrase) => normalizedText.includes(phrase.toLowerCase()))
  return [...answerInputs, ...phraseInputs]
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function stableHash(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(16)
}
