'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getT } from '@/lib/translations'
import SimpleNav from '@/components/SimpleNav'

const CATEGORIES_IT = ['Tutti', '📷 Fotografia', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica', '🏛️ Location', '💌 Partecipazioni', '🎂 Torta']
const CATEGORIES_EN = ['All', '📷 Photography', '🌸 Floral Design', '🍽️ Catering', '🎵 Music', '🏛️ Venue', '💌 Stationery', '🎂 Cake']
const REGIONS = ['Tutte / All', 'Toscana', 'Langhe & Piemonte', 'Amalfi Coast', 'Lago di Como', 'Roma & Lazio', 'Venezia & Veneto', 'Puglia', 'Umbria']

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, Italia`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VELOWedding/1.0' } }
    )
    const data = await res.json()
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

export default function FornitoriPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState('it')
  const [activeRegion, setActiveRegion] = useState('Tutte')
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [citySearch, setCitySearch] = useState('')
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) {
      setLocale(match[1])
      setActiveRegion(match[1] === 'en' ? 'All' : 'Tutte')
      setActiveCategory(match[1] === 'en' ? 'All' : 'Tutti')
    } else if (navigator.language.startsWith('en')) {
      setLocale('en')
      setActiveRegion('All')
      setActiveCategory('All')
    }
  }, [])

  useEffect(() => {
    supabase.from('public_vendors').select('*')
      .order('featured', { ascending: false })
      .order('rating', { ascending: false })
      .then(({ data }) => {
        setVendors(data || [])
        setLoading(false)
      })
  }, [])

  const tr = getT(locale)
  const categories = locale === 'en' ? CATEGORIES_EN : CATEGORIES_IT
  const allLabel = locale === 'en' ? 'All' : 'Tutte'
  const allCatLabel = locale === 'en' ? 'All' : 'Tutti'

  const handleCitySearch = async () => {
    if (!citySearch.trim()) return
    const coords = await geocodeCity(citySearch.trim())
    setCityCoords(coords)
    setSearchCity(citySearch.trim())
  }

  const clearCitySearch = () => {
    setCitySearch('')
    setCityCoords(null)
    setSearchCity('')
  }

  const withDistance = (list: any[]) => {
    if (!cityCoords) return list
    return list
      .map(v => ({
        ...v,
        _distKm: (v.lat && v.lng)
          ? haversineKm(cityCoords.lat, cityCoords.lng, v.lat, v.lng)
          : 9999
      }))
      .sort((a, b) => a._distKm - b._distKm)
  }

  const filtered = vendors.filter((v: any) => {
    const matchR = activeRegion === allLabel || activeRegion === 'Tutte / All' || v.region === activeRegion
    const matchC = activeCategory === allCatLabel || v.category === activeCategory ||
      (locale === 'en' && activeCategory !== 'All' && v.category.includes(activeCategory.replace(/[^\w\s]/g, '').trim()))
    return matchR && matchC
  })

  const displayed = withDistance(filtered)

  if (loading) return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center">
      <div className="text-gold text-sm">Caricamento...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-bg text-cream">
      <SimpleNav
        locale={locale}
        backHref="/"
        backLabel="← VELO"
        rightLabel={tr.nav.forVendors}
        rightHref="/vendor"
      />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-muted text-sm tracking-[0.3em] uppercase mb-2">{tr.fornitori.label}</p>
            <h1 className="text-4xl font-light mb-2">{tr.fornitori.title}</h1>
            <p className="text-muted">{displayed.length} {tr.fornitori.countSuffix}</p>
          </div>

          {/* City search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                placeholder="Cerca per città (es. Milano, Firenze...)"
                className="w-full bg-dark border border-border rounded-2xl px-5 py-4 text-cream placeholder-muted focus:outline-none focus:border-gold transition-colors pr-32"
              />
              <button
                onClick={handleCitySearch}
                className="absolute right-2 top-2 bg-gold text-bg text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                Cerca
              </button>
            </div>
            {searchCity && (
              <p className="text-muted text-xs mt-2 px-1">
                Risultati vicino a {searchCity}
                <button onClick={clearCitySearch} className="text-gold ml-2 hover:opacity-70">✕</button>
              </p>
            )}
          </div>

          {/* Region filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {REGIONS.map(r => (
              <button key={r}
                onClick={() => setActiveRegion(r === 'Tutte / All' ? allLabel : r)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  (activeRegion === r || (r === 'Tutte / All' && (activeRegion === 'Tutte' || activeRegion === 'All')))
                    ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {r}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c) => (
              <button key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  activeCategory === c ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((v: any) => (
              <Link key={v.id} href={`/fornitori/${v.id}`}
                className={`group bg-dark border rounded-2xl overflow-hidden hover:border-gold/40 transition-all hover:-translate-y-0.5 ${v.featured ? 'border-gold/30' : 'border-border'}`}>
                <div className="h-48 bg-bg flex items-center justify-center relative overflow-hidden">
                  {v.photo1_url ? (
                    <img src={v.photo1_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-6xl opacity-30">{v.cover_emoji || '📷'}</span>
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
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-gold text-sm">⭐ {v.rating}</span>
                    <span className="text-muted text-xs">({v.review_count} {tr.vendorDetail.reviews})</span>
                    {v.price_from && <span className="text-gold text-xs ml-auto">{tr.vendorDetail.priceFrom} €{v.price_from}</span>}
                    {(v as any)._distKm && (v as any)._distKm < 9999 && (
                      <span className="text-xs text-muted border border-border rounded-full px-3 py-1">
                        📍 {Math.round((v as any)._distKm)} km
                      </span>
                    )}
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

          {displayed.length === 0 && (
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
