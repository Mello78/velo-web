'use client'
import { useState, useEffect } from 'react'
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
  const key = Object.keys(SPECIALITA_PER_CATEGORIA).find(k => category.includes(k.replace(/[^\w\s]/g, '').trim()) || k.includes(category.replace(/[^\w\s]/g, '').trim()))
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
      else setSuccess("✅ Registrazione completata! Controlla la tua email e clicca sul link di conferma, poi torna qui ad accedere. Se non trovi l'email, controlla la cartella spam.")
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
            {/* Toggle login/registrazione — link secondario */}
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

// âââ PROFILE SETUP (prima volta dopo registrazione) âââââââââââââââââââââââââââ
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
                {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" /> : <span className="text-3xl opacity-20">ð·ï¸</span>}
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
            <p className="text-muted/50 text-xs mt-1">La versione in inglese puoi aggiungerla dopo dal tab ✨ Info</p>
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

// âââ VENDOR DASHBOARD ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function VendorDashboard({ vendor, locale, onLogout, onUpdate }: {
  vendor: any; locale: string; onLogout: () => void; onUpdate: (v: any) => void
}) {
  const tr = getT(locale)
  const d = tr.vendor.dashboard
  const [tab, setTab] = useState<'profile' | 'info' | 'messages' | 'photos' | 'social' | 'availability' | 'stats'>('profile')
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
  const [maxGuests, setMaxGuests] = useState(vendor.max_guests?.toString() || '')
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
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatConversations, setChatConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [newMsg, setNewMsg] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [chatLoaded, setChatLoaded] = useState(false)

  // Auto-carica messaggi all'apertura del tab
  useEffect(() => {
    if (tab === 'messages' && !chatLoaded) {
      loadConversations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])
  const [translateMsg, setTranslateMsg] = useState('')
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
        const url = await uploadImage(photoFiles[i]!, `${vendor.user_id}/photo${i + 1}.${ext}`)
        if (url) urls[i] = url
      }
    }
    const { data } = await supabase.from('vendor_accounts').update({
      photo1_url: urls[0] || null, photo2_url: urls[1] || null, photo3_url: urls[2] || null,
    }).eq('id', vendor.id).select().single()
    if (data) {
      onUpdate({ ...vendor, ...data })
      // Aggiorna anche public_vendors se il vendor è in vetrina
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
      // Sincronizza automaticamente con public_vendors se il vendor è in vetrina
      if (vendor.public_vendor_id) {
        await supabase.from('public_vendors').update({
          name: businessName,
          category,
          location,
          description: bio || null,
          phone: phone || null,
          instagram: instagram || null,
          facebook: facebook || null,
          tiktok: tiktok || null,
          website: website || null,
          whatsapp: whatsapp || null,
          price_from: priceFrom || null,
          price_to: priceTo || null,
          logo_url: logoUrl,
          max_guests: maxGuests ? parseInt(maxGuests) : null,
          specialties,
          languages,
          specialties_custom: specialtiesCustom.filter(Boolean),
          bio_en: bioEn || null,
          awards_en: awardsEn.filter(Boolean),
          specialties_custom_en: specialtiesCustomEn.filter(Boolean),
          years_experience: parseInt(yearsExp) || 0,
          awards: awards.filter(Boolean),
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }).eq('id', vendor.public_vendor_id)
      }
      setSavedMsg('✓')
    }
    setEditing(false); setSaving(false); setLogoFile(null)
    setTimeout(() => setSavedMsg(''), 2000)
  }

  const translateToEnglish = async () => {
    setTranslating(true); setTranslateMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        'https://jogsdrxnqrbbqieozlmo.supabase.co/functions/v1/velo-translate-vendor',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ bio, description: bio, specialties, specialties_custom: specialtiesCustom.filter(Boolean), awards: awards.filter(Boolean) }),
        }
      )
      const data = await res.json()
      if (data.error) { setTranslateMsg('â Errore: ' + data.error); setTranslating(false); return }
      // Aggiorna state locale con traduzioni ricevute
      if (data.bio) setBioEn(data.bio)
      if (data.specialties_custom?.length) setSpecialtiesCustomEn(data.specialties_custom)
      if (data.awards?.length) setAwardsEn(data.awards)
      if (vendor.public_vendor_id) {
        await supabase.from('public_vendors').update({
          description_en: data.bio || data.description || null,
          specialties_en: data.specialties || [],
          awards_en: data.awards || [],
        }).eq('id', vendor.public_vendor_id)
      }
      setTranslateMsg('✓ Traduzione salvata in inglese')
      setTimeout(() => setTranslateMsg(''), 3000)
    } catch (e) { setTranslateMsg('â Errore di rete') }
    setTranslating(false)
  }

  
  const loadConversations = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
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
      setChatConversations(convs)
    }
    setChatLoaded(true)
  }

  const loadChatWithCouple = async (coupleUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('messages').select('*')
      .eq('vendor_user_id', session.user.id)
      .eq('user_id', coupleUserId).order('created_at', { ascending: true })
    if (data) {
      setChatMessages(data)
      // Marca i messaggi della coppia come letti
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
    // Trova un vendor_id per questa conversazione
    const existing = chatMessages[0]
    const { data } = await supabase.from('messages').insert({
      content: newMsg.trim(),
      vendor_id: existing?.vendor_id || null,
      user_id: selectedConv,
      vendor_user_id: session.user.id,
      from_vendor: true,
    }).select().single()
    if (data) setChatMessages(prev => [...prev, data])
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
      content: null,
      image_url: publicUrl,
      vendor_id: existing?.vendor_id || null,
      user_id: selectedConv,
      vendor_user_id: session.user.id,
      from_vendor: true,
    }).select().single()
    if (data) setChatMessages(prev => [...prev, data])
    setUploadingImg(false)
  }

