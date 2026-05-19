import { createVitaPilotRepository } from '@vitapilot/data'

export const vitaPilotRepository = createVitaPilotRepository({
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  url: import.meta.env.VITE_SUPABASE_URL,
})
