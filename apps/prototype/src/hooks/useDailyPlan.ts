import { useCallback, useEffect, useState } from 'react'
import {
  buildDailyPlanFromGraph,
  seedDailyPlan,
  userProfile,
  type ActionStatus,
  type DailyPlan,
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

type GraphActionStatusMap = Record<string, ActionStatus>

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
      const graphPlan = graph ? buildDailyPlanFromGraph(graph, localDate) : null
      setUsesGraphPlan(graph !== null)
      setSnapshot({
        ...dailyPlanSnapshot,
        plan: graphPlan
          ? applyGraphActionStatuses(graphPlan, readGraphActionStatuses(localDate))
          : dailyPlanSnapshot.plan,
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
      writeGraphActionStatus(localDate, actionId, status)
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

function applyGraphActionStatuses(plan: DailyPlan, statuses: GraphActionStatusMap): DailyPlan {
  return {
    ...plan,
    actions: plan.actions.map((action) => ({
      ...action,
      status: statuses[action.id] ?? action.status,
    })),
  }
}

function graphActionStatusKey(localDate: string) {
  return `vitapilot:graph-action-status:${localDate}`
}

function readGraphActionStatuses(localDate: string): GraphActionStatusMap {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return {}
  }

  try {
    const value = window.localStorage.getItem(graphActionStatusKey(localDate))
    if (!value) {
      return {}
    }

    return JSON.parse(value) as GraphActionStatusMap
  } catch {
    return {}
  }
}

function writeGraphActionStatus(localDate: string, actionId: string, status: ActionStatus) {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return
  }

  try {
    const statuses = readGraphActionStatuses(localDate)
    window.localStorage.setItem(
      graphActionStatusKey(localDate),
      JSON.stringify({ ...statuses, [actionId]: status }),
    )
  } catch {
    return
  }
}
