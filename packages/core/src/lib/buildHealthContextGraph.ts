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

const GRAPH_SCHEMA_VERSION = '1.0'
const GRAPH_SOURCE = 'deterministic'

const timePressurePhrases = [
  'busy',
  'packed schedule',
  'no time',
  'long shifts',
  'school and work',
  'work and school',
  'unpredictable schedule',
  'overloaded',
  'hard to find time',
  'late work',
]

const stressPhrases = [
  'stressed',
  'stress eating',
  'burned out',
  'burnt out',
  'overwhelmed',
  'mental load',
  'anxious schedule',
  'work stress',
  'school stress',
  'stress',
]

const restaurantPhrases = [
  'eat out',
  'eating out',
  'takeout',
  'drive thru',
  'fast food',
  'restaurants',
  'restaurant',
  'convenience food',
  'grabbing food',
  'door dash',
  'doordash',
]

const poorSleepPhrases = [
  'poor sleep',
  'bad sleep',
  "can't sleep",
  'cant sleep',
  'wake up tired',
  'sleep schedule',
  'insomnia',
  'late nights',
  'tired in the morning',
]

const lowEnergyPhrases = [
  'low energy',
  'tired',
  'fatigued',
  'crash',
  'afternoon crash',
  'exhausted',
  'no energy',
  'sluggish',
]

const injuryPhrases = [
  'knee pain',
  'back pain',
  'shoulder pain',
  'ankle pain',
  'joint pain',
  'hip pain',
  'injury',
  'injured',
  'limited mobility',
]

const urgentSymptomPhrases = [
  'chest pain',
  'fainting',
  'fainted',
  'passed out',
  'dizzy',
  'severe dizziness',
  'shortness of breath',
  'trouble breathing',
]

const eatingBehaviorPhrases = [
  'eating disorder',
  'binge',
  'binge eating',
  'restrict',
  'restricting',
  'purge',
  'purging',
  'afraid of food',
  'obsessive tracking',
  'obsessed with tracking',
  'guilt after eating',
  'compensation',
  'overexercise after eating',
  'restriction',
]

const budgetPhrases = [
  'tight budget',
  'low budget',
  'cheap meals',
  "can't afford",
  'cant afford',
  'expensive groceries',
  'budget meals',
  'budget',
  'cost',
  'expensive',
]

const travelPhrases = [
  'travel a lot',
  'traveling',
  'hotels',
  'hotel',
  'on the road',
  'road trips',
  'work trips',
  'travel',
]

const noGymPhrases = [
  'no gym',
  'home workouts',
  'bodyweight only',
  'no equipment',
  'apartment workout',
]

const inconsistencyPhrases = [
  'fall off',
  'fell off',
  'inconsistent',
  'all or nothing',
  'start and stop',
  'hard to stick with it',
  'weekend falloff',
  'lose momentum',
]

