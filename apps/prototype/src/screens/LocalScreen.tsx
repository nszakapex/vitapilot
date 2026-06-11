import { ShieldCheck } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import {
  hasBlockedRecommendation,
  hasSafetyCategory,
  hasSafetyFlag,
  localEvents,
  userProfile,
  type HealthContextGraph,
  type LocalEvent,
} from '@vitapilot/core'
import { useHealthContextGraph } from '../hooks/useHealthContextGraph'

export function LocalScreen() {
  const { graph, status } = useHealthContextGraph()
  const hasGraph = status === 'ready' && graph !== null
  const keepMovementConservative = hasGraph && shouldKeepLocalMovementConservative(graph)
  const visibleEvents = keepMovementConservative
    ? localEvents.filter((event) => !isRunOrIntenseEvent(event))
    : localEvents

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Local"
        title={`Local suggestions preview for ${userProfile.locationLabel}`}
        supporting="Static demo content - live local matching, maps, filters, booking, and geolocation are coming later."
      />

      <section className="local-preview-panel" aria-label="Local preview status">
        <div>
          <span className="eyebrow">Local suggestions preview</span>
          <h2>Static demo content</h2>
          <p>
            {hasGraph
              ? 'Future local suggestions should respect your Context Graph and safety boundaries.'
              : 'Complete intake to show how future local suggestions should respect your Context Graph.'}
          </p>
        </div>
        <span className="graph-aware-pill">Preview</span>
      </section>

      {keepMovementConservative ? (
        <aside className="local-safety-note" role="status">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>Movement suggestions are being kept conservative because your graph includes safety boundaries.</p>
        </aside>
      ) : null}

      <section className="map-surface" aria-label="Static local preview categories">
        <span>Food</span>
        <span>Walking</span>
        <span>Recovery</span>
        <span>Community</span>
      </section>

      <section className="list-stack" aria-label="Local events">
        {visibleEvents.map((event) => (
          <article className="event-row" key={event.id}>
            <div>
              <span className="eyebrow">{event.type}</span>
              <h2>{event.title}</h2>
              <p>{event.fitReason}</p>
            </div>
            <div className="event-row__meta">
              <strong>{event.when}</strong>
              <span>{event.distance}</span>
              <span>{event.price}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}

function shouldKeepLocalMovementConservative(graph: HealthContextGraph) {
  return hasSafetyFlag(graph, 'urgent-medical-symptom') ||
    hasSafetyCategory(graph, 'injury') ||
    hasSafetyCategory(graph, 'pregnancy_postpartum') ||
    hasBlockedRecommendation(graph, 'intense_workouts') ||
    hasBlockedRecommendation(graph, 'high_impact_exercise')
}

function isRunOrIntenseEvent(event: LocalEvent) {
  const text = `${event.title} ${event.type} ${event.fitReason}`.toLowerCase()
  return ['run', 'running', 'hiit', 'intense', 'high-impact', 'high impact'].some((term) => text.includes(term))
}
