import type { Metadata } from 'next'
import './globals.css'
import SplashLoader from '@/components/SplashLoader'

export const metadata: Metadata = {
  title: 'VELO — from yes to forever',
  description: 'Il wedding planner per i matrimoni in Italia. Pianifica, organizza e trova i migliori fornitori.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon_180.png',
  },
  openGraph: {
    title: 'VELO — from yes to forever',
    description: 'Il wedding planner per i matrimoni in Italia.',
    url: 'https://velowedding.it',
    siteName: 'VELO',
    images: [{ url: '/logo_velo.png' }],
  },
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
