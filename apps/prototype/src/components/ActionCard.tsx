import { CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import type { HealthAction } from '@vitapilot/core'

interface ActionCardProps {
  action: HealthAction
}

const areaLabel: Record<HealthAction['area'], string> = {
  nutrition: 'Food',
  movement: 'Move',
  recovery: 'Recover',
  habit: 'Habit',
  local: 'Local',
  safety: 'Safety',
}

export function ActionCard({ action }: ActionCardProps) {
  const StatusIcon = action.status === 'complete' ? CheckCircle2 : Clock3

  return (
    <article className={`action-card action-card--${action.area}`}>
      <div className="action-card__topline">
        <span>{areaLabel[action.area]}</span>
        <span className="action-card__meta">
          <StatusIcon size={14} aria-hidden="true" />
          {action.duration}
        </span>
      </div>
      <h2>{action.title}</h2>
      <p>{action.why}</p>
      <div className="action-card__footer">
        <span className="evidence-pill">
          <Sparkles size={13} aria-hidden="true" />
          {action.evidence}
        </span>
        <button type="button">{action.cta}</button>
      </div>
    </article>
  )
}
