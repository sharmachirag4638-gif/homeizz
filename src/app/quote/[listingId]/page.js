'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { toPaise } from '@/lib/utils';

// ──────────────────────────────────────────────────────────────
// Quote request form — homeowner side.
// ──────────────────────────────────────────────────────────────

export default function RequestQuotePage() {
  const { listingId } = useParams();
  const router = useRouter();
  const sb = createClient();

  const [form, setForm] = useState({
    city: '', scope: '', bedrooms: 3, sqft: '',
    budget: '', vastuRequired: false, targetDate: '',
  });
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, [sb]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    if (!user) {
      router.push('/auth?next=/quote/' + listingId);
      return;
    }
    const { error } = await sb.from('quote_requests').insert({
      homeowner_id: user.id,
      listing_id: listingId === 'new' ? null : listingId,
      city: form.city,
      scope: form.scope,
      bedrooms: Number(form.bedrooms) || null,
      sqft: Number(form.sqft) || null,
      budget_paise: form.budget ? toPaise(form.budget) : null,
      vastu_required: form.vastuRequired,
      target_date: form.targetDate || null,
    });
    setBusy(false);
    if (error) { setMsg('Could not submit: ' + error.message); return; }
    setMsg('Quote request submitted. Designers will respond within 24 hours.');
    setTimeout(() => router.push('/dashboard'), 1500);
  }

  return (
    <>
      <Nav />
      <div className="pay-pg">
        <div className="pay-wrap" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="pay-hd">
              <h2>Request a quote</h2>
              <p>Tell us about your project — 3-5 verified designers will respond within 24 hours. Free.</p>
            </div>
            {msg && (
              <div className="payblk" style={{ background: '#EAF2E6', color: '#6B7F5E' }}>
                {msg}
              </div>
            )}
            <form onSubmit={submit}>
              <div className="payblk">
                <div className="payblk-t">📝 Project details</div>
                <div className="pfields">
                  <div className="prow2">
                    <div className="fi">
                      <label>City</label>
                      <input required value={form.city} onChange={e=>setForm({...form, city: e.target.value})} placeholder="e.g. Bangalore" />
                    </div>
                    <div className="fi">
                      <label>BHK</label>
                      <select value={form.bedrooms} onChange={e=>setForm({...form, bedrooms: e.target.value})}>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="prow2">
                    <div className="fi">
                      <label>Built-up area (sqft)</label>
                      <input type="number" inputMode="numeric" value={form.sqft} onChange={e=>setForm({...form, sqft: e.target.value})} placeholder="e.g. 1200" />
                    </div>
                    <div className="fi">
                      <label>Your budget (₹)</label>
                      <input type="number" inputMode="numeric" value={form.budget} onChange={e=>setForm({...form, budget: e.target.value})} placeholder="e.g. 500000" />
                    </div>
                  </div>
                  <div className="fi">
                    <label>What do you want designed?</label>
                    <textarea required value={form.scope} onChange={e=>setForm({...form, scope: e.target.value})} placeholder="e.g. Full-home interior for a 3BHK apartment. Modern minimal style, with kid-friendly living room and Vastu-compliant pooja room." />
                  </div>
                  <div className="prow2">
                    <div className="fi">
                      <label>Target move-in date</label>
                      <input type="date" value={form.targetDate} onChange={e=>setForm({...form, targetDate: e.target.value})} />
                    </div>
                    <div className="fi" style={{ justifyContent: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={form.vastuRequired} onChange={e=>setForm({...form, vastuRequired: e.target.checked})} />
                        Vastu-compliant design required
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="pay-btn" disabled={busy}>
                {busy ? 'Submitting…' : 'Send request to 3–5 designers'}
              </button>
              <p className="pay-secure">🔒 Free to request. You only pay when you hire and approve a milestone.</p>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
