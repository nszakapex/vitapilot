import {
  Bot,
  CalendarDays,
  Dumbbell,
  Map,
  Salad,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { TabId } from '@vitapilot/core'

interface NavigationItem {
  id: TabId
  label: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'assistant', label: 'Coach', icon: Bot },
  { id: 'food', label: 'Food', icon: Salad },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'local', label: 'Local', icon: Map },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: ReactNode
}

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="rail" aria-label="Primary">
        <div className="brand-block">
          <span className="brand-mark">V</span>
          <div>
            <strong>VitaPilot</strong>
            <small>AI health OS</small>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeTab

            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'nav-item nav-item--active' : 'nav-item'}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                type="button"
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav" aria-label="Primary">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeTab

          return (
            <button
              aria-current={isActive ? 'page' : undefined}
              className={isActive ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item'}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              type="button"
            >
              <Icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
