import type { HealthContextSafetyFlag } from '@vitapilot/core'

interface SafetyFlagCardProps {
  safetyFlag: HealthContextSafetyFlag
}

export function SafetyFlagCard({ safetyFlag }: SafetyFlagCardProps) {
  return (
    <article className="context-card context-card--safety">
      <header className="context-card__header">
        <span className="context-card__kicker">{formatLabel(safetyFlag.category)}</span>
        <span className={getBadgeClass(safetyFlag.riskLevel)}>{formatLabel(safetyFlag.riskLevel)} risk</span>
      </header>
      <h3>{safetyFlag.title}</h3>
      <p>{safetyFlag.description}</p>
      <dl className="context-mini-list">
        <div>
          <dt>App behavior rule</dt>
          <dd>{safetyFlag.appBehaviorRule}</dd>
        </div>
        <div>
          <dt>User-facing language</dt>
          <dd>{safetyFlag.userFacingLanguage}</dd>
        </div>
        <div>
          <dt>Disclaimer level</dt>
          <dd>{formatLabel(safetyFlag.disclaimerLevel)}</dd>
        </div>
        <div>
          <dt>Blocked recommendation types</dt>
          <dd>{safetyFlag.blockedRecommendationTypes.map(formatLabel).join(', ') || 'None'}</dd>
        </div>
      </dl>
    </article>
  )
}

function getBadgeClass(value: string) {
  return `context-badge context-badge--${value}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
