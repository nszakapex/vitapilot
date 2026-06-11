import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppShell } from './components/AppShell'
import { AssistantScreen } from './screens/AssistantScreen'
import { ContextGraphScreen } from './screens/ContextGraphScreen'
import { FitnessScreen } from './screens/FitnessScreen'
import { FoodScreen } from './screens/FoodScreen'
import { IntakeScreen } from './screens/IntakeScreen'
import { LocalScreen } from './screens/LocalScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { TabId } from '@vitapilot/core'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('intake')

  const screens: Record<TabId, ReactNode> = {
    intake: <IntakeScreen onOpenContext={() => setActiveTab('context')} />,
    context: <ContextGraphScreen onOpenIntake={() => setActiveTab('intake')} />,
    today: <TodayScreen />,
    assistant: <AssistantScreen onOpenIntake={() => setActiveTab('intake')} />,
    food: <FoodScreen onOpenIntake={() => setActiveTab('intake')} />,
    fitness: <FitnessScreen onOpenIntake={() => setActiveTab('intake')} />,
    local: <LocalScreen />,
    profile: <ProfileScreen onOpenIntake={() => setActiveTab('intake')} />,
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {screens[activeTab]}
    </AppShell>
  )
}

export default App
