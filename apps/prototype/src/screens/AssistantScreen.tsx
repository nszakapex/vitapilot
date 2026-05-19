import { SendHorizontal, ShieldCheck } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { assistantPrompts, getSafetyCopy, userProfile } from '@vitapilot/core'

export function AssistantScreen() {
  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Coach"
        title={`${userProfile.coachStyle} guidance, grounded in your day`}
        supporting="Ask for food swaps, workout adjustments, trend checks, recovery plans, or a smaller version of today's plan."
      />

      <section className="prompt-grid" aria-label="Suggested prompts">
        {assistantPrompts.map((item) => (
          <button className="prompt-card" key={item.id} type="button">
            <span>{item.label}</span>
            <p>{item.prompt}</p>
          </button>
        ))}
      </section>

      <section className="conversation-panel" aria-label="Assistant conversation">
        <div className="message message--user">
          I only have 15 minutes and feel tired. Should I skip today?
        </div>
        <div className="message message--coach">
          Do the smaller version. Two rounds of squats, rows, and incline push-ups, then a short walk after dinner. That keeps the habit alive without pretending today is a high-output day.
        </div>
      </section>

      <form className="composer">
        <label className="sr-only" htmlFor="assistant-message">
          Message
        </label>
        <input
          id="assistant-message"
          placeholder="Ask about a meal, workout, trend, or reset..."
          type="text"
        />
        <button className="icon-button" type="submit" title="Send message">
          <SendHorizontal size={18} aria-hidden="true" />
        </button>
      </form>

      <aside className="safety-note">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>{getSafetyCopy()}</p>
      </aside>
    </section>
  )
}
