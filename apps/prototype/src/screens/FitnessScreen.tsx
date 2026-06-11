import { Activity, HeartPulse, ShieldCheck, TimerReset } from 'lucide-react'
import {
  graphHasFriction,
  hasBlockedRecommendation,
  hasPlanningRule,
  hasSafetyCategory,
  hasSafetyFlag,
  workoutOptions,
  type HealthContextGraph,
} from '@vitapilot/core'
import type { LucideIcon } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { useHealthContextGraph } from '../hooks/useHealthContextGraph'

interface FitnessScreenProps {
  onOpenIntake?: () => void
}

interface FitnessOption {
  id: string
  title: string
  duration: string
  intensity: string
  blocks: string[]
  swap: string
}

interface FitnessGuidanceCard {
  id: string
  icon: LucideIcon
  title: string
  detail: string
  tag: string
}

export function FitnessScreen({ onOpenIntake }: FitnessScreenProps) {
  const { error, graph, status } = useHealthContextGraph()
  const hasGraph = status === 'ready' && graph !== null
  const fitnessOptions = hasGraph ? createFitnessOptions(graph) : workoutOptions
  const modes = hasGraph ? createFitnessModes(graph) : ['10 min', '20 min', '45 min', 'Tired']

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Fitness"
        title="A plan that bends without breaking"
        supporting={hasGraph
          ? 'Movement cards are constrained by your graph: safety flags, recovery, equipment, energy, and time pressure.'
          : 'Complete intake to let Fitness adapt to injuries, recovery, equipment, energy, and schedule.'}
      />

      {hasGraph ? (
        <section className="graph-aware-panel" aria-label="Graph-aware fitness guidance">
          <div>
            <span className="eyebrow">Graph-aware movement</span>
            <h2>{movementPanelTitle(graph)}</h2>
            <p>{movementPanelCopy(graph)}</p>
          </div>
          <span className="graph-aware-pill">{graph.userSnapshot.recommendedStartingIntensity} intensity</span>
        </section>
      ) : (
        <section className="graph-empty-note" aria-label="Fitness graph status">
          <div>
            <span className="eyebrow">{status === 'error' ? 'Graph unavailable' : 'No graph yet'}</span>
            <h2>Complete intake to personalize movement cards.</h2>
            <p>{status === 'error' ? error : 'Static examples stay visible until your Health Context Graph exists.'}</p>
          </div>
          {onOpenIntake ? (
            <button className="text-button" onClick={onOpenIntake} type="button">
              Edit Intake
            </button>
          ) : null}
        </section>
      )}

      <section className="mode-row" aria-label="Workout length">
        {modes.map((mode, index) => (
          <button className={index === 0 ? 'mode-chip mode-chip--active' : 'mode-chip'} key={mode} type="button">
            {mode}
          </button>
        ))}
      </section>

      {hasGraph ? (
        <section className="graph-recommendation-grid" aria-label="Graph movement constraints">
          {createFitnessGuidanceCards(graph).map((card) => {
            const Icon = card.icon

            return (
              <article className="graph-recommendation-card" key={card.id}>
                <div className="graph-recommendation-card__icon" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div>
                  <span className="eyebrow">{card.tag}</span>
                  <h2>{card.title}</h2>
                  <p>{card.detail}</p>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}

      <section className="list-stack" aria-label="Workout options">
        {fitnessOptions.map((workout) => (
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

function createFitnessModes(graph: HealthContextGraph) {
  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) return ['Conservative', 'Guidance first', 'Recovery']
  if (hasSafetyCategory(graph, 'injury')) return ['Low impact', 'Mobility', 'Walk']
  if (hasSafetyCategory(graph, 'pregnancy_postpartum')) return ['Clearance-aware', 'Gentle', 'Walk']
  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) return ['Light', '10 min', 'Mobility', 'Walk']
  if (graphHasFriction(graph, 'no-gym-access')) return ['No equipment', 'Bodyweight', 'Walk']
  if (graphHasFriction(graph, 'time-pressure')) return ['10 min', '15 min', 'Walk']

  return ['20 min', 'Walk', 'Strength']
}

function createFitnessOptions(graph: HealthContextGraph): FitnessOption[] {
  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) {
    return [
      {
        blocks: [
          'Keep movement gentle until symptoms or limitations are professionally addressed',
          'Use only easy walking or mobility if it already feels safe',
          'Stop immediately if symptoms appear or worsen',
        ],
        duration: '5-10 min',
        id: 'urgent-conservative',
        intensity: 'Conservative',
        swap: 'For urgent, current, severe, or unexplained symptoms, use urgent or emergency medical care.',
        title: 'Professional-guided movement only',
      },
      {
        blocks: ['Hydration check', 'Breathing-paced reset', 'Prepare the next intake update'],
        duration: '5 min',
        id: 'urgent-recovery',
        intensity: 'Recovery',
        swap: 'Skip intense workouts today; VitaPilot will not treat symptoms or push performance.',
        title: 'Recovery-first reset',
      },
    ]
  }

  if (hasSafetyCategory(graph, 'injury') || hasSafetyCategory(graph, 'pregnancy_postpartum')) {
    return [
      {
        blocks: ['Easy warm-up walk', 'Gentle mobility', 'Controlled range of motion only'],
        duration: '10-20 min',
        id: 'low-impact-mobility',
        intensity: 'Low impact',
        swap: 'Use professional guidance for pain, injury, pregnancy, postpartum, or movement clearance questions.',
        title: 'Low-impact mobility block',
      },
      {
        blocks: ['Talk-test walk', 'No jumping', 'Stop or swap anything that feels wrong'],
        duration: '10-25 min',
        id: 'easy-walk',
        intensity: 'Low',
        swap: 'Replace this with rest if symptoms, pain, or recovery signals make movement feel inappropriate.',
        title: 'Easy walking option',
      },
    ]
  }

  if (
    graphHasFriction(graph, 'poor-sleep') ||
    graphHasFriction(graph, 'low-energy') ||
    hasBlockedRecommendation(graph, 'intense_workouts')
  ) {
    return [
      {
        blocks: ['5 min easy start', '10 min talk-test pace', '3 min cooldown'],
        duration: '18 min',
        id: 'low-recovery-walk',
        intensity: 'Low',
        swap: 'If energy drops, shorten this to one outside lap or five minutes of mobility.',
        title: 'Low-recovery walk',
      },
      {
        blocks: ['Hip hinge practice', 'Wall push-up', 'Supported row or band pull', 'Slow cooldown'],
        duration: '12-18 min',
        id: 'light-strength',
        intensity: 'Light',
        swap: 'Keep this below hard effort; the graph is capping intensity today.',
        title: 'Light strength primer',
      },
    ]
  }

  if (graphHasFriction(graph, 'no-gym-access') || hasPlanningRule(graph, 'no-gym-movement')) {
    return [
      {
        blocks: ['Easy warm-up', 'Bodyweight squat to comfortable depth', 'Incline push-up', 'Backpack row'],
        duration: graphHasFriction(graph, 'time-pressure') ? '10-15 min' : '15-20 min',
        id: 'no-equipment-basics',
        intensity: 'Moderate',
        swap: 'Use walking if equipment, space, or energy is limited.',
        title: 'No-equipment basics',
      },
      {
        blocks: ['Walk outside or indoors', 'Add two short mobility breaks', 'Finish before it feels like a chore'],
        duration: '10-25 min',
        id: 'apartment-walk',
        intensity: 'Low',
        swap: 'This is intentionally simple so no gym access does not block the plan.',
        title: 'Apartment-friendly walk',
      },
    ]
  }

  return workoutOptions
}

function createFitnessGuidanceCards(graph: HealthContextGraph): FitnessGuidanceCard[] {
  const cards: FitnessGuidanceCard[] = []

  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) {
    cards.push({
      detail: 'No intense workouts appear while urgent symptoms are part of the graph.',
      icon: ShieldCheck,
      id: 'urgent-safety',
      tag: 'Medical boundary',
      title: 'Conservative movement only',
    })
  }

  if (hasSafetyCategory(graph, 'injury')) {
    cards.push({
      detail: 'High-impact movement is blocked; movement cards stay low-impact and pain-aware.',
      icon: ShieldCheck,
      id: 'injury-safety',
      tag: 'Injury',
      title: 'Low-impact defaults',
    })
  }

  if (hasSafetyCategory(graph, 'pregnancy_postpartum')) {
    cards.push({
      detail: 'Movement stays conservative and clearance-aware instead of using advanced training.',
      icon: ShieldCheck,
      id: 'pregnancy-safety',
      tag: 'Safety',
      title: 'Clearance-aware plan',
    })
  }

  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) {
    cards.push({
      detail: 'Low recovery shifts the screen toward walking, mobility, and light strength.',
      icon: HeartPulse,
      id: 'recovery-aware',
      tag: 'Recovery',
      title: 'Intensity capped',
    })
  }

  if (graphHasFriction(graph, 'no-gym-access')) {
    cards.push({
      detail: 'Cards avoid gym-dependent equipment and keep walking or bodyweight options visible.',
      icon: Activity,
      id: 'no-gym',
      tag: 'Equipment',
      title: 'No-gym movement',
    })
  }

  if (graphHasFriction(graph, 'time-pressure')) {
    cards.push({
      detail: 'Short-session options stay first so the plan can survive packed days.',
      icon: TimerReset,
      id: 'short-session',
      tag: 'Schedule',
      title: 'Short sessions first',
    })
  }

  return cards.slice(0, 4)
}

function movementPanelTitle(graph: HealthContextGraph) {
  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) return 'Conservative movement only'
  if (hasSafetyCategory(graph, 'injury')) return 'Low-impact options are prioritized'
  if (hasSafetyCategory(graph, 'pregnancy_postpartum')) return 'Clearance-aware movement'
  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) return 'Intensity is capped for recovery'
  if (graphHasFriction(graph, 'no-gym-access')) return 'No-gym options are active'

  return 'Workout cards are matched to your graph'
}

function movementPanelCopy(graph: HealthContextGraph) {
  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) {
    return 'VitaPilot keeps this screen conservative and points urgent, current, severe, or unexplained symptoms to urgent or emergency medical care.'
  }

  if (hasSafetyCategory(graph, 'injury')) {
    return 'High-impact recommendations are blocked and the visible cards stay low-impact.'
  }

  if (hasSafetyCategory(graph, 'pregnancy_postpartum')) {
    return 'The visible cards stay conservative and avoid advanced training unless the user is cleared by a clinician.'
  }

  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) {
    return 'Low recovery shifts the plan toward light effort, walking, mobility, and smaller sessions.'
  }

  if (graphHasFriction(graph, 'no-gym-access')) {
    return 'No-equipment and walking options are shown before gym-dependent workouts.'
  }

  return 'The current options are deterministic cards shaped by safety, recovery, equipment, and schedule.'
}
