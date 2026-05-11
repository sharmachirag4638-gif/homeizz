'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Nav() {
  const sb = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const meta = user?.user_metadata || {};
  const initials = meta.full_name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">Home<span>izz</span></Link>
      <div className="nav-links">
        <Link href="/browse" className="nl">Browse</Link>
        <Link href="/architects/mumbai/modern" className="nl">Architects</Link>
        <Link href="/interior-designer/mumbai/modular-kitchen" className="nl">Interior</Link>
        <Link href="/pricing" className="nl">Pricing</Link>
        {user ? (
          <div onClick={()=>meta.role==='professional'?router.push('/pro-dashboard'):router.push('/dashboard')} className="nav-av" title={meta.full_name||'Account'}>
            {initials}
          </div>
        ) : (
          <>
            <Link href="/pro-signup" className="nl">List your work</Link>
            <Link href="/auth" className="nl nl-cta">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
