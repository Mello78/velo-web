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
  const [tab, setTab] = useState<'vetrina' | 'messages' | 'availability' | 'stats'>('vetrina')
  const [editingSection, setEditingSection] = useState<string | null>(null)
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

  // Completion data
  const completionItems = [
    { ok: !!vendor.logo_url, label: d.completionLogo, section: 'essentials' },
    { ok: !!(vendor.bio?.trim()), label: d.completionBioIt, section: 'presentation' },
    { ok: !!(vendor.bio_en?.trim()), label: d.completionBioEn, section: 'presentation' },
    { ok: !!(vendor.specialties?.length), label: d.completionSpecialties, section: 'specialties' },
    { ok: !!(vendor.photo1_url || vendor.photo2_url || vendor.photo3_url), label: d.completionPhoto, section: 'portfolio' },
    { ok: !!(vendor.instagram || vendor.website || vendor.whatsapp), label: d.completionContacts, section: 'contacts' },
    { ok: !!(vendor.price_from), label: d.completionPrice, section: 'essentials' },
  ]
  const completionScore = Math.round((completionItems.filter(i => i.ok).length / completionItems.length) * 100)
  const completionMissing = completionItems.filter(i => !i.ok)

  // Derived state for conversation header
  const currentConv = chatConversations.find(c => c.coupleUserId === selectedConv)
  const currentCoupleName = currentConv?.partner1 && currentConv?.partner2
    ? `${currentConv.partner1} & ${currentConv.partner2}`
    : currentConv?.partner1 || (locale === 'it' ? 'Conversazione' : 'Conversation')

  const totalUnread = chatConversations.reduce((s, c) => s + c.unread, 0)

  return (
    <main className="min-h-screen bg-bg text-cream">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light hidden sm:block">VELO</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-muted text-sm truncate">{vendor.business_name}</span>
            <span className="text-border mx-1">·</span>
            <span className={`text-xs border rounded-full px-2.5 py-1 shrink-0 ${statusBadge.cls}`}>{statusBadge.label}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LangToggle locale={locale} />
            <button onClick={onLogout} className="text-muted text-xs hover:text-red-400 transition-colors">
              {d.logout}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* ══ HERO DASHBOARD ══════════════════════════════════════ */}
        <div className="rounded-2xl border border-border bg-dark p-6 sm:p-8 mb-6">
          {/* Identity row */}
          <div className="flex items-start gap-5 mb-6">
            {vendor.logo_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                <img src={vendor.logo_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border border-dashed border-border/60 flex items-center justify-center shrink-0 bg-bg/40">
                <span className="text-muted/50 text-xs">Logo</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-[1.75rem] font-light text-cream leading-tight tracking-tight">{vendor.business_name}</h1>
              <p className="text-muted text-sm mt-1.5">{vendor.category} · {vendor.location}</p>
              <span className={`inline-flex mt-2.5 text-xs border rounded-full px-3 py-1 ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-gold text-xs font-semibold tracking-wide">{d.free}</p>
              <p className="text-muted/60 text-xs mt-1">{d.freeTil}</p>
              <p className="text-muted/40 text-xs mt-0.5">{d.then}</p>
            </div>
          </div>
          {/* Completion row */}
          <div className="border-t border-border/60 pt-6">
            <div className="flex items-center gap-5 flex-wrap">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `conic-gradient(#C9A84C 0% ${completionScore}%, #1e1c19 ${completionScore}% 100%)` }}
              >
                <div className="w-11 h-11 bg-dark rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gold">{completionScore}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {completionScore < 100 ? (
                  <>
                    <p className="text-cream/90 text-sm font-semibold mb-2.5">
                      <span className="text-gold">{completionMissing.length}</span>{' '}
                      {locale === 'it'
                        ? (completionMissing.length === 1 ? 'elemento mancante nel profilo' : 'elementi mancanti nel profilo')
                        : (completionMissing.length === 1 ? 'item missing from profile' : 'items missing from profile')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {completionMissing.map(item => (
                        <button key={item.label}
                          onClick={() => { setTab('vetrina'); setEditingSection(item.section) }}
                          className="text-xs border border-gold/40 text-gold rounded-full px-3 py-1 hover:bg-gold/10 transition-colors font-medium">
                          {item.label} →
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-green-400 text-sm font-semibold">{d.completionComplete}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {completionMissing.length > 0 && (
                  <button
                    onClick={() => { setTab('vetrina'); setEditingSection(completionMissing[0].section) }}
                    className="bg-gold text-bg text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                    {locale === 'it' ? 'Completa vetrina →' : 'Complete showcase →'}
                  </button>
                )}
                {vendor.public_vendor_id && (
                  <a href={`/fornitori/${vendor.public_vendor_id}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-muted/80 border border-border rounded-xl px-4 py-3 hover:text-cream hover:border-gold/30 transition-colors">
                    {locale === 'it' ? 'Vedi vetrina ↗' : 'View profile ↗'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4-TAB BAR ── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['vetrina', 'messages', 'availability', 'stats'] as const).map(t => {
            const label = t === 'vetrina' ? (locale === 'it' ? 'Vetrina' : 'Showcase')
              : t === 'messages' ? (locale === 'it' ? 'Messaggi' : 'Messages')
              : t === 'availability' ? (locale === 'it' ? 'Disponibilità' : 'Availability')
              : (locale === 'it' ? 'Statistiche' : 'Statistics')
            return (
              <button key={t}
                onClick={() => { setTab(t); setEditingSection(null); setSavedMsg('') }}
                className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream hover:border-gold/30'
                }`}>
                {label}
                {t === 'messages' && totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-bg text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {totalUnread}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ══ VETRINA TAB ══════════════════════════════════════════ */}
        {tab === 'vetrina' && (
          <div className="space-y-4">

            {/* ─ Essenziali ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'essentials' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${businessName && location && priceFrom ? 'bg-green-400' : 'bg-gold'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">{locale === 'it' ? 'Essenziali' : 'Essentials'}</h3>
                    <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? "Appare nell'intestazione della vetrina pubblica" : 'Shown in your public profile header'}</p>
                  </div>
                </div>
                {editingSection === 'essentials' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await save(); setEditingSection(null) }} disabled={saving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? d.saving : savedMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('essentials')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'essentials' ? (
                  <div className="space-y-4 pt-5">
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wider mb-3">Logo</p>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-border bg-bg overflow-hidden flex items-center justify-center shrink-0">
                          {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" /> : <span className="text-muted text-xs">Logo</span>}
                        </div>
                        <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                          {logoPreview ? (locale === 'it' ? 'Cambia logo' : 'Change logo') : (locale === 'it' ? 'Carica logo' : 'Upload logo')}
                          <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.nameLabel}</label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{locale === 'it' ? 'Categoria' : 'Category'}</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold">
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                        </select></div>
                      <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.cityLabel}</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceFromLabel}</label>
                        <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" placeholder="0" /></div>
                      <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.priceToLabel}</label>
                        <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                          placeholder={locale === 'it' ? 'Vuoto = su richiesta' : 'Empty = on request'} /></div>
                    </div>
                    <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.phoneLabel}</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder={d.phonePlaceholder} /></div>
                    {['location', 'catering'].some(t => (category || vendor.category || '').toLowerCase().includes(t)) && (
                      <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">{locale === 'it' ? 'Numero massimo ospiti' : 'Maximum guests'}</label>
                        <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                          placeholder={locale === 'it' ? 'es. 150' : 'e.g. 150'} /></div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 pt-4 flex-wrap">
                    {vendor.logo_url && <img src={vendor.logo_url} alt="" className="w-12 h-12 rounded-xl border border-border object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-cream font-medium">{vendor.business_name}</p>
                      <p className="text-muted text-sm mt-0.5">{vendor.category} · {vendor.location}</p>
                    </div>
                    {vendor.price_from && (
                      <div className="text-right shrink-0">
                        <p className="text-muted text-xs uppercase tracking-wider mb-0.5">{d.prices}</p>
                        <p className="text-cream text-sm">€{vendor.price_from}{vendor.price_to ? `–€${vendor.price_to}` : '+'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─ Presentazione ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'presentation' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${vendor.bio && vendor.bio_en ? 'bg-green-400' : vendor.bio ? 'bg-gold' : 'bg-border'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">{locale === 'it' ? 'Presentazione' : 'Presentation'}</h3>
                    <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? 'Il racconto del tuo lavoro visibile in vetrina' : 'Your story shown on the public listing'}</p>
                  </div>
                </div>
                {editingSection === 'presentation' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await save(); setEditingSection(null) }} disabled={saving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? d.saving : savedMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('presentation')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'presentation' ? (
                  <div className="space-y-4 pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-muted/60 text-xs mb-2">🇮🇹 Italiano</p>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5}
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                          placeholder={d.bioPlaceholder} />
                      </div>
                      <div>
                        <p className="text-muted/60 text-xs mb-2">🇬🇧 English</p>
                        <textarea value={bioEn} onChange={e => setBioEn(e.target.value)} rows={5}
                          className="w-full bg-bg border border-border/60 rounded-xl px-4 py-3 text-cream/80 text-sm focus:outline-none focus:border-gold/60 resize-none"
                          placeholder={locale === 'it' ? 'Descrizione in inglese...' : 'Description in English...'} />
                      </div>
                    </div>
                    <button onClick={translateToEnglish} disabled={translating}
                      className="w-full py-2.5 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10 transition-colors disabled:opacity-50">
                      {translating ? d.translating : d.translateBtn}
                    </button>
                    {translateMsg && <p className={`text-center text-xs ${translateMsg.startsWith('✕') ? 'text-red-400' : 'text-green-400'}`}>{translateMsg}</p>}
                  </div>
                ) : (
                  <div className="pt-4 space-y-3">
                    {vendor.bio
                      ? <div><p className="text-muted/50 text-xs uppercase tracking-wider mb-1">IT</p><p className="text-cream/90 text-sm leading-relaxed line-clamp-3">{vendor.bio}</p></div>
                      : <p className="text-gold/70 text-xs italic">{locale === 'it' ? '⚠ Biografia IT non inserita' : '⚠ Italian bio not added'}</p>}
                    {vendor.bio_en
                      ? <div><p className="text-muted/50 text-xs uppercase tracking-wider mb-1">EN</p><p className="text-cream/60 text-sm leading-relaxed line-clamp-2 italic">{vendor.bio_en}</p></div>
                      : <p className="text-gold/70 text-xs italic">{locale === 'it' ? '⚠ Biografia EN mancante — usa Traduci in Modifica' : '⚠ English bio missing — use Translate in Edit'}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ─ Specialità e Stile ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'specialties' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${specialties.length > 0 ? 'bg-green-400' : 'bg-border'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">{locale === 'it' ? 'Specialità e Stile' : 'Specialties & Style'}</h3>
                    <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? 'Aiuta le coppie a trovarti con filtri pertinenti' : 'Helps couples find you with relevant filters'}</p>
                  </div>
                </div>
                {editingSection === 'specialties' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await save(); setEditingSection(null) }} disabled={saving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? d.saving : savedMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('specialties')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'specialties' ? (
                  <div className="space-y-6 pt-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-muted text-xs uppercase tracking-wider">{d.specialtiesLabel}</p>
                        <span className={`text-xs rounded-full px-2 py-0.5 border ${specialties.length >= 5 ? 'border-gold/40 text-gold bg-gold/10' : 'border-border text-muted'}`}>{specialties.length}/5</span>
                      </div>
                      <p className="text-muted/60 text-xs mb-3">{d.specialtiesHint}</p>
                      <div className="flex flex-wrap gap-2">
                        {getSpecialitaPerCategoria(category || vendor.category || '').map(sp => {
                          const on = specialties.includes(sp); const atMax = specialties.length >= 5 && !on
                          return (
                            <button key={sp} onClick={() => { if (atMax) return; setSpecialties(prev => on ? prev.filter(x => x !== sp) : [...prev, sp]) }}
                              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'border-gold bg-gold/10 text-gold' : atMax ? 'border-border text-muted opacity-40 cursor-not-allowed' : 'border-border text-muted hover:border-gold/50 hover:text-cream'}`}>
                              {sp}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wider mb-3">{d.yearsLabel}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setYearsExp(v => Math.max(0, parseInt(v || '0') - 1).toString())} className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">−</button>
                        <span className="text-3xl font-light text-cream w-12 text-center">{yearsExp || '0'}</span>
                        <button onClick={() => setYearsExp(v => (parseInt(v || '0') + 1).toString())} className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">+</button>
                        <span className="text-muted text-sm">{d.yearsUnit}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wider mb-3">{d.languagesLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {LINGUE.map(lang => { const on = languages.includes(lang); return (
                          <button key={lang} onClick={() => setLanguages(prev => on ? prev.filter(x => x !== lang) : [...prev, lang])}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50 hover:text-cream'}`}>
                            {lang}
                          </button>
                        )})}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted/60 text-xs mb-3">{d.specialtiesCustomLabel}</p>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                          <input type="text" value={specialtiesCustom[i] || ''} onChange={e => { const n = [...specialtiesCustom]; n[i] = e.target.value; setSpecialtiesCustom(n) }}
                            className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold" placeholder="Skill IT" />
                          <input type="text" value={specialtiesCustomEn[i] || ''} onChange={e => { const n = [...specialtiesCustomEn]; n[i] = e.target.value; setSpecialtiesCustomEn(n) }}
                            className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60" placeholder="Skill EN" />
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border">
                      <button onClick={translateToEnglish} disabled={translating} className="w-full py-3 rounded-xl border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors disabled:opacity-50">
                        {translating ? d.translating : d.translateBtn}
                      </button>
                      {translateMsg && <p className={`text-center text-xs mt-2 ${translateMsg.startsWith('✕') ? 'text-red-400' : 'text-green-400'}`}>{translateMsg}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4">
                    {specialties.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {specialties.map(sp => <span key={sp} className="text-xs border border-gold/30 bg-gold/5 text-gold rounded-full px-3 py-1">{sp}</span>)}
                        {languages.length > 0 && <span className="text-xs border border-border text-muted rounded-full px-3 py-1">{languages.join(' · ')}</span>}
                      </div>
                    ) : <p className="text-muted/40 text-sm italic">{locale === 'it' ? 'Nessuna specialità selezionata' : 'No specialties selected'}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ─ Trust & Riconoscimenti ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'trust' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${awards.filter(Boolean).length > 0 ? 'bg-green-400' : 'bg-border'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">{locale === 'it' ? 'Trust & Riconoscimenti' : 'Trust & Awards'}</h3>
                    <p className="text-muted/60 text-xs mt-0.5">
                      {locale === 'it' ? 'Aumenta la credibilità nella scheda pubblica' : 'Builds credibility in your public profile'}
                      <span className="ml-2 text-muted/40">{locale === 'it' ? '(opzionale)' : '(optional)'}</span>
                    </p>
                  </div>
                </div>
                {editingSection === 'trust' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await save(); setEditingSection(null) }} disabled={saving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? d.saving : savedMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('trust')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'trust' ? (
                  <div className="space-y-3 pt-5">
                    <p className="text-muted/60 text-xs">{d.awardsHint}</p>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input type="text" value={awards[i] || ''} onChange={e => { const n = [...awards]; n[i] = e.target.value; setAwards(n) }}
                          className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                          placeholder={i === 0 ? 'Premio IT' : i === 1 ? 'Pubblicazione IT' : 'Riconoscimento IT'} />
                        <input type="text" value={awardsEn[i] || ''} onChange={e => { const n = [...awardsEn]; n[i] = e.target.value; setAwardsEn(n) }}
                          className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60"
                          placeholder={i === 0 ? 'Award EN' : i === 1 ? 'Publication EN' : 'Recognition EN'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pt-4">
                    {awards.filter(Boolean).length > 0
                      ? <div className="space-y-1">{awards.filter(Boolean).map((aw, i) => <div key={i} className="flex items-center gap-2"><span className="text-gold text-xs">✦</span><span className="text-cream/80 text-sm">{aw}</span></div>)}</div>
                      : <p className="text-muted/40 text-sm italic">{locale === 'it' ? 'Nessun riconoscimento inserito' : 'No awards added yet'}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ─ Portfolio ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'portfolio' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${vendor.photo1_url || vendor.photo2_url || vendor.photo3_url ? 'bg-green-400' : 'bg-border'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">Portfolio</h3>
                    <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? 'La prima foto è la copertina della vetrina' : 'The first photo is your showcase cover'}</p>
                  </div>
                </div>
                {editingSection === 'portfolio' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await savePhotos(); setEditingSection(null) }} disabled={photoSaving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {photoSaving ? d.saving : photoMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('portfolio')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'portfolio' ? (
                  <div className="pt-5">
                    <p className="text-muted text-xs mb-4">{d.photosHint}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="space-y-1.5">
                          <div className={`aspect-video rounded-xl bg-bg overflow-hidden flex items-center justify-center relative group ${i === 0 && photoPreviews[0] ? 'border border-gold/40 ring-1 ring-gold/20' : 'border border-border'}`}>
                            {photoPreviews[i] ? <img src={photoPreviews[i]} className="w-full h-full object-cover" alt={`foto ${i + 1}`} /> : <span className="text-muted text-xs">{locale === 'it' ? 'Vuoto' : 'Empty'}</span>}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="text-cream text-xs border border-cream/40 rounded-full px-3 py-1">{photoPreviews[i] ? (locale === 'it' ? 'Cambia' : 'Change') : (locale === 'it' ? 'Carica' : 'Upload')}</span>
                              <input type="file" accept="image/*" onChange={handlePhotoChange(i)} className="hidden" />
                            </label>
                          </div>
                          <p className={`text-xs text-center ${i === 0 ? 'text-gold/70' : 'text-muted'}`}>{i === 0 ? (locale === 'it' ? 'Copertina' : 'Cover') : (locale === 'it' ? `Foto ${i + 1}` : `Photo ${i + 1}`)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[vendor.photo1_url, vendor.photo2_url, vendor.photo3_url].map((url, i) => (
                        <div key={i} className={`aspect-video rounded-xl overflow-hidden ${url ? 'border border-border' : 'border border-dashed border-border bg-bg flex items-center justify-center'}`}>
                          {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span className="text-muted text-xs">{locale === 'it' ? 'Vuoto' : 'Empty'}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Contatti & Social ─ */}
            <div className={`bg-dark border rounded-2xl overflow-hidden transition-colors duration-200 ${editingSection === 'contacts' ? 'border-gold/40' : 'border-border'}`}>
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${vendor.instagram || vendor.website || vendor.whatsapp ? 'bg-green-400' : 'bg-border'}`} />
                  <div>
                    <h3 className="text-cream font-medium text-sm">{locale === 'it' ? 'Contatti & Social' : 'Contacts & Social'}</h3>
                    <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? 'Visibili in vetrina solo per profili verificati' : 'Shown in listing only for verified profiles'}</p>
                  </div>
                </div>
                {editingSection === 'contacts' ? (
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => setEditingSection(null)} className="text-muted text-xs hover:text-cream transition-colors">{d.cancel}</button>
                    <button onClick={async () => { await save(); setEditingSection(null) }} disabled={saving}
                      className="text-xs px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? d.saving : savedMsg || d.save}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSection('contacts')}
                    className="text-xs text-gold border border-gold/30 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors shrink-0">{d.edit}</button>
                )}
              </div>
              <div className="px-6 pb-6 border-t border-border">
                {editingSection === 'contacts' ? (
                  <div className="space-y-4 pt-5">
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
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" placeholder={ph} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {[{ l: 'Instagram', v: vendor.instagram }, { l: 'Website', v: vendor.website }, { l: 'WhatsApp', v: vendor.whatsapp }, { l: 'Facebook', v: vendor.facebook }, { l: 'TikTok', v: vendor.tiktok }]
                      .filter(c => c.v).map(({ l, v }) => (
                        <div key={l} className="flex items-center gap-1.5">
                          <span className="text-muted/50 text-xs">{l}</span>
                          <span className="text-cream/70 text-xs truncate max-w-[120px]">{v}</span>
                        </div>
                      ))}
                    {!vendor.instagram && !vendor.website && !vendor.whatsapp && !vendor.facebook && !vendor.tiktok && (
                      <p className="text-muted/40 text-sm italic">{locale === 'it' ? 'Nessun contatto inserito' : 'No contacts added'}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ══ MESSAGES TAB ════════════════════════════════════════ */}
        {tab === 'messages' && (
          <div className="bg-dark border border-border rounded-2xl overflow-hidden" style={{ minHeight: 560 }}>
            <div className="lg:grid lg:grid-cols-[280px_1fr]" style={{ minHeight: 560 }}>

              {/* Left: Inbox list */}
              <div className={`flex flex-col border-r border-border ${selectedConv ? 'hidden lg:flex' : 'flex'}`} style={{ minHeight: 560 }}>
                <div className="px-5 py-4 border-b border-border shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-cream font-semibold text-sm tracking-tight">{locale === 'it' ? 'Conversazioni' : 'Conversations'}</h2>
                      {chatConversations.length > 0 && (
                        <p className="text-muted text-xs mt-0.5">
                          {chatConversations.length} {locale === 'it' ? 'attive' : 'active'}
                          {totalUnread > 0 && <span className="text-gold font-medium ml-2">· {totalUnread} {locale === 'it' ? 'non letti' : 'unread'}</span>}
                        </p>
                      )}
                    </div>
                    <button onClick={loadConversations} className="text-muted/70 hover:text-gold text-xs border border-border rounded-full px-3 py-1.5 transition-colors shrink-0">
                      ↻
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chatLoading ? (
                    <div className="flex items-center justify-center py-16"><p className="text-muted text-sm">{locale === 'it' ? 'Caricamento...' : 'Loading...'}</p></div>
                  ) : chatConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="w-14 h-14 rounded-2xl border border-border/60 flex items-center justify-center mb-4 bg-bg/30">
                        <span className="text-muted text-2xl">✉</span>
                      </div>
                      <p className="text-cream text-sm font-medium mb-1">{d.messagesEmpty}</p>
                      <p className="text-muted/70 text-xs leading-relaxed max-w-[200px]">{d.messagesEmptyDesc}</p>
                    </div>
                  ) : chatConversations.map((conv: any) => {
                    const coupleName = conv.partner1 && conv.partner2 ? `${conv.partner1} & ${conv.partner2}` : conv.partner1 || (locale === 'it' ? 'Sposi' : 'Couple')
                    const initial = (conv.partner1?.[0] || '?').toUpperCase()
                    const isActive = selectedConv === conv.coupleUserId
                    const needsReply = conv.lastMessage && !conv.lastMessage.from_vendor
                    return (
                      <button key={conv.coupleUserId} onClick={() => loadChatWithCouple(conv.coupleUserId)}
                        className={`w-full text-left px-4 py-3.5 border-b border-border/60 last:border-0 transition-colors border-l-2 ${
                          isActive ? 'bg-gold/10 border-l-gold' : conv.unread > 0 ? 'bg-gold/5 hover:bg-gold/8 border-l-transparent' : 'hover:bg-white/4 border-l-transparent'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${
                            isActive ? 'bg-gold/30 text-gold' : conv.unread > 0 ? 'bg-gold/20 text-gold' : 'bg-border/80 text-muted'
                          }`}>{initial}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className={`text-sm truncate ${conv.unread > 0 || isActive ? 'text-cream font-semibold' : 'text-cream/80 font-medium'}`}>{coupleName}</p>
                              {conv.unread > 0 && <span className="shrink-0 bg-gold text-bg text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">{conv.unread}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {conv.lastMessage?.from_vendor && <span className="text-muted/40 text-xs shrink-0">{locale === 'it' ? 'Tu: ' : 'You: '}</span>}
                              <p className="text-muted/70 text-xs truncate">{conv.lastMessage?.content || (conv.lastMessage?.image_url ? '📷' : '—')}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-1">
                            <p className="text-muted/40 text-[11px]">{conv.lastMessage ? formatRelativeTime(conv.lastMessage.created_at, locale) : ''}</p>
                            {needsReply && conv.unread === 0 && <span className="text-gold/80 border border-gold/30 text-[9px] rounded-full px-1.5 py-0.5 mt-1 block">{d.needsReply}</span>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right: Thread or placeholder */}
              <div className={`flex flex-col ${!selectedConv ? 'hidden lg:flex' : 'flex'}`} style={{ minHeight: 560 }}>
                {!selectedConv ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 px-8 text-center">
                    <div className="w-16 h-16 rounded-2xl border border-border/60 flex items-center justify-center mb-5 bg-bg/30">
                      <span className="text-muted/60 text-2xl">✉</span>
                    </div>
                    <p className="text-cream text-sm font-medium mb-1.5">{locale === 'it' ? 'Nessuna conversazione selezionata' : 'No conversation selected'}</p>
                    <p className="text-muted/60 text-xs leading-relaxed">{locale === 'it' ? 'Scegli una coppia dalla lista a sinistra' : 'Choose a couple from the list on the left'}</p>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-4 border-b border-border bg-dark/40 flex items-center gap-3 shrink-0">
                      <button onClick={() => { setSelectedConv(null); setChatMessages([]) }} className="text-gold hover:opacity-70 text-sm shrink-0 transition-opacity lg:hidden mr-1">
                        ←
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0 text-sm font-semibold text-gold">
                        {(currentConv?.partner1?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-cream font-semibold text-base truncate leading-tight">{currentCoupleName}</h2>
                        <p className="text-muted/50 text-xs mt-0.5">{chatMessages.length} {locale === 'it' ? 'messaggi' : 'messages'}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ minHeight: 0 }}>
                      {chatMessages.length === 0 && (
                        <p className="text-muted/60 text-sm text-center py-8 italic">{d.messagesNone}</p>
                      )}
                      {chatMessages.map((m: any) => (
                        <div key={m.id} className={`flex ${m.from_vendor ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[72%] min-w-[80px] px-4 py-3 rounded-2xl text-sm ${m.from_vendor ? 'bg-gold text-bg rounded-br-sm' : 'bg-white/8 text-cream rounded-bl-sm border border-border/60'}`}>
                            {m.image_url
                              ? <img src={m.image_url} alt="" className="rounded-xl max-w-full" style={{ maxHeight: 220 }} />
                              : <p className="leading-relaxed">{m.content}</p>}
                            {!m.image_url && (
                              <button onClick={() => translateChatMessage(m.id, m._translated || m.content)}
                                className={`text-xs mt-1.5 transition-opacity block ${m.from_vendor ? 'opacity-40 hover:opacity-70' : 'opacity-25 hover:opacity-55'}`}
                                disabled={translatingMsg === m.id}>{translatingMsg === m.id ? '...' : '↔'}</button>
                            )}
                            {m._translated && <p className="text-xs mt-2 opacity-70 border-t border-white/10 pt-2 italic leading-relaxed">{m._translated}</p>}
                            <p className={`text-[11px] mt-1.5 ${m.from_vendor ? 'opacity-50' : 'opacity-35'}`}>
                              {new Date(m.created_at).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesBottomRef} />
                    </div>
                    <div className="px-4 py-3.5 border-t border-border bg-dark/30 flex gap-3 items-center shrink-0">
                      <label className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${uploadingImg ? 'border-border/40 opacity-40 cursor-not-allowed' : 'border-border hover:border-gold/50 hover:bg-gold/5'}`}>
                        <span className="text-muted text-lg leading-none">{uploadingImg ? '…' : '+'}</span>
                        <input type="file" accept="image/*,image/heic" className="hidden" disabled={uploadingImg}
                          onChange={e => { const f = e.target.files?.[0]; if (f) sendImageAsVendor(f); e.target.value = '' }} />
                      </label>
                      <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendVendorMessage()}
                        className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold/60 placeholder:text-muted/50"
                        placeholder={d.messagesPlaceholder} />
                      <button onClick={sendVendorMessage} disabled={!newMsg.trim() || sendingMsg}
                        className="bg-gold text-bg font-semibold px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-35 text-sm shrink-0 transition-opacity min-w-[48px] text-center">
                        {sendingMsg ? '…' : '→'}
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ══ AVAILABILITY TAB ═════════════════════════════════════ */}
        {tab === 'availability' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-cream font-medium">{d.availabilityTitle}</h2>
              <p className="text-muted text-sm mt-1">{d.availabilityDesc}</p>
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mb-6">
              <p className="text-gold text-xs uppercase tracking-wider mb-1">{locale === 'it' ? 'Configurazione attuale' : 'Current setting'}</p>
              <p className="text-cream text-sm">{locale === 'it' ? `Max ${maxEvents} ${maxEvents === 1 ? 'matrimonio' : 'matrimoni'} nello stesso giorno` : `Max ${maxEvents} ${maxEvents === 1 ? 'wedding' : 'weddings'} on the same day`}</p>
            </div>
            <div className="flex items-center gap-5 mb-6">
              <button onClick={() => setMaxEvents((v: number) => Math.max(1, v - 1))} className="w-11 h-11 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center transition-colors">−</button>
              <span className="text-5xl font-light text-cream w-14 text-center">{maxEvents}</span>
              <button onClick={() => setMaxEvents((v: number) => v + 1)} className="w-11 h-11 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center transition-colors">+</button>
              <div>
                <p className="text-cream text-sm">{d.maxEvents}</p>
                <p className="text-muted/60 text-xs mt-0.5">{locale === 'it' ? 'Matrimoni in contemporanea nella stessa data' : 'Concurrent weddings on the same date'}</p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <p className="text-muted/60 text-xs max-w-sm leading-relaxed">{d.availabilityNote}</p>
              <button onClick={save} disabled={saving} className="text-sm px-5 py-2.5 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50 shrink-0">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>
          </div>
        )}

        {/* ══ STATS TAB ════════════════════════════════════════════ */}
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
        setLoading(false); return
      }
      const [msgsRes, engsRes] = await Promise.all([
        supabase.from('messages').select('id, user_id, created_at').in('vendor_id', vendorIds),
        supabase.from('engagements').select('id, status, user_id').in('vendor_id', vendorIds),
      ])
      const msgs = msgsRes.data || []; const engs = engsRes.data || []
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
  const STATUS_BAR_COLORS: Record<EngagementStatus, string> = {
    lead: '#8A7E6A', quote_sent: '#4A7AB8', agreed: '#C9A84C',
    booked: '#7A9E7E', completed: '#7A9E7E', cancelled: '#C4756A',
  }

  if (loading) return (
    <div className="bg-dark border border-border rounded-2xl p-12 text-center">
      <p className="text-muted text-sm">{d.statsLoading}</p>
    </div>
  )

  const hasData = stats && Object.values(stats.byStatus).some(v => v > 0)
  const totalEngagements = stats ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0) : 0

  return (
    <div className="space-y-4">

      {/* Pipeline — primary element */}
      <div className="bg-dark border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="text-muted/70 text-[10px] uppercase tracking-[0.15em] mb-1.5">{d.statsPipeline}</p>
            <p className="text-cream font-light text-lg leading-tight">
              {stats?.couples ?? 0}{' '}
              <span className="text-muted text-base">
                {locale === 'it' ? (stats?.couples === 1 ? 'coppia in contatto' : 'coppie in contatto') : (stats?.couples === 1 ? 'couple in contact' : 'couples in contact')}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-light text-green-400 leading-none">{stats?.booked ?? 0}</p>
            <p className="text-muted/70 text-xs mt-1.5 tracking-wide">{d.statsConfirmed}</p>
          </div>
        </div>
        {hasData ? (
          <div className="space-y-4">
            {(Object.entries(stats!.byStatus) as [EngagementStatus, number][])
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="flex items-center gap-4">
                  <span className={`text-xs w-28 shrink-0 font-medium ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
                  <div className="flex-1 h-1.5 bg-border/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (count / Math.max(totalEngagements, 1)) * 100)}%`, background: STATUS_BAR_COLORS[status] }} />
                  </div>
                  <span className={`text-sm font-semibold w-6 text-right shrink-0 tabular-nums ${STATUS_COLORS[status]}`}>{count}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-4 border-t border-border/40">
            <p className="text-muted/60 text-sm italic leading-relaxed">
              {locale === 'it'
                ? 'Nessun dato ancora — i dati appaiono quando le coppie interagiscono con il profilo'
                : 'No data yet — data appears when couples interact with your profile'}
            </p>
          </div>
        )}
      </div>

      {/* Activity strip — 3 metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: stats?.couples ?? 0, label: d.statsCouples, hint: locale === 'it' ? 'coppie che hanno scritto' : 'couples who messaged', color: 'text-gold' },
          { value: stats?.messages ?? 0, label: d.statsMessages, hint: locale === 'it' ? 'messaggi totali' : 'total messages', color: 'text-blue-400' },
          { value: stats?.thisWeek ?? 0, label: d.statsViews, hint: locale === 'it' ? 'ultimi 7 giorni' : 'last 7 days', color: 'text-cream/90' },
        ].map(({ value, label, hint, color }) => (
          <div key={label} className="bg-dark border border-border rounded-2xl p-5 text-center">
            <p className={`text-4xl font-light leading-none ${color}`}>{value}</p>
            <p className="text-muted/80 text-xs mt-2.5 font-medium leading-snug">{label}</p>
            <p className="text-muted/40 text-[11px] mt-1 leading-snug">{hint}</p>
          </div>
        ))}
      </div>

      {/* Listing status */}
      {publicVendorId ? (
        <div className="bg-dark border border-green-400/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center shrink-0">
            <span className="text-green-400 text-sm font-bold">✓</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-sm font-semibold">{locale === 'it' ? 'Profilo in vetrina VELO' : 'Profile live on VELO'}</p>
            <p className="text-muted/70 text-xs mt-0.5">{d.statsLiveDesc}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <span className="text-gold text-sm">○</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-sm font-semibold">{locale === 'it' ? 'Profilo non ancora in vetrina' : 'Profile not yet listed'}</p>
            <p className="text-muted/70 text-xs mt-0.5">{d.statsNotLiveDesc}</p>
          </div>
        </div>
      )}
    </div>
  )
}
