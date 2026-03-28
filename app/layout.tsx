import type { Metadata } from 'next'
import './globals.css'
import SplashLoader from '../components/SplashLoader'

export const metadata: Metadata = {
  title: {
    default: 'VELO — Wedding Planner Italia',
    template: '%s | VELO Wedding',
  },
  description: 'VELO è il wedding planner digitale per matrimoni in Italia. Trova fotografi, fioristi, location e catering in Toscana, Amalfi Coast, Lago di Como, Roma, Puglia e in tutta Italia.',
  keywords: [
    'wedding planner Italia', 'matrimonio Italia', 'fornitori matrimonio',
    'fotografi matrimonio Toscana', 'location matrimonio Firenze', 'location matrimonio Roma',
    'catering matrimonio Amalfi', 'fioristi matrimonio Lago di Como', 'wedding planner Puglia',
    'destination wedding Italy', 'sposi stranieri Italia', 'matrimonio Umbria',
    'wedding photographer Italy', 'villa matrimonio Toscana', 'masseria matrimonio Puglia',
    'velowedding', 'velo wedding', 'pianificare matrimonio',
  ],
  authors: [{ name: 'VELO Wedding', url: 'https://velowedding.it' }],
  metadataBase: new URL('https://velowedding.it'),
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon_180.png',
  },
  openGraph: {
    title: 'VELO — Wedding Planner Italia',
    description: 'Trova i migliori fornitori per il tuo matrimonio in Italia. Fotografi, location, catering, fioristi e molto altro.',
    url: 'https://velowedding.it',
    siteName: 'VELO Wedding',
    locale: 'it_IT',
    type: 'website',
    images: [{ url: '/logo_velo.png', width: 1200, height: 630, alt: 'VELO Wedding' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VELO — Wedding Planner Italia',
    description: 'Trova i migliori fornitori per il tuo matrimonio in Italia.',
    images: ['/logo_velo.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <SplashLoader />
        {children}
      </body>
    </html>
  )
}
