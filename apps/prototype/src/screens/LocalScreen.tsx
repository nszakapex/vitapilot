import { Filter, MapPin } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { localEvents, userProfile } from '@vitapilot/core'

export function LocalScreen() {
  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Local"
        title={`Healthy options near ${userProfile.locationLabel}`}
        supporting="The local layer turns plans into real-world movement, food, recovery, and community."
      />

      <section className="local-toolbar">
        <button className="tool-button" type="button">
          <Filter size={18} aria-hidden="true" />
          Filters
        </button>
        <button className="tool-button" type="button">
          <MapPin size={18} aria-hidden="true" />
          Near me
        </button>
      </section>

      <section className="map-surface" aria-label="Local map preview">
        <span>Run clubs</span>
        <span>Markets</span>
        <span>Classes</span>
        <span>Recovery</span>
      </section>

      <section className="list-stack" aria-label="Local events">
        {localEvents.map((event) => (
          <article className="event-row" key={event.id}>
            <div>
              <span className="eyebrow">{event.type}</span>
              <h2>{event.title}</h2>
              <p>{event.fitReason}</p>
            </div>
            <div className="event-row__meta">
              <strong>{event.when}</strong>
              <span>{event.distance}</span>
              <span>{event.price}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}
