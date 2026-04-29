import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'FAQ | Homeizz',
  description: 'Frequently asked questions about Homeizz.',
};

const FAQS = [
  {
    q: 'What is Homeizz?',
    a: 'Homeizz is India\'s home design marketplace. We connect homeowners with verified architects, interior designers, and home plan experts across India.'
  },
  {
    q: 'Is Homeizz free for homeowners?',
    a: 'Yes! Homeizz is completely free for homeowners. Browse listings, send enquiries, and connect with professionals at no cost.'
  },
  {
    q: 'How do I find a designer in my city?',
    a: 'Go to Browse page and filter by your city. You can also filter by style, type, and budget to find the perfect match.'
  },
  {
    q: 'How are professionals verified?',
    a: 'All professionals on Homeizz provide their PAN or GST details during signup. We verify their credentials and review their portfolio before they go live on the platform.'
  },
  {
    q: 'How much does it cost for professionals to list?',
    a: 'Professionals get a 90-day free trial — no credit card needed. After that, three plans: Starter at ₹499/mo (3 listings, basics), Growth at ₹1,499/mo (10 listings + WhatsApp alerts + priority placement + analytics — most popular), and Pro at ₹3,999/mo (25 listings + featured on home page + custom firm landing page + dedicated manager). Annual billing saves you 2 months on every plan. No commission on projects you close.'
  },
  {
    q: 'Can I cancel my professional subscription?',
    a: 'Yes, you can cancel anytime from your dashboard. Your listing will remain active until the end of the current billing period.'
  },
  {
    q: 'How do enquiries work?',
    a: 'When you send an enquiry to a professional, they receive an email notification with your details. They can then contact you directly to discuss your project.'
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We use industry-standard encryption and never share your personal data with third parties. Read our Privacy Policy for details.'
  },
  {
    q: 'How do I sign in with Google?',
    a: 'On the sign in page, click "Continue with Google" and select your Google account. Your account will be created automatically.'
  },
  {
    q: 'How do I contact Homeizz support?',
    a: 'Email us at hello@homeizz.in or reach us on Instagram @homeizz.in. We typically respond within 24 hours.'
  },
];

export default function FAQPage() {
  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <div style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'var(--tl)',marginBottom:12}}>Help Center</div>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Frequently Asked<br/><em style={{color:'var(--tl)'}}>Questions</em></h1>
            <p style={{color:'rgba(255,255,255,.55)',fontSize:'.95rem'}}>Everything you need to know about Homeizz</p>
          </div>
        </div>
        <div style={{maxWidth:800,margin:'0 auto',padding:'48px 44px 80px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {FAQS.map((faq,i)=>(
              <div key={i} style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.1rem',marginBottom:10}}>{faq.q}</h3>
                <p style={{color:'var(--tm)',fontSize:'.9rem',lineHeight:1.75,margin:0}}>{faq.a}</p>
              </div>
            ))}
          </div>

          <div style={{marginTop:40,background:'var(--b)',borderRadius:16,padding:'28px',textAlign:'center'}}>
            <h3 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:8}}>Still have questions?</h3>
            <p style={{color:'rgba(255,255,255,.55)',fontSize:'.88rem',marginBottom:16}}>We're here to help!</p>
            <a href="mailto:hello@homeizz.in" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',background:'var(--t)',color:'#fff',borderRadius:50,fontWeight:700,textDecoration:'none',fontSize:'.88rem'}}>
              📧 Contact Us
            </a>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}