import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-g">
        <div className="footer-brand">
          <div className="footer-logo">Home<span>izz</span></div>
          <p>India's home design marketplace — architects, interior designers, and ready-to-build home plans.</p>
        </div>
        <div className="footer-col">
          <h4>Discover</h4>
          <Link href="/browse">Browse listings</Link>
          <Link href="/architects/bangalore/modern">Architects</Link>
          <Link href="/interior-designer/mumbai/modular-kitchen">Interior designers</Link>
          <Link href="/architects/jaipur/vastu-compliant">Vastu-compliant</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/refund">Refund Policy</Link>
        </div>
      </div>
      <div className="footer-btm">
        <p>© {new Date().getFullYear()} Homeizz Technologies Pvt Ltd. All rights reserved.</p>
        <div className="fbadges">
          <span className="fbadge">Made in India</span>
          <span className="fbadge">Razorpay Secure</span>
        </div>
      </div>
    </footer>
  );
}
