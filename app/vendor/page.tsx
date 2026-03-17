'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function VendorPage() {
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
      if (!va) { setError('Account fornitore non trovato. Registrati dall\'app VELO.'); setLoading(false); return }
      setVendorData(va); setLoggedIn(true)
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else setSuccess('Controlla la tua email per confermare l\'account, poi accedi dall\'app VELO per completare il profilo.')
    }
    setLoading(false)
  }

  if (loggedIn && vendorData) return (
    <VendorDashboard vendor={vendorData}
      onLogout={() => { supabase.auth.signOut(); setLoggedIn(false); setVendorData(null) }}
      onUpdate={(updated: any) => setVendorData(updated)} />
  )

  return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-gold text-3xl tracking-[0.3em] font-light">VELO</Link>
          <p className="text-muted text-sm mt-2">Area Fornitori</p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-8">
          <div className="flex gap-2 mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>Accedi</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${!isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>Registrati</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted text-xs tracking-wider uppercase block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="email@esempio.it" />
            </div>
            <div>
              <label className="text-muted text-xs tracking-wider uppercase block mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••" />
            </div>
          </div>
          {error && <p className="text-red text-sm mt-4">{error}</p>}
          {success && <p className="text-green text-sm mt-4">{success}</p>}
          <button onClick={handle} disabled={loading}
            className="w-full bg-gold text-bg font-semibold py-4 rounded-xl mt-6 hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Attendere...' : isLogin ? 'Accedi →' : 'Registrati →'}
          </button>
        </div>
        <div className="mt-8 bg-gold/5 border border-gold/20 rounded-2xl p-6">
          <p className="text-gold text-sm font-medium mb-2">⭐ Primo anno gratuito</p>
          <p className="text-muted text-sm leading-relaxed">Entra ora gratuitamente. Dal 2027 saranno €20/mese senza vincoli e cancellazione libera.</p>
        </div>
      </div>
    </main>
  )
}

