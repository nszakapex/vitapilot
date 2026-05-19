import type {
  AssistantPrompt,
  DailyPlan,
  DailyMetric,
  HealthAction,
  IntakeQuestion,
  LifeIntake,
  LocalEvent,
  MealOption,
  RoadmapItem,
  UserProfile,
  WorkoutOption,
} from '../types/health'

export const userProfile: UserProfile = {
  name: 'Alex',
  primaryGoal: 'Build steady energy and lose weight without obsessive tracking',
  secondaryGoal: 'Get stronger with short, realistic workouts',
  coachStyle: 'gentle',
  constraints: ['busy workdays', 'eats out often', 'limited weeknight cooking'],
  foodPreferences: ['high-protein', 'no shellfish', 'budget-aware', 'coffee before noon'],
  fitnessReality: ['gym beginner', 'has dumbbells at home', 'prefers walks on tired days'],
  locationLabel: 'Denver, CO',
}

export const dailyMetrics: DailyMetric[] = [
  {
    label: 'Sleep',
    value: '6h 12m',
    detail: 'Short night',
    tone: 'attention',
  },
  {
    label: 'Readiness',
    value: '62',
    detail: 'Use moderate effort',
    tone: 'calm',
  },
  {
    label: 'Steps',
    value: '4.3k',
    detail: 'Walk window open',
    tone: 'steady',
  },
  {
    label: 'Protein',
    value: '38g',
    detail: 'Aim for 45g more',
    tone: 'good',
  },
]

export const todayActions: HealthAction[] = [
  {
    id: 'protein-lunch',
    area: 'nutrition',
    title: 'Protein-forward lunch',
    why: 'You slept short, so a steady lunch helps curb afternoon snack drift.',
    duration: '12 min',
    effort: 'low',
    status: 'ready',
    evidence: 'practical',
    cta: 'See meals',
  },
  {
    id: 'short-strength',
    area: 'movement',
    title: '22-minute strength reset',
    why: 'Enough stimulus to keep momentum without pushing hard on a low-recovery day.',
    duration: '22 min',
    effort: 'medium',
    status: 'scheduled',
    evidence: 'strong',
    cta: 'Start plan',
  },
  {
    id: 'local-walk',
    area: 'local',
    title: 'Evening walk near Sloan Lake',
    why: 'Weather is good and an outdoor walk fits your stress pattern after meetings.',
    duration: '35 min',
    effort: 'low',
    status: 'ready',
    evidence: 'strong',
    cta: 'View route',
  },
]

export const seedDailyPlan: DailyPlan = {
  localDate: new Date().toISOString().slice(0, 10),
  focus: 'Steady energy, moderate movement, and one easy local win.',
  metrics: dailyMetrics,
  actions: todayActions,
  weeklyPattern: 'Protect lunch, lower workout intensity on short-sleep days, add one local activity.',
}

export const mealOptions: MealOption[] = [
  {
    id: 'bowl',
    title: 'Chicken rice bowl',
    context: 'Fast-casual order',
    protein: '42g',
    prepTime: '8 min',
    tags: ['restaurant-safe', 'high-protein', 'under $14'],
  },
  {
    id: 'eggs',
    title: 'Egg scramble wrap',
    context: 'Pantry fallback',
    protein: '31g',
    prepTime: '10 min',
    tags: ['budget', 'low cleanup', 'breakfast-for-dinner'],
  },
  {
    id: 'yogurt',
    title: 'Greek yogurt crunch bowl',
    context: 'No-cook snack',
    protein: '28g',
    prepTime: '3 min',
    tags: ['no-cook', 'sweet craving', 'sleep-friendly'],
  },
]

export const workoutOptions: WorkoutOption[] = [
  {
    id: 'short-strength',
    title: 'Dumbbell foundation',
    duration: '22 min',
    intensity: 'Moderate',
    blocks: [
      '3 min warm-up walk',
      '3 rounds: goblet squat, incline push-up, one-arm row',
      '4 min mobility cooldown',
    ],
    swap: 'If energy drops, do one round plus a 12-minute walk.',
  },
  {
    id: 'walk',
    title: 'Zone 2 walk',
    duration: '35 min',
    intensity: 'Low',
    blocks: ['5 min easy start', '25 min talk-test pace', '5 min easy finish'],
    swap: 'If weather turns, use treadmill incline 2-4%.',
  },
]

