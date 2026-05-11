'use client';
import { useState } from 'react';
import Script from 'next/script';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

const TEST_CARDS = [
  { network: 'Visa (India)',       number: '4012 0010 3818 8351', note: 'Domestic — works on Indian accounts' },
  { network: 'Mastercard (India)', number: '5104 0600 0000 0008', note: 'Domestic — works on Indian accounts' },
];

export default function TestPaymentPage() {
  const [amount, setAmount] = useState(100); // ₹
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // {type:'success'|'error', payload:...}

  async function handlePay() {
    setBusy(true);
    setResult(null);
    try {
      const orderRes = await fetch('/api/razorpay/test-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaise: Math.max(100, Math.round(amount * 100)) }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Order creation failed');

      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay script not loaded yet — try again in a few seconds.');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Homeizz',
        description: 'Test payment — verify integration',
        image: '/favicon.svg',
        prefill: { name: 'Test User', email: 'test@homeizz.in', contact: '9999999999' },
        theme: { color: '#C4622D' },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/razorpay/test-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const data = await verifyRes.json();
            if (data.ok) {
              setResult({ type: 'success', payload: data });
            } else {
              setResult({ type: 'error', payload: data });
            }
          } catch (e) {
            setResult({ type: 'error', payload: { error: e.message } });
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => { setBusy(false); setResult({ type: 'cancelled' }); } },
      });
      rzp.on('payment.failed', (resp) => {
        setBusy(false);
        setResult({ type: 'error', payload: resp.error });
      });
      rzp.open();
    } catch (e) {
      setBusy(false);
      setResult({ type: 'error', payload: { error: e.message } });
    }
  }

  return (
    <>
      <Nav />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <main style={{ background: 'var(--c)', minHeight: '100vh', paddingTop: 96, paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>

          <div style={{ marginBottom: 24, display: 'inline-block', background: '#FEF3C7', color: '#92400E', padding: '6px 14px', borderRadius: 50, fontSize: '.78rem', fontWeight: 700, letterSpacing: '.5px' }}>
            🧪 TEST MODE ONLY
          </div>

          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(2rem,4vw,2.8rem)', color: 'var(--b)', marginBottom: 12, fontWeight: 600, lineHeight: 1.1 }}>
            Razorpay test payment
          </h1>
          <p style={{ color: 'var(--tm)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.6 }}>
            This page lets you verify the Razorpay integration end-to-end without needing the quotes/payments DB tables. Uses test-mode keys only — no real money moves.
          </p>

          <div style={{ background: '#fff', borderRadius: 16, padding: '28px', border: '1.5px solid var(--borderl)', boxShadow: 'var(--sh)', marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, color: 'var(--b)', marginBottom: 8 }}>
              Test amount (₹)
            </label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--tlt)', fontWeight: 600 }}>₹</span>
              <input
                type="number"
                value={amount}
                min="1"
                max="10000"
                onChange={e => setAmount(Number(e.target.value) || 0)}
                style={{ width: '100%', padding: '12px 14px 12px 28px', border: '1.5px solid var(--borderl)', borderRadius: 10, fontSize: '1rem', color: 'var(--b)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button
              onClick={handlePay}
              disabled={busy || amount < 1}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                background: busy ? 'var(--borderl)' : 'var(--t)',
                color: busy ? 'var(--tlt)' : '#fff',
                fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                fontSize: '.95rem', fontFamily: 'inherit',
                boxShadow: busy ? 'none' : '0 6px 20px rgba(196,98,45,.3)',
              }}
            >
              {busy ? 'Opening Razorpay…' : `Pay ₹${amount.toLocaleString('en-IN')} (test)`}
            </button>
          </div>

          {result && (
            <div style={{
              background: result.type === 'success' ? '#D1FAE5' : result.type === 'cancelled' ? '#FEF3C7' : '#FEE2E2',
              border: `1.5px solid ${result.type === 'success' ? '#10B981' : result.type === 'cancelled' ? '#F59E0B' : '#EF4444'}`,
              borderRadius: 14, padding: '20px 24px', marginBottom: 24,
            }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.25rem', fontWeight: 600, marginBottom: 6,
                color: result.type === 'success' ? '#065F46' : result.type === 'cancelled' ? '#92400E' : '#991B1B',
              }}>
                {result.type === 'success' && '✅ Payment verified successfully'}
                {result.type === 'cancelled' && '⚠️ Payment cancelled'}
                {result.type === 'error' && '❌ Payment failed'}
              </div>
              {result.type === 'success' && (
                <div style={{ fontSize: '.85rem', color: '#065F46', lineHeight: 1.7 }}>
                  Order ID: <code style={{ background: 'rgba(0,0,0,.05)', padding: '2px 6px', borderRadius: 4 }}>{result.payload.razorpay_order_id}</code><br/>
                  Payment ID: <code style={{ background: 'rgba(0,0,0,.05)', padding: '2px 6px', borderRadius: 4 }}>{result.payload.razorpay_payment_id}</code><br/>
                  Signature verified server-side via HMAC-SHA256 ✓
                </div>
              )}
              {result.type === 'cancelled' && (
                <div style={{ fontSize: '.88rem', color: '#92400E' }}>
                  You closed the Razorpay modal before completing the payment. Try again.
                </div>
              )}
              {result.type === 'error' && (
                <div style={{ fontSize: '.85rem', color: '#991B1B' }}>
                  <pre style={{ background: 'rgba(0,0,0,.04)', padding: 10, borderRadius: 6, overflowX: 'auto', fontSize: '.78rem' }}>
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', border: '1.5px solid var(--borderl)' }}>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.1rem', color: 'var(--b)', marginBottom: 14, fontWeight: 600 }}>Test card numbers</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--tlt)', marginBottom: 14, lineHeight: 1.6 }}>
              Use any of these on the Razorpay checkout. CVV = any 3 digits. Expiry = any future date. OTP = <strong>1234</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TEST_CARDS.map(c => (
                <div key={c.number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--c)', borderRadius: 10, border: '1px solid var(--borderl)', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: '.78rem', color: 'var(--tlt)', fontWeight: 600 }}>{c.network}</div>
                    <code style={{ fontSize: '.95rem', fontFamily: 'monospace', color: 'var(--b)' }}>{c.number}</code>
                  </div>
                  <div style={{ fontSize: '.8rem', color: 'var(--tm)', fontStyle: 'italic' }}>{c.note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#FEF3C7', borderRadius: 8, fontSize: '.78rem', color: '#92400E' }}>
              💡 You can also test UPI: use any UPI ID like <code style={{ background: 'rgba(0,0,0,.05)', padding: '1px 5px', borderRadius: 3 }}>success@razorpay</code> or <code style={{ background: 'rgba(0,0,0,.05)', padding: '1px 5px', borderRadius: 3 }}>failure@razorpay</code>.
            </div>
          </div>

          <p style={{ marginTop: 24, fontSize: '.78rem', color: 'var(--tlt)', textAlign: 'center', lineHeight: 1.6 }}>
            This page only works with <code>rzp_test_*</code> keys. The server refuses to create live-mode orders here.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
