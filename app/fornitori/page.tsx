import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Tutti', '📸 Fotografia', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica', '🏛️ Location', '💌 Partecipazioni', '🎂 Torta']
const REGIONS = ['Tutte', 'Toscana', 'Langhe & Piemonte', 'Amalfi Coast', 'Lago di Como', 'Roma & Lazio', 'Venezia & Veneto', 'Puglia', 'Umbria']

async function getVendors() {
  const { data } = await supabase
    .from('public_vendors')
    .select('*')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false })
  return data || []
}

export default async function FornitoriPage({ searchParams }: { searchParams: { region?: string, category?: string } }) {
  const vendors = await getVendors()
  const activeRegion = searchParams.region || 'Tutte'
  const activeCategory = searchParams.category || 'Tutti'

  const filtered = vendors.filter((v: any) => {
    const matchR = activeRegion === 'Tutte' || v.region === activeRegion
    const matchC = activeCategory === 'Tutti' || v.category === activeCategory
    return matchR && matchC
  })

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-2xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-cream text-sm">Fornitori</span>
            <Link href="/vendor" className="text-muted hover:text-cream text-sm transition-colors">Sei un fornitore?</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-muted text-sm tracking-[0.3em] uppercase mb-2">Marketplace</p>
            <h1 className="text-4xl font-light mb-2">Fornitori per il tuo matrimonio</h1>
            <p className="text-muted">{filtered.length} professionisti selezionati in tutta Italia</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map(r => (
              <Link key={r}
                href={`/fornitori?region=${encodeURIComponent(r)}&category=${encodeURIComponent(activeCategory)}`}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeRegion === r ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {r}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(c => (
              <Link key={c}
                href={`/fornitori?region=${encodeURIComponent(activeRegion)}&category=${encodeURIComponent(c)}`}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeCategory === c ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {c}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v: any) => (
              <Link key={v.id} href={`/fornitori/${v.id}`} className={`group bg-dark border rounded-2xl overflow-hidden hover:border-gold/40 transition-all hover:-translate-y-0.5 ${v.featured ? 'border-gold/30' : 'border-border'}`}>
                <div className="h-48 bg-bg flex items-center justify-center relative overflow-hidden">
                  {v.photo1_url ? (
                    <img src={v.photo1_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-6xl opacity-30">{v.cover_emoji || '📸'}</span>
                  )}
                  {/* Overlay + logo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {v.logo_url && (
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-lg overflow-hidden border-2 border-bg bg-dark">
                      <img src={v.logo_url} alt="logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {v.featured && (
                    <span className="absolute top-3 left-3 bg-gold/20 border border-gold/40 text-gold text-xs px-3 py-1 rounded-full">
                      ⭐ In evidenza
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-cream font-medium group-hover:text-gold transition-colors">{v.name}</h3>
                      <p className="text-muted text-xs mt-1">{v.category} · {v.location}, {v.region}</p>
                    </div>
                    {v.verified && (
                      <span className="text-green text-xs bg-green/10 border border-green/20 px-2 py-1 rounded-full shrink-0">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gold text-sm">★ {v.rating}</span>
                    <span className="text-muted text-xs">({v.review_count})</span>
                    {v.price_from && <span className="text-gold text-xs ml-auto">da €{v.price_from}</span>}
                  </div>
                  {v.description && <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed">{v.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted text-xs">Vedi profilo completo</span>
                    <span className="text-gold text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-muted">Nessun fornitore trovato con questi filtri.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
