import { useCallback, useEffect, useState } from 'react'
import {
  buildDailyPlanFromGraph,
  seedDailyPlan,
  userProfile,
  type ActionStatus,
  type UserProfile,
} from '@vitapilot/core'
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
  const [usesGraphPlan, setUsesGraphPlan] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDailyPlan = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [dailyPlanSnapshot, graph] = await Promise.all([
        vitaPilotRepository.getDailyPlan(localDate),
        vitaPilotRepository.getHealthContextGraph(),
      ])
      setUsesGraphPlan(graph !== null)
      setSnapshot({
        ...dailyPlanSnapshot,
        plan: graph ? buildDailyPlanFromGraph(graph, localDate) : dailyPlanSnapshot.plan,
      })
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

    if (usesGraphPlan) {
      return
    }

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
