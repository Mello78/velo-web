'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { getT } from '../../lib/translations'
import SimpleNav from '../../components/SimpleNav'
import LangToggle from '../../components/LangToggle'

const CATEGORIES = [
  '📷 Fotografia', '🎬 Video', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica',
  '🏛️ Location', '💌 Partecipazioni', '🎂 Torta', '🌺 Fiori', '🚗 Auto',
  '💄 Trucco & Parrucco', '👗 Abiti', '🎉 Animazione', '🎁 Bomboniere', '📋 Wedding Planner',
]

const LINGUE = ['Italiano', 'English', 'Français', 'Deutsch', 'Español', 'Português', '中文', 'العربية']
const SPECIALITA_PER_CATEGORIA: Record<string, string[]> = {
  '📷 Fotografia': ['Reportage naturale', 'Fine Art', 'Stile romantico', 'Stile documentario', 'Luxury & Editoriale', 'Bianco e nero', 'Film analogico', 'Drone'],
  '🎬 Video': ['Cinematic', 'Reportage', 'Drone aereo', 'Super 8 / Film', 'Short film', 'Highlight 3 min', 'Full day'],
  '🌸 Floral Design': ['Allestimento chiesa', 'Allestimento ricevimento', 'Bouquet cascata', 'Decorazioni tavoli', 'Archi floreali', 'Stile boho', 'Stile lusso', 'Fiori secchi'],
  '🍽️ Catering': ['Cucina italiana tradizionale', 'Cucina fusion', 'Menu vegano', 'Finger food', 'Buffet', 'Servizio al tavolo', 'Food truck', 'Chef privato'],
  '🎵 Musica': ['Jazz trio', 'Musica classica', 'Band pop/rock', 'DJ set', "Quartetto d'archi", 'Pianoforte live', 'Singer & guitar'],
  '🏛️ Location': ['Villa storica', 'Castello', 'Masseria', 'Agriturismo', 'Vista mare', 'Vista lago', 'Vista montagna', 'Tenuta vinicola'],
  '💌 Partecipazioni': ['Stile classico', 'Acquerello', 'Calligrafia a mano', 'Stampa tipografica', 'Laser cut', 'Illustrazione custom'],
  '🎂 Torta': ['Naked cake', 'Torta fondente', 'Torta floreale', 'Torta a piani', 'Torta moderna', 'Dolci tradizionali'],
  '💄 Trucco & Parrucco': ['Trucco naturale', 'Trucco glamour', 'Acconciatura raccolta', 'Acconciatura sciolta', 'Prove incluse', 'Servizio in loco'],
  '👗 Abiti': ['Alta moda', 'Sartoria su misura', 'Abiti vintage', 'Abiti boho', 'Abiti da sposo', 'Noleggio'],
  '🚗 Auto': ["Auto d'epoca", 'Auto di lusso', 'Limousine', 'Cabriolet', 'Carrozza'],
  '📋 Wedding Planner': ['Full planning', 'Day coordination', 'Design & styling', 'Destination wedding', 'Budget management'],
}

const SPECIALITA_GENERICHE = ['Destination wedding', 'Coppie straniere', 'Multilingue', 'Piccoli matrimoni (< 30)', 'Grandi eventi (> 150)', "Matrimoni all'aperto", 'Cerimonie religiose', 'Cerimonie civili', 'Disponibile weekend']

function getSpecialitaPerCategoria(category: string): string[] {
  const key = Object.keys(SPECIALITA_PER_CATEGORIA).find(k =>
    category.includes(k.replace(/[^\w\s]/g, '').trim()) || k.includes(category.replace(/[^\w\s]/g, '').trim())
  )
  return key ? SPECIALITA_PER_CATEGORIA[key] : SPECIALITA_GENERICHE
}

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
  if (!file || file.size === 0) { console.error('File vuoto'); return null }
  if (file.size > 5 * 1024 * 1024) { alert('Il file supera i 5MB'); return null }
  const { error } = await supabase.storage.from('vendor-photos').upload(path, file, { upsert: true })
  if (error) { console.error('Upload error:', error); alert('Errore upload: ' + error.message); return null }
  const { data } = supabase.storage.from('vendor-photos').getPublicUrl(path)
  return data.publicUrl
}

