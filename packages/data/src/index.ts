import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  seedDailyPlan,
  seedLifeIntake,
  todayActions,
  userProfile,
  type ActionStatus,
  type DailyMetric,
  type DailyPlan,
  type HealthAction,
  type HealthContextGraph,
  type LifeIntake,
  type UserProfile,
} from '@vitapilot/core'

export interface SupabaseEnvironment {
  publishableKey?: string
  url?: string
}

export type RepositorySource = 'local' | 'supabase'

export interface DailyPlanSnapshot {
  plan: DailyPlan
  profile: UserProfile
  source: RepositorySource
}

export interface VitaPilotRepository {
  getDailyPlan(localDate: string): Promise<DailyPlanSnapshot>
  getHealthContextGraph(): Promise<HealthContextGraph | null>
  getLifeIntake(): Promise<LifeIntake>
  saveActionStatus(localDate: string, actionId: string, status: ActionStatus): Promise<DailyPlanSnapshot>
  saveHealthContextGraph(graph: HealthContextGraph): Promise<HealthContextGraph>
  saveLifeIntake(intake: LifeIntake): Promise<LifeIntake>
  saveProfile(profile: UserProfile): Promise<UserProfile>
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface ProfileRow {
  coach_style: UserProfile['coachStyle']
  constraints: string[]
  display_name: string
  fitness_reality: string[]
  food_preferences: string[]
  location_label: string
  primary_goal: string
  secondary_goal: string
}

interface DailyPlanRow {
  focus: string
  id: string
  local_date: string
  metrics: DailyMetric[]
  weekly_pattern: string
}

interface DailyActionRow {
  action_key: string
  area: HealthAction['area']
  cta: string
  duration: string
  effort: HealthAction['effort']
  evidence: HealthAction['evidence']
  sort_order: number
  status: ActionStatus
  title: string
  why: string
}

const profileKey = 'vitapilot:profile'
const intakeKey = 'vitapilot:life-intake'
const healthContextGraphKey = 'vitapilot:health-context-graph'
const planKey = (localDate: string) => `vitapilot:daily-plan:${localDate}`

export function createVitaPilotRepository(
  environment: SupabaseEnvironment = {},
  storage = getBrowserStorage(),
): VitaPilotRepository {
  const localRepository = createLocalRepository(storage)

  if (!environment.url || !environment.publishableKey) {
    return localRepository
  }

  const supabase = createClient(environment.url, environment.publishableKey)
  return createSupabaseRepository(supabase, localRepository)
}

function createLocalRepository(storage: StorageLike | null): VitaPilotRepository {
  const readProfile = () => readJson<UserProfile>(storage, profileKey) ?? userProfile

  const readPlan = (localDate: string): DailyPlan => {
    const storedPlan = readJson<DailyPlan>(storage, planKey(localDate))
    return storedPlan ?? { ...seedDailyPlan, localDate }
  }

  const writePlan = (plan: DailyPlan) => {
    writeJson(storage, planKey(plan.localDate), plan)
  }

  return {
    async getDailyPlan(localDate) {
      const profile = readProfile()
      const plan = readPlan(localDate)
      writeJson(storage, profileKey, profile)
      writePlan(plan)
      return { plan, profile, source: 'local' }
    },
    async getHealthContextGraph() {
      return readJson<HealthContextGraph>(storage, healthContextGraphKey)
    },
    async getLifeIntake() {
      const intake = readJson<LifeIntake>(storage, intakeKey) ?? seedLifeIntake
      writeJson(storage, intakeKey, intake)
      return intake
    },
    async saveActionStatus(localDate, actionId, status) {
      const plan = readPlan(localDate)
      const updatedPlan = {
        ...plan,
        actions: plan.actions.map((action) =>
          action.id === actionId ? { ...action, status } : action,
        ),
      }
      writePlan(updatedPlan)
      return { plan: updatedPlan, profile: readProfile(), source: 'local' }
    },
    async saveHealthContextGraph(graph) {
      writeJson(storage, healthContextGraphKey, graph)
      return graph
    },
    async saveLifeIntake(intake) {
      writeJson(storage, intakeKey, intake)
      return intake
    },
    async saveProfile(profile) {
      writeJson(storage, profileKey, profile)
      return profile
    },
  }
}

function createSupabaseRepository(
  supabase: SupabaseClient,
  localRepository: VitaPilotRepository,
): VitaPilotRepository {
  return {
    async getDailyPlan(localDate) {
      const userId = await getUserId(supabase)
      if (!userId) return localRepository.getDailyPlan(localDate)

      const profile = await getOrCreateProfile(supabase, userId)
      const plan = await getOrCreateDailyPlan(supabase, userId, localDate)
      return { plan, profile, source: 'supabase' }
    },
    async getLifeIntake() {
      return localRepository.getLifeIntake()
    },
    async getHealthContextGraph() {
      return localRepository.getHealthContextGraph()
    },
    async saveActionStatus(localDate, actionId, status) {
      const userId = await getUserId(supabase)
      if (!userId) return localRepository.saveActionStatus(localDate, actionId, status)

      const plan = await getOrCreatePlanRow(supabase, userId, localDate)
      await supabase
        .from('daily_actions')
        .update({ status })
        .eq('plan_id', plan.id)
        .eq('action_key', actionId)

      const profile = await getOrCreateProfile(supabase, userId)
      const updatedPlan = await getOrCreateDailyPlan(supabase, userId, localDate)
      return { plan: updatedPlan, profile, source: 'supabase' }
    },
    async saveHealthContextGraph(graph) {
      return localRepository.saveHealthContextGraph(graph)
    },
    async saveLifeIntake(intake) {
      return localRepository.saveLifeIntake(intake)
    },
    async saveProfile(profile) {
      const userId = await getUserId(supabase)
      if (!userId) return localRepository.saveProfile(profile)

      await supabase.from('profiles').upsert({
        id: userId,
        coach_style: profile.coachStyle,
        constraints: profile.constraints,
        display_name: profile.name,
        fitness_reality: profile.fitnessReality,
        food_preferences: profile.foodPreferences,
        location_label: profile.locationLabel,
        primary_goal: profile.primaryGoal,
        secondary_goal: profile.secondaryGoal,
      })

      return profile
    },
  }
}

async function getUserId(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

async function getOrCreateProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile> {
  const { data } = await supabase
    .from('profiles')
    .select(
      'coach_style,constraints,display_name,fitness_reality,food_preferences,location_label,primary_goal,secondary_goal',
    )
    .eq('id', userId)
    .maybeSingle<ProfileRow>()

  if (data) return mapProfileRow(data)

  await supabase.from('profiles').insert({
    id: userId,
    coach_style: userProfile.coachStyle,
    constraints: userProfile.constraints,
    display_name: userProfile.name,
    fitness_reality: userProfile.fitnessReality,
    food_preferences: userProfile.foodPreferences,
    location_label: userProfile.locationLabel,
    primary_goal: userProfile.primaryGoal,
    secondary_goal: userProfile.secondaryGoal,
  })

  return userProfile
}

async function getOrCreateDailyPlan(
  supabase: SupabaseClient,
  userId: string,
  localDate: string,
): Promise<DailyPlan> {
  const plan = await getOrCreatePlanRow(supabase, userId, localDate)
  const actions = await getOrCreateActionRows(supabase, plan.id)

  return {
    actions: actions.map(mapActionRow),
    focus: plan.focus,
    localDate: plan.local_date,
    metrics: plan.metrics,
    weeklyPattern: plan.weekly_pattern,
  }
}

async function getOrCreatePlanRow(
  supabase: SupabaseClient,
  userId: string,
  localDate: string,
): Promise<DailyPlanRow> {
  const { data } = await supabase
    .from('daily_plans')
    .select('id,local_date,focus,metrics,weekly_pattern')
    .eq('user_id', userId)
    .eq('local_date', localDate)
    .maybeSingle<DailyPlanRow>()

  if (data) return data

  const { data: insertedPlan, error } = await supabase
    .from('daily_plans')
    .insert({
      focus: seedDailyPlan.focus,
      local_date: localDate,
      metrics: seedDailyPlan.metrics,
      user_id: userId,
      weekly_pattern: seedDailyPlan.weeklyPattern,
    })
    .select('id,local_date,focus,metrics,weekly_pattern')
    .single<DailyPlanRow>()

  if (error || !insertedPlan) {
    throw new Error(error?.message ?? 'Unable to create daily plan')
  }

  await insertSeedActions(supabase, insertedPlan.id)
  return insertedPlan
}

async function getOrCreateActionRows(
  supabase: SupabaseClient,
  planId: string,
): Promise<DailyActionRow[]> {
  const { data } = await supabase
    .from('daily_actions')
    .select('action_key,area,cta,duration,effort,evidence,sort_order,status,title,why')
    .eq('plan_id', planId)
    .order('sort_order', { ascending: true })
    .returns<DailyActionRow[]>()

  if (data?.length) return data

  await insertSeedActions(supabase, planId)

  const { data: insertedActions, error } = await supabase
    .from('daily_actions')
    .select('action_key,area,cta,duration,effort,evidence,sort_order,status,title,why')
    .eq('plan_id', planId)
    .order('sort_order', { ascending: true })
    .returns<DailyActionRow[]>()

  if (error || !insertedActions) {
    throw new Error(error?.message ?? 'Unable to create daily actions')
  }

  return insertedActions
}

async function insertSeedActions(supabase: SupabaseClient, planId: string) {
  await supabase.from('daily_actions').insert(
    todayActions.map((action, index) => ({
      action_key: action.id,
      area: action.area,
      cta: action.cta,
      duration: action.duration,
      effort: action.effort,
      evidence: action.evidence,
      plan_id: planId,
      sort_order: index,
      status: action.status,
      title: action.title,
      why: action.why,
    })),
  )
}

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    coachStyle: row.coach_style,
    constraints: row.constraints,
    fitnessReality: row.fitness_reality,
    foodPreferences: row.food_preferences,
    locationLabel: row.location_label,
    name: row.display_name,
    primaryGoal: row.primary_goal,
    secondaryGoal: row.secondary_goal,
  }
}

function mapActionRow(row: DailyActionRow): HealthAction {
  return {
    area: row.area,
    cta: row.cta,
    duration: row.duration,
    effort: row.effort,
    evidence: row.evidence,
    id: row.action_key,
    status: row.status,
    title: row.title,
    why: row.why,
  }
}

function getBrowserStorage(): StorageLike | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null
  }

  return globalThis.localStorage
}

function readJson<T>(storage: StorageLike | null, key: string): T | null {
  if (!storage) return null

  const value = storage.getItem(key)
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function writeJson<T>(storage: StorageLike | null, key: string, value: T) {
  if (!storage) return
  storage.setItem(key, JSON.stringify(value))
}
