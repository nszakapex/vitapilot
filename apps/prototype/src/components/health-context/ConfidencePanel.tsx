import type { HealthContextConfidence } from '@vitapilot/core'

interface ConfidencePanelProps {
  confidence: HealthContextConfidence
}

export function ConfidencePanel({ confidence }: ConfidencePanelProps) {
  return (
    <section className="context-section" aria-labelledby="confidence-title">
      <div className="context-section__header">
        <div>
          <span className="eyebrow">Confidence and missing info</span>
          <h2 id="confidence-title">What VitaPilot knows, and what it still needs to learn.</h2>
        </div>
      </div>

      <div className="confidence-grid">
        <ConfidenceList title="High confidence" items={confidence.highConfidenceInsights} />
        <ConfidenceList title="Low-confidence assumptions" items={confidence.lowConfidenceAssumptions} />
        <ConfidenceList title="Missing information" items={confidence.missingInformation} />
        <ConfidenceList title="Follow-up questions" items={confidence.recommendedFollowUpQuestions} />
      </div>
    </section>
  )
}

interface ConfidenceListProps {
  title: string
  items: string[]
}

function ConfidenceList({ title, items }: ConfidenceListProps) {
  return (
    <article className="confidence-column">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No major items yet.</p>
      )}
    </article>
  )
}
