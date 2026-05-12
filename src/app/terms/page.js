import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Homeizz',
  description: 'Terms of service for Homeizz.',
};

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By creating an account or using Homeizz, you agree to these Terms of Service. If you do not agree, please do not use the platform.' },
  { title: '2. Who Can Use Homeizz', content: 'Homeizz is open to homeowners looking for design services and to verified design professionals (architects, interior designers, firms) operating in India. You must be 18 or older.' },
  { title: '3. Professional Listings', content: 'Professionals are responsible for the accuracy of their listings and profile information. Misrepresentation, plagiarised photos, or fraudulent profiles will result in account termination without refund.' },
  { title: '4. Subscriptions and Payments', content: 'Professional plans are billed monthly or annually via Razorpay. Paid subscriptions renew until cancelled. You can cancel anytime from your dashboard; cancellation takes effect at the end of the current billing period.' },
  { title: '5. Refunds', content: 'See our Refund Policy at /refund for details. In short: we offer pro-rated refunds in limited cases described there.' },
  { title: '6. Enquiries and Direct Dealings', content: 'Homeizz connects homeowners with professionals but is not a party to any project agreement between them. We do not handle project payments and we do not take a commission. Disputes between homeowners and professionals must be resolved between the parties.' },
  { title: '7. Acceptable Use', content: 'No spam, harassment, or unlawful content. No scraping or automated access. No reselling of homeowner enquiries. We may suspend any account that violates this policy.' },
  { title: '8. Intellectual Property', content: 'You retain ownership of content you upload (photos, descriptions). By uploading, you grant Homeizz a non-exclusive licence to display that content on the platform and in marketing material that promotes the platform.' },
  { title: '9. Liability', content: 'Homeizz is provided "as is". We are not liable for indirect or consequential damages arising from your use of the platform or from any project relationship formed through it.' },
  { title: '10. Changes', content: 'We may update these terms from time to time. Material changes will be notified via email at least 14 days before they take effect.' },
  { title: '11. Governing Law', content: 'These terms are governed by the laws of India. Disputes will be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.' },
  { title: '12. Contact', content: 'Questions about these terms: hello@homeizz.in' },
];

export default function TermsPage() {
  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Terms of Service</h1>
            <p style={{color:'rgba(255,255,255,.55)'}}>Last updated: April 2026</p>
          </div>
        </div>
        <div style={{maxWidth:800,margin:'0 auto',padding:'48px 44px 80px'}}>
          <div style={{background:'#fff',borderRadius:20,padding:'40px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
            {SECTIONS.map(section=>(
              <div key={section.title} style={{marginBottom:28}}>
                <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.2rem',marginBottom:10}}>{section.title}</h2>
                <p style={{color:'var(--tm)',lineHeight:1.8,fontSize:'.92rem'}}>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
