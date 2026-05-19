create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Alex',
  primary_goal text not null default '',
  secondary_goal text not null default '',
  coach_style text not null default 'gentle' check (coach_style in ('gentle', 'direct', 'analytical', 'minimal')),
  constraints jsonb not null default '[]'::jsonb,
  food_preferences jsonb not null default '[]'::jsonb,
  fitness_reality jsonb not null default '[]'::jsonb,
  location_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  focus text not null default '',
  metrics jsonb not null default '[]'::jsonb,
  weekly_pattern text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table if not exists public.daily_actions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.daily_plans(id) on delete cascade,
  action_key text not null,
  area text not null check (area in ('nutrition', 'movement', 'recovery', 'habit', 'local', 'safety')),
  title text not null,
  why text not null,
  duration text not null,
  effort text not null check (effort in ('low', 'medium', 'high')),
  status text not null default 'ready' check (status in ('ready', 'scheduled', 'complete')),
  evidence text not null check (evidence in ('strong', 'mixed', 'early', 'practical')),
  cta text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, action_key)
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  energy integer check (energy between 1 and 5),
  hunger integer check (hunger between 1 and 5),
  stress integer check (stress between 1 and 5),
  sleep_quality integer check (sleep_quality between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Daily coach',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.assistant_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  safety_level text check (safety_level in ('green', 'yellow', 'red')),
  created_at timestamptz not null default now()
);

create table if not exists public.local_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'manual',
  external_id text,
  title text not null,
  event_type text not null,
  starts_at timestamptz,
  distance_label text,
  price_label text,
  fit_reason text,
  location_label text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);

create table if not exists public.saved_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.local_events(id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'going', 'dismissed')),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.safety_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source text not null,
  level text not null check (level in ('green', 'yellow', 'red')),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  evidence_level text not null check (evidence_level in ('strong', 'mixed', 'early', 'practical', 'hype-risk')),
  summary text not null,
  reviewed_by text,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_plans_user_date_idx on public.daily_plans (user_id, local_date);
create index if not exists daily_actions_plan_idx on public.daily_actions (plan_id, sort_order);
create index if not exists check_ins_user_date_idx on public.check_ins (user_id, local_date);
create index if not exists assistant_messages_thread_idx on public.assistant_messages (thread_id, created_at);
create index if not exists local_events_starts_at_idx on public.local_events (starts_at);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists daily_plans_set_updated_at on public.daily_plans;
create trigger daily_plans_set_updated_at
before update on public.daily_plans
for each row execute function public.set_updated_at();

drop trigger if exists daily_actions_set_updated_at on public.daily_actions;
create trigger daily_actions_set_updated_at
before update on public.daily_actions
for each row execute function public.set_updated_at();

drop trigger if exists assistant_threads_set_updated_at on public.assistant_threads;
create trigger assistant_threads_set_updated_at
before update on public.assistant_threads
for each row execute function public.set_updated_at();

drop trigger if exists local_events_set_updated_at on public.local_events;
create trigger local_events_set_updated_at
before update on public.local_events
for each row execute function public.set_updated_at();

drop trigger if exists evidence_cards_set_updated_at on public.evidence_cards;
create trigger evidence_cards_set_updated_at
before update on public.evidence_cards
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_plans enable row level security;
alter table public.daily_actions enable row level security;
alter table public.check_ins enable row level security;
alter table public.assistant_threads enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.local_events enable row level security;
alter table public.saved_events enable row level security;
alter table public.safety_flags enable row level security;
alter table public.evidence_cards enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users manage own daily plans" on public.daily_plans;
create policy "Users manage own daily plans"
on public.daily_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage actions through own plans" on public.daily_actions;
create policy "Users manage actions through own plans"
on public.daily_actions
for all
using (
  exists (
    select 1 from public.daily_plans
    where daily_plans.id = daily_actions.plan_id
    and daily_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.daily_plans
    where daily_plans.id = daily_actions.plan_id
    and daily_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users manage own check-ins" on public.check_ins;
create policy "Users manage own check-ins"
on public.check_ins
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own assistant threads" on public.assistant_threads;
create policy "Users manage own assistant threads"
on public.assistant_threads
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own assistant messages" on public.assistant_messages;
create policy "Users manage own assistant messages"
on public.assistant_messages
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Anyone authenticated can read local events" on public.local_events;
create policy "Anyone authenticated can read local events"
on public.local_events
for select
to authenticated
using (true);

drop policy if exists "Users manage own saved events" on public.saved_events;
create policy "Users manage own saved events"
on public.saved_events
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read own safety flags" on public.safety_flags;
create policy "Users read own safety flags"
on public.safety_flags
for select
using (auth.uid() = user_id);

drop policy if exists "Authenticated users read evidence cards" on public.evidence_cards;
create policy "Authenticated users read evidence cards"
on public.evidence_cards
for select
to authenticated
using (true);
