# Supabase

This folder will hold Supabase migrations, seed data, generated database types, and Edge Functions.

Initial planned tables:

- `profiles`
- `health_preferences`
- `daily_plans`
- `daily_actions`
- `check_ins`
- `assistant_threads`
- `assistant_messages`
- `local_events`
- `saved_events`
- `safety_flags`
- `evidence_cards`

## Local Setup Later

```bash
supabase start
supabase db reset
```

## Hosted Project Setup Later

1. Create a Supabase project.
2. Apply `supabase/migrations/20260519153000_initial_health_schema.sql`.
3. Copy the project URL and publishable key into `apps/prototype/.env.local`.
4. Add auth in the app; unauthenticated users currently use the local fallback repository.
