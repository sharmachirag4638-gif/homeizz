import './globals.css';
import Script from 'next/script';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;
const OG_IMAGE = 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=630&fit=crop&q=80';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Homeizz - Architects & Interior Designers in India',
    template: '%s | Homeizz',
  },
  description:
    'Find verified architects, interior designers, modular kitchen experts, and ready-to-build home plans across India. Compare portfolios and request quotes on Homeizz.',
  keywords: [
    'architects in India',
    'interior designers in India',
    'home design marketplace',
    'house plans India',
    'modular kitchen designers',
    'home renovation India',
    'vastu home design',
    '3BHK interior design',
    'Homeizz',
  ],
  authors: [{ name: 'Homeizz' }],
  creator: 'Homeizz',
  publisher: 'Homeizz',
  category: 'Home Design',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : undefined,
  openGraph: {
    type: 'website',
    siteName: 'Homeizz',
    title: 'Homeizz - Architects & Interior Designers in India',
    description:
      'Discover verified architects, interior designers, modular kitchen experts, and home plans across India.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Modern Indian home design inspiration' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Homeizz - Architects & Interior Designers in India',
    description: 'Verified architects, interior designers, and home plans across India.',
    images: [OG_IMAGE],
  },
};

export const viewport = {
  themeColor: '#FAF6F0',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Homeizz',
      url: SITE_URL,
      logo: absoluteUrl('/favicon.svg'),
      description:
        "India's home design marketplace connecting homeowners with verified architects, interior designers, and ready-to-build home plans.",
      areaServed: { '@type': 'Country', name: 'India' },
      sameAs: ['https://instagram.com/homeizz.in'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Homeizz',
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/browse?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Preconnect (Next injects font links, but these speed up Razorpay checkout too) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
