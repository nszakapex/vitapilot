import { ArrowRight, CheckCircle2, FileText, Sparkles, Upload } from 'lucide-react'
import { intakeQuestions } from '@vitapilot/core'
import { ScreenHeader } from '../components/ScreenHeader'
import { useLifeIntake } from '../hooks/useLifeIntake'

const categoryLabels = {
  food: 'Food reality',
  life: 'Life context',
  motivation: 'Coaching style',
  movement: 'Movement',
  recovery: 'Recovery',
  safety: 'Safety',
} as const

interface IntakeScreenProps {
  onOpenContext: () => void
}

export function IntakeScreen({ onOpenContext }: IntakeScreenProps) {
  const {
    graphStatus,
    hasGraph,
    intake,
    isLoading,
    saveIntake,
    saveState,
    toggleAnswer,
    updateFreeform,
  } = useLifeIntake()

  const getAnswers = (questionId: string) =>
    intake.responses.find((response) => response.questionId === questionId)?.answers ?? []

  const selectedCount = intake.responses.reduce((total, response) => total + response.answers.length, 0)
  const contextScore = Math.min(100, selectedCount * 9 + Math.min(30, Math.floor(intake.freeform.length / 12)))
  const showGraphSuccess = graphStatus === 'generated' || hasGraph

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Life intake"
        title="Tell the app how your real life works"
        supporting="This is the difference between a generic wellness app and a coach that knows when restaurant meals, stress, budget, injuries, and motivation actually show up."
      />

      <section className="intake-hero">
        <div>
          <span className="eyebrow">Personalization depth</span>
          <h2>{isLoading ? 'Loading your context' : `${contextScore}% context captured`}</h2>
          <p>The assistant should use this context before it recommends meals, workouts, local events, or reset plans.</p>
        </div>
        <div className="intake-score" aria-label={`${contextScore}% context captured`}>
          <span>{contextScore}</span>
          <small>/100</small>
        </div>
      </section>

      <section className="life-upload-panel">
        <div className="life-upload-panel__header">
          <FileText size={19} aria-hidden="true" />
          <div>
            <h2>Life dump</h2>
            <p>Paste anything: schedule, food habits, budget, injuries, travel, family, stress, goals, what has failed before.</p>
          </div>
        </div>
        <textarea
          aria-label="Life context"
          onChange={(event) => updateFreeform(event.target.value)}
          placeholder="Example: I work late three nights a week, eat out for lunch, hate calorie tracking, have a cranky knee, and usually fall off after a stressful weekend..."
          value={intake.freeform}
        />
        <div className="upload-row">
          <button className="tool-button" type="button">
            <Upload size={18} aria-hidden="true" />
            Upload later
          </button>
          <p>Document/image upload is staged for V2. For now, paste text so the planning model can use it.</p>
        </div>
      </section>

      <section className="intake-question-grid" aria-label="Life intake questions">
        {intakeQuestions.map((question) => {
          const selectedAnswers = getAnswers(question.id)

          return (
            <article className="intake-question" key={question.id}>
              <span className="eyebrow">{categoryLabels[question.category]}</span>
              <h2>{question.prompt}</h2>
              <p>{question.helper}</p>
              <div className="answer-grid">
                {question.options.map((option) => {
                  const isSelected = selectedAnswers.includes(option)
                  return (
                    <button
                      className={isSelected ? 'answer-chip answer-chip--selected' : 'answer-chip'}
                      key={option}
                      onClick={() => toggleAnswer(question.id, option, question.allowMultiple)}
                      type="button"
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </section>

      <section className="intake-save-strip">
        <div>
          <span className="eyebrow">Assessment output</span>
          <h2>The next version should turn this into a health context graph.</h2>
          <p>Goals, constraints, preferences, risk flags, motivation style, and real-world friction become planning inputs.</p>
        </div>
        <button onClick={() => void saveIntake()} type="button">
          <Sparkles size={18} aria-hidden="true" />
          {saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : 'Save context'}
        </button>
      </section>

      {showGraphSuccess ? (
        <section className="intake-graph-success" aria-live="polite">
          <div className="intake-graph-success__icon" aria-hidden="true">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="eyebrow">Assessment generated</span>
            <h2>Your Health Context Graph is ready.</h2>
            <p>
              VitaPilot used your intake to identify your strengths, friction points, safety considerations, planning rules, and first-week plan.
            </p>
          </div>
          <button className="text-button" onClick={onOpenContext} type="button">
            View Context Graph
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </section>
      ) : null}
    </section>
  )
}
