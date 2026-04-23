'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const sb = createClient();
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('homeowner');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone, role } },
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (e2) {
      setErr(e2.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">Home<span style={{ color:'#C8A882' }}>izz</span></div>
        <p className="auth-sub">Welcome back, or join us — free to get started.</p>
        <div className="tabs">
          <button type="button" onClick={() => setMode('signin')} className={`tab ${mode==='signin' ? 'on':''}`}>Sign in</button>
          <button type="button" onClick={() => setMode('signup')} className={`tab ${mode==='signup' ? 'on':''}`}>Create account</button>
        </div>
        {err && <div className="err-box" style={{ display:'block' }}>{err}</div>}
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <div className="utypes">
                <div className={`utype ${role==='homeowner' ? 'on':''}`} onClick={() => setRole('homeowner')}>
                  <div className="utype-ico">🏠</div>
                  <div className="utype-t">Homeowner</div>
                  <div className="utype-s">Looking for designs</div>
                </div>
                <div className={`utype ${role==='designer' ? 'on':''}`} onClick={() => setRole('designer')}>
                  <div className="utype-ico">🎨</div>
                  <div className="utype-t">Designer</div>
                  <div className="utype-s">Offering services</div>
                </div>
              </div>
              <div className="fg">
                <label htmlFor="fn">Full name</label>
                <input id="fn" required value={fullName} onChange={e=>setFullName(e.target.value)} />
              </div>
              <div className="fg">
                <label htmlFor="ph">Phone (India)</label>
                <input id="ph" type="tel" inputMode="numeric" pattern="[0-9]{10}" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" />
              </div>
            </>
          )}
          <div className="fg">
            <label htmlFor="em">Email</label>
            <input id="em" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="fg">
            <label htmlFor="pw">Password</label>
            <input id="pw" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="ubtn" disabled={busy}>
            {busy ? 'Please wait…' : (mode==='signup' ? 'Create my account' : 'Sign in')}
          </button>
        </form>
      </div>
    </div>
  );
}
