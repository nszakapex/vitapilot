import { Brain, NotebookPen, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { HealthContextGraph, UserProfile } from '@vitapilot/core'
import { hasEatingBehaviorGuardrail, strongestSafetyFlag } from '@vitapilot/core'
import { ScreenHeader } from '../components/ScreenHeader'
import { useDailyPlan } from '../hooks/useDailyPlan'
import { useHealthContextGraph } from '../hooks/useHealthContextGraph'
import { vitaPilotRepository } from '../lib/repository'

interface ProfileScreenProps {
  onOpenIntake?: () => void
}

export function ProfileScreen({ onOpenIntake }: ProfileScreenProps) {
  const { profile, saveProfile } = useDailyPlan()
  const { error, graph, status } = useHealthContextGraph()
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'saving'>('idle')
  const hasGraph = status === 'ready' && graph !== null
  const usesGentleProfileLanguage = hasEatingBehaviorGuardrail(graph)
  const displayedProfile = usesGentleProfileLanguage ? createGentleProfile(profile) : profile

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextProfile: UserProfile = {
      ...profile,
      locationLabel: String(formData.get('locationLabel') ?? profile.locationLabel),
      name: String(formData.get('name') ?? profile.name),
      primaryGoal: String(formData.get('primaryGoal') ?? profile.primaryGoal),
      secondaryGoal: String(formData.get('secondaryGoal') ?? profile.secondaryGoal),
    }

    setSaveState('saving')
    await saveProfile(nextProfile)
    setSaveState('saved')
  }

  const handleResetDemoData = async () => {
    const confirmed = window.confirm('Reset VitaPilot demo data saved in this browser? This only clears VitaPilot local prototype data.')
    if (!confirmed) return

    await vitaPilotRepository.resetLocalDemoData()
    window.location.reload()
  }

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Profile"
        title={`${profile.name}'s health context`}
        supporting={hasGraph ? graph.userSnapshot.summary : profile.primaryGoal}
      />

      <form
        className="profile-form"
        key={usesGentleProfileLanguage ? 'gentle-profile-form' : 'standard-profile-form'}
        onSubmit={(event) => void handleSave(event)}
      >
        <label>
          Name
          <input
            defaultValue={displayedProfile.name}
            name="name"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Primary goal
          <input
            defaultValue={displayedProfile.primaryGoal}
            name="primaryGoal"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Secondary goal
          <input
            defaultValue={displayedProfile.secondaryGoal}
            name="secondaryGoal"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Location
          <input
            defaultValue={displayedProfile.locationLabel}
            name="locationLabel"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <button disabled={saveState === 'saving'} type="submit">
          {saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : 'Save profile'}
        </button>
      </form>

      <section className="profile-clarity-card" aria-label="Profile and graph relationship">
        <div>
          <span className="eyebrow">Profile and graph</span>
          <h2>Profile basics are separate from your Context Graph.</h2>
          <p>To update your graph and plan logic, edit your Intake.</p>
        </div>
        {onOpenIntake ? (
          <button className="text-button" onClick={onOpenIntake} type="button">
            <NotebookPen size={16} aria-hidden="true" />
            Edit Intake
          </button>
        ) : null}
      </section>

      {hasGraph ? (
        <GraphProfileSummary graph={graph} onOpenIntake={onOpenIntake} />
      ) : (
        <section className="graph-empty-note" aria-label="Profile graph status">
          <div>
            <span className="eyebrow">{status === 'error' ? 'Graph unavailable' : 'No graph yet'}</span>
            <h2>Complete intake to generate your Health Context Graph.</h2>
            <p>{status === 'error' ? error : 'Profile will summarize strengths, friction points, safety boundaries, and plan rules after intake is saved.'}</p>
          </div>
          {onOpenIntake ? (
            <button className="text-button" onClick={onOpenIntake} type="button">
              Edit Intake
            </button>
          ) : null}
        </section>
      )}

      <section className="prototype-data-panel" aria-label="Prototype data controls">
        <div>
          <span className="eyebrow">Prototype data</span>
          <h2>Local browser storage only</h2>
          <p>Prototype data note: your intake, graph, profile, and completed actions are saved in this browser's local storage for demo purposes.</p>
        </div>
        <button className="text-button text-button--danger" onClick={() => void handleResetDemoData()} type="button">
          <RotateCcw size={16} aria-hidden="true" />
          Reset demo data
        </button>
      </section>

      <section className="profile-grid" aria-label="Profile basics">
        <article>
          <h2>Constraints</h2>
          <div className="tag-list">
            {profile.constraints.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article>
          <h2>Food</h2>
          <div className="tag-list">
            {displayedProfile.foodPreferences.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article>
          <h2>Fitness</h2>
          <div className="tag-list">
            {profile.fitnessReality.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </section>

      <aside className="safety-note">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>VitaPilot uses intake to adapt conservative general wellness suggestions. It is not medical advice, and medical symptoms or limitations should use professional guidance.</p>
      </aside>
    </section>
  )
}

function GraphProfileSummary({
  graph,
  onOpenIntake,
}: {
  graph: HealthContextGraph
  onOpenIntake?: () => void
}) {
  const safetyFlag = strongestSafetyFlag(graph)

  return (
    <section className="profile-graph-summary" aria-label="Health Context Graph summary">
      <div className="profile-graph-summary__header">
        <div>
          <span className="eyebrow">Health Context Graph</span>
          <h2>Last generated {formatDate(graph.generatedAt)}</h2>
          <p>Update your intake anytime to refresh your graph and plan.</p>
        </div>
        {onOpenIntake ? (
          <button className="text-button" onClick={onOpenIntake} type="button">
            <NotebookPen size={16} aria-hidden="true" />
            Edit Intake
          </button>
        ) : null}
      </div>

      <div className="profile-graph-metrics">
        <article>
          <span>Goal</span>
          <strong>{graph.userSnapshot.primaryGoal}</strong>
        </article>
        <article>
          <span>Readiness</span>
          <strong>{formatLabel(graph.userSnapshot.readinessLevel)}</strong>
        </article>
        <article>
          <span>Starting intensity</span>
          <strong>{formatLabel(graph.userSnapshot.recommendedStartingIntensity)}</strong>
        </article>
        <article>
          <span>Graph confidence</span>
          <strong>{formatLabel(graph.userSnapshot.confidence)}</strong>
        </article>
      </div>

      <div className="profile-graph-columns">
        <GraphList
          empty="No strengths captured yet."
          items={graph.strengths.slice(0, 3).map((item) => ({
            detail: item.whyItMatters,
            title: item.title,
          }))}
          title="Top strengths"
        />
        <GraphList
          empty="No friction points captured yet."
          items={graph.frictionPoints.slice(0, 3).map((item) => ({
            detail: item.suggestedAdjustment,
            title: item.title,
          }))}
          title="Top friction points"
        />
        <GraphList
          empty="No major safety boundaries saved yet."
          items={(safetyFlag ? [safetyFlag] : []).map((item) => ({
            detail: item.userFacingLanguage,
            title: item.title,
          }))}
          title="Safety boundaries"
        />
      </div>

      <div className="profile-graph-footer">
        <Brain size={17} aria-hidden="true" />
        <span>
          Schema {graph.schemaVersion}, {graph.source.replace('_', ' ')} source, based on intake updated {formatDate(graph.sourceIntakeUpdatedAt)}.
        </span>
      </div>
    </section>
  )
}

function GraphList({
  empty,
  items,
  title,
}: {
  empty: string
  items: Array<{ title: string; detail: string }>
  title: string
}) {
  return (
    <article>
      <h2>{title}</h2>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </article>
  )
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function createGentleProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    foodPreferences: profile.foodPreferences.map((item) =>
      item.toLowerCase().includes('protein') ? 'steady meal anchors' : item,
    ),
    primaryGoal: 'Build steady energy with supportive food, movement, recovery, and consistency.',
  }
}
