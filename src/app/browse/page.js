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

function inr(paise) {
  if (!paise) return 'On Request';
  const amount = paise / 100;
  if (amount >= 100000) return `₹${(amount/100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount/1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString()}`;
}

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
    <Link href={`/listing/${listing.id}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',transition:'transform .2s',cursor:'pointer'}}>
      <div style={{height:220,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
        {listing.cover_image
          ?<img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🏠</div>
        }
        <div style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'4px 10px',borderRadius:50,textTransform:'uppercase',letterSpacing:'.5px',backdropFilter:'blur(8px)'}}>
          {listing.listing_type||'Design'}
        </div>
        {listing.style&&<div style={{position:'absolute',top:12,right:12,background:'rgba(196,98,45,.85)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'4px 10px',borderRadius:50,backdropFilter:'blur(8px)'}}>{listing.style}</div>}
      </div>
      <div style={{padding:'18px 20px'}}>
        <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:6,display:'flex',alignItems:'center',gap:4}}>
          📍 {listing.city}
        </div>
        <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem',lineHeight:1.35,marginBottom:10,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{listing.title}</div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          {listing.bedrooms&&<span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50,border:'1px solid var(--borderl)'}}>🛏 {listing.bedrooms}</span>}
          {listing.sqft&&<span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50,border:'1px solid var(--borderl)'}}>📐 {listing.sqft} sqft</span>}
          {listing.project_type&&<span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50,border:'1px solid var(--borderl)'}}>{listing.project_type}</span>}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid var(--borderl)'}}>
          <div>
            <div style={{fontFamily:'var(--fd)',fontSize:'1.25rem',fontWeight:700,color:'var(--t)',lineHeight:1}}>
              {listing.price_unit==='on request'?'On Request':inr(listing.price_paise)}
            </div>
            {listing.price_unit&&listing.price_unit!=='on request'&&<div style={{fontSize:'.66rem',color:'var(--tlt)',marginTop:2}}>{listing.price_unit}</div>}
          </div>
          <div style={{background:'var(--t)',color:'#fff',fontSize:'.75rem',fontWeight:700,padding:'8px 16px',borderRadius:50}}>
            View →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BrowsePage({ searchParams }) {
  const sb = createServer();
  const city = searchParams?.city || '';
  const style = searchParams?.style || '';
  const type = searchParams?.type || '';
  const sort = searchParams?.sort || 'newest';

  let query = sb.from('listings').select('*').eq('status','live');
  if (city) query = query.eq('city', city);
  if (style) query = query.eq('style', style);
  if (type) query = query.eq('listing_type', type);
  if (sort==='price_low') query = query.order('price_paise',{ascending:true});
  else if (sort==='price_high') query = query.order('price_paise',{ascending:false});
  else query = query.order('created_at',{ascending:false});
  query = query.limit(60);

  const { data: listings } = await query;
  const count = listings?.length || 0;
  const hasFilters = city || style || type;

  return (
    <>
      <Nav/>
      <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>

        {/* Hero */}
        <div style={{background:'linear-gradient(135deg,var(--b) 0%,#3D1A08 100%)',padding:'56px 44px 48px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,.03) 1px,transparent 0)',backgroundSize:'32px 32px'}}/>
          <div style={{maxWidth:1100,margin:'0 auto',position:'relative',zIndex:2}}>
            <div style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tl)',marginBottom:12}}>Discover</div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(1.8rem,4vw,2.8rem)',marginBottom:8}}>
              Find your perfect <em style={{color:'var(--tl)'}}>designer</em>
            </h1>
            <p style={{color:'rgba(255,255,255,.5)',fontSize:'.95rem'}}>{count>0?`${count} listings across India`:'Verified professionals across India'}</p>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{background:'#fff',borderBottom:'1px solid var(--borderl)',padding:'16px 44px',position:'sticky',top:64,zIndex:100,boxShadow:'0 2px 16px rgba(0,0,0,.06)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <form style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>

              {/* City pills */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',flex:1}}>
                {/* All */}
                <Link href={buildUrl({city:'',style,type,sort})} style={{padding:'8px 18px',borderRadius:50,border:`1.5px solid ${!city?'var(--t)':'var(--borderl)'}`,background:!city?'var(--t)':'#fff',color:!city?'#fff':'var(--tm)',fontSize:'.82rem',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
                  All Cities
                </Link>
                {CITIES.slice(0,6).map(c=>(
                  <Link key={c} href={buildUrl({city:c,style,type,sort})} style={{padding:'8px 18px',borderRadius:50,border:`1.5px solid ${city===c?'var(--t)':'var(--borderl)'}`,background:city===c?'var(--t)':'#fff',color:city===c?'#fff':'var(--tm)',fontSize:'.82rem',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
                    {c}
                  </Link>
                ))}
              </div>

              {/* Type + Style + Sort selects */}
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                <select defaultValue={type} onChange={e=>window.location.href=buildUrl({city,style,type:e.target.value,sort})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:type?'var(--tpp)':'#fff',color:type?'var(--t)':'var(--tm)',fontSize:'.82rem',fontWeight:600,cursor:'pointer',outline:'none'}}>
                  <option value="">All Types</option>
                  <option value="interior">Interior</option>
                  <option value="architecture">Architecture</option>
                  <option value="plan">Home Plan</option>
                </select>
                <select defaultValue={style} onChange={e=>window.location.href=buildUrl({city,style:e.target.value,type,sort})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:style?'var(--tpp)':'#fff',color:style?'var(--t)':'var(--tm)',fontSize:'.82rem',fontWeight:600,cursor:'pointer',outline:'none'}}>
                  <option value="">All Styles</option>
                  {STYLES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <select defaultValue={sort} onChange={e=>window.location.href=buildUrl({city,style,type,sort:e.target.value})} style={{padding:'8px 14px',borderRadius:50,border:'1.5px solid var(--borderl)',background:'#fff',color:'var(--tm)',fontSize:'.82rem',fontWeight:600,cursor:'pointer',outline:'none'}}>
                  <option value="newest">Newest</option>
                  <option value="price_low">Price ↑</option>
                  <option value="price_high">Price ↓</option>
                </select>
              </div>
            </form>

            {/* Active filters */}
            {hasFilters&&(
              <div style={{display:'flex',gap:8,alignItems:'center',marginTop:12,flexWrap:'wrap'}}>
                <span style={{fontSize:'.72rem',color:'var(--tlt)',fontWeight:600}}>Active:</span>
                {city&&<span style={{background:'var(--tpp)',color:'var(--t)',fontSize:'.75rem',fontWeight:600,padding:'4px 12px',borderRadius:50,border:'1px solid var(--tp)'}}>{city} ×</span>}
                {type&&<span style={{background:'var(--tpp)',color:'var(--t)',fontSize:'.75rem',fontWeight:600,padding:'4px 12px',borderRadius:50,border:'1px solid var(--tp)'}}>{type} ×</span>}
                {style&&<span style={{background:'var(--tpp)',color:'var(--t)',fontSize:'.75rem',fontWeight:600,padding:'4px 12px',borderRadius:50,border:'1px solid var(--tp)'}}>{style} ×</span>}
                <Link href="/browse" style={{fontSize:'.75rem',color:'var(--tlt)',textDecoration:'none',padding:'4px 10px',borderRadius:50,border:'1px solid var(--borderl)'}}>Clear all</Link>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 44px 80px'}}>
          <div style={{marginBottom:20,fontSize:'.86rem',color:'var(--tm)'}}>
            <strong style={{color:'var(--b)'}}>{count}</strong> listing{count!==1?'s':''} found
          </div>

          {count===0?(
            <div style={{textAlign:'center',padding:'80px 24px',background:'#fff',borderRadius:20,border:'2px dashed var(--borderl)'}}>
              <div style={{fontSize:'3.5rem',marginBottom:16}}>🔍</div>
              <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings found</h3>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:24,maxWidth:360,margin:'0 auto 24px'}}>
                Try removing some filters or check back soon — new designers join every week!
              </p>
              <Link href="/browse" style={{padding:'12px 28px',background:'var(--t)',color:'#fff',borderRadius:50,textDecoration:'none',fontWeight:700,fontSize:'.9rem',display:'inline-block'}}>
                Clear filters
              </Link>
            </div>
          ):(
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