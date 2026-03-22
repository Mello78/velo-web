'use client'
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { getT } from '../../lib/translations'
import SimpleNav from '../../components/SimpleNav'
import LangToggle from '../../components/LangToggle'

const CATEGORIES = [
  '📷 Fotografia', '🎬 Video', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica',
  '🏛️ Location', '💌 Partecipazioni', '🎂 Torta', '💐 Fiori', '🚗 Auto',
  '💄 Trucco & Parrucco', '👗 Abiti', '🎉 Animazione', '🎊 Bomboniere', '📋 Wedding Planner',
]

const LINGUE = ['Italiano', 'English', 'Français', 'Deutsch', 'Español', 'Português', '中文', 'العربية']
const SPECIALITA = [
  'Reportage naturale', 'Stile romantico', 'Luxury & Fine Art', 'Destination wedding',
  'Cerimonie religiose', 'Cerimonie civili', 'Cerimonie simboliche', 'Matrimoni all\'aperto',
  'Ville storiche', 'Piccoli matrimoni', 'Grandi eventi', 'Coppie straniere',
  'Multilingue', 'Disponibile weekend',
]

function useLocale() {
  const [locale, setLocale] = useState('it')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (navigator.language.startsWith('en')) setLocale('en')
  }, [])
  return locale
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Italia')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VELOWedding/1.0' } }
    )
    const data = await res.json()
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!file || file.size === 0) { console.error('File vuoto'); return null; }
  if (file.size > 5 * 1024 * 1024) { alert('Il file supera i 5MB'); return null; }
  const { error } = await supabase.storage.from('vendor-photos').upload(path, file, { upsert: true })
  if (error) { console.error('Upload error:', error); alert('Errore upload: ' + error.message); return null; }
  const { data } = supabase.storage.from('vendor-photos').getPublicUrl(path)
  return data.publicUrl
}

