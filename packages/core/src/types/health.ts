export type TabId = 'today' | 'assistant' | 'food' | 'fitness' | 'local' | 'profile'

export type HealthArea =
  | 'nutrition'
  | 'movement'
  | 'recovery'
  | 'habit'
  | 'local'
  | 'safety'

export type EvidenceLevel = 'strong' | 'mixed' | 'early' | 'practical'

export type ActionStatus = 'ready' | 'scheduled' | 'complete'

export interface UserProfile {
  name: string
  primaryGoal: string
  secondaryGoal: string
  coachStyle: 'gentle' | 'direct' | 'analytical' | 'minimal'
  constraints: string[]
  foodPreferences: string[]
  fitnessReality: string[]
  locationLabel: string
}

export interface DailyMetric {
  label: string
  value: string
  detail: string
  tone: 'steady' | 'attention' | 'good' | 'calm'
}

export interface HealthAction {
  id: string
  area: HealthArea
  title: string
  why: string
  duration: string
  effort: 'low' | 'medium' | 'high'
  status: ActionStatus
  evidence: EvidenceLevel
  cta: string
}

export interface DailyPlan {
  localDate: string
  focus: string
  metrics: DailyMetric[]
  actions: HealthAction[]
  weeklyPattern: string
}

export interface MealOption {
  id: string
  title: string
  context: string
  protein: string
  prepTime: string
  tags: string[]
}

export interface WorkoutOption {
  id: string
  title: string
  duration: string
  intensity: string
  blocks: string[]
  swap: string
}

export interface LocalEvent {
  id: string
  title: string
  type: string
  when: string
  distance: string
  fitReason: string
  price: string
}

export interface AssistantPrompt {
  id: string
  label: string
  prompt: string
}

export interface RoadmapItem {
  id: string
  title: string
  status: 'mvp' | 'next' | 'later'
  detail: string
}
