import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Home Design Blog — Tips, Guides & Inspiration | Homeizz',
  description: 'Expert advice on interior design, architecture, and home renovation in India.',
};

const POSTS = [
  { slug:'top-interior-designers-mumbai', title:'Top 10 Interior Designers in Mumbai 2026', excerpt:'Discover the most talented and highly-rated interior designers in Mumbai. Compare portfolios and find the perfect match for your home.', city:'Mumbai', time:'5 min read', img:'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', category:'City Guide' },
  { slug:'top-architects-bangalore', title:'Best Architects in Bangalore: A Complete 2026 Guide', excerpt:'Looking for an architect in Bangalore? Here are the top firms and independent architects known for their exceptional work.', city:'Bangalore', time:'6 min read', img:'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80', category:'City Guide' },
  { slug:'modern-vs-minimalist', title:'Modern vs Minimalist: Which Interior Style is Right for You?', excerpt:'Confused between modern and minimalist design? We break down the key differences to help you choose.', city:'Design Guide', time:'7 min read', img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', category:'Design Guide' },
  { slug:'interior-design-cost-india', title:'How Much Does Home Interior Design Cost in India 2026?', excerpt:'A comprehensive guide to interior design costs in India. From budget to luxury, know what to expect.', city:'Cost Guide', time:'8 min read', img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', category:'Cost Guide' },
  { slug:'vastu-shastra-modern-homes', title:'Vastu Shastra for Modern Homes: A Practical Guide', excerpt:'How to incorporate Vastu principles in your modern home design without compromising on aesthetics.', city:'Vastu', time:'6 min read', img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', category:'Tips' },
  { slug:'questions-ask-interior-designer', title:'10 Questions to Ask Your Interior Designer Before Hiring', excerpt:'Make sure you are making the right choice. These key questions will help you find the perfect designer.', city:'Tips', time:'4 min read', img:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', category:'Tips' },
];

export default function BlogPage() {
  const featured = POSTS[0];
  const rest = POSTS.slice(1);
  return (
    <>
      <Nav/>
      <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tl)',marginBottom:12}}>Homeizz Blog</div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Design guides &<br/><em style={{color:'var(--tl)'}}>expert advice</em></h1>
            <p style={{color:'rgba(255,255,255,.55)',maxWidth:480,fontSize:'.95rem'}}>Tips, inspiration and city guides to help you build your dream home</p>
          </div>
        </div>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'48px 44px 80px'}}>

          {/* Featured */}
          <Link href={`/blog/${featured.slug}`} style={{textDecoration:'none',display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,background:'#fff',borderRadius:20,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',marginBottom:40}}>
            <div style={{height:360,overflow:'hidden'}}>
              <img src={featured.img} alt={featured.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div style={{padding:'40px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{display:'flex',gap:8,marginBottom:16}}>
                <span style={{fontSize:'.7rem',fontWeight:700,color:'var(--t)',background:'var(--tpp)',padding:'4px 12px',borderRadius:50}}>{featured.category}</span>
                <span style={{fontSize:'.7rem',color:'var(--tlt)',padding:'4px 0'}}>{featured.time}</span>
              </div>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.8rem',marginBottom:16,lineHeight:1.2}}>{featured.title}</h2>
              <p style={{color:'var(--tlt)',fontSize:'.9rem',lineHeight:1.75,marginBottom:24}}>{featured.excerpt}</p>
              <span style={{color:'var(--t)',fontWeight:700,fontSize:'.88rem'}}>Read article →</span>
            </div>
          </Link>

          {/* Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24}}>
            {rest.map(post=>(
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <div style={{height:200,overflow:'hidden'}}>
                  <img src={post.img} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                <div style={{padding:'20px'}}>
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    <span style={{fontSize:'.7rem',fontWeight:700,color:'var(--t)',background:'var(--tpp)',padding:'3px 10px',borderRadius:50}}>{post.category}</span>
                    <span style={{fontSize:'.7rem',color:'var(--tlt)'}}>{post.time}</span>
                  </div>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.15rem',lineHeight:1.3,marginBottom:10}}>{post.title}</h3>
                  <p style={{color:'var(--tlt)',fontSize:'.82rem',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}