const statusBadge = vendor.public_vendor_id
    ? { label: '✓ In vetrina', cls: 'text-green-400 border-green-400/30 bg-green-400/5' }
    : vendor.verified
    ? { label: '✓ Verificato · in attesa di pubblicazione', cls: 'text-gold border-gold/30 bg-gold/5' }
    : { label: 'â³ In attesa di approvazione', cls: 'text-muted border-border bg-transparent' }

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
          {(['profile', 'info', 'messages', 'photos', 'social', 'availability', 'stats'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setEditing(false) }}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab === t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t === 'profile' ? d.tabProfile : t === 'info' ? d.tabInfo : t === 'messages' ? d.tabMessages : t === 'photos' ? d.tabPhotos : t === 'social' ? d.tabSocial : t === 'availability' ? d.tabAvailability : d.tabStats}
            </button>
          ))}
        </div>

        {/* INFO */}
        {tab === 'info' && (
          <div className="bg-dark border border-border rounded-2xl p-6 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-cream font-medium">{d.tabInfo} {d.infoTitle}</h2>
              <button onClick={save} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? d.saving : savedMsg || d.save}
              </button>
            </div>

            {/* Specialità — max 5 */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">{d.specialtiesLabel} <span className="text-gold">({d.specialtiesMax})</span></p>
              <p className="text-muted/60 text-xs mb-3">{d.specialtiesHint}</p>
              <p className="text-muted/60 text-xs mb-3">
                Lista per: <strong className="text-cream/80">{category || vendor.category}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {getSpecialitaPerCategoria(category || vendor.category || '').map(sp => {
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

              {/* Specialità custom — campi liberi */}
              <div className="mt-4 space-y-2">
                <p className="text-muted/60 text-xs">{d.specialtiesCustomLabel}</p>
                {[0, 1, 2].map(i => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input type="text" value={specialtiesCustom[i] || ''}
                      onChange={e => { const n = [...specialtiesCustom]; n[i] = e.target.value; setSpecialtiesCustom(n) }}
                      className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={`Skill personalizzata (IT)`} />
                    <input type="text" value={specialtiesCustomEn[i] || ''}
                      onChange={e => { const n = [...specialtiesCustomEn]; n[i] = e.target.value; setSpecialtiesCustomEn(n) }}
                      className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60"
                      placeholder={`Custom skill (EN)`} />
                  </div>
                ))}
                <p className="text-muted/40 text-xs">IT = italiano · EN = inglese · oppure usa "Traduci" in fondo</p>
              </div>
            </div>

            {/* Anni esperienza */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-3">{d.yearsLabel}</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setYearsExp(v => Math.max(0, parseInt(v||'0') - 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">â</button>
                <span className="text-3xl font-light text-cream w-12 text-center">{yearsExp || '0'}</span>
                <button onClick={() => setYearsExp(v => (parseInt(v||'0') + 1).toString())}
                  className="w-9 h-9 rounded-full border border-gold text-gold text-lg hover:bg-gold/10 flex items-center justify-center">+</button>
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
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${on ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted hover:border-gold/50'}`}>
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Riconoscimenti */}
            <div>
              <p className="text-muted text-xs uppercase tracking-wider mb-1">{d.awardsLabel} <span className="text-muted/60">(opzionale)</span></p>
              <p className="text-muted/60 text-xs mb-3">{d.awardsHint}</p>
              <div className="space-y-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input type="text" value={awards[i] || ''} onChange={e => { const n = [...awards]; n[i] = e.target.value; setAwards(n) }}
                      className="bg-bg border border-border rounded-xl px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={i === 0 ? 'Premio (IT)' : i === 1 ? 'Pubblicazione (IT)' : 'Riconoscimento (IT)'} />
                    <input type="text" value={awardsEn[i] || ''} onChange={e => { const n = [...awardsEn]; n[i] = e.target.value; setAwardsEn(n) }}
                      className="bg-bg border border-border/60 rounded-xl px-3 py-2.5 text-cream/80 text-sm focus:outline-none focus:border-gold/60"
                      placeholder={i === 0 ? 'Award (EN)' : i === 1 ? 'Publication (EN)' : 'Recognition (EN)'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottone traduzione automatica */}
            {vendor.public_vendor_id && (
              <div className="pt-4 border-t border-border">
                <button onClick={translateToEnglish} disabled={translating}
                  className="w-full py-3 rounded-xl border border-gold/40 text-gold text-sm hover:bg-gold/10 transition-colors disabled:opacity-50">
                  {translating ? d.translating : d.translateBtn}
                </button>
                {translateMsg && <p className="text-center text-xs mt-2 text-green-400">{translateMsg}</p>}
                <p className="text-muted/60 text-xs text-center mt-1">
                  {d.translateHint}
                </p>
              </div>
            )}
          </div>
        )}


        {/* MESSAGGI */}
        {tab === 'messages' && (
          <div className="bg-dark border border-border rounded-2xl overflow-hidden">
            {!selectedConv ? (
              // Lista conversazioni
              <div>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-cream font-medium">{d.messagesTitle}</h2>
                  <button onClick={loadConversations}
                    className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1 hover:bg-gold/10">
                    Aggiorna
                  </button>
                </div>
                {chatConversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="text-muted">{d.messagesEmpty}</p>
                    <p className="text-muted/60 text-xs mt-1">{d.messagesEmptyDesc}</p>
                  </div>
                ) : (
                  <div>
                    {chatConversations.map((conv: any) => (
                      <button key={conv.coupleUserId}
                        onClick={() => loadChatWithCouple(conv.coupleUserId)}
                        className="w-full text-left p-4 border-b border-border hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-cream text-sm font-medium">{conv.partner1 && conv.partner2 ? `${conv.partner1} & ${conv.partner2}` : 'Sposi'}</p>
                            <p className="text-muted text-xs mt-0.5 truncate max-w-xs">
                              {conv.lastMessage?.content || (conv.lastMessage?.image_url ? '📷 Immagine' : '')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-muted/60 text-xs">
                              {new Date(conv.lastMessage?.created_at).toLocaleDateString('it-IT')}
                            </p>
                            {conv.unread > 0 && (
                              <span className="inline-block mt-1 bg-gold text-bg text-xs rounded-full px-2 py-0.5 font-semibold">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Chat con una coppia
              <div className="flex flex-col h-[600px]">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="text-gold hover:opacity-70 text-sm">← Indietro</button>
                  <h2 className="text-cream font-medium">{chatConversations.find(c => c.coupleUserId === selectedConv)?.partner1 && chatConversations.find(c => c.coupleUserId === selectedConv)?.partner2 ? `${chatConversations.find(c => c.coupleUserId === selectedConv)?.partner1} & ${chatConversations.find(c => c.coupleUserId === selectedConv)?.partner2}` : 'Conversazione'}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-muted text-sm text-center py-8">Nessun messaggio in questa conversazione</p>
                  )}
                  {chatMessages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.from_vendor ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        m.from_vendor
                          ? 'bg-gold text-bg rounded-br-sm'
                          : 'bg-white/10 text-cream rounded-bl-sm border border-border'
                      }`}>
                        {m.image_url ? (
                          <img src={m.image_url} alt="immagine" className="rounded-xl max-w-full" style={{ maxHeight: 200 }} />
                        ) : (
                          <p>{m.content}</p>
                        )}
                        <p className={`text-xs mt-1 opacity-60`}>
                          {new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                                <div className="p-4 border-t border-border flex gap-3 items-end">
                  <label className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${uploadingImg ? 'border-border opacity-40 cursor-not-allowed' : 'border-border hover:border-gold/50'}`}>
                    <span className="text-lg">{uploadingImg ? '⏳' : '📷'}</span>
                    <input type="file" accept="image/*,image/heic" className="hidden"
                      disabled={uploadingImg}
                      onChange={e => { const f = e.target.files?.[0]; if (f) sendImageAsVendor(f); e.target.value = '' }} />
                  </label>
                  <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendVendorMessage()}
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-cream text-sm focus:outline-none focus:border-gold"
                    placeholder={d.messagesPlaceholder} />
                  <button onClick={sendVendorMessage} disabled={!newMsg.trim() || sendingMsg}
                    className="bg-gold text-bg font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 text-sm">
                    {sendingMsg ? '...' : '→'}
                  </button>
                </div>
              </div>
            )}
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
                      {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt="logo" /> : <span className="text-2xl opacity-20">ð·ï¸</span>}
                    </div>
                    <label className="cursor-pointer border border-gold/40 text-gold text-xs px-4 py-2 rounded-full hover:bg-gold/10 transition-colors">
                      {logoPreview ? 'Cambia logo' : 'Carica logo'}
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.nameLabel}</label>
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
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.cityLabel}</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold" placeholder="Es. Firenze" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-2">{d.bioLabel}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted/60 text-xs mb-1.5">🇮🇹 Italiano</p>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                        placeholder={d.bioPlaceholder} />
                    </div>
                    <div>
                      <p className="text-muted/60 text-xs mb-1.5">🇬🇧 English</p>
                      <textarea value={bioEn} onChange={e => setBioEn(e.target.value)} rows={4}
                        className="w-full bg-bg border border-border/60 rounded-xl px-4 py-3 text-cream/80 text-sm focus:outline-none focus:border-gold/60 resize-none"
                        placeholder="Describe yourself... (or use Translate in ✨ Info)" />
                    </div>
                  </div>
                  {vendor.public_vendor_id && (
                    <div className="mt-2">
                      <button onClick={translateToEnglish} disabled={translating}
                        className="w-full py-2 rounded-xl border border-gold/30 text-gold text-xs hover:bg-gold/10 transition-colors disabled:opacity-50">
                        {translating ? '🌐 Traduzione in corso...' : '🌐 Traduci descrizione in inglese'}
                      </button>
                      {translateMsg && <p className="text-center text-xs mt-1 text-green-400">{translateMsg}</p>}
                    </div>
                  )}
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
                {/* Max ospiti — per location e catering */}
                {['location', 'catering'].some(t => (category || vendor.category || '').toLowerCase().includes(t)) && (
                  <div>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">
                      👥 Numero massimo ospiti
                    </label>
                    <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder="es. 150" />
                    <p className="text-muted/60 text-xs mt-1">Le coppie vedranno solo le location compatibili con il loro numero di ospiti</p>
                  </div>
                )}
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
              <h2 className="text-cream font-medium">{d.photosTitle}</h2>
              <button onClick={savePhotos} disabled={photoSaving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 disabled:opacity-50">
                {photoSaving ? 'Salvataggio...' : photoMsg || 'Salva foto'}
              </button>
            </div>
            <p className="text-muted text-xs mb-6">{d.photosHint}</p>
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
                  ['🎵 TikTok', vendor.tiktok], ['🌐 Sito web', vendor.website], ['ð¬ WhatsApp', vendor.whatsapp],
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

        {/* DISPONIBILITÃ */}
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
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 flex items-center justify-center">â</button>
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
          <StatsPanel vendorUserId={vendor.user_id} publicVendorId={vendor.public_vendor_id} d={d} />
        )}
      </div>
    </main>
  )
}

// --- STATS PANEL ---
function StatsPanel({ vendorUserId, publicVendorId, d }: { vendorUserId: string; publicVendorId: string | null; d: any }) {
  const [stats, setStats] = useState<{ couples: number; messages: number; unread: number; thisWeek: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const [msgsRes, unreadRes] = await Promise.all([
        supabase.from('messages').select('id, user_id, created_at, from_vendor').eq('vendor_user_id', session.user.id),
        supabase.from('messages').select('id', { count: 'exact', head: true })
          .eq('vendor_user_id', session.user.id).eq('from_vendor', false).eq('is_read', false),
      ])
      const msgs = msgsRes.data || []
      const couples = new Set(msgs.map((m: any) => m.user_id)).size
      const week = new Date(); week.setDate(week.getDate() - 7)
      const thisWeek = msgs.filter((m: any) => new Date(m.created_at) > week).length
      setStats({ couples, messages: msgs.length, unread: unreadRes.count ?? 0, thisWeek })
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: d.statsCouples, value: stats?.couples ?? '—', cls: 'text-gold' },
          { label: d.statsConfirmed, value: stats?.unread ?? '—', cls: stats?.unread ? 'text-gold' : 'text-cream' },
          { label: d.statsMessages, value: stats?.messages ?? '—', cls: 'text-blue-400' },
          { label: d.statsViews, value: stats?.thisWeek ?? '—', cls: 'text-green-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-dark border border-border rounded-2xl p-6 text-center">
            <p className={`text-3xl font-light ${cls}`}>{String(value)}</p>
            <p className="text-muted text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>
      {publicVendorId ? (
        <div className="bg-dark border border-border rounded-2xl p-6">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">✓ In vetrina VELO</p>
          <p className="text-muted text-sm">Il tuo profilo è visibile a tutte le coppie che pianificano il matrimonio con VELO.</p>
        </div>
      ) : (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-6">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">⏳ Non ancora in vetrina</p>
          <p className="text-muted text-sm">Completa il profilo e contatta il team VELO per l'attivazione.</p>
        </div>
      )}
    </div>
  )
}
