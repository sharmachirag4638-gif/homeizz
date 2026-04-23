import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// This is the home page. It runs as a React Server Component by default —
// everything here is rendered on the server, which means Google sees the
// full HTML on first load. That alone is a massive SEO upgrade over your
// previous single-file SPA.

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* HERO — port the JSX from the old index.html's .hero section.
          For now, minimal hero so the build runs. */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-dots" />
        <div className="hero-body">
          <div className="hero-inner">
            <div className="hero-pill">
              <span className="pill-dot"></span>
              India's Home Design Marketplace
            </div>
            <h1>Your dream home,<br /><em>designed by India's best.</em></h1>
            <p className="hero-sub">
              Discover verified architects, interior designers, and ready-to-build home plans.
              Compare portfolios, get quotes, and build with confidence.
            </p>
            <div className="hero-btns">
              <Link href="/browse" className="btn btn-p">Browse designs →</Link>
              <Link href="/list" className="btn btn-o">List your work</Link>
            </div>
            <div className="hero-stats">
              <div className="hs"><div className="hs-n">500+</div><div className="hs-l">VERIFIED PROS</div></div>
              <div className="hs"><div className="hs-n">30+</div><div className="hs-l">CITIES</div></div>
              <div className="hs"><div className="hs-n">2,000+</div><div className="hs-l">DESIGNS</div></div>
              <div className="hs"><div className="hs-n">4.8★</div><div className="hs-l">AVG RATING</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* "How it works" — port from old index.html's .how section */}
      <section className="how">
        <div className="how-in">
          <div className="sec-lbl"><span className="sec-lbl-line"></span>HOW IT WORKS</div>
          <h2>Four steps to your dream home</h2>
          <p className="how-sub">From inspiration to move-in, Homeizz keeps you in control.</p>
          <div className="steps">
            {[
              { n: 1, t: 'Browse', d: 'Explore verified architects and ready-to-build home plans.' },
              { n: 2, t: 'Compare', d: 'Save favourites, compare styles, and read honest reviews.' },
              { n: 3, t: 'Get quotes', d: 'Request structured quotes from 3-5 designers in 24 hours.' },
              { n: 4, t: 'Build safely', d: 'Pay by milestone via Razorpay escrow. Your money is protected.' },
            ].map(s => (
              <div key={s.n} className="step">
                <div className="step-n">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City grid — this is your internal linking engine. Every city link
          takes Google into a programmatic SEO page, which keeps crawl budget
          flowing through your site. */}
      <section className="feats">
        <div className="feats-hd">
          <h2>Find designers in your city</h2>
          <p>Covering 30+ cities across India — and growing fast.</p>
        </div>
        <div className="feat-grid">
          {[
            'bangalore','mumbai','delhi','hyderabad','chennai','pune',
            'jaipur','kochi','indore','chandigarh','ahmedabad','kolkata',
          ].map(c => (
            <Link key={c} href={`/architects/${c}/modern`} className="feat">
              <div className="feat-ico">📍</div>
              <h3 style={{ textTransform: 'capitalize' }}>{c}</h3>
              <p>Architects and designers serving {c.charAt(0).toUpperCase() + c.slice(1)} and nearby areas.</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
