'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PLANS, LAUNCH_OFFER_LIMIT } from '@/lib/plans';

const FAQ = [
  {
    q: 'How does the first 100 listers offer work?',
    a: `The first ${LAUNCH_OFFER_LIMIT} verified professionals who join Homeizz get free launch access while we build the marketplace. No credit card is needed at signup. You can add your profile and listings, then activate a paid plan when you are ready.`,
  },
  {
    q: 'Do you take a commission on projects I close?',
    a: "No, never. The monthly fee is all you pay. Whatever a homeowner pays you stays 100% yours — Homeizz doesn't touch project revenue.",
  },
  {
    q: 'What happens if I cancel?',
    a: 'Cancel anytime from your dashboard. Your listings stay live until the end of your current billing period, then your account moves to a free state (your profile remains, but listings are paused).',
  },
  {
    q: 'Can I upgrade or downgrade plans?',
    a: 'Yes — change plans anytime from your dashboard. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'How do I get paid by homeowners?',
    a: 'Directly. Homeowners contact you through Homeizz, then you handle quotes and payments however you normally do — bank transfer, UPI, cheque, your choice. We never sit between you and the homeowner.',
  },
  {
    q: 'Is there a setup fee or contract?',
    a: 'Neither. No setup fees, no annual contracts (unless you choose annual billing for the discount). Pay monthly, cancel anytime.',
  },
];

