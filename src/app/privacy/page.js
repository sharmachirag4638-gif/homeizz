import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Homeizz',
  description: 'How Homeizz handles your data.',
};

const SECTIONS = [
  { title: '1. Information We Collect', content: 'We collect information you provide when registering, including name, email, phone number, and professional details. We also collect usage data to improve our platform.' },
  { title: '2. How We Use Your Information', content: 'Your information is used to provide and improve our services, send notifications about enquiries, process payments, and communicate important updates about your account.' },
  { title: '3. Data Sharing', content: 'We do not sell your personal data. We share limited information with service providers like Razorpay for payments and Resend for email notifications. These providers are bound by strict data protection agreements.' },
  { title: '4. Data Security', content: 'We use industry-standard encryption and security practices. Your data is stored securely on Supabase servers with row-level security policies in place.' },
  { title: '5. Cookies', content: 'We use essential cookies to keep you logged in and improve your experience. We do not use advertising cookies or tracking pixels.' },
  { title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. Contact us at hello@homeizz.in to exercise these rights.' },
  { title: '7. Contact', content: 'For privacy concerns, contact our team at hello@homeizz.in' },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Privacy Policy</h1>
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
