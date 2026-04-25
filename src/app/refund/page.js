import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Refund Policy | Homeizz',
  description: 'Refund and cancellation policy for Homeizz.',
};

export default function RefundPage() {
  return (
    <>
      <Nav/>
      <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
        <div style={{background:'var(--b)',padding:'60px 44px'}}>
          <div style={{maxWidth:800,margin:'0 auto'}}>
            <h1 style={{fontFamily:'var(--fd)',color:'#fff',marginBottom:12}}>Refund Policy</h1>
            <p style={{color:'rgba(255,255,255,.55)'}}>Last updated: April 2026</p>
          </div>
        </div>
        <div style={{maxWidth:800,margin:'0 auto',padding:'48px 44px 80px'}}>
          <div style={{background:'#fff',borderRadius:20,padding:'40px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
            {[
              {title:'1. Free Trial',content:'All new professional accounts receive a 3-month free trial. No payment is required during the trial period. You can cancel anytime during the trial without any charges.'},
              {title:'2. Subscription Cancellation',content:'You can cancel your subscription at any time from your dashboard. Your listing will remain active until the end of the current billing period. No refunds are provided for the remaining days of the current billing period.'},
              {title:'3. Refund Eligibility',content:'Refunds are only considered in the following cases: double charges due to technical errors, charges after a confirmed cancellation, or unauthorized transactions. All refund requests must be submitted within 7 days of the charge.'},
              {title:'4. How to Request a Refund',content:'To request a refund, email us at hello@homeizz.in with your registered email address, transaction ID, and reason for the refund. We will review and respond within 3-5 business days.'},
              {title:'5. Refund Processing',content:'Approved refunds will be processed within 5-7 business days and credited back to the original payment method. The actual time may vary depending on your bank or card issuer.'},
              {title:'6. Contact',content:'For refund queries, contact us at hello@homeizz.in'},
            ].map(section=>(
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