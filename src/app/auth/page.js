'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const defaultMode = searchParams.get('mode') || 'signin';

  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        if (meta?.role === 'professional') router.push('/pro-dashboard');
        else router.push(redirect);
      }
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(''); setSuccess('');
    try {
      if (mode === 'signup') {
        const { error } = await sb.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone, role: 'homeowner' } },
        });
        if (error) throw error;
        setSuccess('Account created! Check your email to verify, then sign in.');
        setMode('signin');
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const meta = data.user?.user_metadata;
        if (meta?.role === 'professional') router.push('/pro-dashboard');
        else router.push(redirect);
      }
    } catch (e2) {
      setErr(e2.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = { width:'100%', padding:'12px 14px', border:'1.5px solid var(--borderl)', borderRadius:10, fontSize:'.9rem', color:'var(--b)', background:'#fff', outline:'none', fontFamily:'var(--fb)', boxSizing:'border-box' };
  const labelStyle = { display:'block', fontSize:'.82rem', fontWeight:600, color:'var(--b)', marginBottom:6 };

  return (
    <div style={{minHeight:'100vh',background:'var(--c)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div onClick={()=>router.push('/')} style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:'var(--b)',cursor:'pointer',display:'inline-block'}}>
            Home<span style={{color:'var(--t)'}}>izz</span>
          </div>
          <p style={{color:'var(--tlt)',fontSize:'.88rem',marginTop:6}}>
            {mode==='signup'?'Create your free homeowner account':'Welcome back!'}
          </p>
        </div>

        <div style={{background:'#fff',borderRadius:20,padding:'32px',border:'1.5px solid var(--borderl)',boxShadow:'var(--shm)'}}>
          <div style={{display:'flex',background:'var(--c)',borderRadius:12,padding:4,marginBottom:24}}>
            {['signin','signup'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr('');setSuccess('');}} style={{flex:1,padding:'10px',border:'none',borderRadius:10,background:mode===m?'#fff':'transparent',color:mode===m?'var(--t)':'var(--tlt)',fontWeight:700,cursor:'pointer',fontSize:'.88rem',boxShadow:mode===m?'var(--sh)':'none',transition:'all .2s'}}>
                {m==='signin'?'Sign In':'Create Account'}
              </button>
            ))}
          </div>

          {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:'.85rem'}}>{err}</div>}
          {success&&<div style={{background:'#F0FDF4',border:'1px solid #86EFAC',color:'#166534',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:'.85rem'}}>✅ {success}</div>}

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            {mode==='signup'&&(
              <>
                <div style={{background:'var(--tpp)',borderRadius:12,padding:'12px 16px',border:'1.5px solid var(--tp)',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:'1.5rem'}}>🏠</span>
                  <div>
                    <div style={{fontWeight:700,color:'var(--b)',fontSize:'.85rem'}}>Homeowner Account</div>
                    <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>Free forever · Browse & contact designers</div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Amit Sharma" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" style={inputStyle}/>
                </div>
              </>
            )}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle}/>
            </div>
            <button type="submit" disabled={busy} style={{padding:'14px',background:busy?'var(--borderl)':'var(--t)',color:'#fff',border:'none',borderRadius:12,fontWeight:700,cursor:busy?'not-allowed':'pointer',fontSize:'.95rem',boxShadow:busy?'none':'0 6px 20px rgba(196,98,45,.3)',marginTop:4}}>
              {busy?'Please wait...':mode==='signup'?'Create Free Account →':'Sign In →'}
            </button>
          </form>

          <div style={{textAlign:'center',marginTop:20,paddingTop:20,borderTop:'1px solid var(--borderl)'}}>
            <p style={{fontSize:'.8rem',color:'var(--tlt)',marginBottom:10}}>Are you a designer or architect?</p>
            <button onClick={()=>router.push('/pro-signup')} style={{padding:'10px 20px',background:'transparent',color:'var(--t)',border:'1.5px solid var(--t)',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:'.82rem'}}>
              Join as Professional →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}