# Homeizz Next.js — Setup & Deployment Guide

This is your new repo. Replace the contents of your existing GitHub repo with this folder, or create a new repo entirely — either works.

## What you're getting

A Next.js 14 project that:

1. **Ranks in Google** — every page is server-rendered with proper meta tags, Open Graph, canonical URLs, and JSON-LD structured data.
2. **Auto-generates ~750 SEO landing pages** — 30 cities × (15 architecture styles + 10 interior categories). Every combination is a dedicated URL like `/architects/bangalore/modern` that Google can index.
3. **Runs a real quote + escrow flow** — homeowners request quotes, designers respond, payment goes through Razorpay with server-side signature verification. Nothing fake, nothing client-side-only.

---

## Where every file goes

The whole `homeizz-next/` folder IS your new repo root. Paste it wholesale into your GitHub repo (after clearing the old single-file setup). Here's what's inside and why:

### Project config (repo root)

| File | Purpose |
|---|---|
| `package.json` | Dependencies: Next.js, Supabase, Razorpay, Resend |
| `next.config.js` | www→apex redirect, security headers, image domains |
| `jsconfig.json` | Enables `@/lib/...` style imports |
| `vercel.json` | Tells Vercel to run Next.js in the Mumbai (bom1) region — closer to your Indian users |
| `.env.example` | Template for env vars. Copy to `.env.local` for dev |
| `.gitignore` | Standard Next.js ignores |

### Public assets (`public/`)

Served at the root URL. Drop real favicons and an OG image here when you have them.

- `favicon.svg` (placeholder — replace with your logo)
- `robots.txt`
- `site.webmanifest`

Still need to add: `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `og-image.jpg` (1200×630), `logo.png`. Generate them all at once at https://realfavicongenerator.net.

### App routes (`src/app/`)

This is Next.js App Router. Each folder = a URL.

| Path | URL | What it does |
|---|---|---|
| `layout.js` | (wraps everything) | Global SEO metadata, fonts, Organization JSON-LD |
| `globals.css` | (your existing CSS, extracted) | Same classes as your old site — `.hero`, `.lcard`, etc. |
| `page.js` | `/` | Home page. Port your old hero/how/features sections into this file progressively |
| `browse/page.js` | `/browse` | Listing grid, filters via URL params |
| `listing/[id]/page.js` | `/listing/123` | Listing detail with per-page SEO + Product JSON-LD |
| `designer/[id]/page.js` | `/designer/abc` | Designer profile with ProfessionalService JSON-LD |
| `auth/page.js` | `/auth` | Sign-in / sign-up via Supabase |
| `quote/[listingId]/page.js` | `/quote/123` | Homeowner submits a quote request |
| `architects/[city]/[style]/page.js` | `/architects/bangalore/modern` | **Programmatic SEO. 450 pages from one file.** |
| `interior-designer/[city]/[style]/page.js` | `/interior-designer/pune/modular-kitchen` | **300 more SEO pages.** |
| `sitemap.xml/route.js` | `/sitemap.xml` | Dynamic sitemap listing everything — city/style combos + live listings + designers |
| `api/razorpay/create-order/route.js` | `/api/razorpay/create-order` | Server-only: creates Razorpay order |
| `api/razorpay/verify/route.js` | `/api/razorpay/verify` | Server-only: verifies signature, marks payment paid |
| `api/send-email/route.js` | `/api/send-email` | Server-only: sends email via Resend |

### Library helpers (`src/lib/`)

| File | Purpose |
|---|---|
| `supabase-browser.js` | Supabase client for client components (anon key only) |
| `supabase-server.js` | Supabase client for server components + admin client for privileged ops |
| `cities.js` | All 30+ cities we generate pages for. Add more here to expand coverage |
| `styles.js` | All architecture styles + interior categories. Add more to expand |
| `utils.js` | `escapeHTML`, `inr`, `toPaise`, `slugify` |

### Reusable components (`src/components/`)

| File | Purpose |
|---|---|
| `Nav.js` | Top navigation — appears on every page |
| `Footer.js` | Footer with links to key cities + legal |
| `ListingCard.js` | The card you see in browse / landing pages |
| `RazorpayCheckoutButton.js` | Drop-in button that opens Razorpay checkout |

### Database migrations (`supabase/`)

| File | Purpose |
|---|---|
| `01_schema_quotes.sql` | Creates `quote_requests`, `quotes`, `payments` tables + Row Level Security policies |

---

## Step-by-step: get it running

### 1. Local dev (on your machine)

```bash
cd homeizz-next
cp .env.example .env.local
# Edit .env.local with your real Supabase + Razorpay keys
npm install
npm run dev
```

Visit http://localhost:3000. You should see the home page with empty listings (because your new Supabase tables are empty).

### 2. Supabase schema

Go to https://supabase.com/dashboard → your project → SQL Editor → New query.

Paste the contents of `supabase/01_schema_quotes.sql` and click Run. This creates the three new tables and enables Row Level Security.

**Also important:** you need these existing-looking tables for the pages to work. If you don't already have them:

```sql
-- profiles (users beyond what auth.users provides)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text,            -- 'homeowner' | 'designer' | 'architect'
  city text,
  bio text,
  public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles_select_public" on profiles for select using (public = true or auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- listings
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  title text not null,
  description text,
  listing_type text,    -- 'architecture' | 'interior' | 'plan'
  city text,
  bedrooms int,
  sqft int,
  price_paise bigint,
  price_unit text,      -- e.g. 'per sqft' | 'total'
  cover_image text,
  photos jsonb,
  tags text[],
  rating numeric,
  status text default 'live',
  badge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table listings enable row level security;
