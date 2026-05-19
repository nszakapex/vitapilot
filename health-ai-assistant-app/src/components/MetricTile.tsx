import type { DailyMetric } from '../types/health'

interface MetricTileProps {
  metric: DailyMetric
}

export function MetricTile({ metric }: MetricTileProps) {
  return (
    <article className={`metric-tile metric-tile--${metric.tone}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <small>{metric.detail}</small>
    </article>
  )
}
