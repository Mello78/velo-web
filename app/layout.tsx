import type { Metadata } from 'next'
import './globals.css'
import SplashLoader from '../components/SplashLoader'

export const metadata: Metadata = {
  title: {
    default: 'VELO - Wedding Planner Italia',
    template: '%s | VELO Wedding',
  },
  description: 'VELO is the wedding planning platform for couples getting married in Italy, with dashboard, documents guidance, checklist, vendors, guests, and budget in one place.',
  keywords: [
    'wedding planner Italia',
    'matrimonio Italia',
    'wedding planning platform Italy',
    'couple area wedding planning',
    'wedding dashboard',
    'wedding checklist Italy',
    'wedding budget planner',
    'wedding guests planner',
    'wedding documents Italy',
    'fornitori matrimonio',
    'fotografi matrimonio Toscana',
    'location matrimonio Firenze',
    'location matrimonio Roma',
    'catering matrimonio Amalfi',
    'fioristi matrimonio Lago di Como',
    'wedding planner Puglia',
    'destination wedding Italy',
    'sposi stranieri Italia',
    'matrimonio Umbria',
    'wedding photographer Italy',
    'villa matrimonio Toscana',
    'masseria matrimonio Puglia',
    'velowedding',
    'velo wedding',
    'pianificare matrimonio',
  ],
  authors: [{ name: 'VELO Wedding', url: 'https://velowedding.it' }],
  metadataBase: new URL('https://velowedding.it'),
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon_180.png',
  },
  openGraph: {
    title: 'VELO - Wedding Planner Italia',
    description: 'Plan your wedding in Italy with dashboard, documents guidance, checklist, vendors, guests, and budget in one platform.',
    url: 'https://velowedding.it',
    siteName: 'VELO Wedding',
    locale: 'it_IT',
    type: 'website',
    images: [{ url: '/logo_velo.png', width: 1200, height: 630, alt: 'VELO Wedding' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VELO - Wedding Planner Italia',
    description: 'The VELO platform for planning a wedding in Italy.',
    images: ['/logo_velo.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SplashLoader />
        {children}
      </body>
    </html>
  )
}
