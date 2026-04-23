import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { CITIES, findCity } from '@/lib/cities';
import { INTERIOR_CATEGORIES, findStyle } from '@/lib/styles';
import { createServer } from '@/lib/supabase-server';

// Interior-designer variant. Same pattern as /architects/[city]/[style].
// 30 cities × 10 categories = 300 more landing pages.

export async function generateStaticParams() {
  const out = [];
  for (const c of CITIES) {
    for (const s of INTERIOR_CATEGORIES) {
      out.push({ city: c.slug, style: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }) {
  const city = findCity(params.city);
  const style = findStyle(params.style);
  if (!city || !style) return { title: 'Not found' };
  const title = `${style.name} Interior Designers in ${city.name} | Homeizz`;
  const description = `Hire verified ${style.name.toLowerCase()} interior designers in ${city.name}. Compare portfolios, get quotes, pay by milestone via Razorpay escrow.`;
  return {
    title,
    description,
    alternates: { canonical: `/interior-designer/${city.slug}/${style.slug}` },
    openGraph: { title, description },
  };
}

export default async function InteriorByCityStyle({ params }) {
  const city = findCity(params.city);
  const style = findStyle(params.style);
  if (!city || !style) notFound();

  const sb = createServer();
  const { data: listings } = await sb
    .from('listings')
    .select('*')
    .ilike('city', city.name)
    .eq('listing_type', 'interior')
    .eq('status', 'live')
    .limit(24);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${style.name} Interior Designers in ${city.name}`,
  };

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="browse-pg">
        <div className="sh">
          <div className="sh-in">
            <h1 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: 8 }}>
              {style.name} Interior Designers in {city.name}
            </h1>
            <p>Verified designers serving {city.name}, {city.state}.</p>
          </div>
        </div>
        <div className="list-wrap">
          <div className="cgrid">
            {(listings || []).map(l => <ListingCard key={l.id} listing={l} />)}
            {(!listings || listings.length === 0) && (
              <div className="search-empty" style={{ gridColumn: '1/-1' }}>
                <h3>No {style.name.toLowerCase()} designers in {city.name} yet</h3>
                <p>We're expanding fast — check back soon.</p>
              </div>
            )}
          </div>
          <section style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', marginBottom: 16 }}>
              Also explore in {city.name}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERIOR_CATEGORIES.filter(s => s.slug !== style.slug).map(s => (
                <Link key={s.slug} href={`/interior-designer/${city.slug}/${s.slug}`} className="ftag">
                  {s.name}
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
