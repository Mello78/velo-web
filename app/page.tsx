import Link from 'next/link'

const features = [
  { emoji: '📋', title: 'Planning intelligente', desc: 'Checklist personalizzata in base al tipo di cerimonia. Task automatici, scadenze, promemoria.' },
  { emoji: '🌸', title: 'Marketplace fornitori', desc: 'Fotografi, fioristi, location, catering. Filtri per zona, prezzo, stile. Chat diretta.' },
  { emoji: '👥', title: 'Gestione ospiti', desc: 'Lista invitati con RSVP, gruppi, esigenze alimentari. Tutto in un posto.' },
  { emoji: '💶', title: 'Budget tracker', desc: 'Tieni traccia di ogni spesa. Impegnato vs pagato. Nessuna sorpresa.' },
  { emoji: '📋', title: 'Documenti legali', desc: 'Guida documenti specifica per il tuo paese. 20 nazionalità supportate.' },
  { emoji: '✨', title: 'Visione & stile', desc: 'Definisci lo stile del matrimonio. VELO suggerisce i fornitori più adatti.' },
]

const regions = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-gold text-2xl tracking-[0.3em] font-light">VELO</span>
          <div className="flex items-center gap-6">
            <Link href="/fornitori" className="text-muted hover:text-cream text-sm transition-colors">Fornitori</Link>
            <Link href="/vendor" className="text-muted hover:text-cream text-sm transition-colors">Sei un fornitore?</Link>
            <a href="#download" className="bg-gold text-bg text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              Scarica l'app
            </a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-6 text-center">
        <p className="text-muted text-sm tracking-[0.3em] uppercase mb-6">Il wedding planner per l'Italia</p>
        <h1 className="text-5xl md:text-7xl font-light leading-tight mb-6">
          Dal <span className="text-gold">sì</span><br />a per sempre
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          VELO è l'app che pianifica ogni dettaglio del tuo matrimonio in Italia.
          Planning, fornitori, ospiti, budget — tutto in un posto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center" id="download">
          <a href="#" className="bg-gold text-bg font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition-opacity">
            🍎 App Store
          </a>
          <a href="#" className="border border-border text-cream px-8 py-4 rounded-full text-lg hover:border-gold transition-colors">
            🤖 Google Play
          </a>
        </div>
        <p className="text-muted text-xs mt-6">Gratuita · Nessun abbonamento per le coppie</p>
      </section>

      <div className="max-w-6xl mx-auto px-6"><div className="h-px bg-border" /></div>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted text-sm tracking-[0.3em] uppercase text-center mb-4">Tutto quello che serve</p>
          <h2 className="text-4xl font-light text-center mb-16">Pianifica senza stress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-dark border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors">
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-cream font-medium mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted text-sm tracking-[0.3em] uppercase mb-4">Destination wedding</p>
          <h2 className="text-4xl font-light mb-4">Dove volete sposarvi?</h2>
          <p className="text-muted mb-12">Fornitori selezionati nelle location più belle d'Italia</p>
          <div className="flex flex-wrap justify-center gap-3">
            {regions.map((r, i) => (
              <Link key={i} href={`/fornitori?region=${encodeURIComponent(r)}`}
                className="border border-border rounded-full px-5 py-2 text-sm text-muted hover:border-gold hover:text-gold transition-colors">
                {r}
              </Link>
            ))}
          </div>
          <Link href="/fornitori" className="inline-block mt-10 text-gold text-sm hover:opacity-70 transition-opacity">
            Vedi tutti i fornitori →
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted text-sm tracking-[0.3em] uppercase mb-4">Per i professionisti</p>
          <h2 className="text-4xl font-light mb-6">Sei un fornitore di matrimoni?</h2>
          <p className="text-muted text-lg mb-4 leading-relaxed">
            Entra nella vetrina VELO e raggiungi coppie che stanno pianificando il loro matrimonio in Italia.
          </p>
          <p className="text-gold text-sm mb-10">⭐ Primo anno gratuito — poi €20/mese, cancellazione libera</p>
          <Link href="/vendor" className="bg-gold text-bg font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition-opacity">
            Registrati come fornitore →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
            <p className="text-muted text-xs mt-1">from yes to forever</p>
          </div>
          <div className="flex gap-8">
            <Link href="/fornitori" className="text-muted text-sm hover:text-cream transition-colors">Fornitori</Link>
            <Link href="/vendor" className="text-muted text-sm hover:text-cream transition-colors">Area Fornitori</Link>
            <Link href="/admin" className="text-muted text-sm hover:text-cream transition-colors">Admin</Link>
          </div>
          <p className="text-muted text-xs">© 2025 VELO · velowedding.it</p>
        </div>
      </footer>
    </main>
  )
}