function formatRelativeTime(dateStr: string, locale = 'it'): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (locale === 'en') {
    if (min < 2) return 'just now'
    if (min < 60) return `${min}m ago`
    if (hr < 24) return `${hr}h ago`
    if (day === 1) return 'yesterday'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  if (min < 2) return 'ora'
  if (min < 60) return `${min} min fa`
  if (hr < 24) return `${hr}h fa`
  if (day === 1) return 'ieri'
  return new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

// ─── PROFILE COMPLETION COMPONENT ──────────────────────────────────────────
function ProfileCompletion({ vendor, d }: { vendor: any; d: any }) {
  const items = [
    { ok: !!vendor.logo_url, label: d.completionLogo },
    { ok: !!(vendor.bio?.trim()), label: d.completionBioIt },
    { ok: !!(vendor.bio_en?.trim()), label: d.completionBioEn },
    { ok: !!(vendor.specialties?.length), label: d.completionSpecialties },
    { ok: !!(vendor.photo1_url || vendor.photo2_url || vendor.photo3_url), label: d.completionPhoto },
    { ok: !!(vendor.instagram || vendor.website || vendor.whatsapp), label: d.completionContacts },
    { ok: !!(vendor.price_from), label: d.completionPrice },
  ]
  const done = items.filter(i => i.ok).length
  const score = Math.round((done / items.length) * 100)
  const missing = items.filter(i => !i.ok)

  if (score === 100) {
    return (
      <div className="bg-green-400/5 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-green-400 text-sm">✓</span>
        <p className="text-green-400 text-sm">{d.completionComplete}</p>
      </div>
    )
  }

  return (
    <div className="bg-dark border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted uppercase tracking-wider">{d.completionTitle}</p>
        <p className="text-sm font-medium text-gold">{score}%</p>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-muted/60 text-xs mb-2">{d.completionMissing}</p>
      <div className="flex flex-wrap gap-1.5">
        {missing.map(item => (
          <span key={item.label} className="text-xs border border-border text-muted rounded-full px-2.5 py-0.5">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
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
        if (va) { setVendorData(va); setMode('dashboard') }
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
      else setSuccess("✓ Registrazione completata! Controlla la tua email e clicca sul link di conferma, poi torna qui ad accedere. Se non trovi l'email, controlla la cartella spam.")
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
              {isLogin ? tr.vendor.dashboard.loginTitle : tr.vendor.dashboard.registerTitle}
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
            <p className="text-center text-muted text-sm mt-5">
              {isLogin ? (
                <>{tr.vendor.dashboard.newToVelo}{' '}
                  <button onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
                    className="text-gold hover:opacity-70 transition-opacity underline underline-offset-2">
                    Crea il tuo profilo gratuito →
                  </button>
                </>
              ) : (
                <>{tr.vendor.dashboard.alreadyAccount}{' '}
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

// ─── PROFILE SETUP ──────────────────────────────────────────────────────────
function ProfileSetup({ locale, userId, onComplete }: {
  locale: string; userId: string; onComplete: (va: any) => void
}) {
  const tr = getT(locale)
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
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">{tr.vendor.dashboard.label}</p>
        <h1 className="text-3xl font-light mb-2">{tr.vendor.dashboard.setupTitle}</h1>
        <p className="text-muted text-sm mb-8">{tr.vendor.dashboard.setupSubtitle}</p>
        <div className="bg-dark border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-3">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                {logoPreview
                  ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" />
                  : <span className="text-muted text-xs text-center leading-tight px-2">Logo</span>}
              </div>
              <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2.5 rounded-full hover:bg-gold/10 transition-colors">
                {logoPreview ? 'Cambia logo' : 'Carica logo'}
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">{tr.vendor.dashboard.nameLabel} *</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder={tr.vendor.dashboard.namePlaceholder} />
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">Categoria *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-wider block mb-2">{tr.vendor.dashboard.cityLabel} *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder={tr.vendor.dashboard.cityPlaceholder} />
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
            <p className="text-muted/50 text-xs mt-1">La versione in inglese puoi aggiungerla dopo dal tab Info</p>
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

// ─── VENDOR DASHBOARD ───────────────────────────────────────────────────────
function VendorDashboard({ vendor, locale, onLogout, onUpdate }: {
  vendor: any; locale: string; onLogout: () => void; onUpdate: (v: any) => void
}) {
  const tr = getT(locale)
  const d = tr.vendor.dashboard
  const [tab, setTab] = useState<'profile' | 'info' | 'messages' | 'photos' | 'social' | 'availability' | 'stats'>('profile')
  const [profileEditing, setProfileEditing] = useState(false)
  const [socialEditing, setSocialEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Profile / social fields
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
  const [maxGuests, setMaxGuests] = useState(vendor.max_guests?.toString() || '')

  // Info fields
  const [specialties, setSpecialties] = useState<string[]>(vendor.specialties || [])
  const [languages, setLanguages] = useState<string[]>(vendor.languages || [])
  const [yearsExp, setYearsExp] = useState<string>((vendor.years_experience || 0).toString())
  const [awards, setAwards] = useState<string[]>(
    vendor.awards?.length ? [...vendor.awards, '', ''].slice(0, 3) : ['', '', '']
  )
  const [awardsEn, setAwardsEn] = useState<string[]>(
    vendor.awards_en?.length ? [...vendor.awards_en, '', ''].slice(0, 3) : ['', '', '']
  )
  const [specialtiesCustom, setSpecialtiesCustom] = useState<string[]>(
    vendor.specialties_custom?.length ? [...vendor.specialties_custom, '', ''] : ['', '', '']
  )
  const [specialtiesCustomEn, setSpecialtiesCustomEn] = useState<string[]>(
    vendor.specialties_custom_en?.length ? [...vendor.specialties_custom_en, '', ''] : ['', '', '']
  )
  const [bioEn, setBioEn] = useState(vendor.bio_en || '')
  const [translating, setTranslating] = useState(false)
  const [translateMsg, setTranslateMsg] = useState('')

  // Chat
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatConversations, setChatConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [newMsg, setNewMsg] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [translatingMsg, setTranslatingMsg] = useState<string | null>(null)
  const [chatLoaded, setChatLoaded] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const messagesBottomRef = useRef<HTMLDivElement>(null)

  // Photos
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(vendor.logo_url || '')
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([
    vendor.photo1_url || '', vendor.photo2_url || '', vendor.photo3_url || '',
  ])
  const [photoSaving, setPhotoSaving] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')

  // Auto-scroll chat when messages change
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [chatMessages])

  // Auto-load conversations when switching to messages tab
  useEffect(() => {
    if (tab === 'messages' && !chatLoaded) {
      loadConversations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

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
        const url = await uploadImage(photoFiles[i]!, `${vendor.user_id}/photo${i + 1}.${ext}`)
        if (url) urls[i] = url
      }
    }
    const { data } = await supabase.from('vendor_accounts').update({
      photo1_url: urls[0] || null, photo2_url: urls[1] || null, photo3_url: urls[2] || null,
    }).eq('id', vendor.id).select().single()
    if (data) {
      onUpdate({ ...vendor, ...data })
      if (vendor.public_vendor_id) {
        await supabase.from('public_vendors').update({
          photo1_url: urls[0] || null,
          photo2_url: urls[1] || null,
          photo3_url: urls[2] || null,
        }).eq('id', vendor.public_vendor_id)
      }
      setPhotoMsg('✓ Foto salvate')
    }
    setPhotoSaving(false); setTimeout(() => setPhotoMsg(''), 3000)
  }

  const save = async () => {
    setSaving(true)
    const coords = location !== vendor.location ? await geocodeCity(location) : null
    let logoUrl = vendor.logo_url
    if (logoFile) {
      const ext = logoFile.name.split('.').pop() || 'jpg'
      const url = await uploadImage(logoFile, `${vendor.user_id}/logo.${ext}`)
      if (url) logoUrl = url
    }
    const payload: any = {
      business_name: businessName, category, location, bio: bio || null,
      phone: phone || null, instagram: instagram || null, facebook: facebook || null,
      tiktok: tiktok || null, website: website || null, whatsapp: whatsapp || null,
      price_from: priceFrom || null, price_to: priceTo || null,
      max_events_per_day: maxEvents, logo_url: logoUrl,
      max_guests: maxGuests ? parseInt(maxGuests) : null,
      specialties, languages,
      specialties_custom: specialtiesCustom.filter(Boolean),
      bio_en: bioEn || null,
      awards_en: awardsEn.filter(Boolean),
      specialties_custom_en: specialtiesCustomEn.filter(Boolean),
      years_experience: parseInt(yearsExp) || 0,
      awards: awards.filter(Boolean),
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    }
    const { data } = await supabase.from('vendor_accounts').update(payload).eq('id', vendor.id).select().single()
    if (data) {
      onUpdate({ ...vendor, ...data })
      setProfileEditing(false)
      setSocialEditing(false)
      if (vendor.public_vendor_id) {
        await supabase.from('public_vendors').update({
          name: businessName, category, location, region: vendor.region,
          description: bio || null, description_en: bioEn || null,
          phone: phone || null, instagram: instagram || null, facebook: facebook || null,
          tiktok: tiktok || null, website: website || null, whatsapp: whatsapp || null,
          price_from: priceFrom || null, price_to: priceTo || null,
          logo_url: logoUrl, max_guests: maxGuests ? parseInt(maxGuests) : null,
          specialties, languages,
          specialties_custom: specialtiesCustom.filter(Boolean),
          bio_en: bioEn || null, awards_en: awardsEn.filter(Boolean),
          specialties_custom_en: specialtiesCustomEn.filter(Boolean),
          years_experience: parseInt(yearsExp) || 0,
          awards: awards.filter(Boolean),
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }).eq('id', vendor.public_vendor_id)
      }
      setSavedMsg('✓')
    }
    setSaving(false); setLogoFile(null)
    setTimeout(() => setSavedMsg(''), 2000)
  }

  // FIX: field names now match what velo-translate-vendor actually returns
  const translateToEnglish = async () => {
    setTranslating(true); setTranslateMsg('')
    try {
      const { data, error } = await supabase.functions.invoke('velo-translate-vendor', {
        body: {
          bio,
          specialties_custom: specialtiesCustom.filter(Boolean),
          awards: awards.filter(Boolean),
        },
      })
      if (error || data?.error) {
        setTranslateMsg('✕ Errore: ' + (error?.message || data?.error || data?.message))
        setTranslating(false)
        return
      }
      // Edge function returns: bio_en, specialties_custom_en, awards_en
      if (data.bio_en) setBioEn(data.bio_en)
      if (data.specialties_custom_en?.length) setSpecialtiesCustomEn(data.specialties_custom_en)
      if (data.awards_en?.length) setAwardsEn(data.awards_en)
      // Persist immediately to avoid losing translation on reload
      await supabase.from('vendor_accounts').update({
        bio_en: data.bio_en || null,
        awards_en: data.awards_en?.filter(Boolean) || [],
        specialties_custom_en: data.specialties_custom_en?.filter(Boolean) || [],
      }).eq('id', vendor.id)
      if (vendor.public_vendor_id) {
        await supabase.from('public_vendors').update({
          bio_en: data.bio_en || null,
          description_en: data.bio_en || null,
          awards_en: data.awards_en || [],
          specialties_custom_en: data.specialties_custom_en?.filter(Boolean) || [],
        }).eq('id', vendor.public_vendor_id)
      }
      setTranslateMsg('✓ Traduzione salvata')
      setTimeout(() => setTranslateMsg(''), 3000)
    } catch (_e) {
      setTranslateMsg('✕ Errore di rete')
    }
    setTranslating(false)
  }

  const loadConversations = async () => {
    setChatLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setChatLoading(false); return }
    const { data } = await supabase.from('messages')
      .select('id, user_id, vendor_id, content, image_url, created_at, from_vendor, is_read')
      .eq('vendor_user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) {
      const byCouple: Record<string, any[]> = {}
      data.forEach((m: any) => {
        if (!byCouple[m.user_id]) byCouple[m.user_id] = []
        byCouple[m.user_id].push(m)
      })
      const userIds = Object.keys(byCouple)
      let couplesMap: Record<string, { partner1: string; partner2: string }> = {}
      if (userIds.length > 0) {
        const { data: couplesData } = await supabase.from('couples')
          .select('user_id, partner1, partner2').in('user_id', userIds)
        couplesData?.forEach((c: any) => { couplesMap[c.user_id] = { partner1: c.partner1 || '', partner2: c.partner2 || '' } })
      }
      const convs = Object.entries(byCouple).map(([uid, msgs]) => ({
        coupleUserId: uid,
        lastMessage: msgs[0],
        partner1: couplesMap[uid]?.partner1 || '',
        partner2: couplesMap[uid]?.partner2 || '',
        unread: msgs.filter((m: any) => !m.from_vendor && !m.is_read).length,
      }))
      // Sort by most recent last message
      convs.sort((a, b) =>
        new Date(b.lastMessage?.created_at || 0).getTime() - new Date(a.lastMessage?.created_at || 0).getTime()
      )
      setChatConversations(convs)
    }
    setChatLoaded(true)
    setChatLoading(false)
  }

  const loadChatWithCouple = async (coupleUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('messages').select('*')
      .eq('vendor_user_id', session.user.id)
      .eq('user_id', coupleUserId).order('created_at', { ascending: true })
    if (data) {
      setChatMessages(data)
      const unreadIds = data.filter((m: any) => !m.from_vendor && !m.is_read).map((m: any) => m.id)
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds)
        setChatConversations((prev: any[]) => prev.map((c: any) =>
          c.coupleUserId === coupleUserId ? { ...c, unread: 0 } : c
        ))
      }
    }
    setSelectedConv(coupleUserId)
  }

  const sendVendorMessage = async () => {
    if (!newMsg.trim() || !selectedConv) return
    setSendingMsg(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const existing = chatMessages[0]
    const { data } = await supabase.from('messages').insert({
      content: newMsg.trim(),
      vendor_id: existing?.vendor_id || null,
      user_id: selectedConv,
      vendor_user_id: session.user.id,
      from_vendor: true,
    }).select().single()
    if (data) {
      setChatMessages(prev => [...prev, data])
      // Update last message in conversation list
      setChatConversations(prev => prev.map(c =>
        c.coupleUserId === selectedConv ? { ...c, lastMessage: data } : c
      ))
    }
    setNewMsg('')
    setSendingMsg(false)
  }

  const sendImageAsVendor = async (file: File) => {
    if (!selectedConv || !file) return
    if (file.size > 5 * 1024 * 1024) { alert('Il file supera i 5MB'); return }
    setUploadingImg(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setUploadingImg(false); return }
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${session.user.id}/chat_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('chat-images').upload(filePath, file, { upsert: true })
    if (error) { alert('Errore upload: ' + error.message); setUploadingImg(false); return }
    const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(filePath)
    const existing = chatMessages[0]
    const { data } = await supabase.from('messages').insert({
      content: null, image_url: publicUrl,
      vendor_id: existing?.vendor_id || null,
      user_id: selectedConv, vendor_user_id: session.user.id,
      from_vendor: true,
    }).select().single()
    if (data) setChatMessages(prev => [...prev, data])
    setUploadingImg(false)
  }

  const translateChatMessage = async (msgId: string, content: string) => {
    if (!content?.trim()) return
    setTranslatingMsg(msgId)
    try {
      const targetLang = locale === 'it' ? 'en' : 'it'
      const { data } = await supabase.functions.invoke('velo-translate-message', {
        body: { text: content, target_lang: targetLang },
      })
      if (data.translated) {
        setChatMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, _translated: data.translated } : m
        ))
      }
    } catch {}
    setTranslatingMsg(null)
  }

  const statusBadge = vendor.public_vendor_id
    ? { label: '✓ In vetrina', cls: 'text-green-400 border-green-400/30 bg-green-400/5' }
    : vendor.verified
    ? { label: '✓ Verificato · in attesa di pubblicazione', cls: 'text-gold border-gold/30 bg-gold/5' }
    : { label: '⏳ In attesa di approvazione', cls: 'text-muted border-border bg-transparent' }

  // Derived state for conversation header
  const currentConv = chatConversations.find(c => c.coupleUserId === selectedConv)
  const currentCoupleName = currentConv?.partner1 && currentConv?.partner2
    ? `${currentConv.partner1} & ${currentConv.partner2}`
    : currentConv?.partner1 || (locale === 'it' ? 'Conversazione' : 'Conversation')

  return (
    <main className="min-h-screen bg-bg text-cream">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light hidden sm:block">VELO</span>
          </Link>
          <span className="text-muted text-sm hidden md:block truncate">{vendor.business_name}</span>
          <div className="flex items-center gap-3 shrink-0">
            <LangToggle locale={locale} />
            <button onClick={onLogout}
              className="text-red-400 text-xs hover:opacity-70 border border-red-400/30 rounded-full px-3 py-1.5">
              {d.logout}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pt-24">

        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-muted text-xs tracking-widest uppercase mb-2">{d.label}</p>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-3xl font-light">{vendor.business_name}</h1>
              <p className="text-muted mt-1 text-sm">{vendor.category} · {vendor.location}</p>
              <span className={`inline-block mt-2 text-xs border rounded-full px-3 py-1 ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-right shrink-0">
              <p className="text-gold text-xs font-medium">{d.free}</p>
              <p className="text-muted text-xs mt-1">{d.freeTil}</p>
              <p className="text-muted text-xs">{d.then}</p>
            </div>
          </div>
          {/* Profile completion bar */}
          <ProfileCompletion vendor={vendor} d={d} />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['profile', 'info', 'messages', 'photos', 'social', 'availability', 'stats'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setProfileEditing(false); setSocialEditing(false); setSavedMsg('') }}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab === t
                ? 'bg-gold text-bg font-semibold'
                : 'border border-border text-muted hover:text-cream hover:border-gold/30'}`}>
              {t === 'profile' ? d.tabProfile
                : t === 'info' ? d.tabInfo
                : t === 'messages' ? d.tabMessages
                : t === 'photos' ? d.tabPhotos
                : t === 'social' ? d.tabSocial
                : t === 'availability' ? d.tabAvailability
                : d.tabStats}
            </button>
          ))}
        </div>

        {/* ════════════════ INFO TAB ════════════════ */}
        {tab === 'info' && (
          <div className="bg-dark border border-border rounded-2xl p-6 space-y-8">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-cream font-medium">{d.infoTitle}</h2>
                <p className="text-muted/60 text-xs mt-1">{d.infoPublicNote}</p>
              </div>
              <button onClick={save} disabled={saving}
                className="text-sm px-5 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50 shrink-0">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>

            {/* Specialità */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-muted text-xs uppercase tracking-wider">{d.specialtiesLabel}</p>
                <span className={`text-xs rounded-full px-2 py-0.5 border ${
                  specialties.length >= 5
                    ? 'border-gold/40 text-gold bg-gold/10'
                    : 'border-border text-muted'
                }`}>
                  {specialties.length}/5
                </span>
              </div>
              <p className="text-muted/60 text-xs mb-3">{d.specialtiesHint}</p>
              <p className="text-muted/50 text-xs mb-3">
                {locale === 'it' ? 'Lista per:' : 'List for:'}{' '}
                <strong className="text-cream/70">{category || vendor.category}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {getSpecialitaPerCategoria(category || vendor.category || '').map(sp => {
                  const on = specialties.includes(sp)
                  const atMax = specialties.length >= 5 && !on
                  return (
                    <button key={sp}
                      onClick={() => { if (atMax) return; setSpecialties(prev => on ? prev.filter(x => x !== sp) : [...prev, sp]) }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        on
                          ? 'border-gold bg-gold/10 text-gold'
                          : atMax
                          ? 'border-border text-muted opacity-40 cursor-not-allowed'
                          : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                      }`}>
                      {sp}
                    </button>
                  )
                })}
              </div>

              {/* Custom specialties */}
              <div className="mt-5 space-y-2">
                <p className="text-muted/60 text-xs">{d.specialtiesCustomLabel}</p>
                {[0, 1, 2].map(i => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input type="text" value={specialtiesCustom[i] || ''}
                      onChange={e => { const n = [...specialtiesCustom]; n[i] = e.target.value; setSpecialtiesCustom(n) }}
                      className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={`Skill personalizzata IT`} />
                    <input type="text" value={specialtiesCustomEn[i] || ''}
                      onChange={e => { const n = [...specialtiesCustomEn]; n[i] = e.target.value; setSpecialtiesCustomEn(n) }}
                      className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60"
                      placeholder={`Custom skill EN`} />
                  </div>
                ))}
                <p className="text-muted/40 text-xs">IT = italiano · EN = inglese · oppure usa il bottone Traduci</p>
              </div>
            </div>

            {/* Anni esperienza */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-3">{d.yearsLabel}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setYearsExp(v => Math.max(0, parseInt(v || '0') - 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">
                  −
                </button>
                <span className="text-3xl font-light text-cream w-12 text-center">{yearsExp || '0'}</span>
                <button
                  onClick={() => setYearsExp(v => (parseInt(v || '0') + 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">
                  +
                </button>
                <span className="text-muted text-sm">{d.yearsUnit}</span>
              </div>
            </div>

            {/* Lingue */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-3">{d.languagesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {LINGUE.map(lang => {
                  const on = languages.includes(lang)
                  return (
                    <button key={lang}
                      onClick={() => setLanguages(prev => on ? prev.filter(x => x !== lang) : [...prev, lang])}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        on ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'
                      }`}>
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Riconoscimenti */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">
                {d.awardsLabel} <span className="text-muted/50 normal-case font-normal">(opzionale)</span>
              </p>
              <p className="text-muted/60 text-xs mb-3">{d.awardsHint}</p>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input type="text" value={awards[i] || ''}
                      onChange={e => { const n = [...awards]; n[i] = e.target.value; setAwards(n) }}
                      className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={i === 0 ? 'Premio IT' : i === 1 ? 'Pubblicazione IT' : 'Riconoscimento IT'} />
                    <input type="text" value={awardsEn[i] || ''}
                      onChange={e => { const n = [...awardsEn]; n[i] = e.target.value; setAwardsEn(n) }}
                      className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60"
                      placeholder={i === 0 ? 'Award EN' : i === 1 ? 'Publication EN' : 'Recognition EN'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Traduzione automatica */}
            <div className="pt-4 border-t border-border">
              <button onClick={translateToEnglish} disabled={translating}
                className="w-full py-3 rounded-xl border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors disabled:opacity-50">
                {translating ? d.translating : d.translateBtn}
              </button>
              {translateMsg && (
                <p className={`text-center text-xs mt-2 ${translateMsg.startsWith('✕') ? 'text-red-400' : 'text-green-400'}`}>
                  {translateMsg}
                </p>
              )}
              <p className="text-muted/50 text-xs text-center mt-1">{d.translateHint}</p>
            </div>
          </div>
        )}

        {/* ════════════════ MESSAGES TAB ════════════════ */}
        {tab === 'messages' && (
          <div className="bg-dark border border-border rounded-2xl overflow-hidden">
            {!selectedConv ? (
              // Conversation list
              <div>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-cream font-medium">
                      {locale === 'it' ? 'Messaggi' : 'Messages'}
                    </h2>
                    {chatConversations.length > 0 && (
                      <p className="text-muted text-xs mt-0.5">
                        {chatConversations.length} {locale === 'it' ? 'conversazioni' : 'conversations'}
                        {chatConversations.some(c => c.unread > 0) && (
                          <span className="text-gold ml-2">
                            · {chatConversations.reduce((s, c) => s + c.unread, 0)} {locale === 'it' ? 'da leggere' : 'unread'}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button onClick={loadConversations}
                    className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1.5 hover:bg-gold/10 transition-colors">
                    {d.messagesRefresh}
                  </button>
                </div>

                {chatLoading ? (
                  <div className="p-16 text-center">
                    <p className="text-muted text-sm">{locale === 'it' ? 'Caricamento...' : 'Loading...'}</p>
                  </div>
                ) : chatConversations.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mx-auto mb-4">
                      <span className="text-muted text-xl">↩</span>
                    </div>
                    <p className="text-cream font-light text-base mb-1">{d.messagesEmpty}</p>
                    <p className="text-muted text-sm">{d.messagesEmptyDesc}</p>
                  </div>
                ) : (
                  <div>
                    {chatConversations.map((conv: any) => {
                      const needsReply = conv.lastMessage && !conv.lastMessage.from_vendor
                      const coupleName = conv.partner1 && conv.partner2
                        ? `${conv.partner1} & ${conv.partner2}`
                        : conv.partner1 || (locale === 'it' ? 'Sposi' : 'Couple')
                      const initial = (conv.partner1?.[0] || '?').toUpperCase()
                      return (
                        <button key={conv.coupleUserId}
                          onClick={() => loadChatWithCouple(conv.coupleUserId)}
                          className={`w-full text-left p-4 border-b border-border last:border-0 transition-colors ${
                            conv.unread > 0 ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-white/5'
                          }`}>
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-medium ${
                              conv.unread > 0 ? 'bg-gold/20 text-gold' : 'bg-border text-muted'
                            }`}>
                              {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-sm font-medium truncate ${conv.unread > 0 ? 'text-cream' : 'text-cream/80'}`}>
                                  {coupleName}
                                </p>
                                {conv.unread > 0 && (
                                  <span className="shrink-0 bg-gold text-bg text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold">
                                    {conv.unread}
                                  </span>
                                )}
                                {needsReply && conv.unread === 0 && (
                                  <span className="shrink-0 text-gold border border-gold/30 text-xs rounded-full px-2 py-0.5 leading-none">
                                    {d.needsReply}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted text-xs truncate">
                                {conv.lastMessage?.from_vendor && (
                                  <span className="text-muted/50">{locale === 'it' ? 'Tu: ' : 'You: '}</span>
                                )}
                                {conv.lastMessage?.content || (conv.lastMessage?.image_url ? '📷' : '—')}
                              </p>
                            </div>
                            <p className="text-muted/50 text-xs shrink-0 self-start mt-0.5">
                              {conv.lastMessage ? formatRelativeTime(conv.lastMessage.created_at, locale) : ''}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Chat thread
              <div className="flex flex-col" style={{ height: '68vh', minHeight: 480, maxHeight: 720 }}>
                {/* Thread header */}
                <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => { setSelectedConv(null); setChatMessages([]) }}
                    className="text-gold hover:opacity-70 text-sm shrink-0 transition-opacity">
                    ← {locale === 'it' ? 'Tutti' : 'Back'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-cream font-medium truncate">{currentCoupleName}</h2>
                    <p className="text-muted/60 text-xs">
                      {chatMessages.length} {locale === 'it' ? 'messaggi' : 'messages'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {chatMessages.length === 0 && (
                    <p className="text-muted text-sm text-center py-8">{d.messagesNone}</p>
                  )}
                  {chatMessages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.from_vendor ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm ${
                        m.from_vendor
                          ? 'bg-gold text-bg rounded-br-sm'
                          : 'bg-white/10 text-cream rounded-bl-sm border border-border'
                      }`}>
                        {m.image_url ? (
                          <img src={m.image_url} alt="" className="rounded-xl max-w-full" style={{ maxHeight: 220 }} />
                        ) : (
                          <p className="leading-relaxed">{m.content}</p>
                        )}
                        {!m.image_url && (
                          <button
                            onClick={() => translateChatMessage(m.id, m._translated || m.content)}
                            className={`text-xs mt-1 transition-opacity block ${
                              m.from_vendor ? 'opacity-40 hover:opacity-70' : 'opacity-30 hover:opacity-60'
                            }`}
                            disabled={translatingMsg === m.id}>
                            {translatingMsg === m.id ? '...' : '↔'}
                          </button>
                        )}
                        {m._translated && (
                          <p className="text-xs mt-1.5 opacity-70 border-t border-white/10 pt-1.5 italic leading-relaxed">
                            {m._translated}
                          </p>
                        )}
                        <p className={`text-xs mt-1 ${m.from_vendor ? 'opacity-50' : 'opacity-40'}`}>
                          {new Date(m.created_at).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-GB', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesBottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border flex gap-2 items-end shrink-0">
                  <label className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                    uploadingImg ? 'border-border opacity-40 cursor-not-allowed' : 'border-border hover:border-gold/40'
                  }`}>
                    <span className="text-muted text-base">{uploadingImg ? '…' : '📷'}</span>
                    <input type="file" accept="image/*,image/heic" className="hidden"
                      disabled={uploadingImg}
                      onChange={e => { const f = e.target.files?.[0]; if (f) sendImageAsVendor(f); e.target.value = '' }} />
                  </label>
                  <input
                    type="text" value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendVendorMessage()}
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                    placeholder={d.messagesPlaceholder} />
                  <button
                    onClick={sendVendorMessage}
                    disabled={!newMsg.trim() || sendingMsg}
                    className="bg-gold text-bg font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 text-sm shrink-0 transition-opacity">
                    {sendingMsg ? '…' : '→'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ PROFILE TAB ════════════════ */}
        {tab === 'profile' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">{d.profileTitle}</h2>
              <div className="flex items-center gap-2">
                {profileEditing && (
                  <button onClick={() => { setProfileEditing(false); setLogoFile(null) }}
                    className="text-muted text-sm hover:text-cream transition-colors">
                    {d.cancel}
                  </button>
                )}
                <button onClick={() => profileEditing ? save() : setProfileEditing(true)} disabled={saving}
                  className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                  {saving ? d.saving : savedMsg || (profileEditing ? d.save : d.edit)}
                </button>
              </div>
            </div>

            {profileEditing ? (
              // Edit mode
              <div className="space-y-5">
                {/* Logo */}
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-3">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                      {logoPreview
                        ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" />
                        : <span className="text-muted text-xs">Logo</span>}
                    </div>
                    <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                      {logoPreview ? 'Cambia logo' : 'Carica logo'}
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Identità */}
                <div className="space-y-4 pb-4 border-b border-border">
                  <p className="text-muted/60 text-xs uppercase tracking-wider">
                    {locale === 'it' ? 'Informazioni base' : 'Basic information'}
                  </p>
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.nameLabel}</label>
                    <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">
                      {locale === 'it' ? 'Categoria' : 'Category'}
                    </label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.cityLabel}</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder="Es. Firenze" />
                  </div>
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={d.phonePlaceholder} />
                  </div>
                </div>

                {/* Biografia */}
                <div className="space-y-4 pb-4 border-b border-border">
                  <p className="text-muted/60 text-xs uppercase tracking-wider">{d.bioLabel}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted/60 text-xs mb-1.5">🇮🇹 Italiano</p>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                        placeholder={d.bioPlaceholder} />
                    </div>
                    <div>
                      <p className="text-muted/60 text-xs mb-1.5">🇬🇧 English</p>
                      <textarea value={bioEn} onChange={e => setBioEn(e.target.value)} rows={5}
                        className="w-full bg-bg border border-border/60 rounded-xl px-4 py-3 text-cream/80 text-sm focus:outline-none focus:border-gold/60 resize-none"
                        placeholder="Describe yourself in English... (or use Translate in Info)" />
                    </div>
                  </div>
                  <button onClick={translateToEnglish} disabled={translating}
                    className="w-full py-2.5 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10 transition-colors disabled:opacity-50">
                    {translating ? d.translating : d.translateBtn}
                  </button>
                  {translateMsg && (
                    <p className={`text-center text-xs mt-1 ${translateMsg.startsWith('✕') ? 'text-red-400' : 'text-green-400'}`}>
                      {translateMsg}
                    </p>
                  )}
                </div>

                {/* Prezzi */}
                <div className="space-y-4">
                  <p className="text-muted/60 text-xs uppercase tracking-wider">
                    {locale === 'it' ? 'Prezzi' : 'Pricing'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceFromLabel}</label>
                      <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder="0" />
                    </div>
                    <div>
                      <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceToLabel}</label>
                      <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder={locale === 'it' ? 'Lascia vuoto se a richiesta' : 'Leave empty if on request'} />
                    </div>
                  </div>
                  {['location', 'catering'].some(t => (category || vendor.category || '').toLowerCase().includes(t)) && (
                    <div>
                      <label className="text-muted text-xs uppercase tracking-wider block mb-2">
                        {locale === 'it' ? 'Numero massimo ospiti' : 'Maximum guests'}
                      </label>
                      <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder={locale === 'it' ? 'es. 150' : 'e.g. 150'} />
                      <p className="text-muted/50 text-xs mt-1">
                        {locale === 'it'
                          ? 'Le coppie vedranno solo le location compatibili con il loro numero di ospiti'
                          : 'Couples will only see venues compatible with their guest count'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // View mode — card layout
              <div className="space-y-6">
                {/* Identity */}
                <div className="flex items-start gap-4">
                  {vendor.logo_url ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                      <img src={vendor.logo_url} alt="logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0">
                      <span className="text-muted text-xs text-center leading-tight px-1">
                        {locale === 'it' ? 'No logo' : 'No logo'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-cream text-xl font-light">{vendor.business_name}</h3>
                    <p className="text-muted text-sm mt-0.5">{vendor.category}</p>
                    <p className="text-muted/60 text-xs mt-1">{vendor.location || '—'}</p>
                  </div>
                </div>

                {/* Bio */}
                {(vendor.bio || vendor.bio_en) ? (
                  <div className="space-y-4 py-4 border-t border-border">
                    {vendor.bio && (
                      <div>
                        <p className="text-muted/50 text-xs uppercase tracking-wider mb-2">IT</p>
                        <p className="text-cream/90 text-sm leading-relaxed">{vendor.bio}</p>
                      </div>
                    )}
                    {vendor.bio_en && (
                      <div>
                        <p className="text-muted/50 text-xs uppercase tracking-wider mb-2">EN</p>
                        <p className="text-cream/60 text-sm leading-relaxed italic">{vendor.bio_en}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 border-t border-border">
                    <p className="text-muted/40 text-sm italic">
                      {locale === 'it' ? 'Biografia non ancora inserita' : 'Bio not yet added'}
                    </p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="bg-bg rounded-xl p-3 border border-border">
                    <p className="text-muted/50 text-xs mb-1 uppercase tracking-wider">{d.phone}</p>
                    <p className="text-cream text-sm">{vendor.phone || '—'}</p>
                  </div>
                  <div className="bg-bg rounded-xl p-3 border border-border">
                    <p className="text-muted/50 text-xs mb-1 uppercase tracking-wider">{d.prices}</p>
                    <p className="text-cream text-sm">
                      {vendor.price_from
                        ? `€${vendor.price_from}${vendor.price_to ? ` – €${vendor.price_to}` : '+'}`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ PHOTOS TAB ════════════════ */}
        {tab === 'photos' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-cream font-medium">{d.photosTitle}</h2>
              <button onClick={savePhotos} disabled={photoSaving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {photoSaving ? d.saving : photoMsg || (locale === 'it' ? 'Salva foto' : 'Save photos')}
              </button>
            </div>
            <p className="text-muted text-xs mb-6">{d.photosHint}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <div className={`aspect-video rounded-xl bg-bg overflow-hidden flex items-center justify-center relative group ${
                    i === 0 && photoPreviews[0]
                      ? 'border border-gold/40 ring-1 ring-gold/20'
                      : 'border border-border'
                  }`}>
                    {photoPreviews[i]
                      ? <img src={photoPreviews[i]} className="w-full h-full object-cover" alt={`foto ${i + 1}`} />
                      : (
                        <div className="text-center px-4">
                          <p className="text-muted text-xs">{locale === 'it' ? 'Nessuna foto' : 'No photo'}</p>
                          {i === 0 && (
                            <p className="text-muted/50 text-xs mt-1">
                              {locale === 'it' ? 'Prima in vetrina' : 'First shown in profile'}
                            </p>
                          )}
                        </div>
                      )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-cream text-xs border border-cream/40 rounded-full px-3 py-1">
                        {photoPreviews[i]
                          ? (locale === 'it' ? 'Cambia' : 'Change')
                          : (locale === 'it' ? 'Carica' : 'Upload')}
                      </span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange(i)} className="hidden" />
                    </label>
                  </div>
                  <p className={`text-xs text-center ${i === 0 ? 'text-gold/70' : 'text-muted'}`}>
                    {i === 0
                      ? d.photo1CoverLabel
                      : locale === 'it' ? `Foto ${i + 1}` : `Photo ${i + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ SOCIAL TAB ════════════════ */}
        {tab === 'social' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-cream font-medium">{d.socialTitle}</h2>
                <p className="text-muted/60 text-xs mt-1">
                  {locale === 'it'
                    ? 'I contatti verificati appaiono nella vetrina pubblica'
                    : 'Verified contacts appear in your public profile'}
                </p>
              </div>
              <button onClick={() => socialEditing ? save() : setSocialEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50 shrink-0">
                {saving ? d.saving : savedMsg || (socialEditing ? d.save : d.edit)}
              </button>
            </div>

            {socialEditing ? (
              <div className="space-y-4 mt-5">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, ph: '@profilo o URL completo' },
                  { label: 'Facebook', val: facebook, set: setFacebook, ph: 'facebook.com/pagina' },
                  { label: 'TikTok', val: tiktok, set: setTiktok, ph: '@profilo' },
                  { label: locale === 'it' ? 'Sito web' : 'Website', val: website, set: setWebsite, ph: 'www.example.com' },
                  { label: 'WhatsApp', val: whatsapp, set: setWhatsapp, ph: '+39 000 000 0000' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={ph} />
                  </div>
                ))}
                <button onClick={() => setSocialEditing(false)} className="text-muted text-sm hover:text-cream transition-colors">
                  {d.cancel}
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-1">
                {[
                  { label: 'Instagram', value: vendor.instagram, href: vendor.instagram ? `https://instagram.com/${vendor.instagram.replace('@', '')}` : null },
                  { label: 'Facebook', value: vendor.facebook, href: vendor.facebook },
                  { label: 'TikTok', value: vendor.tiktok, href: vendor.tiktok ? `https://tiktok.com/@${vendor.tiktok.replace('@', '')}` : null },
                  { label: locale === 'it' ? 'Sito web' : 'Website', value: vendor.website, href: vendor.website },
                  { label: 'WhatsApp', value: vendor.whatsapp, href: vendor.whatsapp ? `https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}` : null },
                ].map(({ label, value, href }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-4">
                    <span className="text-muted text-sm shrink-0 w-24">{label}</span>
                    {value ? (
                      href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:opacity-80 truncate transition-opacity">
                          {value}
                        </a>
                      ) : (
                        <span className="text-cream text-sm truncate">{value}</span>
                      )
                    ) : (
                      <span className="text-muted/40 text-sm italic">
                        {locale === 'it' ? 'Non inserito' : 'Not set'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════ AVAILABILITY TAB ════════════════ */}
        {tab === 'availability' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-cream font-medium">{d.availabilityTitle}</h2>
                <p className="text-muted text-sm mt-1">{d.availabilityDesc}</p>
              </div>
              <button onClick={save} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50 shrink-0">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>

            {/* Stato attuale */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
              <p className="text-gold text-xs uppercase tracking-wider mb-1">
                {locale === 'it' ? 'Configurazione attuale' : 'Current setting'}
              </p>
              <p className="text-cream text-sm">
                {locale === 'it'
                  ? `Max ${maxEvents} ${maxEvents === 1 ? 'matrimonio' : 'matrimoni'} nello stesso giorno`
                  : `Max ${maxEvents} ${maxEvents === 1 ? 'wedding' : 'weddings'} on the same day`}
              </p>
            </div>

            <div className="flex items-center gap-5 mb-8">
              <button
                onClick={() => setMaxEvents((v: number) => Math.max(1, v - 1))}
                className="w-11 h-11 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center transition-colors">
                −
              </button>
              <span className="text-5xl font-light text-cream w-14 text-center">{maxEvents}</span>
              <button
                onClick={() => setMaxEvents((v: number) => v + 1)}
                className="w-11 h-11 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center transition-colors">
                +
              </button>
              <div>
                <p className="text-cream text-sm">{d.maxEvents}</p>
                <p className="text-muted/60 text-xs mt-0.5">
                  {locale === 'it'
                    ? 'Matrimoni in contemporanea nella stessa data'
                    : 'Concurrent weddings on the same date'}
                </p>
              </div>
            </div>

            <div className="bg-bg border border-border rounded-xl p-4 space-y-2">
              <p className="text-muted text-sm">{d.availabilityNote}</p>
              <p className="text-muted/60 text-xs">
                {locale === 'it'
                  ? 'Le coppie vedranno la tua disponibilità in base a quanti eventi hai già nella stessa data. Per bloccare date specifiche, usa l\'app VELO.'
                  : 'Couples will see your availability based on how many events you already have on the same date. To block specific dates, use the VELO app.'}
              </p>
            </div>
          </div>
        )}

        {/* ════════════════ STATS TAB ════════════════ */}
        {tab === 'stats' && (
          <StatsPanel vendorUserId={vendor.user_id} publicVendorId={vendor.public_vendor_id} d={d} locale={locale} />
        )}
      </div>
    </main>
  )
}

// ─── STATS PANEL ────────────────────────────────────────────────────────────
type EngagementStatus = 'lead' | 'quote_sent' | 'agreed' | 'booked' | 'completed' | 'cancelled'
type StatsData = {
  couples: number
  messages: number
  booked: number
  thisWeek: number
  byStatus: Record<EngagementStatus, number>
}

function StatsPanel({ vendorUserId, publicVendorId, d, locale }: {
  vendorUserId: string; publicVendorId: string | null; d: any; locale: string
}) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const vendorRowsRes = publicVendorId
        ? await supabase.from('vendors').select('id').eq('public_vendor_id', publicVendorId)
        : { data: [] }
      const vendorIds: string[] = (vendorRowsRes.data || []).map((r: any) => r.id)

      if (vendorIds.length === 0) {
        setStats({ couples: 0, messages: 0, booked: 0, thisWeek: 0, byStatus: { lead: 0, quote_sent: 0, agreed: 0, booked: 0, completed: 0, cancelled: 0 } })
        setLoading(false)
        return
      }

      const [msgsRes, engsRes] = await Promise.all([
        supabase.from('messages').select('id, user_id, created_at').in('vendor_id', vendorIds),
        supabase.from('engagements').select('id, status, user_id').in('vendor_id', vendorIds),
      ])

      const msgs = msgsRes.data || []
      const engs = engsRes.data || []

      const couples = new Set(msgs.map((m: any) => m.user_id)).size
      const week = new Date(); week.setDate(week.getDate() - 7)
      const thisWeek = msgs.filter((m: any) => new Date(m.created_at) > week).length
      const booked = engs.filter((e: any) => e.status === 'booked').length

      const byStatus: Record<EngagementStatus, number> = { lead: 0, quote_sent: 0, agreed: 0, booked: 0, completed: 0, cancelled: 0 }
      engs.forEach((e: any) => { if (e.status in byStatus) byStatus[e.status as EngagementStatus]++ })

      setStats({ couples, messages: msgs.length, booked, thisWeek, byStatus })
      setLoading(false)
    }
    load()
  }, [publicVendorId])

  const STATUS_LABELS: Record<EngagementStatus, string> = {
    lead: d.pipelineLead, quote_sent: d.pipelineQuoteSent, agreed: d.pipelineAgreed,
    booked: d.pipelineBooked, completed: d.pipelineCompleted, cancelled: d.pipelineCancelled,
  }
  const STATUS_COLORS: Record<EngagementStatus, string> = {
    lead: 'text-muted', quote_sent: 'text-blue-400', agreed: 'text-gold',
    booked: 'text-green-400', completed: 'text-green-400', cancelled: 'text-red-400',
  }

  if (loading) return <div className="text-center py-16 text-muted text-sm">{d.statsLoading}</div>

  return (
    <div className="space-y-5">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: d.statsCouples, value: stats?.couples ?? 0, cls: 'text-gold', hint: locale === 'it' ? 'coppie che ti hanno scritto' : 'couples who messaged you' },
          { label: d.statsConfirmed, value: stats?.booked ?? 0, cls: stats?.booked ? 'text-green-400' : 'text-muted', hint: locale === 'it' ? 'confermato dal contratto' : 'confirmed via agreement' },
          { label: d.statsMessages, value: stats?.messages ?? 0, cls: 'text-blue-400', hint: locale === 'it' ? 'totale scambiati' : 'total exchanged' },
          { label: d.statsViews, value: stats?.thisWeek ?? 0, cls: 'text-cream', hint: locale === 'it' ? 'negli ultimi 7 giorni' : 'in the last 7 days' },
        ].map(({ label, value, cls, hint }) => (
          <div key={label} className="bg-dark border border-border rounded-2xl p-5 text-center">
            <p className={`text-4xl font-light ${cls}`}>{value}</p>
            <p className="text-muted text-xs mt-2 leading-snug font-medium">{label}</p>
            <p className="text-muted/50 text-xs mt-0.5 leading-snug">{hint}</p>
          </div>
        ))}
      </div>

      {/* Engagement pipeline */}
      {stats && Object.values(stats.byStatus).some(v => v > 0) && (
        <div className="bg-dark border border-border rounded-2xl p-6">
          <p className="text-gold text-xs tracking-widest uppercase mb-5">{d.statsPipeline}</p>
          <div className="space-y-4">
            {(Object.entries(stats.byStatus) as [EngagementStatus, number][])
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-muted w-28 shrink-0">{STATUS_LABELS[status]}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold/60 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (count / Math.max(stats.couples, 1)) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-6 text-right shrink-0 ${STATUS_COLORS[status]}`}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Listing status */}
      {publicVendorId ? (
        <div className="bg-dark border border-border rounded-2xl p-5">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">{d.statsLiveTitle}</p>
          <p className="text-muted text-sm">{d.statsLiveDesc}</p>
        </div>
      ) : (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">{d.statsNotLiveTitle}</p>
          <p className="text-muted text-sm">{d.statsNotLiveDesc}</p>
        </div>
      )}
    </div>
  )
}
