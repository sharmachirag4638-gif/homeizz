import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';
import { CITIES, findCity } from '@/lib/cities';
import { INTERIOR_CATEGORIES } from '@/lib/styles';
import { SITE_URL, absoluteUrl, jsonLdScript, truncateMeta } from '@/lib/seo';

const CITY_IMAGES = {
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
  bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80',
  hyderabad: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
  chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
  pune: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80',
  kochi: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80',
};

const DEFAULT_CITY_IMAGE = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80';

function cityImage(citySlug) {
  return CITY_IMAGES[citySlug] || DEFAULT_CITY_IMAGE;
}

function findInteriorStyle(slug) {
  return INTERIOR_CATEGORIES.find(style => style.slug === slug.toLowerCase()) || null;
}

function formatInr(paise) {
  if (!paise) return 'On request';
  const amount = paise / 100;
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

function pageDescription(style, city) {
  return truncateMeta(
    `Find verified ${style.name.toLowerCase()} interior designers in ${city.name}, ${city.state}. Compare portfolios, budgets, timelines, and request quotes from local design studios on Homeizz.`
  );
}

export async function generateMetadata({ params }) {
  const city = findCity(decodeURIComponent(params.city).toLowerCase());
  const style = findInteriorStyle(decodeURIComponent(params.style));
  if (!city || !style) return { title: 'Interior designers not found', robots: { index: false, follow: false } };

  const title = `${style.name} Interior Designers in ${city.name}`;
  const description = pageDescription(style, city);
  const canonical = `/interior-designer/${city.slug}/${style.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(canonical),
      images: [{ url: cityImage(city.slug), width: 1200, height: 630, alt: `${title} on Homeizz` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cityImage(city.slug)],
    },
  };
}

export default async function InteriorPage({ params }) {
  const city = findCity(decodeURIComponent(params.city).toLowerCase());
  const style = findInteriorStyle(decodeURIComponent(params.style));
  if (!city || !style) notFound();

  const sb = createServer();
  const { data: listings } = await sb
    .from('listings')
    .select('*')
    .eq('status', 'live')
    .eq('city', city.name)
    .eq('listing_type', 'interior')
    .ilike('style', style.slug)
    .order('created_at', { ascending: false })
    .limit(30);

  const canonical = `/interior-designer/${city.slug}/${style.slug}`;
  const pageTitle = `${style.name} Interior Designers in ${city.name}`;
  const description = pageDescription(style, city);
  const listingCount = listings?.length || 0;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${absoluteUrl(canonical)}#webpage`,
        url: absoluteUrl(canonical),
        name: pageTitle,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: {
          '@type': 'Service',
          name: `${style.name} interior design services`,
          areaServed: { '@type': 'City', name: city.name },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Interior Designers', item: absoluteUrl('/browse?type=interior') },
          { '@type': 'ListItem', position: 3, name: city.name, item: absoluteUrl(canonical) },
        ],
      },
      {
        '@type': 'ItemList',
        name: pageTitle,
        numberOfItems: listingCount,
        itemListElement: (listings || []).slice(0, 20).map((listing, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(`/listing/${listing.id}`),
          name: listing.title,
        })),
      },
    ],
  };

  return (
    <>
      <Nav />
      <script {...jsonLdScript(schema)} />
      <div style={{ background: 'var(--c)', minHeight: '100vh', paddingTop: 64 }}>
        <div style={{ height: 400, position: 'relative', overflow: 'hidden' }}>
          <img src={cityImage(city.slug)} alt={`${city.name} interior design inspiration`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.72))' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 44px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.68)', marginBottom: 12 }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,.68)' }}>Home</Link> / <Link href="/browse?type=interior" style={{ color: 'rgba(255,255,255,.68)' }}>Interior Designers</Link> / {city.name}
              </div>
              <h1 style={{ fontFamily: 'var(--fd)', color: '#fff', fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: 12, lineHeight: 1.1 }}>
                {pageTitle}
              </h1>
              <p style={{ color: 'rgba(255,255,255,.76)', fontSize: '.98rem', maxWidth: 640, lineHeight: 1.7 }}>
                Compare verified {style.name.toLowerCase()} designers, budgets, timelines, materials, and portfolios in {city.name}, {city.state}.
              </p>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderBottom: '1px solid var(--borderl)', padding: '16px 44px', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
            {INTERIOR_CATEGORIES.map(option => (
              <Link key={option.slug} href={`/interior-designer/${city.slug}/${option.slug}`} style={{ padding: '8px 18px', borderRadius: 50, border: `1.5px solid ${style.slug === option.slug ? 'var(--t)' : 'var(--borderl)'}`, background: style.slug === option.slug ? 'var(--t)' : '#fff', color: style.slug === option.slug ? '#fff' : 'var(--tm)', fontSize: '.82rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {option.name}
              </Link>
            ))}
          </div>
        </div>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 44px 80px' }}>
          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 20, border: '2px dashed var(--borderl)', marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', marginBottom: 8 }}>No listed {style.name.toLowerCase()} designers in {city.name} yet</h2>
              <p style={{ color: 'var(--tlt)', fontSize: '.9rem', marginBottom: 24, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
                We are adding verified design studios city by city. You can still browse all Homeizz professionals or list your studio to appear here.
              </p>
              <Link href="/browse?type=interior" style={{ padding: '12px 28px', background: 'var(--t)', color: '#fff', borderRadius: 50, textDecoration: 'none', fontWeight: 700, fontSize: '.9rem', display: 'inline-block' }}>
                Browse all designers
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24, marginBottom: 44 }}>
              {listings.map(listing => (
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--borderl)', boxShadow: 'var(--sh)' }}>
                  <div style={{ height: 220, background: 'linear-gradient(135deg,#F5DDD0,#FBF0E8)', position: 'relative', overflow: 'hidden' }}>
                    {listing.cover_image ? (
                      <img src={listing.cover_image} alt={`${listing.title} interior design project in ${listing.city || city.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tlt)' }}>Interior project</div>
                    )}
                    {listing.style && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(196,98,45,.88)', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 50 }}>{listing.style}</div>}
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--tlt)', marginBottom: 6 }}>{listing.city || city.name}</div>
                    <div style={{ fontWeight: 700, color: 'var(--b)', fontSize: '.95rem', lineHeight: 1.35, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--borderl)' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--t)' }}>{formatInr(listing.price_paise)}</div>
                      <div style={{ background: 'var(--t)', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '7px 14px', borderRadius: 50 }}>View</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <section style={{ background: '#fff', border: '1.5px solid var(--borderl)', borderRadius: 18, padding: '28px 30px', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', fontSize: '1.7rem', marginBottom: 12 }}>Choose a {style.name.toLowerCase()} designer in {city.name}</h2>
            <p style={{ color: 'var(--tm)', fontSize: '.95rem', lineHeight: 1.8, marginBottom: 14 }}>
              The right interior designer helps you translate taste into working drawings, material choices, execution schedules, and a budget you can actually control. For {style.name.toLowerCase()} projects in {city.name}, compare portfolios carefully and check whether the designer handles sourcing, site supervision, and handover.
            </p>
            <p style={{ color: 'var(--tm)', fontSize: '.95rem', lineHeight: 1.8, margin: 0 }}>
              Ask for a room-wise quote, GST clarity, a payment schedule, material brands, warranty terms, and timelines before signing. Homeizz keeps these city pages focused on real local search intent so homeowners can shortlist faster.
            </p>
          </section>

          <section style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', marginBottom: 18 }}>Explore interior designers in other cities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {CITIES.filter(option => option.slug !== city.slug).slice(0, 12).map(option => (
                <Link key={option.slug} href={`/interior-designer/${option.slug}/${style.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 14, overflow: 'hidden', position: 'relative', height: 120 }}>
                  <img src={cityImage(option.slug)} alt={`${style.name} interior designers in ${option.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.7),transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'var(--fd)', color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{option.name}</div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
