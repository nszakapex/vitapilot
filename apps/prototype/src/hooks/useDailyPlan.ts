import { useCallback, useEffect, useState } from 'react'
import { seedDailyPlan, userProfile, type ActionStatus, type UserProfile } from '@vitapilot/core'
import type { DailyPlanSnapshot } from '@vitapilot/data'
import { vitaPilotRepository } from '../lib/repository'

const currentLocalDate = () => new Date().toISOString().slice(0, 10)

const initialSnapshot: DailyPlanSnapshot = {
  plan: seedDailyPlan,
  profile: userProfile,
  source: 'local',
}

export function useDailyPlan(localDate = currentLocalDate()) {
  const [snapshot, setSnapshot] = useState<DailyPlanSnapshot>(initialSnapshot)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDailyPlan = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSnapshot(await vitaPilotRepository.getDailyPlan(localDate))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load daily plan')
    } finally {
      setIsLoading(false)
    }
  }, [localDate])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDailyPlan()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadDailyPlan])

  const saveActionStatus = async (actionId: string, status: ActionStatus) => {
    setSnapshot((current) => ({
      ...current,
      plan: {
        ...current.plan,
        actions: current.plan.actions.map((action) =>
          action.id === actionId ? { ...action, status } : action,
        ),
      },
    }))

    setSnapshot(await vitaPilotRepository.saveActionStatus(localDate, actionId, status))
  }

  const saveProfile = async (profile: UserProfile) => {
    const savedProfile = await vitaPilotRepository.saveProfile(profile)
    setSnapshot((current) => ({ ...current, profile: savedProfile }))
  }

  return {
    error,
    isLoading,
    plan: snapshot.plan,
    profile: snapshot.profile,
    refresh: loadDailyPlan,
    saveActionStatus,
    saveProfile,
    source: snapshot.source,
  }
}
