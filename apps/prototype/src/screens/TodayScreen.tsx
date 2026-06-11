import { ArrowRight, RefreshCcw } from 'lucide-react'
import { ActionCard } from '../components/ActionCard'
import { MetricTile } from '../components/MetricTile'
import { ScreenHeader } from '../components/ScreenHeader'
import {
  buildDailyCoachNote,
  getSmallestUsefulAction,
  hasHighRiskMedicalBoundary,
} from '@vitapilot/core'
import { useDailyPlan } from '../hooks/useDailyPlan'

export function TodayScreen() {
  const { error, graph, isLoading, plan, profile, saveActionStatus, usesGraphPlan } = useDailyPlan()
  const smallestAction = getSmallestUsefulAction(plan.actions)
  const showMedicalSafetyBanner = usesGraphPlan && hasHighRiskMedicalBoundary(graph)

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

      {showMedicalSafetyBanner ? (
        <aside className="today-safety-banner" role="status">
          <span>Safety boundary active</span>
          <p>
            Your graph includes symptoms or limitations that call for conservative guidance. If symptoms are current, severe, unexplained, or urgent, seek medical or emergency care.
          </p>
        </aside>
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
        <button className="icon-button icon-button--disabled" disabled type="button" title="Swap coming later">
          <RefreshCcw size={18} aria-hidden="true" />
        </button>
      </section>

      <section className="week-preview">
        <div>
          <span className="eyebrow">Weekly pattern</span>
          <h2>{plan.weeklyPattern}</h2>
        </div>
        <button className="text-button text-button--disabled" disabled type="button">
          Weekly planning coming later
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>
    </section>
  )
}
