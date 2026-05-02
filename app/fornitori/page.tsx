'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { getT } from '../../lib/translations'
import SimpleNav from '../../components/SimpleNav'
import PublicFooter from '../../components/PublicFooter'

const CATEGORIES_IT = ['Tutti', 'Fotografia', 'Floral Design', 'Catering', 'Musica', 'Location', 'Partecipazioni', 'Torta']
const CATEGORIES_EN = ['All', 'Photography', 'Floral Design', 'Catering', 'Music', 'Venue', 'Stationery', 'Cake']

const REGIONS = [
  'Tutte / All',
  'Langhe & Piemonte', 'Lago di Como', 'Lago di Garda',
  'Venezia & Veneto', 'Toscana', 'Umbria',
  'Roma & Lazio', 'Amalfi Coast', 'Puglia', 'Sicilia', 'Liguria',
]

function categoryKey(value?: string | null) {
  const text = (value || '').toLowerCase()
  if (text.includes('foto') || text.includes('photo')) return 'photo'
  if (text.includes('floral') || text.includes('fior')) return 'flowers'
  if (text.includes('catering')) return 'catering'
  if (text.includes('music') || text.includes('musica') || text.includes('dj')) return 'music'
  if (text.includes('venue') || text.includes('location')) return 'venue'
  if (text.includes('stationery') || text.includes('partecip')) return 'stationery'
  if (text.includes('cake') || text.includes('torta') || text.includes('pastic')) return 'cake'
  if (text.includes('planner')) return 'planner'
  if (text.includes('beauty') || text.includes('trucco')) return 'beauty'
  if (text.includes('video')) return 'video'
  return text.trim()
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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
  const [guestCount] = useState<number | null>(null)

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
    setActiveRegion(allLabel)
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
          : 9999,
      }))
      .sort((a, b) => a._distKm - b._distKm)
  }

  const filtered = vendors.filter((v: any) => {
    const matchR = activeRegion === allLabel || activeRegion === 'Tutte / All' ||
      v.region === activeRegion ||
      v.work_regions?.includes(activeRegion) ||
      v.serves_regioni?.includes(activeRegion)

    const matchC = activeCategory === allCatLabel || categoryKey(activeCategory) === categoryKey(v.category)
    const matchGuests = !guestCount ||
      (!v.category?.toLowerCase().includes('location') && !v.category?.toLowerCase().includes('catering')) ||
      !v.max_guests || v.max_guests >= guestCount

    return matchR && matchC && matchGuests
  })

  const displayed = withDistance(filtered)

  if (loading) return (
    <main className="min-h-screen bg-[#f3eadb] text-[#1f1812]">
      <SimpleNav locale={locale} backHref="/" backLabel={locale === 'en' ? '← Home' : '← Home'} rightLabel={tr.nav.forVendors} rightHref="/vendor" />
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm tracking-[0.18em] text-[#b85a2e]">{tr.fornitori.loading}</div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f3eadb] text-[#1f1812]">
      <SimpleNav
        locale={locale}
        backHref="/"
        backLabel={locale === 'en' ? '← Home' : '← Home'}
        rightLabel={tr.nav.forVendors}
        rightHref="/vendor"
      />

      <section className="relative overflow-hidden px-6 pb-16 pt-28 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(184,90,46,0.16),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.35),transparent_24%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-12 max-w-[760px]">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-12 bg-[#b85a2e]" />
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a3e1e] sm:text-[12px]">{tr.fornitori.label}</p>
            </div>
            <h1 className="font-light leading-[0.96] tracking-[-0.03em]" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(2.9rem, 5.6vw, 4.8rem)' }}>
              {tr.fornitori.title}
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-relaxed text-[#5d4e40]">
              {displayed.length} {tr.fornitori.countSuffix}
            </p>
          </div>

          <div className="mb-8 rounded-[2rem] border border-[#d9c3aa] bg-[#efe1ce]/86 p-3 shadow-[0_18px_50px_rgba(49,35,24,0.08)] backdrop-blur-sm sm:p-4">
            <div className="flex flex-col gap-3 rounded-[1.55rem] border border-[#e2d0bb] bg-[#fbf4e5]/78 p-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                placeholder={tr.fornitori.searchPlaceholder}
                className="min-h-[3.25rem] flex-1 rounded-[1.25rem] border border-transparent bg-transparent px-4 text-[#1f1812] placeholder-[#8a7e6a] transition-colors focus:border-[#b85a2e]/30 focus:bg-[#fffaf4]/60 focus:outline-none"
              />
              <button
                onClick={handleCitySearch}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-[1.15rem] bg-[#b85a2e] px-5 text-xs font-semibold tracking-[0.14em] text-[#fbf4e5] transition-colors hover:bg-[#a54d25] sm:min-w-[112px]"
              >
                {tr.fornitori.searchBtn}
              </button>
            </div>
            {searchCity && (
              <p className="mt-3 px-1 text-xs text-[#5d4e40]">
                {tr.fornitori.nearCity} {searchCity}
                <button onClick={clearCitySearch} className="ml-2 text-[#b85a2e] hover:opacity-70">×</button>
              </p>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => {
                  setActiveRegion(region === 'Tutte / All' ? allLabel : region)
                  if (region !== 'Tutte / All') clearCitySearch()
                }}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                  (activeRegion === region || (region === 'Tutte / All' && (activeRegion === 'Tutte' || activeRegion === 'All')))
                    ? 'border-[#b85a2e]/55 bg-[#f3dfcf] text-[#8a3e1e]'
                    : 'border-[#d8c4ad] bg-[#fbf4e5]/42 text-[#5d4e40] hover:border-[#b85a2e]/42 hover:bg-[#fbf4e5]/72 hover:text-[#1f1812]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                  activeCategory === category
                    ? 'border-[#b85a2e]/55 bg-[#f3dfcf] text-[#8a3e1e]'
                    : 'border-[#d8c4ad] bg-[#fbf4e5]/42 text-[#5d4e40] hover:border-[#b85a2e]/42 hover:bg-[#fbf4e5]/72 hover:text-[#1f1812]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayed.map((vendor: any) => (
              <Link
                key={vendor.id}
                href={`/fornitori/${vendor.id}`}
                className={`group overflow-hidden rounded-[2.2rem] border bg-[#fbf4e5] shadow-[0_20px_60px_rgba(49,35,24,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#b85a2e]/35 ${vendor.featured ? 'border-[#b85a2e]/26' : 'border-[#e2d0bb]'}`}
              >
                <div className="relative flex h-60 items-center justify-center overflow-hidden bg-[#e8d8c4]">
                  {vendor.photo1_url ? (
                    <img src={vendor.photo1_url} alt={vendor.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <span className="text-3xl font-light tracking-[0.24em] text-[#1f1812]/24" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>VELO</span>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,34,25,0.02)_0%,rgba(44,34,25,0.34)_100%)]" />
                  {vendor.logo_url && (
                    <div className="absolute bottom-4 right-4 h-11 w-11 overflow-hidden rounded-[0.9rem] border border-[#fbf4e5]/75 bg-[#fbf4e5] shadow-lg">
                      <img src={vendor.logo_url} alt={`${vendor.name} logo`} className="h-full w-full object-cover" />
                    </div>
                  )}
                  {vendor.featured && (
                    <span className="absolute left-4 top-4 rounded-full border border-[#fbf4e5]/70 bg-[#fbf4e5]/78 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8a3e1e] backdrop-blur-sm">
                      {tr.fornitori.inEvidence}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a3e1e]">{vendor.category}</p>
                    <h3 className="mt-2 text-[1.48rem] font-light leading-snug text-[#1f1812] group-hover:text-[#8a3e1e]" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>
                      {vendor.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5d4e40]">{vendor.location}, {vendor.region}</p>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#5d4e40]">
                    {(vendor.review_count ?? 0) > 0 && (
                      <span className="rounded-full border border-[#e2d0bb] bg-[#fffaf4]/70 px-3 py-1">
                        {vendor.rating} / 5 · {vendor.review_count} {tr.vendorDetail.reviews}
                      </span>
                    )}
                    {vendor.price_from && (
                      <span className="rounded-full border border-[#e2d0bb] bg-[#fffaf4]/70 px-3 py-1">
                        {tr.vendorDetail.priceFrom} €{vendor.price_from}
                      </span>
                    )}
                    {(vendor as any)._distKm != null && (vendor as any)._distKm < 9999 && (
                      <span className="rounded-full border border-[#e2d0bb] bg-[#fffaf4]/70 px-3 py-1">
                        {Math.round((vendor as any)._distKm)} km
                      </span>
                    )}
                  </div>

                  {(locale === 'en' ? (vendor.description_en || vendor.bio_en || vendor.description) : vendor.description) && (
                    <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-[#5d4e40]">
                      {locale === 'en' ? (vendor.description_en || vendor.bio_en || vendor.description) : vendor.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-[#e2d0bb] pt-4">
                    <span className="text-xs uppercase tracking-[0.16em] text-[#8a3e1e]">{tr.fornitori.viewProfile}</span>
                    <span aria-hidden="true" className="text-sm text-[#b85a2e]">-&gt;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {displayed.length === 0 && (
            <div className="rounded-[2rem] border border-[#dcc8b0] bg-[#fbf4e5]/75 py-20 text-center">
              <p className="text-[#5d4e40]">{tr.fornitori.noResults}</p>
            </div>
          )}
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}
