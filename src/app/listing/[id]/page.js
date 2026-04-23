import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';
import { inr } from '@/lib/utils';

// Per-listing SEO: generate metadata dynamically so every listing ranks in Google.
export async function generateMetadata({ params }) {
  const sb = createServer();
  const { data } = await sb.from('listings').select('title,description,city,cover_image').eq('id', params.id).single();
  if (!data) return { title: 'Listing not found' };
  return {
    title: `${data.title}${data.city ? ' in ' + data.city : ''}`,
    description: (data.description || '').slice(0, 160),
    alternates: { canonical: `/listing/${params.id}` },
    openGraph: {
      title: data.title,
      description: (data.description || '').slice(0, 160),
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }) {
  const sb = createServer();
  const { data: listing } = await sb.from('listings').select('*, profiles(*)').eq('id', params.id).single();
  if (!listing) notFound();

  // Structured data so Google can show this as a rich result
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.cover_image,
    brand: { '@type': 'Brand', name: 'Homeizz' },
    offers: listing.price_paise ? {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: Math.round(listing.price_paise / 100),
      availability: 'https://schema.org/InStock',
    } : undefined,
  };

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className="det-pg">
        <div className="det-lay">
          <div>
            <div className="bcrumb">
              <Link href="/browse">Browse</Link> / <b>{listing.title}</b>
            </div>
            <h1 className="d-title">{listing.title}</h1>
            <div className="d-meta">
              {listing.bedrooms && <span className="d-mi">🛏 {listing.bedrooms}BHK</span>}
              {listing.sqft && <span className="d-mi">📐 {listing.sqft} sqft</span>}
              {listing.city && <span className="d-mi">📍 {listing.city}</span>}
            </div>
            <div className="dsec">
              <h2 className="dstitle">About this design</h2>
              <p>{listing.description || 'A thoughtfully designed home waiting for its new owner.'}</p>
            </div>
          </div>
          <aside className="sticky-sb">
            <div className="price-c">
              <div className="pm">{listing.price_paise ? inr(listing.price_paise) : 'Get quote'}</div>
              <p className="pm-note">All-inclusive professional fee</p>
              <Link href={`/quote/${listing.id}`} className="ctab ctab-p">
                Request a quote →
              </Link>
              <a href={`https://wa.me/91XXXXXXXXXX?text=I'm%20interested%20in%20${encodeURIComponent(listing.title)}%20on%20Homeizz`} className="ctab ctab-w">
                WhatsApp the designer
              </a>
              <p className="priv-note">🔒 Protected by Razorpay escrow</p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
