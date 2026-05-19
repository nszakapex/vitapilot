import type { HealthContextStrength } from '@vitapilot/core'

interface StrengthCardProps {
  strength: HealthContextStrength
}

export function StrengthCard({ strength }: StrengthCardProps) {
  return (
    <article className="context-card context-card--strength">
      <header className="context-card__header">
        <span className="context-card__kicker">Leverage point</span>
        <span className={getBadgeClass(strength.confidence)}>{formatLabel(strength.confidence)}</span>
      </header>
      <h3>{strength.title}</h3>
      <p>{strength.description}</p>
      <p className="context-card__why">{strength.whyItMatters}</p>
      {strength.relatedInputs.length > 0 ? (
        <div className="context-tag-list" aria-label="Related inputs">
          {strength.relatedInputs.map((input) => (
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