export default function VendorPage() {
  const locale = useLocale()
  const tr = getT(locale)
  const [mode, setMode] = useState<'auth' | 'setup' | 'dashboard'>('auth')
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [vendorData, setVendorData] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const uid = data.session.user.id
        setUserId(uid)
        setEmail(data.session.user.email || '')
        const { data: va } = await supabase.from('vendor_accounts').select('*').eq('user_id', uid).single()
        // Vai alla dashboard SOLO se ha già un profilo vendor
        // Se ha una sessione ma non è un vendor, resta sulla schermata login
        if (va) { setVendorData(va); setMode('dashboard') }
        // NON andare a 'setup' in automatico — solo dopo login esplicito
      }
    })
  }, [])

  const handle = async () => {
    setLoading(true); setError(''); setSuccess('')
    if (isLogin) {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      const uid = data.user.id; setUserId(uid)
      const { data: va } = await supabase.from('vendor_accounts').select('*').eq('user_id', uid).single()
      if (va) { setVendorData(va); setMode('dashboard') }
      else setMode('setup')
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else setSuccess("✉️ Controlla la tua email per confermare l'account, poi torna qui e accedi.")
    }
    setLoading(false)
  }

  if (mode === 'setup') return (
    <ProfileSetup locale={locale} userId={userId}
      onComplete={(va: any) => { setVendorData(va); setMode('dashboard') }} />
  )
  if (mode === 'dashboard' && vendorData) return (
    <VendorDashboard vendor={vendorData} locale={locale}
      onLogout={() => { supabase.auth.signOut(); setMode('auth'); setVendorData(null); setEmail(''); setPassword('') }}
      onUpdate={(u: any) => setVendorData(u)} />
  )

  return (
    <main className="min-h-screen bg-bg text-cream">
      <SimpleNav locale={locale} />
      <div className="flex items-center justify-center px-6 pt-24 pb-16 min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">{tr.vendor.title}</p>
            <h1 className="text-3xl font-light text-cream">
              {isLogin ? 'Accedi alla tua area' : 'Crea il tuo profilo'}
            </h1>
          </div>
          <div className="bg-dark border border-border rounded-2xl p-8">
            <div className="space-y-4">
              <div>
                <label className="text-muted text-xs tracking-wider uppercase block mb-2">{tr.vendor.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                  placeholder="email@example.com" onKeyDown={e => e.key === 'Enter' && handle()} autoFocus />
              </div>
              <div>
                <label className="text-muted text-xs tracking-wider uppercase block mb-2">{tr.vendor.passwordLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                  placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handle()} />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            {success && <p className="text-green-400 text-sm mt-4">{success}</p>}
            <button onClick={handle} disabled={loading}
              className="w-full bg-gold text-bg font-semibold py-4 rounded-xl mt-6 hover:opacity-90 disabled:opacity-50">
              {loading ? tr.vendor.loading : isLogin ? tr.vendor.loginBtn : tr.vendor.registerBtn}
            </button>
            {/* Toggle login/registrazione — link secondario */}
            <p className="text-center text-muted text-sm mt-5">
              {isLogin ? (
                <>Nuovo su VELO?{' '}
                  <button onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
                    className="text-gold hover:opacity-70 transition-opacity underline underline-offset-2">
                    Crea il tuo profilo gratuito →
                  </button>
                </>
              ) : (
                <>Hai già un account?{' '}
                  <button onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
                    className="text-gold hover:opacity-70 transition-opacity underline underline-offset-2">
                    Accedi →
                  </button>
                </>
              )}
            </p>
          </div>
          <div className="mt-6 bg-gold/5 border border-gold/20 rounded-2xl p-5">
            <p className="text-gold text-sm font-medium mb-1">{tr.vendor.earlyTitle}</p>
            <p className="text-muted text-sm leading-relaxed">{tr.vendor.earlyDesc}</p>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── PROFILE SETUP (prima volta dopo registrazione) ───────────────────────────
function ProfileSetup({ locale, userId, onComplete }: {
  locale: string; userId: string; onComplete: (va: any) => void
}) {
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)) }
  }

  const save = async () => {
    if (!businessName.trim()) { setError("Il nome dell'attività è obbligatorio"); return }
    if (!location.trim()) { setError('La città è obbligatoria'); return }
    setSaving(true); setError('')
    const coords = await geocodeCity(location)
    let logoUrl: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop() || 'jpg'
      logoUrl = await uploadImage(logoFile, `${userId}/logo.${ext}`)
    }
    const { data, error: err } = await supabase.from('vendor_accounts').insert({
      user_id: userId, business_name: businessName, category,
      location, region: '', bio: bio || null, phone: phone || null,
      logo_url: logoUrl, lat: coords?.lat ?? null, lng: coords?.lng ?? null,
      plan: 'free', verified: false,
    }).select().single()
    if (err) { setError(err.message); setSaving(false); return }
    onComplete(data)
  }

  return (
    <main className="min-h-screen bg-bg text-cream">
      <SimpleNav locale={locale} />
      <div className="max-w-lg mx-auto px-6 pt-28 pb-16">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Configurazione profilo</p>
        <h1 className="text-3xl font-light mb-2">Crea il tuo profilo fornitore</h1>
        <p className="text-muted text-sm mb-8">Il profilo sarà visibile dopo la revisione del team VELO</p>
        <div className="bg-dark border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-3">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" /> : <span className="text-3xl opacity-20">🏷️</span>}
              </div>
              <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2.5 rounded-full hover:bg-gold/10 transition-colors">
                {logoPreview ? 'Cambia logo' : 'Carica logo'}
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Nome attività *</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder="Es. Studio Fotografico Rossi" />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Categoria *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Città *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder="Es. Firenze" />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Telefono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder="+39 000 000 0000" />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Presentazione</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
              placeholder="Descriviti brevemente..." />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={save} disabled={saving}
            className="w-full bg-gold text-bg font-semibold py-4 rounded-xl hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvataggio in corso...' : 'Crea profilo →'}
          </button>
        </div>
      </div>
    </main>
  )
}

