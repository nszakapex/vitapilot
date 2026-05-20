import { useCallback, useEffect, useState } from 'react'
import type { HealthContextGraph } from '@vitapilot/core'
import { HealthContextGraphView } from '../components/health-context/HealthContextGraphView'
import { ScreenHeader } from '../components/ScreenHeader'
import { vitaPilotRepository } from '../lib/repository'

type ContextGraphStatus = 'loading' | 'ready' | 'empty' | 'error'

interface ContextGraphScreenProps {
  onOpenIntake: () => void
}

export function ContextGraphScreen({ onOpenIntake }: ContextGraphScreenProps) {
  const [graph, setGraph] = useState<HealthContextGraph | null>(null)
  const [status, setStatus] = useState<ContextGraphStatus>('loading')

  const refreshGraph = useCallback(async () => {
    setStatus('loading')

    try {
      const storedGraph = await vitaPilotRepository.getHealthContextGraph()
      setGraph(storedGraph)
      setStatus(storedGraph ? 'ready' : 'empty')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshGraph()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [refreshGraph])

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Health context graph"
        title="The assessment, interpreted"
        supporting="VitaPilot turns intake answers into strengths, friction points, safety boundaries, planning rules, and a first-week starter plan."
      />

      {status === 'loading' ? (
        <section className="context-state" aria-live="polite">
          <span className="eyebrow">Loading</span>
          <h2>Reading your latest assessment.</h2>
          <p>The graph is stored locally for now, so it should reload after you save intake.</p>
        </section>
      ) : null}

      {status === 'empty' ? (
        <section className="empty-context-state context-state">
          <span className="eyebrow">No graph yet</span>
          <h2>Complete your intake to generate your Health Context Graph.</h2>
          <p>Go to Intake, add your life context, and save. VitaPilot will turn it into the structured plan logic shown here.</p>
          <button className="text-button" onClick={onOpenIntake} type="button">
            Go to Intake
          </button>
        </section>
      ) : null}

      {status === 'error' ? (
        <section className="context-state context-state--error" role="status">
          <span className="eyebrow">Try again</span>
          <h2>The graph did not load cleanly.</h2>
          <p>Your intake is still safe. This view can try reading the saved graph again.</p>
          <button className="text-button" onClick={() => void refreshGraph()} type="button">
            Reload graph
          </button>
        </section>
      ) : null}

      {status === 'ready' && graph ? <HealthContextGraphView graph={graph} /> : null}
    </section>
  )
}