export default function PricingClient() {
  const [billing, setBilling] = useState('monthly');

  return (
    <main style={{ background: 'var(--c)', paddingTop: 64, minHeight: '100vh' }}>

      {/* HERO */}
      <section className="h-sec" style={{ background: 'var(--c)', textAlign: 'center', paddingTop: '64px' }}>
        <div className="h-cont">
          <div style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--t)', marginBottom: 12 }}>
            Pricing for professionals
          </div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(2.2rem,5vw,3.6rem)', color: 'var(--b)', lineHeight: 1.1, marginBottom: 16, fontWeight: 600 }}>
            Simple pricing.<br/>No commission. No tricks.
          </h1>
          <p style={{ fontSize: 'clamp(1rem,1.6vw,1.15rem)', color: 'var(--tm)', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
            Founding professionals can list free during launch. After that, pick a plan that fits your firm. Whatever a homeowner pays you stays 100% yours — we don't take a cut of your projects.
          </p>
        </div>
      </section>

      {/* LAUNCH OFFER BANNER */}
      <section style={{ padding: '0 16px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: 'var(--sagep)', border: '1.5px solid var(--sage)', borderRadius: 16, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.8rem' }}>🎉</span>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', color: '#2D4A1F', fontWeight: 600 }}>
                First {LAUNCH_OFFER_LIMIT} listers: free launch access
              </div>
              <div style={{ fontSize: '.86rem', color: '#4A6135', marginTop: 2 }}>
                No credit card at signup. Claim your founding spot before paid onboarding starts.
              </div>
            </div>
          </div>
          <Link href="/pro-signup" style={{ background: 'var(--sage)', color: '#fff', padding: '11px 22px', borderRadius: 50, fontWeight: 700, fontSize: '.88rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Claim founding spot →
          </Link>
        </div>
      </section>

      {/* BILLING TOGGLE */}
      <section style={{ padding: '40px 16px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', background: '#fff', borderRadius: 50, padding: 5, border: '1.5px solid var(--borderl)', boxShadow: 'var(--sh)' }}>
          <button
            onClick={() => setBilling('monthly')}
            style={{
              padding: '10px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontSize: '.88rem', fontWeight: 600, fontFamily: 'inherit',
              background: billing === 'monthly' ? 'var(--t)' : 'transparent',
              color: billing === 'monthly' ? '#fff' : 'var(--tlt)',
              transition: 'all .2s',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            style={{
              padding: '10px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontSize: '.88rem', fontWeight: 600, fontFamily: 'inherit',
              background: billing === 'annual' ? 'var(--t)' : 'transparent',
              color: billing === 'annual' ? '#fff' : 'var(--tlt)',
              transition: 'all .2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Annual
            <span style={{
              fontSize: '.68rem', fontWeight: 700, letterSpacing: '.3px',
              padding: '2px 8px', borderRadius: 50,
              background: billing === 'annual' ? 'rgba(255,255,255,.22)' : 'var(--sage)',
              color: '#fff',
            }}>
              SAVE 2 MONTHS
            </span>
          </button>
        </div>
      </section>

      {/* PLAN CARDS */}
      <section style={{ padding: '32px 16px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="h-grid-3" style={{ gap: 22 }}>
          {PLANS.map(plan => {
            const displayPrice = billing === 'annual' ? plan.annualMonthly : plan.monthly;
            return (
              <div key={plan.id} style={{
                background: '#fff',
                border: plan.popular ? `2px solid ${plan.color}` : '1.5px solid var(--borderl)',
                borderRadius: 18,
                padding: '32px 26px',
                position: 'relative',
                boxShadow: plan.popular ? 'var(--shm)' : 'var(--sh)',
                display: 'flex', flexDirection: 'column',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: plan.color, color: '#fff',
                    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.5px',
                    padding: '5px 16px', borderRadius: 50, textTransform: 'uppercase',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--b)', marginBottom: 4 }}>
                    {plan.name}
                  </h3>
                  <div style={{ fontSize: '.82rem', color: 'var(--tlt)' }}>{plan.tagline}</div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: 'var(--fd)', fontSize: '2.6rem', fontWeight: 700, color: plan.color, lineHeight: 1 }}>
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '.92rem', color: 'var(--tlt)', fontWeight: 500 }}>/month</span>
                  </div>
                  {billing === 'annual' && (
                    <div style={{ fontSize: '.78rem', color: 'var(--sage)', fontWeight: 600, marginTop: 4 }}>
                      ₹{plan.annual.toLocaleString('en-IN')}/year · billed annually
                    </div>
                  )}
                  {billing === 'monthly' && (
                    <div style={{ fontSize: '.78rem', color: 'var(--tlt)', marginTop: 4 }}>
                      Pay yearly to save 2 months
                    </div>
                  )}
                </div>

                <Link href="/pro-signup" style={{
                  display: 'block', textAlign: 'center',
                  padding: '13px 20px', borderRadius: 50,
                  background: plan.popular ? plan.color : 'transparent',
                  color: plan.popular ? '#fff' : plan.color,
                  border: `2px solid ${plan.color}`,
                  fontWeight: 700, fontSize: '.92rem',
                  textDecoration: 'none', marginBottom: 22,
                  fontFamily: 'inherit',
                }}>
                  Claim founding spot
                </Link>

                <div style={{ borderTop: '1px solid var(--borderl)', paddingTop: 20, flex: 1 }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--tlt)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>
                    What's included
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ fontSize: '.88rem', color: 'var(--tm)', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                        <span style={{
                          flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                          background: `${plan.color}22`, color: plan.color,
                          fontSize: '.72rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: 2,
                        }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: '.86rem', color: 'var(--tlt)' }}>
          Founding offer: the first <strong style={{ color: 'var(--b)' }}>{LAUNCH_OFFER_LIMIT} professional listers</strong> get free launch access. Cancel anytime. No setup fees. No commission on projects.
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="h-sec tight" style={{ background: '#fff', borderTop: '1px solid var(--borderl)', borderBottom: '1px solid var(--borderl)' }}>
        <div className="h-cont">
          <div className="h-grid-3" style={{ gap: 32, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>🛡️</div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', color: 'var(--b)', marginBottom: 6, fontWeight: 600 }}>
                No commission. Ever.
              </h3>
              <p style={{ fontSize: '.88rem', color: 'var(--tlt)', lineHeight: 1.55 }}>
                Whatever a homeowner pays you stays 100% yours. We make money from subscriptions only.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>🚫</div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', color: 'var(--b)', marginBottom: 6, fontWeight: 600 }}>
                No lead resale.
              </h3>
              <p style={{ fontSize: '.88rem', color: 'var(--tlt)', lineHeight: 1.55 }}>
                Enquiries go straight to your inbox. We don't sell them to your competitors. Unlike Justdial.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>🇮🇳</div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.15rem', color: 'var(--b)', marginBottom: 6, fontWeight: 600 }}>
                Built in India.
              </h3>
              <p style={{ fontSize: '.88rem', color: 'var(--tlt)', lineHeight: 1.55 }}>
                Pricing in INR. Razorpay-secure billing. Support in your time zone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="h-sec" style={{ background: 'var(--c)' }}>
        <div className="h-cont" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--t)', marginBottom: 10 }}>
              Frequently asked
            </div>
            <h2 style={{ fontFamily: 'var(--fd)', color: 'var(--b)', fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>
              Questions architects ask us
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map((item, i) => (
              <details key={i} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid var(--borderl)', padding: '18px 22px' }}>
                <summary style={{ fontFamily: 'var(--fd)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--b)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  {item.q}
                  <span style={{ color: 'var(--t)', fontSize: '1.4rem', fontWeight: 400, lineHeight: 1 }}>+</span>
                </summary>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--borderl)', fontSize: '.92rem', color: 'var(--tm)', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="h-sec" style={{ background: 'var(--b)', textAlign: 'center' }}>
        <div className="h-cont" style={{ maxWidth: 640 }}>
          <h2 style={{ fontFamily: 'var(--fd)', color: '#fff', fontSize: 'clamp(1.8rem,3.6vw,2.6rem)', marginBottom: 14, fontWeight: 600 }}>
            Ready to be seen by homeowners?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1rem', marginBottom: 28, lineHeight: 1.6 }}>
            Sign up takes 2 minutes. First {LAUNCH_OFFER_LIMIT} listers get free launch access. No credit card needed now.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pro-signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', background: 'var(--t)', color: '#fff', borderRadius: 50, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
              Claim founding spot →
            </Link>
            <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', background: 'rgba(255,255,255,.08)', color: '#fff', borderRadius: 50, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.2)' }}>
              Learn more
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
