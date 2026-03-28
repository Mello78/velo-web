import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fornitori Matrimonio Italia — Fotografi, Location, Catering',
  description: 'Trova i migliori fotografi, location, fioristi e catering per il tuo matrimonio in Italia. Ricerca per zona: Toscana, Amalfi Coast, Lago di Como, Roma, Puglia, Venezia e molto altro.',
  keywords: [
    'fornitori matrimonio Italia', 'fotografi matrimonio', 'location matrimonio',
    'catering matrimonio', 'fioristi matrimonio', 'wedding photographer Italy',
    'matrimonio Toscana fornitori', 'matrimonio Firenze fotografi', 'location matrimonio Siena',
    'villa matrimonio Lago di Como', 'matrimonio Amalfi Coast', 'masseria matrimonio Puglia',
    'destination wedding vendor Italy', 'wedding planner Italia', 'fotografo matrimonio Roma',
    'fiorista matrimonio Venezia', 'matrimonio Umbria', 'wedding catering Toscana',
  ],
  alternates: { canonical: '/fornitori' },
  openGraph: {
    title: 'Fornitori Matrimonio in Italia | VELO Wedding',
    description: 'Scopri fotografi, location, catering e fioristi per matrimoni in tutta Italia. Cerca per zona, categoria e budget.',
    url: 'https://velowedding.it/fornitori',
  },
}

export default function FornitoriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
