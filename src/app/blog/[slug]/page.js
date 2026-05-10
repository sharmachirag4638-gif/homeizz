import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { POSTS, getPost, getRelatedPosts } from '@/lib/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeizz.in';

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return { title: 'Post not found | Homeizz Blog' };
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | Homeizz Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url,
      images: [{ url: post.img, width: 1200, height: 630 }],
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.img],
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getPost(params.slug);

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

  const Body = post.Body;
  const related = getRelatedPosts(post.slug);
  const url = `${SITE_URL}/blog/${post.slug}`;

  // Schema.org Article + FAQ JSON-LD for richer Google results
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.img,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'Homeizz', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Homeizz',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const faqSchema = post.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <>
      <Nav/>
      {/* Schema.org structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>

        {/* Hero */}
        <div style={{width:'100%',height:420,overflow:'hidden',position:'relative'}}>
          <img src={post.img} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.2) 60%)'}}/>
          <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:760,padding:'0 24px'}}>
            <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center'}}>
              <span style={{fontSize:'.72rem',fontWeight:700,color:'#fff',background:'var(--t)',padding:'4px 12px',borderRadius:50}}>{post.category}</span>
              <span style={{fontSize:'.78rem',color:'rgba(255,255,255,.7)'}}>{post.time}</span>
            </div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'clamp(1.6rem,4vw,2.6rem)',lineHeight:1.2,marginBottom:8}}>{post.title}</h1>
          </div>
        </div>

        {/* Body */}
        <div style={{maxWidth:760,margin:'0 auto',padding:'48px 24px 80px'}}>
          <Link href="/blog" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--t)',fontWeight:600,fontSize:'.88rem',textDecoration:'none',marginBottom:32}}>
            ← Back to Blog
          </Link>

          <p style={{fontSize:'1.15rem',color:'var(--tlt)',lineHeight:1.85,marginBottom:36,borderLeft:'3px solid var(--t)',paddingLeft:20,fontStyle:'italic'}}>
            {post.excerpt}
          </p>

          {Body ? (
            <Body />
          ) : (
            <div style={{background:'#fff',borderRadius:16,padding:'32px',border:'1.5px solid var(--borderl)',marginBottom:32}}>
              <p style={{color:'var(--tm)',lineHeight:1.85,fontSize:'.95rem'}}>
                We&apos;re writing this article right now. In the meantime, browse our verified architects and interior designers across India — you can compare portfolios, send enquiries to multiple firms, and find the right designer for your home in minutes.
              </p>
            </div>
          )}

          {/* FAQ Section (renders the human-visible version of the schema above) */}
          {post.faqs?.length > 0 && (
            <div style={{marginTop:48}}>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.85rem',fontWeight:600,marginBottom:20,letterSpacing:'-0.2px'}}>
                Frequently asked questions
              </h2>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {post.faqs.map((f, i) => (
                  <details key={i} style={{background:'#fff',borderRadius:12,border:'1.5px solid var(--borderl)',padding:'16px 20px'}}>
                    <summary style={{fontFamily:'var(--fd)',fontSize:'1.05rem',fontWeight:600,color:'var(--b)',cursor:'pointer',listStyle:'none',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
                      {f.q}
                      <span style={{color:'var(--t)',fontSize:'1.4rem',fontWeight:400,lineHeight:1}}>+</span>
                    </summary>
                    <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--borderl)',fontSize:'.95rem',color:'var(--tm)',lineHeight:1.75}}>
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{background:'var(--tpp)',borderRadius:16,padding:'32px',border:'1.5px solid var(--t)',textAlign:'center',marginTop:48}}>
            <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.4rem',marginBottom:8,fontWeight:600}}>Ready to find your designer?</h3>
            <p style={{color:'var(--tlt)',fontSize:'.95rem',marginBottom:22,lineHeight:1.6}}>
              Browse 100s of verified architects and interior designers across India. Compare portfolios, send enquiries to multiple firms, get quotes — free.
            </p>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/browse" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 28px',background:'var(--t)',color:'#fff',borderRadius:50,fontWeight:700,fontSize:'.92rem',textDecoration:'none'}}>
                Browse Designers →
              </Link>
              <Link href="/pricing" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 28px',background:'transparent',color:'var(--t)',border:'1.5px solid var(--t)',borderRadius:50,fontWeight:600,fontSize:'.92rem',textDecoration:'none'}}>
                I&apos;m a designer
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div style={{marginTop:64}}>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.6rem',fontWeight:600,marginBottom:20}}>Related reading</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{textDecoration:'none',display:'block',background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                    <div style={{height:140,overflow:'hidden'}}>
                      <img src={r.img} alt={r.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <div style={{padding:'14px 16px'}}>
                      <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--t)',textTransform:'uppercase',letterSpacing:'.4px',marginBottom:6}}>{r.category}</div>
                      <div style={{fontFamily:'var(--fd)',fontSize:'1rem',fontWeight:600,color:'var(--b)',lineHeight:1.3}}>{r.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}
