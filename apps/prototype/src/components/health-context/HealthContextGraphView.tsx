import type { HealthContextGraph } from '@vitapilot/core'
import { ConfidencePanel } from './ConfidencePanel'
import { FirstWeekPlanCard } from './FirstWeekPlanCard'
import { FrictionPointCard } from './FrictionPointCard'
import { PlanningRuleCard } from './PlanningRuleCard'
import { SafetyFlagCard } from './SafetyFlagCard'
import { StrengthCard } from './StrengthCard'
import { UserSnapshotCard } from './UserSnapshotCard'

interface HealthContextGraphViewProps {
  graph: HealthContextGraph
}

export function HealthContextGraphView({ graph }: HealthContextGraphViewProps) {
  return (
    <div className="context-graph">
      <UserSnapshotCard snapshot={graph.userSnapshot} />

      <section className="context-section" aria-labelledby="strengths-title">
        <div className="context-section__header">
          <div>
            <span className="eyebrow">Strengths</span>
            <h2 id="strengths-title">Positive leverage points</h2>
          </div>
          <small>{graph.strengths.length} detected</small>
        </div>
        {graph.strengths.length > 0 ? (
          <div className="context-grid">
            {graph.strengths.map((strength) => (
              <StrengthCard key={strength.id} strength={strength} />
            ))}
          </div>
        ) : (
          <p className="context-note">No strong leverage points detected yet. More intake detail will help VitaPilot find what is already working.</p>
        )}
      </section>

      <section className="context-section" aria-labelledby="friction-title">
        <div className="context-section__header">
          <div>
            <span className="eyebrow">Friction points</span>
            <h2 id="friction-title">Obstacles treated as design constraints</h2>
          </div>
          <small>{graph.frictionPoints.length} detected</small>
        </div>
        {graph.frictionPoints.length > 0 ? (
          <div className="context-grid context-grid--two">
            {graph.frictionPoints.map((frictionPoint) => (
              <FrictionPointCard key={frictionPoint.id} frictionPoint={frictionPoint} />
            ))}
          </div>
        ) : (
          <p className="context-note">No major friction points detected yet. VitaPilot will keep the first plan simple while it learns more.</p>
        )}
      </section>

      <section className="context-section" aria-labelledby="safety-title">
        <div className="context-section__header">
          <div>
            <span className="eyebrow">Safety flags</span>
            <h2 id="safety-title">Boundaries for careful recommendations</h2>
          </div>
          <small>{graph.safetyFlags.length} flagged</small>
        </div>
        {graph.safetyFlags.length > 0 ? (
          <div className="context-grid context-grid--two">
            {graph.safetyFlags.map((safetyFlag) => (
              <SafetyFlagCard key={safetyFlag.id} safetyFlag={safetyFlag} />
            ))}
          </div>
        ) : (
          <p className="context-note">
            Nothing major flagged from your current intake. VitaPilot will still keep recommendations conservative and non-medical.
          </p>
        )}
      </section>

      <section className="context-section" aria-labelledby="planning-rules-title">
        <div className="context-section__header">
          <div>
            <span className="eyebrow">Planning rules</span>
            <h2 id="planning-rules-title">How the assistant should adapt meals, movement, and recovery</h2>
          </div>
          <small>{graph.planningRules.length} rules</small>
        </div>
        <div className="context-grid">
          {graph.planningRules.map((rule) => (
            <PlanningRuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </section>

      <FirstWeekPlanCard plan={graph.firstWeekPlan} />
      <ConfidencePanel confidence={graph.confidence} />

      <footer className="context-footer">
        <span>Generated {formatDate(graph.generatedAt)}</span>
        <span>Based on intake updated {formatDate(graph.sourceIntakeUpdatedAt)}</span>
      </footer>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
