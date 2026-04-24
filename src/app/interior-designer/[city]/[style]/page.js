import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createServer } from '@/lib/supabase-server';

const CITIES = [
  { name:'Mumbai', img:'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80' },
  { name:'Delhi', img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80' },
  { name:'Bangalore', img:'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80' },
  { name:'Hyderabad', img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80' },
  { name:'Chennai', img:'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80' },
  { name:'Pune', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { name:'Kolkata', img:'https://images.unsplash.com/photo-1558618047-f4e70e7f8871?w=800&q=80' },
  { name:'Ahmedabad', img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
  { name:'Jaipur', img:'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80' },
  { name:'Kochi', img:'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80' },
];

const STYLES = ['modern','minimalist','traditional','contemporary','luxury','industrial','scandinavian'];

function inr(paise) {
  if (!paise) return 'On Request';
  const amount = paise / 100;
  if (amount >= 100000) return `₹${(amount/100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount/1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString()}`;
}

export async function generateMetadata({ params }) {
  const city = decodeURIComponent(params.city);
  const style = decodeURIComponent(params.style);
  return {
    title: `${style.charAt(0).toUpperCase()+style.slice(1)} Interior Designers in ${city} | Homeizz`,
    description: `Find verified ${style} interior designers in ${city}. Compare portfolios, get quotes and transform your space.`,
  };
}

export default async function InteriorPage({ params }) {
  const sb = createServer();
  const city = decodeURIComponent(params.city);
  const style = decodeURIComponent(params.style);

  const { data: listings } = await sb.from('listings')
    .select('*')
    .eq('status', 'live')
    .eq('city', city)
    .eq('listing_type', 'interior')
    .ilike('style', style)
    .order('created_at', { ascending: false })
    .limit(30);

  const cityData = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());

  return (
    <>
      <Nav/>
      <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>

        {/* Hero */}
        <div style={{height:400,position:'relative',overflow:'hidden'}}>
          {cityData?.img
            ?<img src={cityData.img} alt={city} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            :<div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,var(--b),#3D1A08)'}}/>
          }
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.7))'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'40px 44px'}}>
            <div style={{maxWidth:1100,margin:'0 auto',width:'100%'}}>
              <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:12}}>
                <Link href="/" style={{color:'rgba(255,255,255,.6)'}}>Home</Link> › <Link href="/interior-designer" style={{color:'rgba(255,255,255,.6)'}}>Interior</Link> › {city}
              </div>
              <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(2rem,5vw,3.5rem)',marginBottom:12,lineHeight:1.1}}>
                {style.charAt(0).toUpperCase()+style.slice(1)} Interior Designers<br/>in {city}
              </h1>
              <p style={{color:'rgba(255,255,255,.7)',fontSize:'.95rem'}}>
                {listings?.length||0} verified designers · {city}
              </p>
            </div>
          </div>
        </div>

        {/* Style pills */}
        <div style={{background:'#fff',borderBottom:'1px solid var(--borderl)',padding:'16px 44px',overflowX:'auto'}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:8,flexWrap:'nowrap'}}>
            {STYLES.map(s=>(
              <Link key={s} href={`/interior-designer/${city}/${s}`} style={{padding:'8px 18px',borderRadius:50,border:`1.5px solid ${style===s?'var(--t)':'var(--borderl)'}`,background:style===s?'var(--t)':'#fff',color:style===s?'#fff':'var(--tm)',fontSize:'.82rem',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </Link>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 44px 80px'}}>
          {!listings||listings.length===0?(
            <div style={{textAlign:'center',padding:'80px 24px',background:'#fff',borderRadius:20,border:'2px dashed var(--borderl)',marginBottom:40}}>
              <div style={{fontSize:'3rem',marginBottom:16}}>🛋️</div>
              <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No {style} designers in {city} yet</h3>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:24}}>We're expanding fast. Meanwhile, browse all our listings.</p>
              <Link href="/browse" style={{padding:'12px 28px',background:'var(--t)',color:'#fff',borderRadius:50,textDecoration:'none',fontWeight:700,fontSize:'.9rem',display:'inline-block'}}>
                Browse all listings
              </Link>
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24,marginBottom:40}}>
              {listings.map(listing=>(
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                  <div style={{height:220,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
                    {listing.cover_image
                      ?<img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🛋️</div>
                    }
                    {listing.style&&<div style={{position:'absolute',top:12,right:12,background:'rgba(196,98,45,.85)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'4px 10px',borderRadius:50}}>{listing.style}</div>}
                  </div>
                  <div style={{padding:'18px 20px'}}>
                    <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:6}}>📍 {listing.city}</div>
                    <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem',lineHeight:1.35,marginBottom:10,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{listing.title}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid var(--borderl)'}}>
                      <div style={{fontFamily:'var(--fd)',fontSize:'1.2rem',fontWeight:700,color:'var(--t)'}}>{inr(listing.price_paise)}</div>
                      <div style={{background:'var(--t)',color:'#fff',fontSize:'.75rem',fontWeight:700,padding:'7px 14px',borderRadius:50}}>View →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Other cities */}
          <div>
            <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:20}}>Explore other cities</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
              {CITIES.filter(c=>c.name!==city).map(c=>(
                <Link key={c.name} href={`/interior-designer/${c.name}/${style}`} style={{textDecoration:'none',display:'block',borderRadius:14,overflow:'hidden',position:'relative',height:120}}>
                  <img src={c.img} alt={c.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7),transparent)'}}/>
                  <div style={{position:'absolute',bottom:12,left:14,fontFamily:'var(--fd)',color:'#fff',fontSize:'1.1rem',fontWeight:600}}>{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}