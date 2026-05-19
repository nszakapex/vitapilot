import type { UserSnapshot } from '@vitapilot/core'

interface UserSnapshotCardProps {
  snapshot: UserSnapshot
}

export function UserSnapshotCard({ snapshot }: UserSnapshotCardProps) {
  return (
    <section className="snapshot-card" aria-labelledby="context-summary-title">
      <div className="context-section__header">
        <div>
          <span className="eyebrow">Understanding summary</span>
          <h2 id="context-summary-title">Here's what VitaPilot understood about you.</h2>
        </div>
        <span className={getBadgeClass(snapshot.confidence)}>{formatLabel(snapshot.confidence)} confidence</span>
      </div>

      <p className="snapshot-card__summary">{snapshot.summary}</p>

      <dl className="snapshot-metrics">
        <div>
          <dt>Primary goal</dt>
          <dd>{snapshot.primaryGoal}</dd>
        </div>
        <div>
          <dt>Readiness</dt>
          <dd>{formatLabel(snapshot.readinessLevel)}</dd>
        </div>
        <div>
          <dt>Starting intensity</dt>
          <dd>{formatLabel(snapshot.recommendedStartingIntensity)}</dd>
        </div>
      </dl>

      <dl className="snapshot-patterns">
        <div>
          <dt>Current routine</dt>
          <dd>{truncateText(snapshot.currentRoutine)}</dd>
        </div>
        <div>
          <dt>Food pattern</dt>
          <dd>{snapshot.nutritionPattern}</dd>
        </div>
        <div>
          <dt>Movement pattern</dt>
          <dd>{snapshot.movementPattern}</dd>
        </div>
        <div>
          <dt>Recovery pattern</dt>
          <dd>{snapshot.recoveryPattern}</dd>
        </div>
        <div>
          <dt>Schedule pressure</dt>
          <dd>{snapshot.schedulePressure}</dd>
        </div>
        <div>
          <dt>Motivation style</dt>
          <dd>{snapshot.motivationStyle}</dd>
        </div>
      </dl>
    </section>
  )
}

function getBadgeClass(value: string) {
  return `context-badge context-badge--${value}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function truncateText(value: string) {
  const maxLength = 360

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}
