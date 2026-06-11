import { ArrowRight, RefreshCcw } from 'lucide-react'
import { ActionCard } from '../components/ActionCard'
import { MetricTile } from '../components/MetricTile'
import { ScreenHeader } from '../components/ScreenHeader'
import {
  buildDailyCoachNote,
  getSmallestUsefulAction,
} from '@vitapilot/core'
import { useDailyPlan } from '../hooks/useDailyPlan'

export function TodayScreen() {
  const { error, isLoading, plan, profile, saveActionStatus, usesGraphPlan } = useDailyPlan()
  const smallestAction = getSmallestUsefulAction(plan.actions)

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Today"
        title={isLoading ? 'Loading your day' : 'Your next useful moves'}
        supporting={error ?? buildDailyCoachNote(profile, plan.metrics)}
      />

      {usesGraphPlan ? (
        <section className="today-graph-badge" aria-label="Graph-powered plan status">
          <span>Graph-powered plan</span>
          <p>Today's actions are based on your intake, friction points, and safety boundaries.</p>
        </section>
      ) : null}

      <section className="metric-grid" aria-label="Daily signals">
        {plan.metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="action-grid" aria-label="Recommended actions">
        {plan.actions.map((action) => (
          <ActionCard
            action={action}
            key={action.id}
            onActionClick={(actionId) => void saveActionStatus(actionId, 'complete')}
          />
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
          <h2>{plan.weeklyPattern}</h2>
        </div>
        <button className="text-button" type="button">
          Build week
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>
    </section>
  )
}
