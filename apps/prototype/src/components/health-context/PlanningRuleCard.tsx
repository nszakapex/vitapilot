import type { HealthContextPlanningRule } from '@vitapilot/core'

interface PlanningRuleCardProps {
  rule: HealthContextPlanningRule
}

export function PlanningRuleCard({ rule }: PlanningRuleCardProps) {
  return (
    <article className="context-card context-card--rule">
      <header className="context-card__header">
        <span className="context-card__kicker">{formatLabel(rule.appliesTo)}</span>
        <span className={getBadgeClass(rule.priority)}>{formatLabel(rule.priority)}</span>
      </header>
      <h3>{rule.title}</h3>
      <p>{rule.description}</p>
      <p className="context-card__example">{rule.example}</p>
    </article>
  )
}

function getBadgeClass(value: string) {
  return `context-badge context-badge--${value}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
