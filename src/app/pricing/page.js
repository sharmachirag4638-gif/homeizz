import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing — Plans for Architects & Interior Designers',
  description:
    "Simple plans for India's architects and interior designers. Starter ₹499/mo, Growth ₹1,499/mo, Pro ₹3,999/mo. No commission on projects.",
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Homeizz Pricing — Plans for Architects & Designers',
    description:
      'Plans from ₹499/mo. No commission on projects you close.',
  },
};

export default function PricingPage() {
  return (
    <>
      <Nav />
      <PricingClient />
      <Footer />
    </>
  );
}