create policy "listings_select_live" on listings for select using (status = 'live' or auth.uid() = owner_id);
create policy "listings_insert_own" on listings for insert with check (auth.uid() = owner_id);
create policy "listings_update_own" on listings for update using (auth.uid() = owner_id);
create policy "listings_delete_own" on listings for delete using (auth.uid() = owner_id);
create index if not exists idx_listings_city on listings(city);
create index if not exists idx_listings_status on listings(status);
```

### 3. Razorpay setup

1. Create an account at https://dashboard.razorpay.com
2. Stay in **Test Mode** while you develop (button top-right of dashboard)
3. Settings → API Keys → Generate Test Key
4. Copy `Key ID` → `.env.local` as `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. Copy `Key Secret` → `.env.local` as `RAZORPAY_KEY_SECRET`
6. When you go live: switch to Live Mode, complete KYC (takes 2-3 days in India), generate live keys, replace env vars in Vercel.
7. Optional: set up a webhook at Settings → Webhooks pointing to `https://homeizz.com/api/razorpay/verify` for additional redundancy.

### 4. Resend setup (for emails)

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Add and verify `homeizz.com` as a domain (DNS records go in GoDaddy)
3. Create an API key → put in `.env.local` as `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL=hello@homeizz.com`

### 5. Deploy to Vercel

Two options:

**A. Via Vercel dashboard (easiest)**

1. Push this folder to GitHub
2. Go to https://vercel.com/new
3. Import the repo
4. Vercel auto-detects Next.js — just click Deploy
5. After first deploy fails (because env vars are missing), go to Project → Settings → Environment Variables and add all six values from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_SITE_URL` (set to `https://homeizz.com`)
6. Hit "Redeploy" on the Deployments tab

**B. Via CLI**

```bash
npm i -g vercel
cd homeizz-next
vercel --prod
```

### 6. GoDaddy → Vercel DNS

In Vercel: Project → Settings → Domains → Add `homeizz.com` and `www.homeizz.com`. Vercel shows you the exact DNS records to add.

In GoDaddy: DNS Management for `homeizz.com`:
- **A record** — Host `@`, Points to `76.76.21.21`, TTL 600
- **CNAME** — Host `www`, Points to `cname.vercel-dns.com`, TTL 600
- Delete any existing `@` or `www` A/CNAME records that conflict

**Do NOT use GoDaddy's "Domain Forwarding" feature.** It breaks HTTPS and SEO. Use real DNS records as above.

Propagation takes 10 minutes to a few hours. Once green in Vercel, visit `https://homeizz.com`.

### 7. Google Search Console

Once live:
1. Go to https://search.google.com/search-console
2. Add property: `https://homeizz.com`
3. Verify ownership (easiest: add a TXT record in GoDaddy)
4. Submit sitemap: `https://homeizz.com/sitemap.xml`
5. In ~2 weeks you'll start seeing impressions in the Performance report. Watch for city + style keyword queries.

---

## What still needs porting from your old `index.html`

I built a minimal but complete working scaffold. These sections from your existing site need to be copied into the new React components:

| Old section (in index.html) | New home | Notes |
|---|---|---|
| Hero (`.hero` block) | `src/app/page.js` — I included a minimal version; expand with your full markup | |
| Features grid (`.feats`) | `src/app/page.js` | Paste the markup, wrap class attrs as `className` |
| Testimonials (`.testi`) | `src/app/page.js` | Same |
| Dashboard (`.dash-layout`) | Create `src/app/dashboard/page.js` as `'use client'` with Supabase auth gate | |
| Listing form (the old "list your work" flow) | Create `src/app/list/page.js` | |
| Gallery / detail page UI details | `src/app/listing/[id]/page.js` | Expand beyond the basic layout I included |

The rule for porting: every `onclick="X"` becomes `onClick={X}`, every `class=` becomes `className=`, every `<input ... />` stays the same. Most of your CSS classes work as-is because I kept `globals.css` identical.

---

## Roadmap (what to tackle next, in order)

1. **Port your hero + full home page content** into `src/app/page.js`. One afternoon of find-and-replace.
2. **Add 50 seed listings** in Supabase manually so programmatic SEO pages aren't empty when Google crawls. Even stubs with placeholder images work.
3. **Write 200 words of original intro copy per top city** — manually edit `src/app/architects/[city]/[style]/page.js` to pull copy from a `cityCopy[city]` map. This is what separates you from the programmatic-SEO spam Google already penalises.
4. **Wire real listings into SEO pages** — add a `tags` array or `style_slug` column to your `listings` table, then match on it in the landing pages.
5. **Build the designer-side quote response UI** — designer views incoming quote requests and submits a `quote` row with milestones.
6. **WhatsApp notifications** — when a quote is sent / accepted / paid, fire a WhatsApp message via Gupshup or AiSensy API (wrap in a server action).
7. **Hindi + regional language routes** — Next.js i18n middleware. `/hi/architects/...` etc. Translate via freelancer.

---

## Things I could not verify automatically

- I didn't run `npm install` or `npm run build` against this — do it locally once and paste any errors, I'll fix.
- The `profiles` and `listings` table column names I used (`full_name`, `cover_image`, `price_paise`, etc.) are a guess. If yours differ, either rename in Supabase or update the field names in the page files (search the codebase for `from('listings')` and `from('profiles')`).
- Favicons are placeholders. Generate real ones before going live.
- `og-image.jpg` needs to be created. Use Figma or Canva — 1200×630 with the Homeizz logo + tagline.

---

Ship it, watch Search Console, iterate. DM me when you hit a wall.
