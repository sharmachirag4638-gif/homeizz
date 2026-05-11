-- ============================================================
-- HOMEIZZ SUBSCRIPTIONS MIGRATION
-- Date: 2026-05-11
-- Adds Razorpay subscription state to professional profiles.
-- Safe to re-run.
-- ============================================================

alter table public.profiles
  add column if not exists billing_interval text default 'monthly',
  add column if not exists subscription_status text default 'inactive',
  add column if not exists razorpay_subscription_id text,
  add column if not exists razorpay_plan_id text,
  add column if not exists razorpay_customer_id text,
  add column if not exists subscription_current_start timestamptz,
  add column if not exists subscription_current_end timestamptz,
  add column if not exists subscription_cancel_at_cycle_end boolean default false,
  add column if not exists subscription_cancelled_at timestamptz,
  add column if not exists subscription_pending_plan text,
  add column if not exists subscription_pending_interval text,
  add column if not exists subscription_last_payment_id text,
  add column if not exists subscription_last_event text,
  add column if not exists subscription_updated_at timestamptz;

create unique index if not exists idx_profiles_razorpay_subscription_id
  on public.profiles(razorpay_subscription_id)
  where razorpay_subscription_id is not null;

create index if not exists idx_profiles_subscription_status
  on public.profiles(subscription_status);

do $$
begin
  alter table public.profiles
    add constraint profiles_billing_interval_check
    check (billing_interval in ('monthly', 'annual'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_subscription_pending_interval_check
    check (subscription_pending_interval is null or subscription_pending_interval in ('monthly', 'annual'));
exception
  when duplicate_object then null;
end $$;

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  profile_id uuid references public.profiles(id) on delete set null,
  razorpay_subscription_id text,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

alter table public.subscription_events enable row level security;

drop policy if exists "subscription_events_owner_select" on public.subscription_events;
create policy "subscription_events_owner_select" on public.subscription_events
  for select using ((select auth.uid()) = profile_id);

create index if not exists idx_subscription_events_profile_id
  on public.subscription_events(profile_id);

create index if not exists idx_subscription_events_razorpay_subscription_id
  on public.subscription_events(razorpay_subscription_id);