// ─── VENDOR DASHBOARD ──────────────────────────────────────────────────────────
function VendorDashboard({ vendor, locale, onLogout, onUpdate }: {
  vendor: any; locale: string; onLogout: () => void; onUpdate: (v: any) => void
}) {
  const tr = getT(locale)
  const d = tr.vendor.dashboard
  const [tab, setTab] = useState<'profile' | 'info' | 'photos' | 'social' | 'availability' | 'stats'>('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [businessName, setBusinessName] = useState(vendor.business_name || '')
  const [category, setCategory] = useState(vendor.category || CATEGORIES[0])
  const [location, setLocation] = useState(vendor.location || '')
  const [bio, setBio] = useState(vendor.bio || '')
  const [phone, setPhone] = useState(vendor.phone || '')
  const [priceFrom, setPriceFrom] = useState(vendor.price_from || '')
  const [priceTo, setPriceTo] = useState(vendor.price_to || '')
  const [instagram, setInstagram] = useState(vendor.instagram || '')
  const [facebook, setFacebook] = useState(vendor.facebook || '')
  const [tiktok, setTiktok] = useState(vendor.tiktok || '')
  const [website, setWebsite] = useState(vendor.website || '')
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp || '')
  const [maxEvents, setMaxEvents] = useState(vendor.max_events_per_day || 1)
  const [specialties, setSpecialties] = useState<string[]>(vendor.specialties || [])
  const [languages, setLanguages] = useState<string[]>(vendor.languages || [])
  const [yearsExp, setYearsExp] = useState<string>((vendor.years_experience || 0).toString())
  const [awards, setAwards] = useState<string[]>(
    vendor.awards?.length ? [...vendor.awards, '', ''].slice(0, 3) : ['', '', '']
  )
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(vendor.logo_url || '')
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([
    vendor.photo1_url || '', vendor.photo2_url || '', vendor.photo3_url || '',
  ])
  const [photoSaving, setPhotoSaving] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)) }
  }
  const handlePhotoChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const nf = [...photoFiles]; nf[idx] = file; setPhotoFiles(nf)
    const np = [...photoPreviews]; np[idx] = URL.createObjectURL(file); setPhotoPreviews(np)
  }

  const savePhotos = async () => {
    setPhotoSaving(true)
    const urls = [vendor.photo1_url || '', vendor.photo2_url || '', vendor.photo3_url || '']
    for (let i = 0; i < 3; i++) {
      if (photoFiles[i]) {
        const ext = photoFiles[i]!.name.split('.').pop() || 'jpg'
        const url = await uploadImage(photoFiles[i]!, `${vendor.id}/photo${i + 1}.${ext}`)
        if (url) urls[i] = url
      }
    }
    const { data } = await supabase.from('vendor_accounts').update({
      photo1_url: urls[0] || null, photo2_url: urls[1] || null, photo3_url: urls[2] || null,
    }).eq('id', vendor.id).select().single()
    if (data) { onUpdate({ ...vendor, ...data }); setPhotoMsg('✓ Foto salvate') }
    setPhotoSaving(false); setTimeout(() => setPhotoMsg(''), 3000)
  }

  const save = async () => {
    setSaving(true)
    const coords = location !== vendor.location ? await geocodeCity(location) : null
    let logoUrl = vendor.logo_url
    if (logoFile) {
      const ext = logoFile.name.split('.').pop() || 'jpg'
      const url = await uploadImage(logoFile, `${vendor.id}/logo.${ext}`)
      if (url) logoUrl = url
    }
    const payload: any = {
      business_name: businessName, category, location, bio: bio || null,
      phone: phone || null, instagram: instagram || null, facebook: facebook || null,
      tiktok: tiktok || null, website: website || null, whatsapp: whatsapp || null,
      price_from: priceFrom || null, price_to: priceTo || null,
      max_events_per_day: maxEvents, logo_url: logoUrl,
      specialties, languages,
      years_experience: parseInt(yearsExp) || 0,
      awards: awards.filter(Boolean),
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    }
    const { data } = await supabase.from('vendor_accounts').update(payload).eq('id', vendor.id).select().single()
    if (data) { onUpdate({ ...vendor, ...data }); setSavedMsg('✓') }
    setEditing(false); setSaving(false); setLogoFile(null)
    setTimeout(() => setSavedMsg(''), 2000)
  }

  const statusBadge = vendor.public_vendor_id
    ? { label: '✓ In vetrina', cls: 'text-green-400 border-green-400/30 bg-green-400/5' }
    : vendor.verified
    ? { label: '✓ Verificato · in attesa di pubblicazione', cls: 'text-gold border-gold/30 bg-gold/5' }
    : { label: '⏳ In attesa di approvazione', cls: 'text-muted border-border bg-transparent' }

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light hidden sm:block">VELO</span>
          </Link>
          <span className="text-muted text-sm hidden md:block truncate">{vendor.business_name}</span>
          <div className="flex items-center gap-3 shrink-0">
            <LangToggle locale={locale} />
            <button onClick={onLogout} className="text-red-400 text-xs hover:opacity-70 border border-red-400/30 rounded-full px-3 py-1.5">{d.logout}</button>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-10 pt-24">
        <div className="mb-8">
          <p className="text-muted text-xs tracking-widest uppercase mb-2">{d.label}</p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-light">{vendor.business_name}</h1>
              <p className="text-muted mt-1">{vendor.category} · {vendor.location}</p>
              <span className={`inline-block mt-2 text-xs border rounded-full px-3 py-1 ${statusBadge.cls}`}>{statusBadge.label}</span>
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-right shrink-0">
              <p className="text-gold text-xs font-medium">{d.free}</p>
              <p className="text-muted text-xs mt-1">{d.freeTil}</p>
              <p className="text-muted text-xs">{d.then}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['profile', 'info', 'photos', 'social', 'availability', 'stats'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setEditing(false) }}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab === t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t === 'profile' ? d.tabProfile : t === 'info' ? '✨ Info' : t === 'photos' ? '📸 Foto' : t === 'social' ? d.tabSocial : t === 'availability' ? d.tabAvailability : d.tabStats}
            </button>
          ))}
        </div>

        {/* INFO */}
        {tab === 'info' && (
          <div className="bg-dark border border-border rounded-2xl p-6 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-cream font-medium">✨ Info vetrina</h2>
              <button onClick={save} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>

            {/* Specialità — max 5 */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">Punti di forza / Specialità <span className="text-gold">(max 5)</span></p>
              <p className="text-muted/60 text-xs mb-3">Seleziona fino a 5 che ti rappresentano meglio</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALITA.map(sp => {
                  const on = specialties.includes(sp)
                  const atMax = specialties.length >= 5 && !on
                  return (
                    <button key={sp}
                      onClick={() => { if (atMax) return; setSpecialties(prev => on ? prev.filter(x => x !== sp) : [...prev, sp]) }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'border-gold bg-gold/10 text-gold' : atMax ? 'border-border text-muted opacity-40 cursor-not-allowed' : 'border-border text-muted hover:border-gold/50'}`}>
                      {sp}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Anni esperienza */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-3">Anni di esperienza</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setYearsExp(v => Math.max(0, parseInt(v||'0') - 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">−</button>
                <span className="text-3xl font-light text-cream w-12 text-center">{yearsExp || '0'}</span>
                <button onClick={() => setYearsExp(v => (parseInt(v||'0') + 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">+</button>
                <span className="text-muted text-sm">anni nel settore wedding</span>
              </div>
            </div>

            {/* Lingue */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-3">Lingue parlate</p>
              <div className="flex flex-wrap gap-2">
                {LINGUE.map(lang => {
                  const on = languages.includes(lang)
                  return (
                    <button key={lang}
                      onClick={() => setLanguages(prev => on ? prev.filter(x => x !== lang) : [...prev, lang])}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50'}`}>
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Riconoscimenti */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">🏆 Riconoscimenti <span className="text-muted/60">(opzionale)</span></p>
              <p className="text-muted/60 text-xs mb-3">Premi, pubblicazioni su riviste, certificazioni — fino a 3</p>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <input key={i} type="text" value={awards[i] || ''} onChange={e => { const n = [...awards]; n[i] = e.target.value; setAwards(n) }}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                    placeholder={i === 0 ? 'es. WedAwards 2024 — Miglior Fotografo' : i === 1 ? 'es. Pubblicato su Vogue Sposa' : 'es. Premio Eccellenza VELO'} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILO */}
        {tab === 'profile' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.profileTitle}</h2>
              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? d.saving : savedMsg || (editing ? d.save : d.edit)}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-3">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                      {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" /> : <span className="text-2xl opacity-20">🏷️</span>}
                    </div>
                    <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                      {logoPreview ? 'Cambia logo' : 'Carica logo'}
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">Nome attività</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">Città</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" placeholder="Es. Firenze" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.bioLabel}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                    placeholder={d.bioPlaceholder} />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                    placeholder={d.phonePlaceholder} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceFromLabel}</label>
                    <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceToLabel}</label>
                    <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream">{d.cancel}</button>
              </div>
            ) : (
              <div>
                {vendor.logo_url && (
                  <div className="mb-4"><div className="w-14 h-14 rounded-xl overflow-hidden border border-border">
                    <img src={vendor.logo_url} alt="logo" className="w-full h-full object-cover" />
                  </div></div>
                )}
                {[
                  ['Nome', vendor.business_name],
                  [d.category, vendor.category],
                  ['Città', vendor.location || '—'],
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

        {/* FOTO */}
        {tab === 'photos' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-cream font-medium">📸 Foto del portfolio</h2>
              <button onClick={savePhotos} disabled={photoSaving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {photoSaving ? 'Salvataggio...' : photoMsg || 'Salva foto'}
              </button>
            </div>
            <p className="text-muted text-xs mb-6">Fino a 3 foto per il portfolio. Formato consigliato: 16:9, max 5MB.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <div className="aspect-video rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center relative group">
                    {photoPreviews[i]
                      ? <img src={photoPreviews[i]} className="w-full h-full object-cover" alt={`foto ${i + 1}`} />
                      : <span className="text-4xl opacity-20">📷</span>}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-cream text-xs border border-cream/50 rounded-full px-3 py-1">{photoPreviews[i] ? 'Cambia' : 'Carica'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange(i)} className="hidden" />
                    </label>
                  </div>
                  <p className="text-muted text-xs text-center">Foto {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOCIAL */}
        {tab === 'social' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.socialTitle}</h2>
              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? d.saving : savedMsg || (editing ? d.save : d.edit)}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, ph: '@profilo' },
                  { label: 'Facebook', val: facebook, set: setFacebook, ph: 'facebook.com/pagina' },
                  { label: 'TikTok', val: tiktok, set: setTiktok, ph: '@profilo' },
                  { label: 'Sito web', val: website, set: setWebsite, ph: 'www.example.com' },
                  { label: 'WhatsApp', val: whatsapp, set: setWhatsapp, ph: '+39 000 000 0000' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" placeholder={ph} />
                  </div>
                ))}
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream">{d.cancel}</button>
              </div>
            ) : (
              <div>
                {[['📷 Instagram', vendor.instagram], ['📘 Facebook', vendor.facebook],
                  ['🎵 TikTok', vendor.tiktok], ['🌐 Sito web', vendor.website], ['💬 WhatsApp', vendor.whatsapp],
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

        {/* DISPONIBILITÀ */}
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
              <button onClick={() => setMaxEvents((v: number) => Math.max(1, v - 1))}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center">−</button>
              <span className="text-4xl font-light text-cream w-12 text-center">{maxEvents}</span>
              <button onClick={() => setMaxEvents((v: number) => v + 1)}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center">+</button>
              <span className="text-muted text-sm">{d.maxEvents}</span>
            </div>
            <p className="text-muted text-xs bg-bg border border-border rounded-xl p-4">{d.availabilityNote}</p>
          </div>
        )}

        {/* STATISTICHE */}
        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[[d.statsCouples, 'text-gold'], [d.statsConfirmed, 'text-green-400'],
                [d.statsMessages, 'text-blue-400'], [d.statsViews, 'text-cream'],
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
