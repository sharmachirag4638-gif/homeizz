import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';

export const metadata = {
  title: 'Browse Home Designs & Architects | Homeizz',
  description: 'Browse verified architects, interior designers, and ready-to-build home plans across India.',
};

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Indore','Kochi'];
const STYLES = ['Modern','Minimalist','Traditional','Contemporary','Industrial','Luxury','Scandinavian','Bohemian','Art Deco','Budget-friendly'];
const TYPES = ['Interior Design','Architecture','Home Plan'];

function buildUrl({ city, style, type, sort }) {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (style) params.set('style', style);
  if (type) params.set('type', type);
  if (sort && sort !== 'newest') params.set('sort', sort);
  const q = params.toString();
  return `/browse${q ? '?' + q : ''}`;
}

function ListingCard({ listing }) {
  return (
    <Link href={`/listing/${listing.id}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',cursor:'pointer'}}>
      <div style={{height:220,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
        {listing.cover_image
          ? <img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🏠</div>
        }
        <div style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'4px 10px',borderRadius:50,textTransform:'uppercase',letterSpacing:'.5px',backdropFilter:'blur(8px)'}}>
          {listing.listing_type||'Design'}
        </div>
        {listing.style&&<div style={{position:'absolute',top:12,right:12,background:'rgba(196,98,45,.85)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'4px 10px',borderRadius:50,backdropFilter:'blur(8px)'}}>{listing.style}</div>}
      </div>
      <div style={{padding:'18px 20px'}}>
        <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:6}}>
          📍 {listing.city}
        </div>
        <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem',lineHeight:1.35,marginBottom:10,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{listing.title}</div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          {listing.bedrooms&&<span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50,border:'1px solid var(--borderl)'}}>🛏 {listing.bedrooms}</span>}
          {listing.sqft&&<span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50,border:'1px solid var(--borderl)'}}>📐 {listing.sqft} sqft</span>}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:'.8rem',color:'var(--tlt)'}}>Min Budget</div>
          <div style={{fontWeight:700,color:'var(--t)',fontSize:'.9rem'}}>{listing.min_budget||'On Request'}</div>
        </div>
      </div>
    </Link>
  );
}

export default async function BrowsePage({ searchParams }) {
  const { city, style, type, sort } = searchParams;
  const sb = createServer();

  let query = sb.from('listings').select('*').eq('status','active');
  if (city) query = query.eq('city', city);
  if (style) query = query.eq('style', style);
  if (type) query = query.eq('listing_type', type);
  if (sort === 'oldest') query = query.order('created_at', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  const { data: listings = [] } = await query;

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
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:32}}>
            <select defaultValue={city||''} onChange={e=>window.location.href=buildUrl({city:e.target.value,style,type,sort})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:'#fff',fontSize:'.82rem',cursor:'pointer'}}>
              <option value="">All Cities</option>
              {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select defaultValue={style||''} onChange={e=>window.location.href=buildUrl({city,style:e.target.value,type,sort})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:'#fff',fontSize:'.82rem',cursor:'pointer'}}>
              <option value="">All Styles</option>
              {STYLES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select defaultValue={type||''} onChange={e=>window.location.href=buildUrl({city,style,type:e.target.value,sort})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:'#fff',fontSize:'.82rem',cursor:'pointer'}}>
              <option value="">All Types</option>
              {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            {(city||style||type)&&(
              <Link href="/browse" style={{padding:'8px 16px',borderRadius:50,border:'1.5px solid var(--t)',color:'var(--t)',fontSize:'.82rem',textDecoration:'none',fontWeight:600}}>
                Clear filters
              </Link>
            )}
          </div>

          {listings.length===0 ? (
            <div style={{textAlign:'center',padding:'80px 20px'}}>
              <div style={{fontSize:'4rem',marginBottom:20}}>🌟</div>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:12}}>Be the first!</h2>
              <p style={{color:'var(--tlt)',fontSize:'.95rem',marginBottom:8,maxWidth:440,margin:'0 auto 8px'}}>
                No listings yet in this area. Are you an architect or interior designer?
              </p>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:32,maxWidth:440,margin:'0 auto 32px'}}>
                List your work on Homeizz and get discovered by thousands of homeowners across India.
              </p>
              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <Link href="/pro-signup" style={{padding:'13px 28px',background:'var(--t)',color:'#fff',borderRadius:50,textDecoration:'none',fontWeight:700,fontSize:'.9rem',display:'inline-block',boxShadow:'0 6px 20px rgba(196,98,45,.3)'}}>
                  List Your Work — Free Trial
                </Link>
                {(city||style||type)&&(
                  <Link href="/browse" style={{padding:'13px 28px',background:'transparent',color:'var(--t)',borderRadius:50,textDecoration:'none',fontWeight:600,fontSize:'.9rem',display:'inline-block',border:'1.5px solid var(--t)'}}>
                    Clear filters
                  </Link>
                )}
              </div>
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
