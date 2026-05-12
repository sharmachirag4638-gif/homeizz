// Single source of truth for plan data — used by pricing page,
// pro-signup, pro-dashboard, and brochure copy.

export const STARTER_FEATURES = [
  '3 listings',
  'Visible for 60 days',
  'Verified profile badge',
  'Direct enquiries (no commission)',
  'Email notifications',
  'City + style tagging',
];

export const GROWTH_FEATURES = [
  '10 listings',
  'Visible for 150 days',
  'Everything in Starter',
  'WhatsApp enquiry alerts',
  'Priority placement in city pages',
  'Detailed enquiry analytics',
  'Email + WhatsApp support',
];

export const PRO_FEATURES = [
  '25 listings',
  'Visible for 6 months',
  'Everything in Growth',
  'Featured on Homeizz home page',
  'Custom firm landing page',
  'Dedicated account manager',
];

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 499,
    annual: 4990,
    annualMonthly: 416,
    listings: 3,
    visibility: '60 days',
    color: '#6B7F5E',
    popular: false,
    tagline: 'For solo architects starting out.',
    features: STARTER_FEATURES,
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 1499,
    annual: 14990,
    annualMonthly: 1249,
    listings: 10,
    visibility: '150 days',
    color: '#C4622D',
    popular: true,
    tagline: 'Most architects pick this.',
    features: GROWTH_FEATURES,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 3999,
    annual: 39990,
    annualMonthly: 3333,
    listings: 25,
    visibility: '6 months',
    color: '#B8860B',
    popular: false,
    tagline: 'For established firms.',
    features: PRO_FEATURES,
  },
];

export const LAUNCH_OFFER_LIMIT = 100;
