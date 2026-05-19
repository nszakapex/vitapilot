import { Camera, ClipboardList, ScanLine, ShoppingBasket } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { mealOptions } from '../data/mockHealthPlan'

export function FoodScreen() {
  return (
    <section className="screen-stack">
      <ScreenHeader
        eyebrow="Food"
        title="Eat for the day you actually have"
        supporting="Meal choices adapt to goals, time, budget, restaurants, sleep, and how much tracking you want."
      />

      <section className="mode-row" aria-label="Food modes">
        <button className="mode-chip mode-chip--active" type="button">
          No tracking
        </button>
        <button className="mode-chip" type="button">
          Light check-in
        </button>
        <button className="mode-chip" type="button">
          Macro view
        </button>
      </section>

      <section className="tool-grid" aria-label="Food tools">
        <button className="tool-button" type="button">
          <ScanLine size={19} aria-hidden="true" />
          Menu scan
        </button>
        <button className="tool-button" type="button">
          <ShoppingBasket size={19} aria-hidden="true" />
          Grocery list
        </button>
        <button className="tool-button" type="button">
          <Camera size={19} aria-hidden="true" />
          Meal photo
        </button>
        <button className="tool-button" type="button">
          <ClipboardList size={19} aria-hidden="true" />
          Pantry meal
        </button>
      </section>

      <section className="list-stack" aria-label="Meal options">
        {mealOptions.map((meal) => (
          <article className="meal-row" key={meal.id}>
            <div>
              <span className="eyebrow">{meal.context}</span>
              <h2>{meal.title}</h2>
              <p>
                {meal.protein} protein, {meal.prepTime}
              </p>
            </div>
            <div className="tag-list">
              {meal.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}
