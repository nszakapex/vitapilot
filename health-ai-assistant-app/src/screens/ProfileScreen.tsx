import { PlugZap, ShieldCheck } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { productRoadmap, userProfile } from '../data/mockHealthPlan'

export function ProfileScreen() {
  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Profile"
        title={`${userProfile.name}'s health context`}
        supporting={userProfile.primaryGoal}
      />

      <section className="profile-grid" aria-label="Profile context">
        <article>
          <h2>Constraints</h2>
          <div className="tag-list">
            {userProfile.constraints.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article>
          <h2>Food</h2>
          <div className="tag-list">
            {userProfile.foodPreferences.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article>
          <h2>Fitness</h2>
          <div className="tag-list">
            {userProfile.fitnessReality.map((item) => (
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
