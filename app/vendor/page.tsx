'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { getT } from '@/lib/translations'
import LangToggle from '@/components/LangToggle'

function useLocale() {
  const [locale, setLocale] = useState('it')
  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) setLocale(match[1])
    else if (navigator.language.startsWith('en')) setLocale('en')
  }, [])
  return locale
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

export default function VendorPage() {
  const locale = useLocale()
  const tr = getT(locale)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)

  const handle = async () => {
    setLoading(true); setError(''); setSuccess('')
    if (isLogin) {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      const { data: va } = await supabase.from('vendor_accounts').select('*').eq('user_id', data.user.id).single()
      if (!va) { setError(tr.vendor.notFound); setLoading(false); return }
      setVendorData(va); setLoggedIn(true)
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else setSuccess(tr.vendor.checkEmail)
    }
    setLoading(false)
  }

  if (loggedIn && vendorData) return (
    <VendorDashboard vendor={vendorData} locale={locale}
      onLogout={() => { supabase.auth.signOut(); setLoggedIn(false); setVendorData(null) }}
      onUpdate={(updated: any) => setVendorData(updated)} />
  )

  return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 justify-center">
            <img src="/favicon.png" alt="" className="h-8 w-auto" />
            <span className="text-gold text-3xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <p className="text-muted text-sm mt-2">{tr.vendor.title}</p>
          <div className="mt-3 flex justify-center"><LangToggle locale={locale} /></div>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-8">
          <div className="flex gap-2 mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>{tr.vendor.login}</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${!isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>{tr.vendor.register}</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted text-xs tracking-wider uppercase block mb-2">{tr.vendor.emailLabel}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-muted text-xs tracking-wider uppercase block mb-2">{tr.vendor.passwordLabel}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-400 text-sm mt-4">{success}</p>}
          <button onClick={handle} disabled={loading}
            className="w-full bg-gold text-bg font-semibold py-4 rounded-xl mt-6 hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? tr.vendor.loading : isLogin ? tr.vendor.loginBtn : tr.vendor.registerBtn}
          </button>
        </div>
        <div className="mt-8 bg-gold/5 border border-gold/20 rounded-2xl p-6">
          <p className="text-gold text-sm font-medium mb-2">{tr.vendor.earlyTitle}</p>
          <p className="text-muted text-sm leading-relaxed">{tr.vendor.earlyDesc}</p>
        </div>
      </div>
    </main>
  )
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

