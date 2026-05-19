import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppShell } from './components/AppShell'
import { AssistantScreen } from './screens/AssistantScreen'
import { FitnessScreen } from './screens/FitnessScreen'
import { FoodScreen } from './screens/FoodScreen'
import { LocalScreen } from './screens/LocalScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { TabId } from '@vitapilot/core'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today')

  const screens: Record<TabId, ReactNode> = {
    today: <TodayScreen />,
    assistant: <AssistantScreen />,
    food: <FoodScreen />,
    fitness: <FitnessScreen />,
    local: <LocalScreen />,
    profile: <ProfileScreen />,
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {screens[activeTab]}
    </AppShell>
  )
}

export default App
