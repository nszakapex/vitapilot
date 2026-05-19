# VitaPilot

VitaPilot is an AI health assistant concept for real-life daily decisions: what to eat, how to move, how to recover, and which local healthy action is worth doing today.

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

## Current Status

- Product strategy and investor roadmap are in `docs/product`.
- The first clickable prototype lives in `apps/prototype`.
- Shared product domain code has started in `packages/core`.
