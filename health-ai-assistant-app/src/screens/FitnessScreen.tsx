import { Activity, TimerReset } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { workoutOptions } from '../data/mockHealthPlan'

export function FitnessScreen() {
  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Fitness"
        title="A plan that bends without breaking"
        supporting="Workouts are selected by time, energy, equipment, confidence, soreness, and progression."
      />

      <section className="mode-row" aria-label="Workout length">
        <button className="mode-chip" type="button">
          10 min
        </button>
        <button className="mode-chip mode-chip--active" type="button">
          20 min
        </button>
        <button className="mode-chip" type="button">
          45 min
        </button>
        <button className="mode-chip" type="button">
          Tired
        </button>
      </section>

      <section className="list-stack" aria-label="Workout options">
        {workoutOptions.map((workout) => (
          <article className="workout-row" key={workout.id}>
            <div className="workout-row__header">
              <div>
                <span className="eyebrow">{workout.intensity}</span>
                <h2>{workout.title}</h2>
              </div>
              <span className="duration-pill">
                <TimerReset size={14} aria-hidden="true" />
                {workout.duration}
              </span>
            </div>
            <ul>
              {workout.blocks.map((block) => (
                <li key={block}>{block}</li>
              ))}
            </ul>
            <p className="swap-note">
              <Activity size={15} aria-hidden="true" />
              {workout.swap}
            </p>
          </article>
        ))}
      </section>
    </section>
  )
}
