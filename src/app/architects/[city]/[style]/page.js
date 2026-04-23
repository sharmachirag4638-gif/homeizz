import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { CITIES, findCity } from '@/lib/cities';
import { ARCHITECTURE_STYLES, findStyle } from '@/lib/styles';
import { createServer } from '@/lib/supabase-server';

// ──────────────────────────────────────────────────────────────────
// PROGRAMMATIC SEO  /architects/[city]/[style]
// ──────────────────────────────────────────────────────────────────
// This single file generates ~450 landing pages (30 cities × 15 styles).
// Next.js pre-renders them at build time and serves them as static HTML —
// fast, cheap, and Google-friendly.
// ──────────────────────────────────────────────────────────────────

// Tell Next.js every (city, style) combination to pre-render.
export async function generateStaticParams() {
  const out = [];
  for (const c of CITIES) {
    for (const s of ARCHITECTURE_STYLES) {
      out.push({ city: c.slug, style: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }) {
  const city = findCity(params.city);
  const style = findStyle(params.style);
  if (!city || !style) return { title: 'Not found' };
  const title = `${style.name} Architects in ${city.name} | Hire on Homeizz`;
  const description = `Find top-rated ${style.name.toLowerCase()} architects in ${city.name}, ${city.state}. Compare portfolios, read verified reviews, and get quotes on Homeizz.`;
  return {
    title,
    description,
    alternates: { canonical: `/architects/${city.slug}/${style.slug}` },
    openGraph: { title, description },
  };
}

export default async function ArchitectsByCityStyle({ params }) {
  const city = findCity(params.city);
  const style = findStyle(params.style);
  if (!city || !style) notFound();

  // Pull listings that match this (city, style). In production, add a
  // `tags` array or `style_slug` column to your `listings` table so the
  // match is exact. For now we do a loose city match + tag/description contains.
  const sb = createServer();
  const { data: listings } = await sb
    .from('listings')
    .select('*')
    .ilike('city', city.name)
    .eq('status', 'live')
    .limit(24);

  // LocalBusiness + CollectionPage JSON-LD — critical for local SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${style.name} Architects in ${city.name}`,
        description: `Curated list of ${style.name.toLowerCase()} architects serving ${city.name}, ${city.state}.`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://homeizz.com/' },
          { '@type': 'ListItem', position: 2, name: 'Architects', item: 'https://homeizz.com/architects' },
          { '@type': 'ListItem', position: 3, name: city.name, item: `https://homeizz.com/architects/${city.slug}` },
          { '@type': 'ListItem', position: 4, name: style.name },
        ],
      },
    ],
  };

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="browse-pg">
        <div className="sh">
          <div className="sh-in">
            <h1 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: 8 }}>
              {style.name} Architects in {city.name}
            </h1>
            <p>
              Compare {listings?.length || 0}+ verified {style.name.toLowerCase()} architects serving{' '}
              {city.name}, {city.state}. Get structured quotes, compare portfolios, and build with confidence.
            </p>
          </div>
        </div>

        <div className="list-wrap">
          {/* Intro copy — this is where you'd write 200-300 words of original content
              per page. For now we generate a simple template. Swap for hand-written
              copy as you scale. Google strongly rewards original, helpful content. */}
          <div className="dsec" style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 24 }}>
            <p>
              {city.name} is one of {city.tier === 1 ? "India's largest metros" : 'India\'s fastest-growing cities'},
              and demand for {style.name.toLowerCase()} home design has grown rapidly in the last five years.
              On Homeizz you can browse verified {style.name.toLowerCase()} architects with real portfolios,
              read reviews from past clients, and request structured quotes — all without paying a rupee
              until you're ready to hire.
            </p>
          </div>

          <div className="cgrid">
            {(listings || []).map(l => <ListingCard key={l.id} listing={l} />)}
            {(!listings || listings.length === 0) && (
              <div className="search-empty" style={{ gridColumn: '1/-1' }}>
                <h3>No {style.name.toLowerCase()} architects in {city.name} yet</h3>
                <p>We're expanding coverage fast. Meanwhile, try nearby cities or browse all our listings.</p>
                <Link href="/browse" className="btn btn-p">Browse all listings</Link>
              </div>
            )}
          </div>

          {/* Internal linking — these are SEO gold. Every page links to related
              (city, style) pages, which helps Google discover and rank them all. */}
          <section style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', marginBottom: 16 }}>
              Also explore in {city.name}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ARCHITECTURE_STYLES.filter(s => s.slug !== style.slug).slice(0, 10).map(s => (
                <Link key={s.slug} href={`/architects/${city.slug}/${s.slug}`} className="ftag">
                  {s.name}
                </Link>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 32 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', marginBottom: 16 }}>
              {style.name} architects in other cities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CITIES.filter(c => c.slug !== city.slug).slice(0, 12).map(c => (
                <Link key={c.slug} href={`/architects/${c.slug}/${style.slug}`} className="ftag">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
