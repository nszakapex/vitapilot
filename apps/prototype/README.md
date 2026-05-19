# VitaPilot AI Health Assistant

Mobile-first React + TypeScript framework for the AI health assistant concept.

## Stack

- Vite
- React
- TypeScript
- Lucide icons
- Plain CSS design system

## App Framework

- `../../packages/core` defines shared product domain types, mock data, and coach-copy helpers.
- `../../packages/data` provides the repository layer with Supabase support and browser-local fallback.
- `src/components` contains app shell, metric, header, and action-card primitives.
- `src/screens` contains the initial app surfaces: Today, Coach, Food, Fitness, Local, and Profile.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

From the repo root, prefer:

```bash
npm run dev:prototype
```

The dev server is pinned to `http://127.0.0.1:5280` so it does not collide with other local Vite projects.

Create `.env.local` from `.env.example` after a Supabase project exists.

## Product Direction

The first implementation focuses on the core daily decision loop: what to eat, how to move, how to recover, and which local action is worth doing today.
