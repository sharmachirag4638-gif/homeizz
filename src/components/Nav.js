import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" aria-label="Homeizz home">
        Home<span>izz</span>
      </Link>
      <div className="nav-links">
        <Link href="/browse" className="nl">Browse</Link>
        <Link href="/architects/bangalore/modern" className="nl">Architects</Link>
        <Link href="/interior-designer/bangalore/modular-kitchen" className="nl">Interior</Link>
        <Link href="/list" className="nl">List your work</Link>
        <Link href="/auth" className="nl nl-cta">Sign in</Link>
      </div>
    </nav>
  );
}
