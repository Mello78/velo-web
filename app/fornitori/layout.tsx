import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner VELO - Professionisti selezionati per matrimoni in Italia',
  description: 'Scopri professionisti selezionati per matrimoni in diverse regioni italiane. Cerca per zona e categoria dentro il contesto VELO.',
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
    title: 'Partner VELO | Professionisti selezionati',
    description: 'Professionisti selezionati per matrimoni in diverse regioni italiane, dentro il contesto operativo VELO.',
    url: 'https://velowedding.it/fornitori',
  },
}

export default function FornitoriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
