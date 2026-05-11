import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { POSTS } from '@/lib/blog';

export const metadata = {
  title: 'Blog — Home Design Guides for India',
  description:
    "Real guides on interior design costs, architects in your city, vastu, modern vs minimalist, and how to hire the right designer. Written for Indian homeowners.",
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Homeizz Blog — Home Design Guides for India',
    description: 'Real, in-depth guides on home design, costs, and finding the right architect in India.',
  },
};

export default function BlogIndexPage() {
  // Featured post = the first one (most recent / highest priority)
  const [featured, ...rest] = POSTS;

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', background: 'var(--c)', paddingTop: 64 }}>

        {/* Header */}
        <section style={{ background: 'var(--c)', padding: '56px 24px 32px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--t)', marginBottom: 12 }}>
              The Homeizz Blog
            </div>
            <h1 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', lineHeight: 1.1, marginBottom: 16, fontWeight: 600 }}>
              Real guides for real Indian homes.
            </h1>
            <p style={{ color: 'var(--tm)', fontSize: 'clamp(1rem, 1.6vw, 1.1rem)', maxWidth: 600, margin: '0 auto', lineHeight: 1.65 }}>
              Costs, designers, styles, and the questions you should ask before hiring. No fluff, no SEO spam.
            </p>
          </div>
        </section>

        {/* Featured post */}
        {featured && (
          <section style={{ padding: '24px 16px 40px', maxWidth: 1100, margin: '0 auto' }}>
            <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', background: '#fff', border: '1.5px solid var(--borderl)', boxShadow: 'var(--shm)' }}>
              <div className="h-grid-2" style={{ gap: 0, alignItems: 'stretch' }}>
                <div style={{ minHeight: 320, position: 'relative', overflow: 'hidden' }}>
                  <img src={featured.img} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ background: 'var(--t)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50, letterSpacing: '.3px' }}>FEATURED</span>
                    <span style={{ fontSize: '.78rem', color: 'var(--tlt)' }}>{featured.category} · {featured.time}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', lineHeight: 1.2, marginBottom: 14, fontWeight: 600 }}>
                    {featured.title}
                  </h2>
                  <p style={{ color: 'var(--tm)', fontSize: '.95rem', lineHeight: 1.7, marginBottom: 16 }}>
                    {featured.excerpt}
                  </p>
                  <div style={{ color: 'var(--t)', fontWeight: 600, fontSize: '.9rem' }}>Read article →</div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Other posts */}
        <section style={{ padding: '8px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="h-grid-3" style={{ gap: 22 }}>
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--borderl)', boxShadow: 'var(--sh)' }}>
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px 22px 22px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--t)', background: 'var(--tpp)', padding: '3px 9px', borderRadius: 50, letterSpacing: '.3px' }}>{post.category}</span>
                    <span style={{ fontSize: '.7rem', color: 'var(--tlt)' }}>{post.time}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', fontSize: '1.15rem', lineHeight: 1.3, marginBottom: 8, fontWeight: 600 }}>
                    {post.title}
                  </h3>
                  <p style={{ color: 'var(--tlt)', fontSize: '.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 56, background: 'var(--b)', borderRadius: 18, padding: '40px 32px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--fd)', color: '#fff', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: 10, fontWeight: 600 }}>
              Ready to find your designer?
            </h2>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.95rem', marginBottom: 22 }}>
              Browse verified architects and interior designers across India. Free for homeowners.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'var(--t)', color: '#fff', borderRadius: 50, fontWeight: 700, fontSize: '.92rem', textDecoration: 'none' }}>
                Browse Designers →
              </Link>
              <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'rgba(255,255,255,.08)', color: '#fff', borderRadius: 50, fontWeight: 600, fontSize: '.92rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.15)' }}>
                I&apos;m a designer
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
