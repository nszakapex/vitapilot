import type { HealthContextFrictionPoint } from '@vitapilot/core'

interface FrictionPointCardProps {
  frictionPoint: HealthContextFrictionPoint
}

export function FrictionPointCard({ frictionPoint }: FrictionPointCardProps) {
  return (
    <article className="context-card context-card--friction">
      <header className="context-card__header">
        <span className="context-card__kicker">{formatLabel(frictionPoint.impactArea)}</span>
        <span className={getBadgeClass(frictionPoint.severity)}>{formatLabel(frictionPoint.severity)}</span>
      </header>
      <h3>{frictionPoint.title}</h3>
      <p>{frictionPoint.description}</p>
      <dl className="context-mini-list">
        <div>
          <dt>Why it matters</dt>
          <dd>{frictionPoint.whyItMatters}</dd>
        </div>
        <div>
          <dt>Adjustment</dt>
          <dd>{frictionPoint.suggestedAdjustment}</dd>
        </div>
      </dl>
      {frictionPoint.relatedInputs.length > 0 ? (
        <div className="context-tag-list" aria-label="Related inputs">
          {frictionPoint.relatedInputs.map((input) => (
            <span key={input}>{input}</span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function getBadgeClass(value: string) {
  return `context-badge context-badge--${value}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
