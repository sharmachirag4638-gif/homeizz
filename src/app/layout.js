import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeizz.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Homeizz – India's Home Design Marketplace",
    template: '%s | Homeizz',
  },
  description:
    "Homeizz is India's home design marketplace. Discover verified architects, interior designers, and ready-to-build home plans across India.",
  keywords: [
    'home design India', 'architects India', 'interior designers',
    'house plans', 'home renovation', 'vastu', '3BHK design',
    'modular kitchen', 'Homeizz',
  ],
  authors: [{ name: 'Homeizz' }],
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Homeizz',
    title: "Homeizz – India's Home Design Marketplace",
    description:
      'Discover verified architects, interior designers, and ready-to-build home plans across India.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Homeizz – India's Home Design Marketplace",
    description: 'Verified architects, interior designers, and home plans across India.',
    images: ['/og-image.jpg'],
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
      logo: `${SITE_URL}/logo.png`,
      description:
        "India's home design marketplace connecting homeowners with verified architects, interior designers, and ready-to-build home plans.",
      areaServed: { '@type': 'Country', name: 'India' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Homeizz',
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
      <body>{children}</body>
    </html>
  );
}
