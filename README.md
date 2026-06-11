# VitaPilot

VitaPilot is a graph-aware health planning assistant prototype for real-life daily decisions: what to eat, how to move, how to recover, and which local healthy action is worth doing today.

## Workspace

```text
apps/
  prototype/          Current Vite React prototype
packages/
  core/               Shared health types, mock data, and coach-copy helpers
  ui/                 Shared design tokens and UI primitives
  data/               Future Supabase clients and database types
  ai-contracts/       Future AI request/response schemas
supabase/             Future migrations, seed data, and edge functions
docs/product/         Strategy and investor planning docs
```

## Scripts

```bash
npm run dev:prototype
npm run build
npm run lint
```

The prototype dev server is pinned to `http://127.0.0.1:5280`.

## Supabase

The schema starts in `supabase/migrations/20260519153000_initial_health_schema.sql`.

The prototype uses a repository in `packages/data`. Without Supabase env vars it persists to browser local storage. With `apps/prototype/.env.local` configured, authenticated users can read and write through Supabase:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Current Status

- Product strategy and investor roadmap are in `docs/product`.
- The first clickable prototype lives in `apps/prototype`.
- Shared product domain code has started in `packages/core`.
