import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Home Designs & Architects | Homeizz',
  description: 'Browse verified architects, interior designers, and ready-to-build home plans across India.',
};

function ListingCard({ listing }) {
  return (
    <Link href={`/listing/${listing.id}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',cursor:'pointer'}}>
      <div style={{height:220,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
        {listing.cover_image
          ? <img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🏠</div>
        }
      </div>
      <div style={{padding:'18px 20px'}}>
        <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:6}}>📍 {listing.city}</div>
        <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem',lineHeight:1.35,marginBottom:10}}>{listing.title}</div>
        <div style={{fontWeight:700,color:'var(--t)',fontSize:'.9rem'}}>{listing.min_budget||'On Request'}</div>
      </div>
    </Link>
  );
}

export default async function BrowsePage({ searchParams }) {
  const { city, style, type } = searchParams;
  
  let listings = [];
  try {
    const sb = createServer();
    let query = sb.from('listings').select('*').eq('status','active');
    if (city) query = query.eq('city', city);
    if (style) query = query.eq('style', style);
    if (type) query = query.eq('listing_type', type);
    query = query.order('created_at', { ascending: false });
    const { data } = await query;
    listings = data || [];
  } catch(e) {
    console.error('Browse error:', e);
  }

  return (
    <>
      <Nav/>
      <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'40px 44px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:8}}>Browse Designs</h1>
            <p style={{color:'rgba(255,255,255,.55)',fontSize:'.95rem'}}>Discover verified architects and interior designers across India</p>
          </div>
        </div>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 44px 80px'}}>
          {listings.length===0 ? (
            <div style={{textAlign:'center',padding:'80px 20px'}}>
              <div style={{fontSize:'4rem',marginBottom:20}}>🌟</div>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:12}}>Be the first!</h2>
              <p style={{color:'var(--tlt)',fontSize:'.95rem',marginBottom:8,maxWidth:440,margin:'0 auto 8px'}}>
                No listings yet. Are you an architect or interior designer?
              </p>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:32,maxWidth:440,margin:'0 auto 32px'}}>
                List your work on Homeizz and get discovered by thousands of homeowners across India.
              </p>
              <Link href="/pro-signup" style={{padding:'13px 28px',background:'var(--t)',color:'#fff',borderRadius:50,textDecoration:'none',fontWeight:700,fontSize:'.9rem',display:'inline-block'}}>
                List Your Work — Free Trial
              </Link>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24}}>
              {listings.map(l=><ListingCard key={l.id} listing={l}/>)}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}
