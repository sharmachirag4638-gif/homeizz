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
        <Link href="/architects/Mumbai/modern" className="nl">Architects</Link>
        <Link href="/interior-designer/Mumbai/modern" className="nl">Interior</Link>
        <Link href="/blog" className="nl">Blog</Link>
        <a href="https://instagram.com/homeizz.in" target="_blank" rel="noopener noreferrer" className="nl" style={{display:'flex',alignItems:'center',gap:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          Instagram
        </a>
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