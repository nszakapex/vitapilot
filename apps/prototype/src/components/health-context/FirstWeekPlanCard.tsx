import type { FirstWeekPlan } from '@vitapilot/core'

interface FirstWeekPlanCardProps {
  plan: FirstWeekPlan
}

export function FirstWeekPlanCard({ plan }: FirstWeekPlanCardProps) {
  return (
    <section className="context-section" aria-labelledby="first-week-title">
      <div className="context-section__header">
        <div>
          <span className="eyebrow">First-week plan</span>
          <h2 id="first-week-title">Start smaller than expected, then learn fast.</h2>
        </div>
        <span className={getBadgeClass(plan.difficulty)}>{formatLabel(plan.difficulty)}</span>
      </div>

      <div className="first-week-summary">
        <p>{plan.overview}</p>
        <dl>
          <div>
            <dt>Time demand</dt>
            <dd>{plan.estimatedTimeDemand}</dd>
          </div>
          <div>
            <dt>Reasoning</dt>
            <dd>{plan.reasoning}</dd>
          </div>
        </dl>
      </div>

      <div className="first-week-action-grid" aria-label="First week action themes">
        <ActionList title="Nutrition" items={plan.nutritionActions} />
        <ActionList title="Movement" items={plan.movementActions} />
        <ActionList title="Recovery" items={plan.recoveryActions} />
      </div>

      <div className="context-callout-grid">
        <article>
          <span>Hydration</span>
          <p>{plan.hydrationAction}</p>
        </article>
        <article>
          <span>Reflection</span>
          <p>{plan.reflectionAction}</p>
        </article>
      </div>

      <div className="first-week-grid" aria-label="Daily first week plan">
        {plan.dailyPlan.map((day) => (
          <article className="first-week-day-card first-week-day" key={day.dayNumber}>
            <header>
              <span>Day {day.dayNumber}</span>
              <small>{day.estimatedTime}</small>
            </header>
            <h3>{day.title}</h3>
            <dl>
              <div>
                <dt>Nutrition</dt>
                <dd>{day.nutritionFocus}</dd>
              </div>
              <div>
                <dt>Movement</dt>
                <dd>{day.movementFocus}</dd>
              </div>
              <div>
                <dt>Recovery</dt>
                <dd>{day.recoveryFocus}</dd>
              </div>
              <div>
                <dt>Optional</dt>
                <dd>{day.optionalBonus}</dd>
              </div>
            </dl>
            <p>{day.reason}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

interface ActionListProps {
  title: string
  items: string[]
}

function ActionList({ title, items }: ActionListProps) {
  return (
    <article>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function getBadgeClass(value: string) {
  return `context-badge context-badge--${value}`
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
