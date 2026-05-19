import { PlugZap, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ScreenHeader } from '../components/ScreenHeader'
import { productRoadmap, type UserProfile } from '@vitapilot/core'
import { useDailyPlan } from '../hooks/useDailyPlan'

export function ProfileScreen() {
  const { profile, saveProfile } = useDailyPlan()
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'saving'>('idle')

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

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Profile"
        title={`${profile.name}'s health context`}
        supporting={profile.primaryGoal}
      />

      <form className="profile-form" onSubmit={(event) => void handleSave(event)}>
        <label>
          Name
          <input
            defaultValue={profile.name}
            name="name"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Primary goal
          <input
            defaultValue={profile.primaryGoal}
            name="primaryGoal"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Secondary goal
          <input
            defaultValue={profile.secondaryGoal}
            name="secondaryGoal"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <label>
          Location
          <input
            defaultValue={profile.locationLabel}
            name="locationLabel"
            onChange={() => setSaveState('idle')}
            type="text"
          />
        </label>
        <button disabled={saveState === 'saving'} type="submit">
          {saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : 'Save profile'}
        </button>
      </form>

      <section className="profile-grid" aria-label="Profile context">
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
            {profile.foodPreferences.map((item) => (
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

      <section className="integration-strip">
        <PlugZap size={19} aria-hidden="true" />
        <div>
          <h2>Integration targets</h2>
          <p>Apple Health, Health Connect, USDA FoodData Central, Google Places, Eventbrite, Meetup, Oura, WHOOP, Fitbit, Garmin, Strava.</p>
        </div>
      </section>

      <section className="roadmap-list" aria-label="Product roadmap">
        {productRoadmap.map((item) => (
          <article className="roadmap-row" key={item.id}>
            <span className={`roadmap-status roadmap-status--${item.status}`}>{item.status}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <aside className="safety-note">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>Safety rules live at the framework level, before model responses or recommendation ranking.</p>
      </aside>
    </section>
  )
}
