import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';
import ListingDetailClient from './ListingDetailClient';
import { absoluteUrl, truncateMeta } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const sb = createServer();
  const { data } = await sb.from('listings').select('title,description,city,cover_image').eq('id', params.id).single();
  if (!data) return { title: 'Listing not found' };
  const description = truncateMeta(data.description || `${data.title} on Homeizz. Compare this home design project and request a quote from a verified professional.`);
  return {
    title: `${data.title}${data.city ? ' in ' + data.city : ''} | Homeizz`,
    description,
    alternates: { canonical: `/listing/${params.id}` },
    openGraph: {
      title: data.title,
      description,
      url: absoluteUrl(`/listing/${params.id}`),
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }) {
  const sb = createServer();
  const { data: listing } = await sb.from('listings').select('*').eq('id', params.id).single();
  if (!listing) notFound();
  const { data: professional } = await sb.from('profiles').select('*').eq('id', listing.owner_id).single();
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(`/listing/${listing.id}`),
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
      <ListingDetailClient listing={listing} professional={professional} />
      <Footer />
    </>
  );
}