export const localEvents: LocalEvent[] = [
  {
    id: 'run-walk',
    title: 'Beginner run/walk meetup',
    type: 'Run club',
    when: 'Sat 9:00 AM',
    distance: '1.1 mi',
    fitReason: 'Low-pressure pace and a coffee stop after.',
    price: 'Free',
  },
  {
    id: 'market',
    title: 'Highlands farmers market',
    type: 'Food',
    when: 'Sun 10:00 AM',
    distance: '2.4 mi',
    fitReason: 'Good for a two-meal prep plan under budget.',
    price: 'Free entry',
  },
  {
    id: 'mobility',
    title: 'Intro mobility class',
    type: 'Recovery',
    when: 'Thu 6:30 PM',
    distance: '0.8 mi',
    fitReason: 'Matches your shoulder stiffness note from last week.',
    price: '$12',
  },
]

export const assistantPrompts: AssistantPrompt[] = [
  {
    id: 'menu',
    label: 'Menu help',
    prompt: 'I am eating at a Mexican restaurant tonight. What should I order?',
  },
  {
    id: 'fell-off',
    label: 'Reset',
    prompt: 'I fell off for four days. What is the smallest useful reset?',
  },
  {
    id: 'trend',
    label: 'Trend check',
    prompt: 'Is the high-protein TikTok breakfast trend actually useful for me?',
  },
]

export const productRoadmap: RoadmapItem[] = [
  {
    id: 'mvp-daily',
    title: 'Daily decision dashboard',
    status: 'mvp',
    detail: 'Food, movement, recovery, and local next actions in one view.',
  },
  {
    id: 'mvp-assistant',
    title: 'Structured AI assistant',
    status: 'mvp',
    detail: 'Conversation grounded in profile, safety rules, and plan state.',
  },
  {
    id: 'next-menu',
    title: 'Restaurant menu scanner',
    status: 'next',
    detail: 'Photo or pasted menu to goal-aware order suggestions.',
  },
  {
    id: 'next-wearables',
    title: 'Wearable interpretation',
    status: 'next',
    detail: 'Turn sleep, steps, workouts, and recovery into plan changes.',
  },
  {
    id: 'later-marketplace',
    title: 'Local partner layer',
    status: 'later',
    detail: 'Featured events, class bookings, and community challenges.',
  },
]

export const intakeQuestions: IntakeQuestion[] = [
  {
    id: 'season',
    category: 'life',
    prompt: 'What season of life are you in right now?',
    helper: 'This tells the app how ambitious or gentle the plan should be.',
    options: ['Work is intense', 'School is chaotic', 'Family comes first', 'I have room to focus'],
    allowMultiple: true,
  },
  {
    id: 'friction',
    category: 'life',
    prompt: 'What usually breaks your health plan?',
    helper: 'The assistant should design around the real obstacle, not the ideal day.',
    options: ['Time', 'Stress', 'Eating out', 'Low energy', 'Cost', 'Conflicting advice'],
    allowMultiple: true,
  },
  {
    id: 'food-style',
    category: 'food',
    prompt: 'What food support would actually help?',
    helper: 'Choose the decision points where food gets messy.',
    options: ['Restaurant orders', 'Cheap groceries', 'High-protein meals', 'No tracking', 'Macro guidance', 'Pantry meals'],
    allowMultiple: true,
  },
  {
    id: 'movement-style',
    category: 'movement',
    prompt: 'What kind of movement feels realistic?',
    helper: 'This keeps workouts from becoming a fantasy schedule.',
    options: ['Short home workouts', 'Gym beginner plan', 'Walking', 'Strength training', 'Low-impact classes', 'Running/cardio'],
    allowMultiple: true,
  },
  {
    id: 'recovery',
    category: 'recovery',
    prompt: 'What recovery signal should the app respect most?',
    helper: 'Plans should adapt to the stress and sleep pattern underneath the behavior.',
    options: ['Poor sleep', 'Stress', 'Soreness', 'Long workdays', 'Travel', 'Mental fatigue'],
    allowMultiple: true,
  },
  {
    id: 'coach-tone',
    category: 'motivation',
    prompt: 'What coaching style keeps you moving?',
    helper: 'Tone is part of personalization. The wrong voice makes people quit.',
    options: ['Gentle', 'Direct', 'Analytical', 'Minimal'],
    allowMultiple: false,
  },
  {
    id: 'safety',
    category: 'safety',
    prompt: 'Anything the app should avoid or handle carefully?',
    helper: 'The app should know where to slow down or recommend a professional.',
    options: ['Injury limitation', 'Eating disorder history', 'Medical condition', 'Pregnancy/postpartum', 'Medication concern', 'None right now'],
    allowMultiple: true,
  },
]

export const seedLifeIntake: LifeIntake = {
  freeform:
    'Busy workdays, frequent restaurant meals, wants better energy without tracking every calorie. Prefers short workouts and no-shame resets after missed days.',
  responses: intakeQuestions.map((question) => ({
    answers: question.options.slice(0, question.allowMultiple ? 2 : 1),
    questionId: question.id,
  })),
  updatedAt: new Date().toISOString(),
}
