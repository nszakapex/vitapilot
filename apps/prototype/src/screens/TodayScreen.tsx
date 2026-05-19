import { ArrowRight, RefreshCcw } from 'lucide-react'
import { ActionCard } from '../components/ActionCard'
import { MetricTile } from '../components/MetricTile'
import { ScreenHeader } from '../components/ScreenHeader'
import {
  buildDailyCoachNote,
  dailyMetrics,
  getSmallestUsefulAction,
  todayActions,
  userProfile,
} from '@vitapilot/core'

export function TodayScreen() {
  const smallestAction = getSmallestUsefulAction(todayActions)

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Today"
        title="Your next useful moves"
        supporting={buildDailyCoachNote(userProfile, dailyMetrics)}
      />

      <section className="metric-grid" aria-label="Daily signals">
        {dailyMetrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="action-grid" aria-label="Recommended actions">
        {todayActions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </section>

      <section className="daily-strip">
        <div>
          <span className="eyebrow">Smallest useful action</span>
          <h2>{smallestAction.title}</h2>
          <p>{smallestAction.why}</p>
        </div>
        <button className="icon-button" type="button" title="Swap action">
          <RefreshCcw size={18} aria-hidden="true" />
        </button>
      </section>

      <section className="week-preview">
        <div>
          <span className="eyebrow">Weekly pattern</span>
          <h2>Protect lunch, lower workout intensity on short-sleep days, add one local activity.</h2>
        </div>
        <button className="text-button" type="button">
          Build week
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>
    </section>
  )
}
