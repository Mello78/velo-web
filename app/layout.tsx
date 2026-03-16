import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VELO — from yes to forever',
  description: 'Il wedding planner per i matrimoni in Italia. Pianifica, organizza e trova i migliori fornitori.',
  openGraph: {
    title: 'VELO — from yes to forever',
    description: 'Il wedding planner per i matrimoni in Italia.',
    url: 'https://velowedding.it',
    siteName: 'VELO',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
