-- ──────────────────────────────────────────────────────────────────────
-- QUOTES + PAYMENTS SCHEMA — paste this into Supabase → SQL Editor → Run.
-- Safe to re-run: every CREATE uses "IF NOT EXISTS".
-- ──────────────────────────────────────────────────────────────────────

-- A "quote request" is a homeowner asking one or more designers for a quote.
create table if not exists quote_requests (
  id              uuid primary key default gen_random_uuid(),
  homeowner_id    uuid references auth.users(id) on delete cascade,
  listing_id      uuid,                             -- optional: specific listing they're asking about
  city            text,
  scope           text,                             -- what they want (free-text)
  bedrooms        int,
  sqft            int,
  budget_paise    bigint,                           -- store everything in paise (integer)
  vastu_required  boolean default false,
  target_date     date,
  status          text default 'open',              -- open | closed | hired
  created_at      timestamptz default now()
);

-- A "quote" is a designer's response to a quote_request.
create table if not exists quotes (
  id                uuid primary key default gen_random_uuid(),
  quote_request_id  uuid references quote_requests(id) on delete cascade,
  designer_id       uuid references auth.users(id) on delete cascade,
  total_paise       bigint not null,
  timeline_weeks    int,
  scope_summary     text,
  milestones        jsonb,                          -- [{title, paise, due_weeks}]
  status            text default 'sent',            -- sent | accepted | rejected | expired
  created_at        timestamptz default now(),
  responded_at      timestamptz
);

-- A "payment" is a single Razorpay transaction against an accepted quote.
-- Used for milestone-based payments (escrow-style).
create table if not exists payments (
  id                    uuid primary key default gen_random_uuid(),
  quote_id              uuid references quotes(id) on delete cascade,
  homeowner_id          uuid references auth.users(id),
  amount_paise          bigint not null,
  milestone_index       int,
  razorpay_order_id     text unique,
  razorpay_payment_id   text,
  razorpay_signature    text,
  status                text default 'created',     -- created | paid | failed | refunded
  created_at            timestamptz default now(),
  paid_at               timestamptz
);

-- ──────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — without this, your anon key is a free pass.
-- ──────────────────────────────────────────────────────────────────────

alter table quote_requests enable row level security;
alter table quotes          enable row level security;
alter table payments        enable row level security;

-- quote_requests: homeowner sees their own; designer sees ones in their city (adjust to match your matching rule)
drop policy if exists "quote_requests_select_own" on quote_requests;
create policy "quote_requests_select_own" on quote_requests
  for select using (auth.uid() = homeowner_id);

drop policy if exists "quote_requests_insert_own" on quote_requests;
create policy "quote_requests_insert_own" on quote_requests
  for insert with check (auth.uid() = homeowner_id);

-- quotes: designer sees their own (what they sent), homeowner sees quotes on their request
drop policy if exists "quotes_select_participants" on quotes;
create policy "quotes_select_participants" on quotes
  for select using (
    auth.uid() = designer_id
    or exists (
      select 1 from quote_requests qr
      where qr.id = quotes.quote_request_id and qr.homeowner_id = auth.uid()
    )
  );

drop policy if exists "quotes_insert_designer" on quotes;
create policy "quotes_insert_designer" on quotes
  for insert with check (auth.uid() = designer_id);

drop policy if exists "quotes_update_designer" on quotes;
create policy "quotes_update_designer" on quotes
  for update using (auth.uid() = designer_id);

-- payments: homeowner can see + create their own
drop policy if exists "payments_select_own" on payments;
create policy "payments_select_own" on payments
  for select using (auth.uid() = homeowner_id);

drop policy if exists "payments_insert_own" on payments;
create policy "payments_insert_own" on payments
  for insert with check (auth.uid() = homeowner_id);

-- Webhook / server must update payment status using the service role key,
-- which bypasses RLS. No policy needed for that path.

-- Indexes
create index if not exists idx_qr_homeowner on quote_requests(homeowner_id);
create index if not exists idx_qr_city on quote_requests(city);
create index if not exists idx_q_request on quotes(quote_request_id);
create index if not exists idx_p_homeowner on payments(homeowner_id);
create index if not exists idx_p_quote on payments(quote_id);
