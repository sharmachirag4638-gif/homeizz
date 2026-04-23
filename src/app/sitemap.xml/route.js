import { CITIES } from '@/lib/cities';
import { ARCHITECTURE_STYLES, INTERIOR_CATEGORIES } from '@/lib/styles';
import { createAdmin } from '@/lib/supabase-server';

// Dynamic sitemap. Regenerates every time Google fetches it.
// Lists: home, static pages, every (city × style) landing page, every listing,
// every designer profile. Could be 50,000+ URLs easily — which is the point.

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeizz.com';

export async function GET() {
  const urls = [];

  // Static pages
  urls.push({ loc: `${SITE}/`,               priority: 1.0, changefreq: 'weekly' });
  urls.push({ loc: `${SITE}/browse`,         priority: 0.9, changefreq: 'daily'  });
  urls.push({ loc: `${SITE}/list`,           priority: 0.7, changefreq: 'monthly' });
  urls.push({ loc: `${SITE}/auth`,           priority: 0.5, changefreq: 'monthly' });
  urls.push({ loc: `${SITE}/faq`,            priority: 0.6, changefreq: 'monthly' });
  urls.push({ loc: `${SITE}/about`,          priority: 0.5, changefreq: 'monthly' });

  // Programmatic SEO pages — architects
  for (const c of CITIES) {
    for (const s of ARCHITECTURE_STYLES) {
      urls.push({
        loc: `${SITE}/architects/${c.slug}/${s.slug}`,
        priority: 0.8,
        changefreq: 'weekly',
      });
    }
  }

  // Programmatic SEO pages — interior designers
  for (const c of CITIES) {
    for (const s of INTERIOR_CATEGORIES) {
      urls.push({
        loc: `${SITE}/interior-designer/${c.slug}/${s.slug}`,
        priority: 0.8,
        changefreq: 'weekly',
      });
    }
  }

  // Dynamic content: listings + designer profiles (best-effort; ignore errors)
  try {
    const sb = createAdmin();
    const { data: listings } = await sb.from('listings').select('id,updated_at').eq('status', 'live').limit(5000);
    listings?.forEach(l => urls.push({
      loc: `${SITE}/listing/${l.id}`,
      lastmod: l.updated_at,
      priority: 0.7,
      changefreq: 'weekly',
    }));
    const { data: profiles } = await sb.from('profiles').select('id,updated_at').eq('public', true).limit(5000);
    profiles?.forEach(p => urls.push({
      loc: `${SITE}/designer/${p.id}`,
      lastmod: p.updated_at,
      priority: 0.6,
      changefreq: 'weekly',
    }));
  } catch (_) { /* don't fail the sitemap because DB was slow */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
