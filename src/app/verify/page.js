'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

function VerifyForm() {
  const sb = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'homeowner';
  const [otp, setOtp] = useState(['','','','','','']);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [resent, setResent] = useState(false);

  function handleOtp(val, idx) {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus();
  }

  function handleKey(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx-1}`)?.focus();
    }
  }

  async function verify() {
    const token = otp.join('');
    if (token.length < 6) return setErr('Please enter the 6-digit code');
    setBusy(true); setErr('');
    try {
      const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      // Redirect based on role
      if (role === 'professional') {
        router.push('/pro-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch(e) {
      setErr(e.message || 'Invalid code. Please try again.');
    } finally { setBusy(false); }
  }

  async function resend() {
    const { error } = await sb.auth.resend({ type: 'signup', email });
    if (!error) setResent(true);
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--c)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:440,textAlign:'center'}}>
        <div onClick={()=>router.push('/')} style={{fontFamily:'var(--fd)',fontSize:'1.6rem',fontWeight:700,color:'var(--t)',cursor:'pointer',marginBottom:40,display:'inline-block'}}>
          Home<span style={{color:'var(--b)'}}>izz</span>
        </div>
        <div style={{background:'#fff',borderRadius:24,padding:'40px 36px',border:'1.5px solid var(--borderl)',boxShadow:'var(--shm)'}}>
          <div style={{width:72,height:72,background:'var(--tpp)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'2rem'}}>📧</div>
          <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>Check your email</h2>
          <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:8}}>We sent a 6-digit code to</p>
          <p style={{color:'var(--t)',fontWeight:700,fontSize:'.95rem',marginBottom:32}}>{email||'your email'}</p>

          <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:24}}>
            {otp.map((digit,i)=>(
              <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e=>handleOtp(e.target.value,i)} onKeyDown={e=>handleKey(e,i)}
                style={{width:48,height:56,textAlign:'center',fontSize:'1.4rem',fontWeight:700,border:`2px solid ${digit?'var(--t)':'var(--borderl)'}`,borderRadius:12,outline:'none',color:'var(--b)',background:digit?'var(--tpp)':'#fff',transition:'all .2s',fontFamily:'var(--fb)'}}/>
            ))}
          </div>

          {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:'.84rem'}}>{err}</div>}

          <button onClick={verify} disabled={busy} style={{width:'100%',padding:'14px',background:busy?'var(--borderl)':'var(--t)',color:'#fff',border:'none',borderRadius:12,fontWeight:700,cursor:busy?'not-allowed':'pointer',fontSize:'.95rem',marginBottom:16}}>
            {busy?'Verifying...':'Verify Email →'}
          </button>

          <p style={{fontSize:'.8rem',color:'var(--tlt)'}}>
            Didn't receive the code?{' '}
            {resent
              ?<span style={{color:'var(--sage)',fontWeight:600}}>Code sent! ✓</span>
              :<span onClick={resend} style={{color:'var(--t)',fontWeight:600,cursor:'pointer'}}>Resend</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>}>
      <VerifyForm/>
    </Suspense>
  );
}