function VendorDashboard({ vendor, locale, onLogout, onUpdate }: {
  vendor: any, locale: string, onLogout: () => void, onUpdate: (v: any) => void
}) {
  const tr = getT(locale)
  const d = tr.vendor.dashboard
  const [tab, setTab] = useState<'profile'|'social'|'availability'|'stats'>('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bio, setBio] = useState(vendor.bio || '')
  const [phone, setPhone] = useState(vendor.phone || '')
  const [instagram, setInstagram] = useState(vendor.instagram || '')
  const [facebook, setFacebook] = useState(vendor.facebook || '')
  const [tiktok, setTiktok] = useState(vendor.tiktok || '')
  const [website, setWebsite] = useState(vendor.website || '')
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp || '')
  const [priceFrom, setPriceFrom] = useState(vendor.price_from || '')
  const [priceTo, setPriceTo] = useState(vendor.price_to || '')
  const [maxEvents, setMaxEvents] = useState(vendor.max_events_per_day || 1)
  const [savedMsg, setSavedMsg] = useState('')

  const save = async () => {
    setSaving(true)
    const payload: any = {
      bio, phone, instagram, facebook, tiktok, website, whatsapp,
      price_from: priceFrom, price_to: priceTo, max_events_per_day: maxEvents
    }
    // Geocoding automatico della città del vendor
    if (vendor.location || vendor.region) {
      const cityToGeocode = vendor.location || vendor.region
      const coords = await geocodeCity(cityToGeocode)
      if (coords) {
        payload.lat = coords.lat
        payload.lng = coords.lng
      }
    }
    const { data } = await supabase.from('vendor_accounts').update(payload).eq('id', vendor.id).select().single()
    if (data) { onUpdate({ ...vendor, ...data }); setSavedMsg('✓'); setTimeout(() => setSavedMsg(''), 2000) }
    setEditing(false); setSaving(false)
  }

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <div className="flex items-center gap-4">
            <LangToggle locale={locale} />
            <span className="text-muted text-sm hidden sm:block">{vendor.business_name}</span>
            <button onClick={onLogout} className="text-red-400 text-sm hover:opacity-70 transition-opacity">{d.logout}</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-muted text-xs tracking-widest uppercase mb-2">{d.label}</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light">{vendor.business_name}</h1>
              <p className="text-muted mt-1">{vendor.category} · {vendor.region}</p>
              {vendor.verified && <span className="inline-block mt-2 text-xs text-green-400 border border-green-400/30 rounded-full px-3 py-1">✓ Verificato da VELO</span>}
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-right shrink-0">
              <p className="text-gold text-xs font-medium">{d.free}</p>
              <p className="text-muted text-xs mt-1">{d.freeTil}</p>
              <p className="text-muted text-xs">{d.then}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {(['profile','social','availability','stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab===t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t==='profile' ? d.tabProfile : t==='social' ? d.tabSocial : t==='availability' ? d.tabAvailability : d.tabStats}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.profileTitle}</h2>
              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? d.saving : savedMsg || (editing ? d.save : d.edit)}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.bioLabel}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                    placeholder={d.bioPlaceholder} /></div>
                <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                    placeholder={d.phonePlaceholder} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceFromLabel}</label>
                    <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" /></div>
                  <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceToLabel}</label>
                    <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" /></div>
                </div>
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream transition-colors">{d.cancel}</button>
              </div>
            ) : (
              <div>
                {[
                  [d.category, vendor.category],
                  [d.zone, vendor.region],
                  [d.phone, vendor.phone || '—'],
                  [d.prices, vendor.price_from ? `€${vendor.price_from}${vendor.price_to ? ` → €${vendor.price_to}` : ''}` : '—'],
                  [d.bio, vendor.bio || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-border last:border-0 gap-4">
                    <span className="text-muted text-sm shrink-0">{label}</span>
                    <span className="text-cream text-sm text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'social' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.socialTitle}</h2>
              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? d.saving : savedMsg || (editing ? d.save : d.edit)}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, ph: '@profile' },
                  { label: 'Facebook', val: facebook, set: setFacebook, ph: 'facebook.com/page' },
                  { label: 'TikTok', val: tiktok, set: setTiktok, ph: '@profile' },
                  { label: locale === 'en' ? 'Website' : 'Sito web', val: website, set: setWebsite, ph: 'www.example.com' },
                  { label: 'WhatsApp', val: whatsapp, set: setWhatsapp, ph: '+39 000 000 0000' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={ph} />
                  </div>
                ))}
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream">{d.cancel}</button>
              </div>
            ) : (
              <div>
                {[
                  ['📷 Instagram', vendor.instagram],
                  ['📘 Facebook', vendor.facebook],
                  ['🎵 TikTok', vendor.tiktok],
                  ['🌐 Website', vendor.website],
                  ['💬 WhatsApp', vendor.whatsapp],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-border last:border-0">
                    <span className="text-muted text-sm">{label}</span>
                    <span className={`text-sm ${!value ? 'text-muted' : 'text-blue-400'}`}>{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'availability' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.availabilityTitle}</h2>
              <button onClick={save} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>
            <p className="text-muted text-sm mb-6">{d.availabilityDesc}</p>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setMaxEvents((v:number) => Math.max(1, v-1))}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center">−</button>
              <span className="text-4xl font-light text-cream w-12 text-center">{maxEvents}</span>
              <button onClick={() => setMaxEvents((v:number) => v+1)}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center">+</button>
              <span className="text-muted text-sm">{d.maxEvents}</span>
            </div>
            <p className="text-muted text-xs bg-bg border border-border rounded-xl p-4">{d.availabilityNote}</p>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                [d.statsCouples, 'text-gold'],
                [d.statsConfirmed, 'text-green-400'],
                [d.statsMessages, 'text-blue-400'],
                [d.statsViews, 'text-cream'],
              ].map(([label, cls]) => (
                <div key={label} className="bg-dark border border-border rounded-2xl p-6 text-center">
                  <p className={`text-3xl font-light ${cls}`}>—</p>
                  <p className="text-muted text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-dark border border-border rounded-2xl p-6">
              <p className="text-muted text-sm text-center">{d.statsNote}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
