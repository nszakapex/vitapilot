# VitaPilot AI Health Assistant

Mobile-first React + TypeScript framework for the AI health assistant concept.

## Stack

- Vite
- React
- TypeScript
- Lucide icons
- Plain CSS design system

## App Framework

- `src/types/health.ts` defines product domain types.
- `src/data/mockHealthPlan.ts` holds mock profile, plans, meals, workouts, events, prompts, and roadmap data.
- `src/lib/coachCopy.ts` contains early assistant-copy helpers.
- `src/components` contains app shell, metric, header, and action-card primitives.
- `src/screens` contains the initial app surfaces: Today, Coach, Food, Fitness, Local, and Profile.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

The dev server is pinned to `http://127.0.0.1:5280` so it does not collide with other local Vite projects.

## Product Direction

The first implementation focuses on the core daily decision loop: what to eat, how to move, how to recover, and which local action is worth doing today.
