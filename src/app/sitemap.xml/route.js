import { CITIES } from '@/lib/cities';
import { ARCHITECTURE_STYLES, INTERIOR_CATEGORIES } from '@/lib/styles';
import { POSTS } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';
import { createAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const STATIC_URLS = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/browse', priority: 0.9, changefreq: 'daily' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.7, changefreq: 'monthly' },
  { path: '/pro-signup', priority: 0.7, changefreq: 'monthly' },
  { path: '/about', priority: 0.5, changefreq: 'monthly' },
  { path: '/contact', priority: 0.5, changefreq: 'monthly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/refund', priority: 0.3, changefreq: 'yearly' },
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pushUrl(urls, path, options = {}) {
  urls.push({
    loc: `${SITE_URL}${path}`,
    priority: options.priority ?? 0.5,
    changefreq: options.changefreq ?? 'monthly',
    lastmod: options.lastmod,
  });
}

export async function GET() {
  const urls = [];

  STATIC_URLS.forEach(item => pushUrl(urls, item.path, item));

  POSTS.filter(post => post.Body).forEach(post => {
    pushUrl(urls, `/blog/${post.slug}`, {
      priority: 0.75,
      changefreq: 'monthly',
      lastmod: post.updatedAt || post.publishedAt,
    });
  });

  for (const city of CITIES) {
    for (const style of ARCHITECTURE_STYLES) {
      pushUrl(urls, `/architects/${city.slug}/${style.slug}`, {
        priority: city.tier === 1 ? 0.85 : 0.75,
        changefreq: 'weekly',
      });
    }
  }

  for (const city of CITIES) {
    for (const style of INTERIOR_CATEGORIES) {
      pushUrl(urls, `/interior-designer/${city.slug}/${style.slug}`, {
        priority: city.tier === 1 ? 0.85 : 0.75,
        changefreq: 'weekly',
      });
    }
  }

  try {
    const sb = createAdmin();
    const { data: listings } = await sb
      .from('listings')
      .select('id,created_at,updated_at')
      .eq('status', 'live')
      .limit(5000);

    listings?.forEach(listing => {
      pushUrl(urls, `/listing/${listing.id}`, {
        lastmod: listing.updated_at || listing.created_at,
        priority: 0.7,
        changefreq: 'weekly',
      });
    });

    const { data: profiles } = await sb
      .from('profiles')
      .select('id,created_at,updated_at')
      .in('user_type', ['professional', 'architect', 'designer'])
      .limit(5000);

    profiles?.forEach(profile => {
      pushUrl(urls, `/designer/${profile.id}`, {
        lastmod: profile.updated_at || profile.created_at,
        priority: 0.6,
        changefreq: 'weekly',
      });
    });
  } catch (_) {
    // Keep the sitemap available even if the database is temporarily unreachable.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${xmlEscape(u.lastmod)}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
