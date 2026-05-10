# Homeizz — Update notes (round 1)

Drop-in changes you can commit to your GitHub repo and push to Vercel.

## Files in this update

- `index.html` — updated with SEO, social, performance, and security fixes
- `robots.txt` — tells Google what to crawl
- `sitemap.xml` — lists your main pages for search engines
- `site.webmanifest` — PWA/install metadata
- `favicon.svg` — simple placeholder favicon (replace with your real logo when ready)

## What to do on Vercel

Put `robots.txt`, `sitemap.xml`, `site.webmanifest`, and `favicon.svg` inside your `/public` folder (or the repo root if you're deploying plain HTML). Vercel will serve them automatically at the root path. Example resulting URLs:

- `https://homeizz.com/robots.txt`
- `https://homeizz.com/sitemap.xml`
- `https://homeizz.com/favicon.svg`

You will also want to generate and drop in:

- `favicon-32x32.png` (32x32)
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png` (192x192)
- `android-chrome-512x512.png` (512x512)
- `og-image.jpg` (1200x630 — this is what shows when Homeizz is shared on WhatsApp / LinkedIn)
- `logo.png` (for the JSON-LD schema logo)

Use https://realfavicongenerator.net with a single high-res logo — it spits out all the sizes.

## What changed in `index.html`

### 1. `<head>` — SEO + social sharing
- Added `<meta name="description">` so Homeizz shows a proper snippet in Google results.
- Added Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) so WhatsApp / LinkedIn / Facebook previews look professional.
- Added Twitter card tags.
- Added `<link rel="canonical">` to prevent duplicate-URL SEO issues.
- Added favicon and manifest links.
- Added JSON-LD structured data (`Organization` + `WebSite`) so Google can understand your brand.

### 2. Performance
- Added `preconnect` hints for Google Fonts and jsDelivr — shaves ~200ms off first paint.
- Added `defer` to the Supabase SDK script so it no longer blocks rendering.

### 3. Security
- Injected an `escapeHTML()` helper near the top of your main `<script>` block. Wherever you do `element.innerHTML = someUserText` (titles, descriptions, inquiry messages), replace with `element.innerHTML = escapeHTML(someUserText)`. This prevents malicious users from injecting `<script>` tags through listing titles or inquiry messages.
- Quick audit: do `Ctrl+F` for `innerHTML` in `index.html` and wrap any user-supplied values.

## Supabase hardening (do this in the Supabase dashboard, not the code)

1. **Row Level Security (RLS)** — for every table, enable RLS and add policies. Right now anyone with your anon key (which is in the HTML source) can likely read/write tables. Typical policies:
   - `profiles`: select allowed for all, update/insert only where `auth.uid() = user_id`
   - `listings`: select allowed for all, insert/update/delete only where `auth.uid() = owner_id`
   - `inquiries`: insert allowed for authenticated, select only for listing owner or sender
2. **API Settings** — rotate the anon key only if the service-role key was ever exposed (check that no `service_role` key is in client code; only the `anon` key is OK).
3. **Auth** — turn on email confirmation and rate-limiting under Auth → Settings.

## Resend email — move the key off the client

Right now `var RESEND = ''` means emails silently fail. The fix:

1. In your GitHub repo, add `api/send-email.js`:
   ```js
   export default async function handler(req, res) {
     if (req.method !== 'POST') return res.status(405).end();
     const { to, subject, html } = req.body;
     const r = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({ from: 'Homeizz <hello@homeizz.com>', to, subject, html })
     });
     const data = await r.json();
     res.status(r.ok ? 200 : 500).json(data);
   }
   ```
2. In Vercel dashboard → Project → Settings → Environment Variables, add `RESEND_API_KEY` with your Resend key.
3. In `index.html`, replace any direct `fetch('https://api.resend.com/...')` calls with `fetch('/api/send-email', ...)`.

## Next round (when you have time)

Things I did not touch yet, ranked by impact:

1. **Split the file.** Move the `<style>` block into `styles.css` and the main `<script>` block into `app.js`, then link them from `index.html`. Your GitHub diffs will become readable overnight.
2. **De-duplicate CSS.** The `:root`, `*`, and `body` selectors are redefined around line ~700 (search for the second `/* ══ DASHBOARD ══ */`). That's where those `!important` flags come from. Merge them.
3. **De-duplicate JS.** `emailNewInquiry()`, `emailInquirySent()`, `emailListingSubmitted()` are each defined twice.
4. **Fix phone inputs.** Find every phone `<input>` and change `type="text"` → `type="tel"` with `inputmode="numeric"`. Better mobile keyboard.
5. **Empty states.** Design proper "No listings yet" / "No inquiries yet" screens with illustrations and a clear CTA.
6. **Real button semantics.** Many clickable `div`/`span` elements should be `<button type="button">` — better keyboard + screen reader support.
7. **FAQ + How it works pages.** Good for SEO and trust. The footer already links to them — just needs content.
8. **Connect real hero stats.** Replace the placeholder numbers with live Supabase `count()` queries.

## GoDaddy → Vercel sanity check

- DNS records should be CNAME (`www` → `cname.vercel-dns.com`) and A (`@` → `76.76.21.21`) — do NOT use GoDaddy's "Domain Forwarding" feature, it breaks HTTPS.
- Confirm both `homeizz.com` and `www.homeizz.com` resolve and redirect to one canonical version (pick one in Vercel → Domains).

---

Ping me when you want round 2 — I'll split the file and clean up the duplicated CSS/JS.
