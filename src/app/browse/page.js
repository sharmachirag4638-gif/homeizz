import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';

export const metadata = {
  title: 'Browse Home Designs & Architects | Homeizz',
  description: 'Browse verified architects, interior designers, and ready-to-build home plans across India.',
  alternates: { canonical: '/browse' },
};

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Indore','Kochi'];
const STYLES = ['Modern','Minimalist','Traditional','Contemporary','Industrial','Luxury','Scandinavian','Bohemian','Art Deco','Budget-friendly'];

function inr(paise) {
  if (!paise) return 'Get Quote';
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

function FilterTag({ label, href }) {
  return (
    <Link href={href} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',background:'var(--tpp)',color:'var(--t)',borderRadius:50,fontSize:'.78rem',fontWeight:600,textDecoration:'none',border:'1.5px solid var(--tp)'}}>
      {label} ×
    </Link>
  );
}

function ListingCard({ listing }) {
  return (
    <Link href={`/listing/${listing.id}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:16,border:'1.5px solid var(--borderl)',overflow:'hidden',boxShadow:'var(--sh)',transition:'all .22s',cursor:'pointer'}}>
      <div style={{height:200,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
        {listing.cover_image
          ? <img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🏠</div>
        }
        <div style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,.6)',color:'#fff',fontSize:'.68rem',fontWeight:700,padding:'4px 10px',borderRadius:50,textTransform:'uppercase',letterSpacing:'.5px'}}>
          {listing.listing_type||'Design'}
        </div>
        {listing.style&&<div style={{position:'absolute',top:12,right:12,background:'rgba(196,98,45,.85)',color:'#fff',fontSize:'.68rem',fontWeight:700,padding:'4px 10px',borderRadius:50}}>{listing.style}</div>}
      </div>
      <div style={{padding:'16px 18px'}}>
        <div style={{fontSize:'.78rem',color:'var(--tlt)',marginBottom:4}}>📍 {listing.city}</div>
        <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem',lineHeight:1.35,marginBottom:10,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{listing.title}</div>
        <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          {listing.bedrooms&&<span style={{fontSize:'.72rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50}}>🛏 {listing.bedrooms}</span>}
          {listing.sqft&&<span style={{fontSize:'.72rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50}}>📐 {listing.sqft} sqft</span>}
          {listing.project_type&&<span style={{fontSize:'.72rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50}}>{listing.project_type}</span>}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid var(--borderl)'}}>
          <div>
            <div style={{fontFamily:'var(--fd)',fontSize:'1.2rem',fontWeight:700,color:'var(--t)',lineHeight:1}}>
              {listing.price_unit==='on request'?'On Request':inr(listing.price_paise)}
            </div>
            {listing.price_unit&&listing.price_unit!=='on request'&&<div style={{fontSize:'.68rem',color:'var(--tlt)'}}>{listing.price_unit}</div>}
          </div>
          <div style={{background:'var(--t)',color:'#fff',fontSize:'.75rem',fontWeight:700,padding:'7px 14px',borderRadius:8}}>View →</div>
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

  return (
    <>
      <Nav/>
      <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>
        <div style={{background:'linear-gradient(135deg,var(--b),#3D1A08)',padding:'48px 44px 36px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,.04) 1px,transparent 0)',backgroundSize:'28px 28px'}}/>
          <div style={{position:'relative',zIndex:2,maxWidth:1100,margin:'0 auto'}}>
            <div style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'1.4px',textTransform:'uppercase',color:'var(--tl)',marginBottom:10}}>BROWSE DESIGNS</div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(1.8rem,4vw,2.8rem)',marginBottom:8}}>Find your perfect <em style={{color:'var(--tl)'}}>designer</em></h1>
            <p style={{color:'rgba(255,255,255,.6)',fontSize:'.95rem'}}>{count>0?`${count} listings across India`:'Verified professionals across India'}</p>
          </div>
        </div>

        <div style={{background:'#fff',borderBottom:'1px solid var(--borderl)',position:'sticky',top:64,zIndex:100,boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
          <div style={{maxWidth:1100,margin:'0 auto',padding:'0 44px'}}>
            <form style={{display:'flex',gap:0,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 18px',borderRight:'1px solid var(--borderl)',flex:1,minWidth:150}}>
                <span>📍</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.62rem',fontWeight:700,color:'var(--tlt)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:2}}>City</div>
                  <select name="city" defaultValue={city} style={{border:'none',outline:'none',background:'transparent',fontSize:'.88rem',color:'var(--td)',fontWeight:500,width:'100%',cursor:'pointer'}}>
                    <option value="">All Cities</option>
                    {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 18px',borderRight:'1px solid var(--borderl)',flex:1,minWidth:150}}>
                <span>🏠</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.62rem',fontWeight:700,color:'var(--tlt)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:2}}>Type</div>
                  <select name="type" defaultValue={type} style={{border:'none',outline:'none',background:'transparent',fontSize:'.88rem',color:'var(--td)',fontWeight:500,width:'100%',cursor:'pointer'}}>
                    <option value="">All Types</option>
                    <option value="interior">Interior Design</option>
                    <option value="architecture">Architecture</option>
                    <option value="plan">Home Plan</option>
                  </select>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 18px',borderRight:'1px solid var(--borderl)',flex:1,minWidth:150}}>
                <span>✨</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.62rem',fontWeight:700,color:'var(--tlt)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:2}}>Style</div>
                  <select name="style" defaultValue={style} style={{border:'none',outline:'none',background:'transparent',fontSize:'.88rem',color:'var(--td)',fontWeight:500,width:'100%',cursor:'pointer'}}>
                    <option value="">All Styles</option>
                    {STYLES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 18px',borderRight:'1px solid var(--borderl)',flex:1,minWidth:150}}>
                <span>↕️</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:'.62rem',fontWeight:700,color:'var(--tlt)',letterSpacing:'.5px',textTransform:'uppercase',marginBottom:2}}>Sort By</div>
                  <select name="sort" defaultValue={sort} style={{border:'none',outline:'none',background:'transparent',fontSize:'.88rem',color:'var(--td)',fontWeight:500,width:'100%',cursor:'pointer'}}>
                    <option value="newest">Newest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{background:'var(--t)',color:'#fff',border:'none',padding:'0 28px',fontSize:'.88rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7,whiteSpace:'nowrap'}}>
                🔍 Search
              </button>
            </form>
          </div>
        </div>

        {(city||style||type)&&(
          <div style={{maxWidth:1100,margin:'0 auto',padding:'14px 44px',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:'.72rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.4px'}}>Active:</span>
            {city&&<FilterTag label={city} href={buildUrl({city:'',style,type,sort})}/>}
            {type&&<FilterTag label={type} href={buildUrl({city,style,type:'',sort})}/>}
            {style&&<FilterTag label={style} href={buildUrl({city,style:'',type,sort})}/>}
            <Link href="/browse" style={{fontSize:'.75rem',color:'var(--tlt)',textDecoration:'none',padding:'4px 10px',borderRadius:50,border:'1px solid var(--borderl)'}}>Clear all ×</Link>
          </div>
        )}

        <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 44px 72px'}}>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:'.86rem',color:'var(--tm)'}}><strong style={{color:'var(--b)'}}>{count}</strong> listing{count!==1?'s':''} found</div>
          </div>
          {count===0?(
            <div style={{textAlign:'center',padding:'72px 24px',background:'#fff',borderRadius:20,border:'2px dashed var(--borderl)'}}>
              <div style={{fontSize:'3rem',marginBottom:16}}>🔍</div>
              <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings found</h3>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:24,maxWidth:360,margin:'0 auto 24px'}}>Try removing some filters or check back soon!</p>
              <Link href="/browse" style={{padding:'12px 24px',background:'var(--t)',color:'#fff',borderRadius:10,textDecoration:'none',fontWeight:700,fontSize:'.9rem'}}>Clear filters</Link>
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