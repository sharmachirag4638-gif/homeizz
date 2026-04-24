import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Homeizz — India\'s Home Design Marketplace',
  description: 'Discover verified architects and interior designers across India. Compare portfolios, get quotes, and build with confidence.',
};

const CITIES = [
  { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80' },
  { name: 'Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80' },
  { name: 'Bangalore', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80' },
  { name: 'Hyderabad', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80' },
  { name: 'Chennai', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80' },
  { name: 'Pune', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
];

const CATEGORIES = [
  { name: 'Architecture', icon: '🏛️', desc: 'Award-winning architects', href: '/architects', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80' },
  { name: 'Interior Design', icon: '🛋️', desc: 'Transform your spaces', href: '/interior-designer', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80' },
  { name: 'Home Plans', icon: '📐', desc: 'Ready-to-build designs', href: '/browse?type=plan', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
];

const INSPIRATION = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80',
  'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=600&q=80',
];

const BLOGS = [
  { title: 'Top 10 Interior Designers in Mumbai 2026', city: 'Mumbai', time: '5 min read', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', href: '/blog/top-interior-designers-mumbai' },
  { title: 'Modern vs Minimalist: Which Style is Right for Your Home?', city: 'Design Guide', time: '7 min read', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', href: '/blog/modern-vs-minimalist' },
  { title: 'How Much Does Home Interior Design Cost in India 2026?', city: 'Cost Guide', time: '8 min read', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80', href: '/blog/interior-design-cost-india' },
];

const STEPS = [
  { n: '01', title: 'Browse & Discover', desc: 'Explore thousands of verified architects and designers across India. Filter by city, style, and budget.' },
  { n: '02', title: 'Connect & Compare', desc: 'Sign up for free and send enquiries to multiple professionals. Compare their portfolios and quotes.' },
  { n: '03', title: 'Build with Confidence', desc: 'Choose your designer and start your dream project. Track progress and pay securely through Homeizz.' },
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>

        {/* HERO */}
        <section style={{height:'100vh',position:'relative',overflow:'hidden'}}>
          <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&q=90" alt="Luxury home" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.35) 0%,rgba(0,0,0,.15) 40%,rgba(0,0,0,.6) 100%)'}}/>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'0 24px',zIndex:2}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.15)',backdropFilter:'blur(12px)',color:'#fff',fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',padding:'8px 20px',borderRadius:50,marginBottom:28,border:'1px solid rgba(255,255,255,.25)'}}>
              🇮🇳 India's Home Design Marketplace
            </div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(2.8rem,6vw,5.5rem)',lineHeight:1.05,marginBottom:20,fontWeight:600,textShadow:'0 2px 20px rgba(0,0,0,.3)'}}>
              Your dream home,<br/><em style={{color:'var(--tl)',fontStyle:'italic'}}>designed by India's best.</em>
            </h1>
            <p style={{color:'rgba(255,255,255,.85)',fontSize:'clamp(1rem,2vw,1.2rem)',maxWidth:540,marginBottom:40,lineHeight:1.7}}>
              Discover verified architects and interior designers. Compare portfolios, get quotes, and build with confidence.
            </p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center'}}>
              <Link href="/browse" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',background:'var(--t)',color:'#fff',borderRadius:50,fontWeight:700,fontSize:'1rem',textDecoration:'none',boxShadow:'0 8px 28px rgba(196,98,45,.5)'}}>
                Browse Designs →
              </Link>
              <Link href="/pro-signup" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',background:'rgba(255,255,255,.15)',color:'#fff',borderRadius:50,fontWeight:600,fontSize:'1rem',textDecoration:'none',border:'1.5px solid rgba(255,255,255,.4)',backdropFilter:'blur(8px)'}}>
                List Your Work
              </Link>
            </div>
          </div>
          <div style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,color:'rgba(255,255,255,.6)',fontSize:'.75rem',letterSpacing:'1px',textTransform:'uppercase'}}>
            <div style={{width:1,height:40,background:'rgba(255,255,255,.4)'}}/>
            Scroll
          </div>
        </section>

        {/* CATEGORIES */}
        <section style={{padding:'80px 44px',background:'var(--c)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tlt)',marginBottom:12}}>What We Offer</div>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:12}}>Find the right professional</h2>
              <p style={{color:'var(--tlt)',maxWidth:480,margin:'0 auto',fontSize:'.95rem'}}>From dream homes to commercial spaces — we connect you with India's finest design talent</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {CATEGORIES.map(cat=>(
                <Link key={cat.name} href={cat.href} style={{textDecoration:'none',display:'block',borderRadius:20,overflow:'hidden',position:'relative',height:320,cursor:'pointer'}}>
                  <img src={cat.img} alt={cat.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 60%)'}}/>
                  <div style={{position:'absolute',bottom:24,left:24,right:24}}>
                    <div style={{fontSize:'1.8rem',marginBottom:8}}>{cat.icon}</div>
                    <h3 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'1.5rem',marginBottom:4}}>{cat.name}</h3>
                    <p style={{color:'rgba(255,255,255,.7)',fontSize:'.82rem'}}>{cat.desc}</p>
                    <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,background:'rgba(255,255,255,.15)',backdropFilter:'blur(8px)',color:'#fff',fontSize:'.75rem',fontWeight:600,padding:'6px 14px',borderRadius:50,border:'1px solid rgba(255,255,255,.25)'}}>
                      Take a look →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{padding:'80px 44px',background:'var(--b)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:56}}>
              <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tl)',marginBottom:12}}>Simple Process</div>
              <h2 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>How Homeizz works</h2>
              <p style={{color:'rgba(255,255,255,.55)',maxWidth:440,margin:'0 auto',fontSize:'.95rem'}}>From discovery to your dream home in 3 simple steps</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32}}>
              {STEPS.map((step,i)=>(
                <div key={i} style={{textAlign:'center',padding:'32px 24px',background:'rgba(255,255,255,.04)',borderRadius:20,border:'1px solid rgba(255,255,255,.08)'}}>
                  <div style={{fontFamily:'var(--fd)',fontSize:'3.5rem',color:'var(--t)',opacity:.4,lineHeight:1,marginBottom:16}}>{step.n}</div>
                  <h3 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'1.3rem',marginBottom:12}}>{step.title}</h3>
                  <p style={{color:'rgba(255,255,255,.5)',fontSize:'.88rem',lineHeight:1.75}}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GET INSPIRED */}
        <section style={{padding:'80px 44px',background:'var(--c)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tlt)',marginBottom:12}}>Get Inspired</div>
                <h2 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Beautiful spaces,<br/><em>curated for you</em></h2>
              </div>
              <Link href="/browse" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',background:'transparent',color:'var(--t)',border:'1.5px solid var(--t)',borderRadius:50,fontWeight:600,fontSize:'.88rem',textDecoration:'none'}}>
                View all →
              </Link>
            </div>
            <div style={{columns:'3 300px',gap:16}}>
              {INSPIRATION.map((img,i)=>(
                <div key={i} style={{breakInside:'avoid',marginBottom:16,borderRadius:16,overflow:'hidden'}}>
                  <img src={img} alt={`Inspiration ${i+1}`} style={{width:'100%',display:'block'}} loading="lazy"/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CITIES */}
        <section style={{padding:'80px 44px',background:'#fff'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tlt)',marginBottom:12}}>Browse by City</div>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Find designers near you</h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {CITIES.map(city=>(
                <Link key={city.name} href={`/browse?city=${city.name}`} style={{textDecoration:'none',display:'block',borderRadius:16,overflow:'hidden',position:'relative',height:200,cursor:'pointer'}}>
                  <img src={city.img} alt={city.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%)'}}/>
                  <div style={{position:'absolute',bottom:16,left:20}}>
                    <div style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'1.4rem',fontWeight:600}}>{city.name}</div>
                    <div style={{color:'rgba(255,255,255,.7)',fontSize:'.75rem'}}>View designers →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BLOG */}
        <section style={{padding:'80px 44px',background:'var(--c)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:40}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tlt)',marginBottom:12}}>From Our Blog</div>
                <h2 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Design guides &<br/><em>expert advice</em></h2>
              </div>
              <Link href="/blog" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',background:'transparent',color:'var(--t)',border:'1.5px solid var(--t)',borderRadius:50,fontWeight:600,fontSize:'.88rem',textDecoration:'none'}}>
                All articles →
              </Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
              {BLOGS.map((blog,i)=>(
                <Link key={i} href={blog.href} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                  <div style={{height:200,overflow:'hidden'}}>
                    <img src={blog.img} alt={blog.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                  <div style={{padding:'20px'}}>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      <span style={{fontSize:'.7rem',fontWeight:600,color:'var(--t)',background:'var(--tpp)',padding:'3px 10px',borderRadius:50}}>{blog.city}</span>
                      <span style={{fontSize:'.7rem',color:'var(--tlt)'}}>{blog.time}</span>
                    </div>
                    <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.1rem',lineHeight:1.3}}>{blog.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{padding:'80px 44px',background:'var(--b)',textAlign:'center'}}>
          <div style={{maxWidth:600,margin:'0 auto'}}>
            <h2 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:16}}>Ready to build your<br/><em style={{color:'var(--tl)'}}>dream home?</em></h2>
            <p style={{color:'rgba(255,255,255,.55)',marginBottom:36,fontSize:'.95rem'}}>Join thousands of homeowners who found their perfect designer on Homeizz</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/browse" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',background:'var(--t)',color:'#fff',borderRadius:50,fontWeight:700,fontSize:'1rem',textDecoration:'none',boxShadow:'0 8px 28px rgba(196,98,45,.4)'}}>
                Browse Designers →
              </Link>
              <Link href="/pro-signup" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',background:'rgba(255,255,255,.08)',color:'#fff',borderRadius:50,fontWeight:600,fontSize:'1rem',textDecoration:'none',border:'1.5px solid rgba(255,255,255,.2)'}}>
                List as Professional
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}