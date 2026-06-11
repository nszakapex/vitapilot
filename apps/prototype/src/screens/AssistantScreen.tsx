import { SendHorizontal, ShieldCheck } from 'lucide-react'
import type { FormEvent } from 'react'
import {
  assistantPrompts,
  hasEatingBehaviorGuardrail,
  graphHasFriction,
  hasSafetyCategory,
  hasSafetyFlag,
  strongestSafetyFlag,
  userProfile,
  type AssistantPrompt,
  type HealthContextGraph,
} from '@vitapilot/core'
import { ScreenHeader } from '../components/ScreenHeader'
import { useHealthContextGraph } from '../hooks/useHealthContextGraph'

interface AssistantScreenProps {
  onOpenIntake?: () => void
}

export function AssistantScreen({ onOpenIntake }: AssistantScreenProps) {
  const { error, graph, status } = useHealthContextGraph()
  const hasGraph = status === 'ready' && graph !== null
  const prompts = hasGraph ? createGraphPrompts(graph) : assistantPrompts
  const watchedItems = hasGraph ? createWatchedItems(graph) : []
  const coachReply = hasGraph
    ? createDeterministicCoachReply(graph)
    : 'Complete intake to ground the coach surface in your Health Context Graph. Until then, this screen shows static prototype examples.'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Coach"
        title={hasGraph ? 'Graph-informed coaching prompts' : `${userProfile.coachStyle} guidance, grounded in your day`}
        supporting={hasGraph
          ? 'Suggested prompts are deterministic and based on your graph. Live AI chat is not implemented yet.'
          : 'Complete intake to make Coach reflect your graph instead of static prototype prompts.'}
      />

      {hasGraph ? (
        <section className="graph-aware-panel" aria-label="Coach graph status">
          <div>
            <span className="eyebrow">Deterministic coach</span>
            <h2>Using your graph, not a live chat model</h2>
            <p>VitaPilot can surface graph-aware prompts and conservative notes today. Real AI chat remains deferred.</p>
          </div>
          <span className="graph-aware-pill">{graph.userSnapshot.confidence} confidence</span>
        </section>
      ) : (
        <section className="graph-empty-note" aria-label="Coach graph status">
          <div>
            <span className="eyebrow">{status === 'error' ? 'Graph unavailable' : 'No graph yet'}</span>
            <h2>Complete intake to ground the coach.</h2>
            <p>{status === 'error' ? error : 'Static prompts stay visible until a Health Context Graph exists.'}</p>
          </div>
          {onOpenIntake ? (
            <button className="text-button" onClick={onOpenIntake} type="button">
              Edit Intake
            </button>
          ) : null}
        </section>
      )}

      <section className="prompt-grid" aria-label="Suggested prompts">
        {prompts.map((item) => (
          <button className="prompt-card" key={item.id} type="button">
            <span>{item.label}</span>
            <p>{item.prompt}</p>
          </button>
        ))}
      </section>

      {watchedItems.length > 0 ? (
        <section className="coach-watch-grid" aria-label="What coach is watching">
          {watchedItems.map((item) => (
            <article key={item.label}>
              <span className="eyebrow">{item.label}</span>
              <h2>{item.value}</h2>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="conversation-panel" aria-label="Assistant conversation">
        <div className="message message--user">
          What is the smallest useful action today?
        </div>
        <div className="message message--coach">
          {coachReply}
        </div>
      </section>

      <form className="composer composer--disabled" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="assistant-message">
          Message
        </label>
        <input
          disabled
          id="assistant-message"
          placeholder="Live coach chat is deferred; use graph-aware prompts for now."
          type="text"
        />
        <button className="icon-button" disabled type="submit" title="Send message">
          <SendHorizontal size={18} aria-hidden="true" />
        </button>
      </form>

      <aside className="safety-note">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>{hasGraph ? createCoachSafetyCopy(graph) : 'VitaPilot provides general wellness guidance and is not medical advice.'}</p>
      </aside>
    </section>
  )
}

function createGraphPrompts(graph: HealthContextGraph): AssistantPrompt[] {
  const prompts: AssistantPrompt[] = []
  const usesGentleFoodLanguage = hasEatingBehaviorGuardrail(graph)

  if (graphHasFriction(graph, 'time-pressure')) {
    prompts.push({
      id: 'smallest-action',
      label: 'Time pressure',
      prompt: 'Help me choose the smallest useful action today.',
    })
  }

  if (graphHasFriction(graph, 'restaurant-dependence')) {
    prompts.push({
      id: 'restaurant-order',
      label: 'Restaurant',
      prompt: usesGentleFoodLanguage
        ? 'Help me choose a supportive restaurant meal that feels steady.'
        : 'Help me make a better restaurant order without detailed tracking.',
    })
  }

  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) {
    prompts.push({
      id: 'low-recovery',
      label: 'Recovery',
      prompt: "Adjust today's plan for low recovery.",
    })
  }

  if (hasSafetyCategory(graph, 'injury')) {
    prompts.push({
      id: 'low-impact',
      label: 'Injury-aware',
      prompt: 'Give me a low-impact movement option.',
    })
  }

  if (usesGentleFoodLanguage) {
    prompts.push({
      id: 'steady-meal',
      label: 'Steady meal',
      prompt: 'Help me build a steady, supportive meal.',
    })
  }

  if (graph.userSnapshot.confidence === 'low') {
    prompts.push({
      id: 'improve-graph',
      label: 'Improve graph',
      prompt: 'What should I tell VitaPilot next to improve my plan?',
    })
  }

  if (prompts.length === 0) {
    prompts.push(
      {
        id: 'today-adjustment',
        label: 'Today',
        prompt: "Help me pick the most realistic version of today's plan.",
      },
      {
        id: 'friction-check',
        label: 'Friction',
        prompt: 'What friction should I plan around first?',
      },
      {
        id: 'weekly-repeat',
        label: 'Repeat',
        prompt: 'Which action should I repeat this week?',
      },
    )
  }

  return prompts.slice(0, 4)
}

function createWatchedItems(graph: HealthContextGraph) {
  const safetyFlag = strongestSafetyFlag(graph)

  return [
    {
      detail: graph.userSnapshot.recommendedStartingIntensity,
      label: 'Readiness',
      value: graph.userSnapshot.readinessLevel,
    },
    {
      detail: graph.frictionPoints.slice(0, 2).map((item) => item.title).join(', ') || 'No major friction captured yet',
      label: 'Friction',
      value: `${graph.frictionPoints.length} signals`,
    },
    {
      detail: safetyFlag?.userFacingLanguage ?? 'No major safety flags saved yet',
      label: 'Safety',
      value: safetyFlag?.title ?? 'Clear',
    },
  ]
}

function createDeterministicCoachReply(graph: HealthContextGraph) {
  const usesGentleFoodLanguage = hasEatingBehaviorGuardrail(graph)

  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) {
    return 'Keep today conservative. For urgent, current, severe, or unexplained symptoms, use urgent or emergency medical care. VitaPilot will not push intense workouts from this graph.'
  }

  if (usesGentleFoodLanguage) {
    return 'Pick one steady meal anchor and one easy reset. The graph keeps food guidance neutral, flexible, and supportive.'
  }

  if (hasSafetyCategory(graph, 'injury')) {
    return 'Use a low-impact option and stop or swap anything that causes pain or unusual symptoms. The graph blocks high-impact recommendations.'
  }

  if (graphHasFriction(graph, 'time-pressure')) {
    return 'Choose the smallest useful version: one food anchor, ten to fifteen minutes of movement, and a five-minute reset.'
  }

  return "Use one nutrition action, one movement action, and one recovery cue. The graph favors repeatable decisions over a perfect day."
}

function createCoachSafetyCopy(graph: HealthContextGraph) {
  if (hasSafetyFlag(graph, 'urgent-medical-symptom')) {
    return 'General wellness guidance only. Urgent, current, severe, or unexplained symptoms should be handled with urgent or emergency medical care.'
  }

  if (hasSafetyCategory(graph, 'medical') || hasSafetyCategory(graph, 'medication')) {
    return 'General wellness guidance only. For medical symptoms, medication, or supplement questions, use licensed professional guidance.'
  }

  if (hasSafetyCategory(graph, 'pregnancy_postpartum')) {
    return 'General wellness guidance only. Pregnancy and postpartum planning should stay clinician-cleared and conservative.'
  }

  return 'VitaPilot uses your intake to adapt conservative general wellness suggestions. It is not medical advice.'
}
