import Link from 'next/link';

// Reusable inline styles for prose content
const proseStyle = {
  color: 'var(--tm)',
  fontSize: '1.05rem',
  lineHeight: 1.85,
};
const h2Style = {
  fontFamily: 'var(--fd)',
  color: 'var(--b)',
  fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
  fontWeight: 600,
  marginTop: 44,
  marginBottom: 18,
  lineHeight: 1.2,
  letterSpacing: '-0.2px',
};
const h3Style = {
  fontFamily: 'var(--fd)',
  color: 'var(--b)',
  fontSize: '1.2rem',
  fontWeight: 600,
  marginTop: 28,
  marginBottom: 10,
};
const pStyle = { ...proseStyle, marginBottom: 18 };
const ulStyle = { ...proseStyle, marginBottom: 18, paddingLeft: 22 };
const liStyle = { marginBottom: 8, lineHeight: 1.7 };
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: 24,
  fontSize: '.95rem',
  background: '#fff',
  border: '1.5px solid var(--borderl)',
  borderRadius: 12,
  overflow: 'hidden',
};
const thStyle = {
  background: 'var(--tpp)',
  color: 'var(--b)',
  fontWeight: 700,
  fontSize: '.85rem',
  textAlign: 'left',
  padding: '14px 16px',
  borderBottom: '1.5px solid var(--borderl)',
};
const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--borderl)',
  color: 'var(--tm)',
  verticalAlign: 'top',
};
const calloutStyle = {
  background: 'var(--tpp)',
  borderLeft: '3px solid var(--t)',
  padding: '16px 20px',
  borderRadius: '0 10px 10px 0',
  marginBottom: 24,
  color: 'var(--tm)',
  fontSize: '1rem',
  lineHeight: 1.7,
};
const linkStyle = { color: 'var(--t)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 };

export const meta = {
  slug: 'interior-design-cost-india',
  title: 'How Much Does Home Interior Design Cost in India 2026?',
  excerpt: 'A complete breakdown of interior design costs across India in 2026 — by BHK, by city, by style. Real numbers, hidden costs, and how to save without cutting corners.',
  category: 'Cost Guide',
  time: '9 min read',
  publishedAt: '2026-04-29',
  img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
  keywords: [
    'interior design cost india',
    'home interior cost',
    '2bhk interior cost',
    '3bhk interior cost',
    'interior design budget india',
    'modular kitchen cost',
    'home renovation cost india',
  ],
  faqs: [
    {
      q: 'How much does interior design cost for a 2BHK in India?',
      a: 'For a typical 900 sqft 2BHK in 2026, expect ₹4–8 lakh for a basic interior, ₹8–18 lakh for mid-range, and ₹18 lakh+ for premium. Mumbai and Delhi sit at the top of these ranges; tier-2 cities at the bottom.',
    },
    {
      q: 'What is the cheapest way to do interior design in India?',
      a: 'Stick to modular furniture from established brands, skip false ceilings (use accent paint instead), choose vitrified tiles over wood flooring, and handle execution oversight yourself. You can do a functional 2BHK in ₹3.5–5 lakh.',
    },
    {
      q: 'Do interior designers charge per square foot or as a percentage?',
      a: 'Most charge per square foot (₹100–1,000/sqft based on tier). Larger and luxury projects often shift to percentage models (10–15% of total project value). Some offer flat fees for design-only work.',
    },
    {
      q: 'Is GST applicable on interior design services?',
      a: 'Yes, 18% GST applies to most interior services and materials. Always confirm whether quotes include or exclude GST — that single line can swing your budget by ₹2–5 lakh.',
    },
    {
      q: 'How long does a typical interior design project take in India?',
      a: 'A 2–3BHK takes 8–14 weeks from final design approval to handover. Add 2–3 weeks for design and approvals, plus delays for custom items. Plan for 4 months end-to-end.',
    },
    {
      q: 'Should I pay the designer fee upfront?',
      a: 'No. Standard practice is 10% on signing, 30% on design approval, 30% at midway execution, 20% near completion, 10% on final handover. Avoid anyone asking for 50%+ upfront.',
    },
  ],
  related: ['top-interior-designers-mumbai', 'modern-vs-minimalist', 'questions-ask-interior-designer'],
};

export default function CostGuideBody() {
  return (
    <article>
      <p style={pStyle}>
        If you&apos;re planning to design or renovate your home in India and you&apos;re tired of vague quotes, this guide gives you the actual numbers — by apartment size, by city, and by style. We&apos;ll cover what&apos;s included, what&apos;s hidden, and how to save without cutting corners that you&apos;ll regret.
      </p>

      <h2 style={h2Style} id="quick-answer">The quick answer</h2>
      <p style={pStyle}>If you&apos;re short on time, here&apos;s the bottom line for typical Indian metros in 2026:</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Apartment size</th>
            <th style={thStyle}>Basic</th>
            <th style={thStyle}>Mid-range</th>
            <th style={thStyle}>Premium / Luxury</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><strong>1BHK</strong> (~600 sqft)</td>
            <td style={tdStyle}>₹3–6 lakh</td>
            <td style={tdStyle}>₹6–12 lakh</td>
            <td style={tdStyle}>₹12–25 lakh+</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>2BHK</strong> (~900 sqft)</td>
            <td style={tdStyle}>₹4–8 lakh</td>
            <td style={tdStyle}>₹8–18 lakh</td>
            <td style={tdStyle}>₹18–35 lakh+</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>3BHK</strong> (~1,500 sqft)</td>
            <td style={tdStyle}>₹6–14 lakh</td>
            <td style={tdStyle}>₹14–28 lakh</td>
            <td style={tdStyle}>₹28–60 lakh+</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>4BHK / Villa</strong></td>
            <td style={tdStyle}>₹12–25 lakh</td>
            <td style={tdStyle}>₹25–50 lakh</td>
            <td style={tdStyle}>₹50 lakh – ₹1 crore+</td>
          </tr>
        </tbody>
      </table>

      <p style={pStyle}><strong>Per-square-foot pricing:</strong></p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Basic:</strong> ₹800–₹1,500/sqft</li>
        <li style={liStyle}><strong>Mid-range:</strong> ₹1,500–₹3,500/sqft</li>
        <li style={liStyle}><strong>Premium:</strong> ₹3,500–₹6,500/sqft</li>
        <li style={liStyle}><strong>Luxury:</strong> ₹6,500/sqft and above</li>
      </ul>

      <div style={calloutStyle}>
        <strong>Heads up:</strong> Costs in Mumbai, Delhi, and Bangalore typically run 15–25% higher than the all-India average. Skip ahead to the <a href="#cost-by-city" style={linkStyle}>city-by-city breakdown</a> if that&apos;s what you came for.
      </div>

      <h2 style={h2Style}>What&apos;s actually included in the cost?</h2>
      <p style={pStyle}>When a designer quotes you a number, here&apos;s what they&apos;re typically pricing in:</p>

      <h3 style={h3Style}>Hard costs — the stuff that goes into your home</h3>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Furniture and furnishings</strong> — sofas, beds, dining tables, wardrobes (custom-built or branded)</li>
        <li style={liStyle}><strong>Modular kitchen</strong> — biggest single cost item; ₹1.5–8 lakh depending on finish</li>
        <li style={liStyle}><strong>False ceiling and lighting</strong> — ₹100–₹250/sqft for ceiling alone</li>
        <li style={liStyle}><strong>Flooring</strong> — vitrified tiles (cheapest), engineered wood, marble (premium)</li>
        <li style={liStyle}><strong>Bathroom fittings</strong> — sanitaryware, taps, showers, accessories</li>
        <li style={liStyle}><strong>Wall treatments</strong> — paint, wallpaper, paneling, or texture finish</li>
        <li style={liStyle}><strong>Electrical work</strong> — switches, sockets, smart automation</li>
        <li style={liStyle}><strong>Civil and minor masonry</strong> — small wall changes, re-routing pipes</li>
      </ul>

      <h3 style={h3Style}>Soft costs — what you pay the designer for</h3>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Designer fees</strong> — usually 10–15% of project value, or per-sqft</li>
        <li style={liStyle}><strong>3D renderings</strong> before execution begins</li>
        <li style={liStyle}><strong>Site supervision</strong> during execution</li>
        <li style={liStyle}><strong>Project management</strong> — vendor coordination, deliveries, change orders</li>
      </ul>
      <p style={pStyle}>The split is roughly 80% hard costs, 20% designer + management. A solid designer earns that 20% by saving you from disasters — wrong measurements, mismatched finishes, missed deadlines, and the carpenter who disappears mid-project.</p>

      <h2 style={h2Style} id="cost-by-city">Cost by city</h2>
      <p style={pStyle}>The same 3BHK costs very different amounts depending on where you are. Here&apos;s why:</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Typical 3BHK (mid-range)</th>
            <th style={thStyle}>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><strong>Mumbai</strong></td>
            <td style={tdStyle}>₹18–32 lakh</td>
            <td style={tdStyle}>Highest labor + material premiums in India</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Bangalore</strong></td>
            <td style={tdStyle}>₹16–28 lakh</td>
            <td style={tdStyle}>Tech-driven; slightly below Mumbai</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Delhi NCR</strong></td>
            <td style={tdStyle}>₹17–30 lakh</td>
            <td style={tdStyle}>High variance — Gurgaon premium, Noida cheaper</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Pune</strong></td>
            <td style={tdStyle}>₹14–25 lakh</td>
            <td style={tdStyle}>Good value relative to Mumbai</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Hyderabad</strong></td>
            <td style={tdStyle}>₹13–23 lakh</td>
            <td style={tdStyle}>Lowest of metros — cheaper labor</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Chennai</strong></td>
            <td style={tdStyle}>₹14–24 lakh</td>
            <td style={tdStyle}>Strong traditional segment increases custom work cost</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Kolkata</strong></td>
            <td style={tdStyle}>₹12–22 lakh</td>
            <td style={tdStyle}>Heritage homes increase complexity</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Ahmedabad</strong></td>
            <td style={tdStyle}>₹11–20 lakh</td>
            <td style={tdStyle}>Material costs lower</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>Tier-2 cities</strong></td>
            <td style={tdStyle}>₹8–16 lakh</td>
            <td style={tdStyle}>25–35% below tier-1 average</td>
          </tr>
        </tbody>
      </table>

      <p style={pStyle}>
        Looking for an architect or designer in a specific city? See verified options in{' '}
        <Link href="/architects/mumbai/modern" style={linkStyle}>Mumbai</Link>,{' '}
        <Link href="/architects/bangalore/modern" style={linkStyle}>Bangalore</Link>,{' '}
        <Link href="/architects/delhi/modern" style={linkStyle}>Delhi</Link>, and{' '}
        <Link href="/browse" style={linkStyle}>25+ other Indian cities</Link>.
      </p>

      <h2 style={h2Style}>Cost by design style</h2>
      <p style={pStyle}>Style choice can swing your budget by 50% or more:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Modern / Contemporary</strong> — baseline cost. Clean lines, mass-produced finishes, fast execution.</li>
        <li style={liStyle}><strong>Minimalist</strong> — slightly below baseline (less material, but premium minimal finishes can add up).</li>
        <li style={liStyle}><strong>Traditional Indian / Heritage</strong> — adds 15–30%. Custom carpentry, hand-finished wood, brass fittings.</li>
        <li style={liStyle}><strong>Vastu-compliant</strong> — usually +5–10% only. Mostly layout-driven, not material-driven.</li>
        <li style={liStyle}><strong>Luxury</strong> — adds 50–100%+. Marble, imported finishes, designer fixtures, smart home automation.</li>
        <li style={liStyle}><strong>Industrial / Loft</strong> — close to baseline, but exposed elements demand quality execution.</li>
      </ul>

      <h2 style={h2Style}>Hidden costs nobody warns you about</h2>
      <p style={pStyle}>This is where homeowners get surprised. Budget for these from day one:</p>
      <ol style={ulStyle}>
        <li style={liStyle}><strong>GST (18%).</strong> Yes, it applies to most interior services and materials. A ₹20 lakh quote may actually mean ₹23.6 lakh.</li>
        <li style={liStyle}><strong>Civil work and demolition.</strong> Moving walls, breaking false ceilings, or extending plumbing is quoted separately. Typical: ₹50,000–3 lakh.</li>
        <li style={liStyle}><strong>Vendor markup.</strong> Designers often work with preferred vendors and may add 10–20% markup. Ask if there&apos;s a &quot;client direct billing&quot; option.</li>
        <li style={liStyle}><strong>Site supervision.</strong> Some firms quote design-only and charge extra for execution oversight. Confirm if it&apos;s bundled.</li>
        <li style={liStyle}><strong>Painting beyond the original quote.</strong> Texture finishes, premium brands, or multiple coats add up.</li>
        <li style={liStyle}><strong>Storage and waste removal.</strong> Especially in Mumbai and Bangalore where space is tight.</li>
        <li style={liStyle}><strong>Curtains, blinds, art, accessories.</strong> Often NOT in the base quote. Budget another 5–8% for the &quot;soft styling&quot; layer.</li>
      </ol>

      <div style={calloutStyle}>
        <strong>Pro tip:</strong> Always ask for a line-item quote with GST included. Vague &quot;lump sum&quot; quotes are where overruns hide.
      </div>

      <h2 style={h2Style}>How designers charge their fees</h2>
      <p style={pStyle}>Three common models — make sure you understand which one your designer uses:</p>

      <h3 style={h3Style}>1. Per square foot (~70% of designers)</h3>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Basic:</strong> ₹100–₹250/sqft</li>
        <li style={liStyle}><strong>Mid-range:</strong> ₹250–₹500/sqft</li>
        <li style={liStyle}><strong>Premium:</strong> ₹500–₹1,000/sqft</li>
      </ul>
      <p style={pStyle}>For a 1,500 sqft 3BHK at mid-range: ₹3.75–7.5 lakh in designer fees alone.</p>

      <h3 style={h3Style}>2. Percentage of project value (10–15%)</h3>
      <p style={pStyle}>Common for large or luxury projects. A ₹30 lakh project = ₹3–4.5 lakh in designer fees. Better for clients who want flexibility on materials.</p>

      <h3 style={h3Style}>3. Flat fee for design-only</h3>
      <p style={pStyle}>₹25,000–₹2 lakh for design + 3D + working drawings only. You handle execution yourself. Suits homeowners who want to oversee the work.</p>

      <p style={pStyle}>Get quotes in at least 2 models if you can — sometimes per-sqft is cheaper for small homes, percentage for large ones.</p>

      <h2 style={h2Style}>Real example: A 3BHK in Bangalore (1,500 sqft, mid-range)</h2>
      <p style={pStyle}>Here&apos;s what a typical mid-range 3BHK budget actually looks like in Bangalore in 2026:</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Item</th>
            <th style={thStyle}>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdStyle}>Modular kitchen (mid-tier laminate finish)</td><td style={tdStyle}>₹3.5 lakh</td></tr>
          <tr><td style={tdStyle}>Wardrobes (3 bedrooms, full-height)</td><td style={tdStyle}>₹4 lakh</td></tr>
          <tr><td style={tdStyle}>Beds + side tables (3 bedrooms)</td><td style={tdStyle}>₹2.5 lakh</td></tr>
          <tr><td style={tdStyle}>Sofa, dining, TV unit (living + dining)</td><td style={tdStyle}>₹3 lakh</td></tr>
          <tr><td style={tdStyle}>False ceiling + lighting</td><td style={tdStyle}>₹2.2 lakh</td></tr>
          <tr><td style={tdStyle}>Flooring (engineered wood + tiles)</td><td style={tdStyle}>₹2.5 lakh</td></tr>
          <tr><td style={tdStyle}>Bathroom fittings + tile upgrade</td><td style={tdStyle}>₹1.5 lakh</td></tr>
          <tr><td style={tdStyle}>Painting (premium emulsion, full home)</td><td style={tdStyle}>₹80,000</td></tr>
          <tr><td style={tdStyle}>Curtains + blinds</td><td style={tdStyle}>₹70,000</td></tr>
          <tr><td style={tdStyle}>Designer fee (~15% of project)</td><td style={tdStyle}>₹3 lakh</td></tr>
          <tr><td style={tdStyle}>GST (18% on services portion)</td><td style={tdStyle}>~₹1.8 lakh</td></tr>
          <tr style={{background:'var(--tpp)'}}><td style={{...tdStyle,fontWeight:700,color:'var(--b)'}}>Total</td><td style={{...tdStyle,fontWeight:700,color:'var(--t)',fontSize:'1.05rem'}}>~₹25.6 lakh</td></tr>
        </tbody>
      </table>

      <p style={pStyle}>This gets you a beautiful, functional, fully-finished home with branded fixtures. You could cut to ₹14–16 lakh on a tight budget, or go to ₹40 lakh+ for premium finishes.</p>

      <h2 style={h2Style}>3 ways to save without compromising</h2>
      <p style={pStyle}><strong>1. Mix premium and budget zones.</strong> Splurge where it matters (kitchen, master bedroom, living room), save on second bedrooms and storage areas. Most homeowners don&apos;t notice the difference in low-traffic spaces.</p>
      <p style={pStyle}><strong>2. Buy direct from vendors for high-ticket items.</strong> Modular kitchens, wardrobes, sofas — get quotes from 3 vendors directly. Your designer&apos;s preferred vendor isn&apos;t always the cheapest.</p>
      <p style={pStyle}><strong>3. Phase your project.</strong> Do the structural and built-in work (kitchen, wardrobes, false ceiling) first, then add furniture and accessories over 3–6 months. Reduces upfront pressure.</p>

      <p style={pStyle}><strong>What NOT to skimp on:</strong> electrical work, plumbing, waterproofing, and load-bearing items. Fixing these later costs 3–5× more than doing them right.</p>

      <h2 style={h2Style}>How to actually find the right designer</h2>
      <p style={pStyle}>Here&apos;s what works:</p>
      <ol style={ulStyle}>
        <li style={liStyle}><strong>Shortlist 3 designers</strong> who match your style, your city, and your budget tier.</li>
        <li style={liStyle}><strong>Ask for line-item quotes with GST</strong> — the only way to do apples-to-apples comparison.</li>
        <li style={liStyle}><strong>Check 2 client references in person</strong> — not just photos on Instagram.</li>
        <li style={liStyle}><strong>Verify their execution team.</strong> They should have actual carpenters, electricians, painters — not subcontractors of subcontractors.</li>
        <li style={liStyle}><strong>Sign a contract</strong> with milestones, payment schedule, and a clear change-order policy.</li>
      </ol>

      <p style={pStyle}>This is exactly what <Link href="/" style={linkStyle}>Homeizz</Link> is built for — discover verified designers in your city, see their real portfolios, send enquiries to multiple firms in two minutes, and compare quotes side-by-side. No spam, no resold leads, no commission on what you build.</p>
    </article>
  );
}
