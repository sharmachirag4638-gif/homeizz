import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import { createServer } from '@/lib/supabase-server';

export const metadata = {
  title: 'Browse Home Designs & Architects',
  description:
    'Browse verified architects, interior designers, and ready-to-build home plans across India. Filter by city, style, budget, and BHK.',
  alternates: { canonical: '/browse' },
};

// `searchParams` comes from the URL (?city=bangalore&bhk=3). Server component,
// so filters hit Supabase directly with no client JS needed.
export default async function BrowsePage({ searchParams }) {
  const sb = createServer();
  let query = sb.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(60);

  if (searchParams?.city) query = query.eq('city', searchParams.city);
  if (searchParams?.bhk)  query = query.eq('bedrooms', Number(searchParams.bhk));
  if (searchParams?.type) query = query.eq('listing_type', searchParams.type);

  const { data: listings, error } = await query;

  return (
    <>
      <Nav />
      <div className="browse-pg">
        <div className="sh">
          <div className="sh-in">
            <h2>Browse {listings?.length || 0} home designs</h2>
            <p>Verified architects and designers across India.</p>
          </div>
        </div>
        <div className="list-wrap">
          <div className="cgrid">
            {(listings || []).map(l => <ListingCard key={l.id} listing={l} />)}
            {(!listings || listings.length === 0) && (
              <div className="search-empty" style={{ gridColumn: '1/-1' }}>
                <h3>No listings match your filters yet</h3>
                <p>{error ? 'We hit an error loading listings. Try again in a moment.' : 'Try widening your search or check back soon — new designers join every week.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
