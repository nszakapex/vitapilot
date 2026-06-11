import {
  Camera,
  ClipboardList,
  Clock3,
  DollarSign,
  MapPinned,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Utensils,
} from 'lucide-react'
import {
  hasEatingBehaviorGuardrail,
  graphHasFriction,
  hasPlanningRule,
  mealOptions,
  type HealthContextGraph,
} from '@vitapilot/core'
import type { LucideIcon } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { useHealthContextGraph } from '../hooks/useHealthContextGraph'

interface FoodScreenProps {
  onOpenIntake?: () => void
}

interface FoodGuidanceCard {
  id: string
  icon: LucideIcon
  title: string
  detail: string
  tag: string
}

const foodTools = [
  { icon: ScanLine, label: 'Menu scan' },
  { icon: ShoppingBasket, label: 'Grocery list' },
  { icon: Camera, label: 'Meal photo' },
  { icon: ClipboardList, label: 'Pantry meal' },
]

export function FoodScreen({ onOpenIntake }: FoodScreenProps) {
  const { error, graph, status } = useHealthContextGraph()
  const hasGraph = status === 'ready' && graph !== null
  const usesGentleFoodLanguage = hasEatingBehaviorGuardrail(graph)
  const guidanceCards = hasGraph ? createFoodGuidanceCards(graph) : []
  const modes = hasGraph ? createFoodModes(graph) : ['Steady meals', 'Plate method', 'Light check-in']

  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Food"
        title="Eat for the day you actually have"
        supporting={hasGraph
          ? 'Food guidance is shaped by your graph: eating environment, tracking preference, budget, travel, time pressure, and safety boundaries.'
          : 'Complete intake to let Food adapt to your restaurants, budget, schedule, recovery, and tracking preference.'}
      />

      {hasGraph ? (
        <section className="graph-aware-panel" aria-label="Graph-aware food guidance">
          <div>
            <span className="eyebrow">Graph-aware food</span>
            <h2>{usesGentleFoodLanguage ? 'Steady meal anchors first' : 'Food cards matched to your context'}</h2>
            <p>
              {usesGentleFoodLanguage
                ? 'VitaPilot keeps food guidance steady, neutral, and non-punitive for this graph. No restriction required.'
                : 'VitaPilot is using your intake friction points and planning rules before showing meal options.'}
            </p>
          </div>
          <span className="graph-aware-pill">{graph.userSnapshot.confidence} confidence</span>
        </section>
      ) : (
        <section className="graph-empty-note" aria-label="Food graph status">
          <div>
            <span className="eyebrow">{status === 'error' ? 'Graph unavailable' : 'No graph yet'}</span>
            <h2>Complete intake to personalize food guidance.</h2>
            <p>{status === 'error' ? error : 'Static examples stay visible until your Health Context Graph exists.'}</p>
          </div>
          {onOpenIntake ? (
            <button className="text-button" onClick={onOpenIntake} type="button">
              Edit Intake
            </button>
          ) : null}
        </section>
      )}

      <section className="mode-row" aria-label="Food modes">
        {modes.map((mode, index) => (
          <button className={index === 0 ? 'mode-chip mode-chip--active' : 'mode-chip'} key={mode} type="button">
            {mode}
          </button>
        ))}
      </section>

      <section className="tool-grid" aria-label="Food tools">
        {foodTools.map((tool) => {
          const Icon = tool.icon

          return (
            <button className="tool-button tool-button--disabled" disabled key={tool.label} type="button">
              <Icon size={19} aria-hidden="true" />
              <span>{tool.label}</span>
              <small>Coming later</small>
            </button>
          )
        })}
      </section>

      {guidanceCards.length > 0 ? (
        <section className="graph-recommendation-grid" aria-label="Graph food recommendations">
          {guidanceCards.map((card) => {
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

      <section className="list-stack" aria-label="Meal options">
        {mealOptions.map((meal) => (
          <article className="meal-row" key={meal.id}>
            <div>
              <span className="eyebrow">{meal.context}</span>
              <h2>{meal.title}</h2>
              <p>{formatMealMeta(meal, usesGentleFoodLanguage)}</p>
            </div>
            <div className="tag-list">
              {mealTags(meal.tags, usesGentleFoodLanguage).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}

function createFoodModes(graph: HealthContextGraph) {
  if (hasEatingBehaviorGuardrail(graph)) return ['Steady meals', 'Regular rhythm', 'Gentle check-in']
  if (graphHasFriction(graph, 'restaurant-dependence')) return ['Restaurant anchors', 'No tracking', 'Pantry fallback']
  if (graphHasFriction(graph, 'budget-pressure')) return ['Budget anchors', 'Leftovers', 'Simple staples']
  if (graphHasFriction(graph, 'travel-disruption')) return ['Travel defaults', 'Restaurant anchors', 'Hydration']
  if (hasPlanningRule(graph, 'no-tracking-nutrition')) return ['No tracking', 'Plate method', 'Light check-in']

  return ['Simple anchor', 'Light check-in', 'Pantry fallback']
}

function createFoodGuidanceCards(graph: HealthContextGraph): FoodGuidanceCard[] {
  const cards: FoodGuidanceCard[] = []
  const usesGentleFoodLanguage = hasEatingBehaviorGuardrail(graph)

  if (usesGentleFoodLanguage) {
    cards.push({
      detail: 'Use regular meals, neutral language, and enough flexibility to avoid turning food into pressure.',
      icon: ShieldCheck,
      id: 'steady-meal-anchor',
      tag: 'Safety-aware',
      title: 'Steady meal anchor',
    })
  }

  if (graphHasFriction(graph, 'restaurant-dependence')) {
    cards.push({
      detail: usesGentleFoodLanguage
        ? 'Choose a familiar steady order that feels supportive, repeatable, and free of restriction pressure.'
        : 'Choose a familiar order with a protein anchor, fiber or plants, and a side that keeps the meal easy to repeat.',
      icon: Utensils,
      id: 'restaurant-order-anchor',
      tag: 'Restaurants',
      title: 'Restaurant-order default',
    })
  }

  if (hasPlanningRule(graph, 'no-tracking-nutrition')) {
    cards.push({
      detail: 'Use the plate method, repeatable anchors, and simple decisions instead of detailed tracking.',
      icon: ClipboardList,
      id: 'no-tracking-anchor',
      tag: 'No tracking',
      title: 'Plate-method choice',
    })
  }

  if (graphHasFriction(graph, 'budget-pressure')) {
    cards.push({
      detail: 'Build around low-cost staples like eggs, beans, yogurt, rice, frozen vegetables, leftovers, or simple restaurant defaults.',
      icon: DollarSign,
      id: 'budget-anchor',
      tag: 'Budget',
      title: 'Budget-simple meal',
    })
  }

  if (graphHasFriction(graph, 'travel-disruption')) {
    cards.push({
      detail: 'Use road, hotel, or airport defaults that are easy to find and do not require a full kitchen.',
      icon: MapPinned,
      id: 'travel-anchor',
      tag: 'Travel',
      title: 'Travel-safe default',
    })
  }

  if (graphHasFriction(graph, 'time-pressure')) {
    cards.push({
      detail: 'Pick meals that can be decided in a few minutes and repeated on packed days.',
      icon: Clock3,
      id: 'fast-anchor',
      tag: 'Time pressure',
      title: 'Fast meal anchor',
    })
  }

  if (graphHasFriction(graph, 'poor-sleep') || graphHasFriction(graph, 'low-energy')) {
    cards.push({
      detail: 'Use simple, steady food choices when recovery is low so the plan does not depend on high motivation.',
      icon: ShieldCheck,
      id: 'recovery-aware-food',
      tag: 'Recovery',
      title: 'Low-energy food fallback',
    })
  }

  return cards.slice(0, 4)
}

function formatMealMeta(meal: (typeof mealOptions)[number], usesGentleFoodLanguage: boolean) {
  if (usesGentleFoodLanguage) {
    return `Steady option, ${meal.prepTime}`
  }

  return `${meal.protein} protein, ${meal.prepTime}`
}

function mealTags(tags: string[], usesGentleFoodLanguage: boolean) {
  if (!usesGentleFoodLanguage) return tags

  return tags
    .filter((tag) => !tag.toLowerCase().includes('protein'))
    .map((tag) => tag === 'sleep-friendly' ? 'gentle evening option' : tag)
}
