import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-g">
        <div className="footer-brand">
          <div className="footer-logo">Home<span>izz</span></div>
          <p>India's home design marketplace — connect with verified architects, interior designers, and home plan experts.</p>
          <div style={{display:'flex',gap:12,marginTop:16}}>
            <a href="https://instagram.com/homeizz.in" target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',background:'linear-gradient(135deg,#E1306C,#833AB4)',color:'#fff',borderRadius:50,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @homeizz.in
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Discover</h4>
          <Link href="/browse">Browse listings</Link>
          <Link href="/architects/Mumbai/modern">Architects</Link>
          <Link href="/interior-designer/Mumbai/modern">Interior designers</Link>
          <Link href="/blog">Design Blog</Link>
        </div>

        <div className="footer-col">
          <h4>For Professionals</h4>
          <Link href="/pro-signup">List your work</Link>
          <Link href="/auth">Sign in</Link>
          <Link href="/pro-dashboard">Dashboard</Link>
          <Link href="/faq">FAQ</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>

      <div className="footer-btm">
        <p>© {new Date().getFullYear()} Homeizz. All rights reserved. Made with ❤️ in India.</p>
        <div className="fbadges">
          <span className="fbadge">🇮🇳 Made in India</span>
          <span className="fbadge">🔒 Razorpay Secure</span>
        </div>
      </div>
    </footer>
  );
}