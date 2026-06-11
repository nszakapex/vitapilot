import { useCallback, useEffect, useState } from 'react'
import type { HealthContextGraph } from '@vitapilot/core'
import { vitaPilotRepository } from '../lib/repository'

type GraphLoadStatus = 'loading' | 'ready' | 'empty' | 'error'

export function useHealthContextGraph() {
  const [graph, setGraph] = useState<HealthContextGraph | null>(null)
  const [status, setStatus] = useState<GraphLoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const loadGraph = useCallback(async () => {
    try {
      setStatus('loading')
      setError(null)
      const storedGraph = await vitaPilotRepository.getHealthContextGraph()
      setGraph(storedGraph)
      setStatus(storedGraph ? 'ready' : 'empty')
    } catch (caughtError) {
      setGraph(null)
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load graph')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadGraph()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadGraph])

  return {
    error,
    graph,
    reload: loadGraph,
    status,
  }
}