function VendorDashboard({ vendor, onLogout, onUpdate }: { vendor: any, onLogout: () => void, onUpdate: (v: any) => void }) {
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
    const payload = { bio, phone, instagram, facebook, tiktok, website, whatsapp, price_from: priceFrom, price_to: priceTo, max_events_per_day: maxEvents }
    const { data } = await supabase.from('vendor_accounts').update(payload).eq('id', vendor.id).select().single()
    if (data) { onUpdate({ ...vendor, ...data }); setSavedMsg('✓ Salvato!'); setTimeout(() => setSavedMsg(''), 2000) }
    setEditing(false); setSaving(false)
  }

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center"><img src="/logo_velo.png" alt="VELO" className="h-8 w-auto" /></Link>
          <div className="flex items-center gap-4">
            <span className="text-muted text-sm hidden sm:block">{vendor.business_name}</span>
            <button onClick={onLogout} className="text-red text-sm hover:opacity-70 transition-opacity">Esci</button>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-muted text-xs tracking-widest uppercase mb-2">Dashboard Fornitore</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light">{vendor.business_name}</h1>
              <p className="text-muted mt-1">{vendor.category} · {vendor.region}</p>
              {vendor.verified && <span className="inline-block mt-2 text-xs text-green border border-green rounded-full px-3 py-1">✓ Verificato da VELO</span>}
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-right shrink-0">
              <p className="text-gold text-xs font-medium">⭐ Gratuito</p>
              <p className="text-muted text-xs mt-1">fino al 31/12/2026</p>
              <p className="text-muted text-xs">poi €20/mese</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {(['profile','social','availability','stats'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab===t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t==='profile' ? '👤 Profilo' : t==='social' ? '🔗 Social & Contatti' : t==='availability' ? '📅 Disponibilità' : '📊 Statistiche'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-dark border border-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-cream font-medium">Informazioni profilo</h2>
                <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                  className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? 'Salvataggio...' : savedMsg || (editing ? 'Salva modifiche' : '✏️ Modifica')}
                </button>
              </div>
              {editing ? (
                <div className="space-y-4">
                  <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">Biografia</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold resize-none"
                      placeholder="Descriviti..." /></div>
                  <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">Telefono</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder="+39 000 000 0000" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">Prezzo da (€)</label>
                      <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder="es. 1500" /></div>
                    <div><label className="text-muted text-xs uppercase tracking-wider block mb-2">Prezzo fino a (€)</label>
                      <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                        placeholder="es. 5000" /></div>
                  </div>
                  <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream transition-colors">Annulla</button>
                </div>
              ) : (
                <div className="space-y-0">
                  {[
                    { label: 'Categoria', value: vendor.category },
                    { label: 'Zona', value: vendor.region },
                    { label: 'Telefono', value: vendor.phone || '—' },
                    { label: 'Prezzi', value: vendor.price_from ? `da €${vendor.price_from}${vendor.price_to ? ` fino a €${vendor.price_to}` : ''}` : '—' },
                    { label: 'Biografia', value: vendor.bio || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-3 border-b border-border last:border-0 gap-4">
                      <span className="text-muted text-sm shrink-0">{label}</span>
                      <span className="text-cream text-sm text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">Social & Contatti</h2>
              <button onClick={() => editing ? save() : setEditing(true)} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? 'Salvataggio...' : savedMsg || (editing ? 'Salva' : '✏️ Modifica')}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, placeholder: '@nomeprofilo' },
                  { label: 'Facebook', val: facebook, set: setFacebook, placeholder: 'facebook.com/pagina' },
                  { label: 'TikTok', val: tiktok, set: setTiktok, placeholder: '@nomeprofilo' },
                  { label: 'Sito web', val: website, set: setWebsite, placeholder: 'www.esempio.it' },
                  { label: 'WhatsApp', val: whatsapp, set: setWhatsapp, placeholder: '+39 000 000 0000' },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label}>
                    <label className="text-muted text-xs uppercase tracking-wider block mb-2">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
                      placeholder={placeholder} />
                  </div>
                ))}
                <button onClick={() => setEditing(false)} className="text-muted text-sm hover:text-cream transition-colors">Annulla</button>
              </div>
            ) : (
              <div className="space-y-0">
                {[
                  { label: '📷 Instagram', value: vendor.instagram || '—' },
                  { label: '📘 Facebook', value: vendor.facebook || '—' },
                  { label: '🎵 TikTok', value: vendor.tiktok || '—' },
                  { label: '🌐 Sito web', value: vendor.website || '—' },
                  { label: '💬 WhatsApp', value: vendor.whatsapp || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3 border-b border-border last:border-0">
                    <span className="text-muted text-sm">{label}</span>
                    <span className={`text-sm ${value === '—' ? 'text-muted' : 'text-blue'}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'availability' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cream font-medium">Capacità per data</h2>
              <button onClick={save} disabled={saving}
                className="text-sm px-4 py-2 rounded-full bg-gold text-bg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? 'Salvataggio...' : savedMsg || 'Salva'}
              </button>
            </div>
            <p className="text-muted text-sm mb-6">Quanti matrimoni riesci a gestire nella stessa giornata?</p>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setMaxEvents((v:number) => Math.max(1, v - 1))}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 transition-colors flex items-center justify-center">−</button>
              <span className="text-4xl font-light text-cream w-12 text-center">{maxEvents}</span>
              <button onClick={() => setMaxEvents((v:number) => v + 1)}
                className="w-10 h-10 rounded-full border border-gold text-gold text-xl hover:bg-gold/10 transition-colors flex items-center justify-center">+</button>
              <span className="text-muted text-sm">eventi massimi per giorno</span>
            </div>
            <div className="bg-bg border border-border rounded-xl p-4">
              <p className="text-muted text-xs">ℹ️ Questo valore viene usato dall'app per mostrare la tua disponibilità alle coppie. Le date dove hai raggiunto il limite appaiono come <span className="text-red">complete</span>.</p>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl font-light text-gold">—</p>
                <p className="text-muted text-sm mt-1">Coppie che ti seguono</p>
              </div>
              <div className="bg-dark border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl font-light text-green">—</p>
                <p className="text-muted text-sm mt-1">Conferme ricevute</p>
              </div>
              <div className="bg-dark border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl font-light text-blue">—</p>
                <p className="text-muted text-sm mt-1">Messaggi ricevuti</p>
              </div>
              <div className="bg-dark border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl font-light text-cream">—</p>
                <p className="text-muted text-sm mt-1">Visualizzazioni profilo</p>
              </div>
            </div>
            <div className="bg-dark border border-border rounded-2xl p-6">
              <p className="text-muted text-sm text-center">Le statistiche dettagliate saranno disponibili nella prossima versione. Per ora gestisci messaggi e disponibilità dall'app VELO.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
