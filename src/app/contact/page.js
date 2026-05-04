import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Contact | Homeizz',
  description: 'Get in touch with the Homeizz team.',
};

const CHANNELS = [
  {
    icon: '✉️',
    title: 'Email',
    value: 'hello@homeizz.in',
    href: 'mailto:hello@homeizz.in',
    note: 'Best for general questions and partnerships. We reply within one business day.',
  },
  {
    icon: '🛠️',
    title: 'Support',
    value: 'support@homeizz.in',
    href: 'mailto:support@homeizz.in',
    note: 'Account, billing, or listing problems. Include your registered email so we can find you faster.',
  },
  {
    icon: '🏢',
    title: 'Office',
    value: 'Bengaluru, India',
    href: null,
    note: 'We are a small remote team based out of Bengaluru. Visits by appointment only.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Contact us</h1>
            <p style={{color:'rgba(255,255,255,.55)',maxWidth:560,lineHeight:1.6}}>
              Questions, feedback, or a partnership idea? Pick the channel that fits.
            </p>
          </div>
        </div>
        <div style={{maxWidth:800,margin:'0 auto',padding:'48px 44px 80px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:16}}>
            {CHANNELS.map(c => (
              <div key={c.title} style={{background:'#fff',borderRadius:16,padding:'24px 28px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',display:'flex',gap:18,alignItems:'flex-start'}}>
                <div style={{fontSize:'1.8rem',lineHeight:1,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.1rem',marginBottom:4}}>{c.title}</div>
                  {c.href
                    ? <a href={c.href} style={{color:'var(--t)',fontWeight:600,fontSize:'.95rem',textDecoration:'none'}}>{c.value}</a>
                    : <div style={{color:'var(--b)',fontWeight:600,fontSize:'.95rem'}}>{c.value}</div>
                  }
                  <p style={{color:'var(--tm)',lineHeight:1.7,fontSize:'.9rem',marginTop:8}}>{c.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:32,background:'#fff',borderRadius:16,padding:'24px 28px',border:'1.5px solid var(--borderl)'}}>
            <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.05rem',marginBottom:8}}>Looking for something specific?</h2>
            <ul style={{margin:0,paddingLeft:18,color:'var(--tm)',lineHeight:1.9,fontSize:'.92rem'}}>
              <li>Refunds and cancellations: see our <a href="/refund" style={{color:'var(--t)',fontWeight:600}}>Refund Policy</a>.</li>
              <li>How we handle your data: see our <a href="/privacy" style={{color:'var(--t)',fontWeight:600}}>Privacy Policy</a>.</li>
              <li>Platform rules: see our <a href="/terms" style={{color:'var(--t)',fontWeight:600}}>Terms of Service</a>.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
