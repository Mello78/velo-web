import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getT } from '@/lib/translations'
import LangToggle from '@/components/LangToggle'

const CATEGORIES_IT = ['Tutti', '📸 Fotografia', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica', '🏛️ Location', '💌 Partecipazioni', '🎂 Torta']
const CATEGORIES_EN = ['All', '📸 Photography', '🌸 Floral Design', '🍽️ Catering', '🎵 Music', '🏛️ Venue', '💌 Stationery', '🎂 Cake']
const REGIONS = ['Tutte / All', 'Toscana', 'Langhe & Piemonte', 'Amalfi Coast', 'Lago di Como', 'Roma & Lazio', 'Venezia & Veneto', 'Puglia', 'Umbria']

async function getVendors() {
  const { data } = await supabase.from('public_vendors').select('*')
    .order('featured', { ascending: false }).order('rating', { ascending: false })
  return data || []
}

export default async function FornitoriPage({
  searchParams,
  params,
}: {
  searchParams: { region?: string; category?: string }
  params?: { locale?: string }
}) {
  const locale = (params as any)?.locale || 'it'
  const tr = getT(locale)
  const vendors = await getVendors()
  const activeRegion = searchParams.region || (locale === 'en' ? 'All' : 'Tutte')
  const activeCategory = searchParams.category || (locale === 'en' ? 'All' : 'Tutti')
  const categories = locale === 'en' ? CATEGORIES_EN : CATEGORIES_IT
  const allLabel = locale === 'en' ? 'All' : 'Tutte'
  const allCatLabel = locale === 'en' ? 'All' : 'Tutti'

  const filtered = vendors.filter((v: any) => {
    const matchR = activeRegion === allLabel || activeRegion === 'Tutte / All' || v.region === activeRegion
    const matchC = activeCategory === allCatLabel || v.category === activeCategory ||
      (locale === 'en' && activeCategory !== 'All' && v.category.includes(activeCategory.replace(/[^\w\s]/g, '').trim()))
    return matchR && matchC
  })

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-cream text-sm">{tr.fornitori.label}</span>
            <Link href="/vendor" className="text-muted hover:text-cream text-sm transition-colors">{tr.nav.forVendors}</Link>
            <LangToggle locale={locale} />
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-muted text-sm tracking-[0.3em] uppercase mb-2">{tr.fornitori.label}</p>
            <h1 className="text-4xl font-light mb-2">{tr.fornitori.title}</h1>
            <p className="text-muted">{filtered.length} {tr.fornitori.countSuffix}</p>
          </div>

          {/* Region filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map(r => (
              <Link key={r}
                href={`/fornitori?region=${encodeURIComponent(r === 'Tutte / All' ? allLabel : r)}&category=${encodeURIComponent(activeCategory)}`}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  (activeRegion === r || (r === 'Tutte / All' && (activeRegion === 'Tutte' || activeRegion === 'All')))
                    ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {r}
              </Link>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c, i) => (
              <Link key={c}
                href={`/fornitori?region=${encodeURIComponent(activeRegion)}&category=${encodeURIComponent(c)}`}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeCategory === c ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {c}
              </Link>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v: any) => (
              <Link key={v.id} href={`/fornitori/${v.id}`}
                className={`group bg-dark border rounded-2xl overflow-hidden hover:border-gold/40 transition-all hover:-translate-y-0.5 ${v.featured ? 'border-gold/30' : 'border-border'}`}>
                <div className="h-48 bg-bg flex items-center justify-center relative overflow-hidden">
                  {v.photo1_url ? (
                    <img src={v.photo1_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-6xl opacity-30">{v.cover_emoji || '📸'}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {v.logo_url && (
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-lg overflow-hidden border-2 border-bg bg-dark">
                      <img src={v.logo_url} alt="logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {v.featured && (
                    <span className="absolute top-3 left-3 bg-gold/20 border border-gold/40 text-gold text-xs px-3 py-1 rounded-full">
                      {tr.fornitori.inEvidence}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-cream font-medium group-hover:text-gold transition-colors">{v.name}</h3>
                      <p className="text-muted text-xs mt-1">{v.category} · {v.location}, {v.region}</p>
                    </div>
                    {v.verified && <span className="text-green text-xs bg-green/10 border border-green/20 px-2 py-1 rounded-full shrink-0">{tr.vendorDetail.verified}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gold text-sm">★ {v.rating}</span>
                    <span className="text-muted text-xs">({v.review_count} {tr.vendorDetail.reviews})</span>
                    {v.price_from && <span className="text-gold text-xs ml-auto">{tr.vendorDetail.priceFrom} €{v.price_from}</span>}
                  </div>
                  {v.description && <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed">{v.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted text-xs">{tr.fornitori.viewProfile}</span>
                    <span className="text-gold text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-muted">{tr.fornitori.noResults}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
