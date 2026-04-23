import Link from 'next/link';
import { inr } from '@/lib/utils';

export default function ListingCard({ listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="lcard">
      <div className="lc-img" style={{ background: 'linear-gradient(135deg,#F5DDD0,#FBF0E8)' }}>
        {listing.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.cover_image} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <span className="lc-img-ico" style={{ fontSize: '3rem' }}>🏠</span>
        )}
        {listing.badge && <span className="lc-bdg">{listing.badge}</span>}
      </div>
      <div className="lc-body">
        <div className="lc-type">{listing.listing_type || 'Home Design'}</div>
        <div className="lc-title">{listing.title}</div>
        <div className="lc-meta">
          {listing.bedrooms && <span className="lc-mi">🛏 {listing.bedrooms}BHK</span>}
          {listing.sqft && <span className="lc-mi">📐 {listing.sqft} sqft</span>}
          {listing.city && <span className="lc-mi">📍 {listing.city}</span>}
        </div>
        <div className="lc-foot">
          <div className="lc-price">
            {listing.price_paise ? inr(listing.price_paise) : 'Get quote'}
            <span className="lc-price-s"> {listing.price_unit || ''}</span>
          </div>
          <div className="lc-rat">★ {listing.rating || '—'}</div>
        </div>
      </div>
    </Link>
  );
}