const medicalConditionPhrases = ['medical condition', 'medical limitation', 'medical issue']
const pregnancyPhrases = ['pregnancy', 'pregnant', 'postpartum']
const medicationPhrases = ['medication', 'medicine', 'prescription']
const goalContextPhrases = [
  'lose weight',
  'fat loss',
  'energy',
  'stronger',
  'strength',
  'health',
  'fitness',
  'sleep',
  'consistency',
]

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
    schemaVersion: GRAPH_SCHEMA_VERSION,
    source: GRAPH_SOURCE,
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

  if (hasAnswer(answersByQuestionId, 'friction', 'Time') || mentions(freeform, timePressurePhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'The user reports limited time or late work as a barrier.',
      id: 'time-pressure',
      impactArea: 'schedule',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'friction', ['Time']),
        timePressurePhrases,
        freeform,
      ),
      severity: 'high',
      suggestedAdjustment: 'Keep weekday health actions short, pre-decided, and easy to swap.',
      title: 'Time pressure',
      whyItMatters: 'Plans that require long uninterrupted blocks are likely to fail.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'friction', 'Stress') || mentions(freeform, stressPhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'Stress is likely to affect food choices, motivation, and recovery.',
      id: 'stress-load',
      impactArea: 'stress',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'friction', ['Stress']),
        stressPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Use simpler meals, shorter workouts, and decompression actions on high-stress days.',
      title: 'Stress load',
      whyItMatters: 'Stress often changes follow-through more than knowledge does.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'friction', 'Eating out') ||
    hasAnswer(answersByQuestionId, 'food-style', 'Restaurant orders') ||
    mentions(freeform, restaurantPhrases)
  ) {
    frictionPoints.push(createFrictionPoint({
      description: 'Restaurants or fast food are part of the real food environment.',
      id: 'restaurant-dependence',
      impactArea: 'nutrition',
      relatedInputs: relatedInputs(
        [
          ...answerInputs(answersByQuestionId, 'friction', ['Eating out']),
          ...answerInputs(answersByQuestionId, 'food-style', ['Restaurant orders']),
        ],
        restaurantPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Prioritize restaurant-order guidance, protein anchors, and good-enough swaps.',
      title: 'Eating-out friction',
      whyItMatters: 'Home-recipe-only planning will not match the user life context.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'recovery', 'Poor sleep') || mentions(freeform, poorSleepPhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'Poor sleep should change exercise intensity and craving support.',
      id: 'poor-sleep',
      impactArea: 'recovery',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'recovery', ['Poor sleep']),
        poorSleepPhrases,
        freeform,
      ),
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

  if (
    hasAnswer(answersByQuestionId, 'friction', 'Cost') ||
    hasAnswer(answersByQuestionId, 'food-style', 'Cheap groceries') ||
    mentions(freeform, budgetPhrases)
  ) {
    frictionPoints.push(createFrictionPoint({
      description: 'Cost or budget pressure appears in the intake.',
      id: 'budget-pressure',
      impactArea: 'nutrition',
      relatedInputs: relatedInputs(
        [
          ...answerInputs(answersByQuestionId, 'friction', ['Cost']),
          ...answerInputs(answersByQuestionId, 'food-style', ['Cheap groceries']),
        ],
        budgetPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Favor low-cost staples, leftovers, and affordable restaurant choices.',
      title: 'Budget pressure',
      whyItMatters: 'Premium wellness plans fail when they ignore affordability.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'friction', 'Low energy') || mentions(freeform, lowEnergyPhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'Low energy is likely to affect movement and meal effort.',
      id: 'low-energy',
      impactArea: 'consistency',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'friction', ['Low energy']),
        lowEnergyPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Use minimum viable actions and recovery-aware movement.',
      title: 'Low-energy follow-through risk',
      whyItMatters: 'Plans should preserve momentum without requiring high motivation.',
    }))
  }

  if (mentions(freeform, inconsistencyPhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'The user names a pattern of dropping momentum after disruption.',
      id: 'inconsistency-pattern',
      impactArea: 'consistency',
      relatedInputs: relatedInputs([], inconsistencyPhrases, freeform),
      severity: 'medium',
      suggestedAdjustment: 'Build an explicit reset flow and avoid streak-based shame.',
      title: 'Inconsistency and re-entry risk',
      whyItMatters: 'The app must help the user restart instead of treating missed days as failure.',
    }))
  }

  if (hasAnswer(answersByQuestionId, 'recovery', 'Travel') || mentions(freeform, travelPhrases)) {
    frictionPoints.push(createFrictionPoint({
      description: 'Travel may disrupt routine, food options, and movement access.',
      id: 'travel-disruption',
      impactArea: 'schedule',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'recovery', ['Travel']),
        travelPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Create travel-safe meal and movement fallbacks.',
      title: 'Travel disruption',
      whyItMatters: 'The app should make the plan portable, not dependent on a perfect home routine.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'movement-style', 'Short home workouts') ||
    mentions(freeform, noGymPhrases)
  ) {
    frictionPoints.push(createFrictionPoint({
      description: 'Gym access or equipment should not be assumed.',
      id: 'no-gym-access',
      impactArea: 'movement',
      relatedInputs: relatedInputs(
        answerInputs(answersByQuestionId, 'movement-style', ['Short home workouts']),
        noGymPhrases,
        freeform,
      ),
      severity: 'medium',
      suggestedAdjustment: 'Use walking, bodyweight, mobility, and no-equipment options.',
      title: 'No-gym planning needed',
      whyItMatters: 'Gym-dependent workouts will not fit a home, apartment, travel, or no-equipment week.',
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
    mentions(freeform, injuryPhrases)
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Avoid high-impact or pain-provoking movement and offer low-impact alternatives unless the user is cleared by a professional.',
      blockedRecommendationTypes: ['high_impact_exercise', 'intense_workouts'],
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
    mentions(freeform, eatingBehaviorPhrases)
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not recommend calorie counting, aggressive restriction, weigh-in pressure, compensatory exercise, or fasting protocols.',
      blockedRecommendationTypes: ['calorie_restriction', 'fasting', 'weigh_in_pressure'],
      category: 'eating_behavior',
      description: 'The intake suggests eating-behavior sensitivity.',
      disclaimerLevel: 'strong',
      id: 'eating-behavior-risk',
      riskLevel: 'high',
      title: 'Eating-behavior guardrail',
      userFacingLanguage: 'I will avoid restrictive dieting language and recommend licensed support for eating-disorder concerns.',
    }))
  }

  if (mentions(freeform, urgentSymptomPhrases)) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Prevent intense exercise recommendations and direct urgent, current, severe, or unexplained symptoms to urgent or emergency medical care.',
      blockedRecommendationTypes: ['intense_workouts', 'medical_treatment_advice'],
      category: 'medical',
      description: 'The intake mentions symptoms that should not be handled as ordinary fitness or wellness context.',
      disclaimerLevel: 'strong',
      id: 'urgent-medical-symptom',
      riskLevel: 'high',
      title: 'Urgent symptom boundary',
      userFacingLanguage: 'Urgent, current, severe, or unexplained symptoms should be handled with urgent or emergency medical care. I will keep guidance general and conservative.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Medical condition') ||
    mentions(freeform, medicalConditionPhrases)
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not provide medical diagnosis or treatment advice. Escalate symptoms and condition-specific decisions to licensed care.',
      blockedRecommendationTypes: ['medical_treatment_advice', 'intense_workouts'],
      category: 'medical',
      description: 'The intake mentions a medical condition or limitation that should not be handled as ordinary wellness.',
      disclaimerLevel: 'standard',
      id: 'medical-boundary',
      riskLevel: 'medium',
      title: 'Medical boundary',
      userFacingLanguage: 'I can support general wellness, but medical symptoms or condition-specific advice should go to a licensed professional.',
    }))
  }

  if (
    hasAnswer(answersByQuestionId, 'safety', 'Pregnancy/postpartum') ||
    mentions(freeform, pregnancyPhrases)
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Avoid intense or restrictive recommendations and suggest clinician-cleared movement and nutrition choices.',
      blockedRecommendationTypes: ['intense_workouts', 'advanced_training'],
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
    mentions(freeform, medicationPhrases)
  ) {
    safetyFlags.push(createSafetyFlag({
      appBehaviorRule: 'Do not advise medication changes or supplement interactions; recommend pharmacist or clinician review.',
      blockedRecommendationTypes: ['supplement_interaction_advice', 'medication_advice'],
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

  if (hasFriction(frictionPoints, 'budget-pressure')) {
    rules.push(createPlanningRule({
      appliesTo: 'meals',
      description: 'Use budget-simple staples, leftovers, and affordable restaurant defaults.',
      example: 'Build a meal around eggs, beans, Greek yogurt, rotisserie chicken, rice, or frozen vegetables.',
      id: 'budget-meal-anchors',
      priority: 'high',
      title: 'Budget meal anchors',
    }))
  }

  if (hasFriction(frictionPoints, 'travel-disruption')) {
    rules.push(createPlanningRule({
      appliesTo: 'habits',
      description: 'Keep travel days portable and avoid plans that depend on a full kitchen or gym.',
      example: 'Use hotel breakfast anchors, airport defaults, walking, mobility, and hydration reminders.',
      id: 'travel-safe-defaults',
      priority: 'high',
      title: 'Travel-safe defaults',
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

  if (hasFriction(frictionPoints, 'low-energy')) {
    rules.push(createPlanningRule({
      appliesTo: 'workouts',
      description: 'Use low or moderate intensity when energy is low.',
      example: 'Pick walking, light strength, or mobility before intense conditioning.',
      id: 'low-energy-intensity-cap',
      priority: 'high',
      title: 'Low-energy intensity cap',
    }))
  }

  if (hasFriction(frictionPoints, 'no-gym-access')) {
    rules.push(createPlanningRule({
      appliesTo: 'workouts',
      description: 'Do not depend on gym access or equipment.',
      example: 'Use walking, mobility, bodyweight basics, and no-equipment strength.',
      id: 'no-gym-movement',
      priority: 'high',
      title: 'No-gym movement',
    }))
  }

  if (hasFriction(frictionPoints, 'inconsistency-pattern')) {
    rules.push(createPlanningRule({
      appliesTo: 'habits',
      description: 'Favor minimum viable habits and explicit restart options.',
      example: 'Give the user a smallest useful action instead of a streak penalty.',
      id: 'minimum-viable-habits',
      priority: 'high',
      title: 'Minimum viable habits',
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

  if (hasSafetyFlag(safetyFlags, 'urgent-medical-symptom')) {
    rules.push(createPlanningRule({
      appliesTo: 'safety',
      description: 'Avoid intense workouts and keep guidance conservative when urgent symptoms are mentioned.',
      example: 'Direct urgent, current, severe, or unexplained symptoms to urgent or emergency medical care.',
      id: 'urgent-medical-conservative-plan',
      priority: 'critical',
      title: 'Urgent symptom conservative plan',
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

  if (hasSafetyFlag(safetyFlags, 'pregnancy-postpartum')) {
    rules.push(createPlanningRule({
      appliesTo: 'safety',
      description: 'Use conservative movement and avoid advanced training unless the user is cleared by a clinician.',
      example: 'Use walking, gentle mobility, and clearance-aware progression.',
      id: 'pregnancy-postpartum-clearance',
      priority: 'critical',
      title: 'Pregnancy/postpartum clearance-aware plan',
    }))
  }

  if (hasSafetyFlag(safetyFlags, 'medication-boundary')) {
    rules.push(createPlanningRule({
      appliesTo: 'safety',
      description: 'Do not advise medication changes, supplement interactions, or medication-specific plans.',
      example: 'Suggest pharmacist or clinician review for medication and supplement questions.',
      id: 'medication-professional-review',
      priority: 'critical',
      title: 'Medication professional review',
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
  const hasLowEnergy = hasFriction(frictionPoints, 'low-energy')
  const hasTimePressure = hasFriction(frictionPoints, 'time-pressure')
  const hasRestaurantFriction = hasFriction(frictionPoints, 'restaurant-dependence')
  const hasBudgetFriction = hasFriction(frictionPoints, 'budget-pressure')
  const hasTravelFriction = hasFriction(frictionPoints, 'travel-disruption')
  const hasNoGym = hasFriction(frictionPoints, 'no-gym-access')
  const hasInconsistency = hasFriction(frictionPoints, 'inconsistency-pattern')
  const hasInjury = hasSafetyFlag(safetyFlags, 'injury-limitation')
  const hasEatingBehaviorSafety = hasSafetyFlag(safetyFlags, 'eating-behavior-risk')
  const hasUrgentMedical = hasSafetyFlag(safetyFlags, 'urgent-medical-symptom')
  const hasPregnancyPostpartum = hasSafetyFlag(safetyFlags, 'pregnancy-postpartum')
  const hasNoTracking = planningRules.some((rule) => rule.id === 'no-tracking-nutrition')
  const difficulty: FirstWeekDifficulty = hasSafety || hasPoorSleep || hasLowEnergy || hasTimePressure || hasInconsistency
    ? 'easy'
    : 'moderate'
  const estimatedTimeDemand = hasTimePressure || hasInconsistency
    ? '5-25 minutes per day'
    : hasTravelFriction
      ? '5-30 minutes per day'
      : '15-45 minutes per day'

  const nutritionBase = hasEatingBehaviorSafety
    ? 'Steady meal rhythm'
    : hasRestaurantFriction
      ? 'Restaurant-order anchors'
      : hasBudgetFriction
        ? 'Budget meal anchors'
        : hasTravelFriction
          ? 'Portable meal defaults'
          : hasNoTracking
            ? 'Plate-method meals'
            : 'Protein-forward meals'

  const foodAnchor = hasEatingBehaviorSafety
    ? 'Choose one regular meal that feels steady, neutral, and repeatable'
    : hasRestaurantFriction
      ? 'Pick a restaurant order with a protein anchor and a simple side'
      : hasBudgetFriction
        ? 'Use one low-cost meal anchor from eggs, beans, yogurt, rice, or frozen vegetables'
        : hasTravelFriction
          ? 'Choose a portable meal default for the road, hotel, or airport'
          : hasNoTracking
            ? 'Build one plate-method meal'
            : 'Choose one repeatable protein-forward meal'

  const movementBase = hasUrgentMedical
    ? 'Professional-guided movement only'
    : hasInjury || hasPregnancyPostpartum
      ? 'Low-impact movement only'
      : hasPoorSleep || hasLowEnergy
        ? 'Walking, mobility, or light strength'
        : hasNoGym
          ? 'Walking or no-equipment strength'
          : 'Short strength plus walking'

  const movementFallback = hasUrgentMedical
    ? 'Avoid intense movement and seek professional guidance for urgent, current, severe, or unexplained symptoms'
    : hasInjury
      ? 'Use low-impact mobility or walking and avoid pain-provoking movement'
      : hasPregnancyPostpartum
        ? 'Use clearance-aware walking or gentle mobility'
        : hasNoGym
          ? 'Use walking, bodyweight basics, or apartment-friendly mobility'
          : hasPoorSleep || hasLowEnergy
            ? 'Use walking or mobility before higher-intensity work'
            : 'Use walking as the default fallback'

  const recoveryBase = hasPoorSleep
    ? 'Earlier wind-down and lighter intensity'
    : hasLowEnergy
      ? 'Energy check and smallest useful action'
      : hasTravelFriction
        ? 'Hydration and sleep cue during travel'
        : 'Small evening reset'

  const dailyTime = hasTimePressure || hasInconsistency ? '5-20 min' : hasTravelFriction ? '5-25 min' : '15-30 min'

  const dailyPlan: FirstWeekDay[] = [
    createFirstWeekDay(1, 'Baseline day', nutritionBase, movementFallback, recoveryBase, hasRestaurantFriction ? 'Save one go-to restaurant order' : 'Save what felt easiest', dailyTime, 'Start with observation and one easy action.'),
    createFirstWeekDay(2, 'Food anchor day', foodAnchor, movementBase, 'Hydration check by mid-afternoon', hasBudgetFriction ? 'Save one budget backup meal' : 'Prep one backup snack', dailyTime, 'Food stability makes later choices easier.'),
    createFirstWeekDay(3, 'Movement confidence day', hasEatingBehaviorSafety ? 'Repeat one steady meal' : 'Good-enough meal swap', movementBase, 'Five-minute cooldown', hasNoGym ? 'Pick a no-equipment fallback' : 'Add a local walk route', dailyTime, 'Build confidence without chasing intensity.'),
    createFirstWeekDay(4, 'Recovery-aware day', hasTravelFriction ? 'Travel-safe meal default' : 'Simple restaurant or pantry option', movementFallback, hasPoorSleep ? 'Caffeine cutoff reminder' : 'Short decompression cue', 'Stretch while watching TV', dailyTime, 'The app should adapt before the user burns out.'),
    createFirstWeekDay(5, 'Consistency day', "Repeat yesterday's easiest meal win", hasInconsistency ? 'One minimum viable movement action' : movementBase, 'Stress reset after work', 'Save a reset action for missed days', dailyTime, 'Repeating a small win is more useful than novelty.'),
    createFirstWeekDay(6, 'Flexible day', hasRestaurantFriction ? 'Restaurant plan before arrival' : hasTravelFriction ? 'Road or hotel meal default' : 'Flexible meal with a simple anchor', hasNoGym ? 'Outdoor walk or bodyweight basics' : movementFallback, 'No-shame evening reset', 'Try a low-pressure local option', hasTimePressure ? '10-25 min' : '20-45 min', 'Weekend planning should preserve flexibility.'),
    createFirstWeekDay(7, 'Review day', hasEatingBehaviorSafety ? 'Notice which steady meals felt easiest' : 'Choose two meals worth repeating', 'Easy walk or mobility', 'Five-minute reflection', 'Build next week from what worked', '10-25 min', 'Reflection turns actions into personalization data.'),
  ]

  return {
    dailyPlan,
    difficulty,
    estimatedTimeDemand,
    hydrationAction: 'Pair water with the first meal and check hydration once before mid-afternoon.',
    movementActions: [
      hasUrgentMedical
        ? 'Avoid intense workouts when urgent symptoms are mentioned and get professional guidance.'
        : hasSafety
          ? 'Use conservative, low-impact movement until safety context is clearer.'
          : 'Complete two short movement sessions.',
      movementFallback,
      'Stop or swap any movement that causes pain, dizziness, or unusual symptoms.',
    ],
    nutritionActions: [
      foodAnchor,
      hasEatingBehaviorSafety || hasNoTracking
        ? 'Use plate-method, regular meal rhythm, or simple anchors instead of tracking.'
        : hasBudgetFriction
          ? 'Choose affordable staples before premium wellness foods.'
          : 'Track only simple meal patterns if the user wants that level of detail.',
      'Keep food guidance steady, neutral, and non-punitive.',
    ],
    overview: 'A conservative first week designed to create momentum without overloading the user.',
    reasoning: 'The plan starts easier than expected, respects safety and recovery signals, and prioritizes repeatable decisions over optimization.',
    recoveryActions: [
      hasPoorSleep ? 'Treat poor sleep as a reason to lower intensity, not to skip health entirely.' : recoveryBase,
      hasInconsistency ? 'Use a minimum viable reset after missed days.' : 'Use a small reset after stressful days.',
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
  const freeform = normalize(intake.freeform)
  const structuredResponseCount = Object.values(answersByQuestionId).reduce(
    (total, answers) => total + answers.length,
    0,
  )
  const hasFreeform = intake.freeform.trim().length > 40
  const hasFoodContext = answeredQuestionIds.includes('food-style') || mentions(freeform, restaurantPhrases) || mentions(freeform, budgetPhrases)
  const hasMovementContext = answeredQuestionIds.includes('movement-style') || mentions(freeform, noGymPhrases) || mentions(freeform, injuryPhrases)
  const hasRecoveryContext = answeredQuestionIds.includes('recovery') || mentions(freeform, poorSleepPhrases) || mentions(freeform, lowEnergyPhrases)
  const hasFrictionContext = answeredQuestionIds.includes('friction') || frictionPoints.length > 0
  const hasSafetyContext = answeredQuestionIds.includes('safety') || safetyFlags.length > 0
  const hasGoalContext = mentions(freeform, goalContextPhrases)

  return {
    highConfidenceInsights: [
      ...strengths.slice(0, 3).map((strength) => strength.title),
      ...frictionPoints.slice(0, 3).map((frictionPoint) => frictionPoint.title),
      ...safetyFlags.slice(0, 2).map((safetyFlag) => safetyFlag.title),
    ],
    lowConfidenceAssumptions: [
      ...(structuredResponseCount >= 5 ? [] : ['Structured intake responses are sparse, so personalization should stay conservative.']),
      ...(hasFreeform ? [] : ['Freeform life context is limited, so routine details may be incomplete.']),
      ...(hasFoodContext ? [] : ['Food preferences and eating environment need confirmation.']),
      ...(hasMovementContext ? [] : ['Movement access, baseline, and preferred activity need confirmation.']),
      ...(hasRecoveryContext ? [] : ['Recovery pattern is inferred from limited information.']),
      ...(hasFrictionContext ? [] : ['Primary friction points are not yet clear.']),
      ...(hasSafetyContext ? [] : ['Safety boundaries are unknown, so recommendations should avoid high-risk assumptions.']),
      ...(hasGoalContext ? [] : ['Goal context is vague, so the graph should not over-optimize.']),
    ],
    missingInformation: [
      ...(hasFoodContext ? [] : ['Food preferences, eating location, budget, and cooking access']),
      ...(hasMovementContext ? [] : ['Current activity baseline, equipment, and safe movement options']),
      ...(hasRecoveryContext ? [] : ['Sleep timing, energy pattern, caffeine, and recovery constraints']),
      ...(hasFrictionContext ? [] : ['Main friction points that break follow-through']),
      ...(hasSafetyContext ? [] : ['Safety limitations, medical boundaries, medications, pregnancy/postpartum, or eating-history concerns']),
      ...(hasGoalContext ? [] : ['Primary goal and how aggressive or gentle the user wants the plan to feel']),
      'Typical weekday schedule',
    ],
    recommendedFollowUpQuestions: [
      'What does a normal weekday look like from wake-up to bedtime?',
      'Where do meals usually happen: home, work, school, restaurants, or delivery?',
      'What movement currently feels safe and realistic?',
      ...(hasSafetyContext
        ? []
        : ['Are there injuries, medical limitations, medications, pregnancy/postpartum context, or eating-history concerns the app should avoid advising on?']),
      'What is the main goal right now, and should the first week feel gentle, moderate, or challenging?',
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
  const contextConfidence: UserSnapshot['confidence'] = confidence.lowConfidenceAssumptions.length > 5
    ? 'low'
    : confidence.lowConfidenceAssumptions.length > 2
      ? 'medium'
      : 'high'

  return {
    confidence: contextConfidence,
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

function answerInputs(
  answersByQuestionId: Record<string, string[]>,
  questionId: string,
  expectedAnswers: string[],
) {
  const answers = answersByQuestionId[questionId] ?? []
  return expectedAnswers.filter((answer) => answers.includes(answer))
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
