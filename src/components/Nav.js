import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

const POSTS = [
  { slug:'top-interior-designers-mumbai', title:'Top 10 Interior Designers in Mumbai 2026', excerpt:'Discover the most talented and highly-rated interior designers in Mumbai. Compare portfolios and find the perfect match for your home.', city:'Mumbai', time:'5 min read', img:'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80', category:'City Guide' },
  { slug:'top-architects-bangalore', title:'Best Architects in Bangalore: A Complete 2026 Guide', excerpt:'Looking for an architect in Bangalore? Here are the top firms and independent architects known for their exceptional work.', city:'Bangalore', time:'6 min read', img:'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80', category:'City Guide' },
  { slug:'modern-vs-minimalist', title:'Modern vs Minimalist: Which Interior Style is Right for You?', excerpt:'Confused between modern and minimalist design? We break down the key differences to help you choose.', city:'Design Guide', time:'7 min read', img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', category:'Design Guide' },
  { slug:'interior-design-cost-india', title:'How Much Does Home Interior Design Cost in India 2026?', excerpt:'A comprehensive guide to interior design costs in India. From budget to luxury, know what to expect.', city:'Cost Guide', time:'8 min read', img:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', category:'Cost Guide' },
  { slug:'vastu-shastra-modern-homes', title:'Vastu Shastra for Modern Homes: A Practical Guide', excerpt:'How to incorporate Vastu principles in your modern home design without compromising on aesthetics.', city:'Vastu', time:'6 min read', img:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80', category:'Tips' },
  { slug:'questions-ask-interior-designer', title:'10 Questions to Ask Your Interior Designer Before Hiring', excerpt:'Make sure you are making the right choice. These key questions will help you find the perfect designer.', city:'Tips', time:'4 min read', img:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', category:'Tips' },
];

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = POSTS.find(p => p.slug === params.slug);
  return {
    title: post ? `${post.title} | Homeizz Blog` : 'Blog | Homeizz',
    description: post?.excerpt || '',
  };
}

export default function BlogPostPage({ params }) {
  const post = POSTS.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <>
        <Nav/>
        <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{textAlign:'center'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:12}}>Post not found</h1>
            <Link href="/blog" style={{color:'var(--t)',fontWeight:600}}>← Back to Blog</Link>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{width:'100%',height:420,overflow:'hidden',position:'relative'}}>
          <img src={post.img} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.2) 60%)'}}/>
          <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:760,padding:'0 24px'}}>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <span style={{fontSize:'.72rem',fontWeight:700,color:'#fff',background:'var(--t)',padding:'4px 12px',borderRadius:50}}>{post.category}</span>
              <span style={{fontSize:'.72rem',color:'rgba(255,255,255,.7)',padding:'4px 0'}}>{post.time}</span>
            </div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(1.6rem,4vw,2.6rem)',lineHeight:1.2}}>{post.title}</h1>
          </div>
        </div>
        <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px 80px'}}>
          <Link href="/blog" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--t)',fontWeight:600,fontSize:'.88rem',textDecoration:'none',marginBottom:32}}>
            ← Back to Blog
          </Link>
          <p style={{fontSize:'1.1rem',color:'var(--tlt)',lineHeight:1.85,marginBottom:32,borderLeft:'3px solid var(--t)',paddingLeft:20,fontStyle:'italic'}}>
            {post.excerpt}
          </p>
          <div style={{background:'#fff',borderRadius:16,padding:'32px',border:'1.5px solid var(--borderl)',marginBottom:32}}>
            <p style={{color:'var(--tm)',lineHeight:1.85,fontSize:'.95rem'}}>
              This is a detailed guide about <strong>{post.title}</strong>. Full article content coming soon. Browse our verified professionals on Homeizz and find the perfect designer for your project.
            </p>
          </div>
          <div style={{background:'var(--tpp)',borderRadius:16,padding:'28px 32px',border:'1.5px solid var(--t)',textAlign:'center'}}>
            <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>Ready to find your designer?</h3>
            <p style={{color:'var(--tlt)',fontSize:'.9rem',marginBottom:20}}>Browse verified architects and interior designers across India.</p>
            <Link href="/browse" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 28px',background:'var(--t)',color:'#fff',borderRadius:50,fontWeight:700,fontSize:'.9rem',textDecoration:'none'}}>
              Browse Designers →
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}