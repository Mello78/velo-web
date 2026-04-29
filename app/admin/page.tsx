'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

const CANDIDATE_CATEGORIES = [
  'Fotografia', 'Video', 'Floral Design', 'Catering', 'Musica', 'Location',
  'Partecipazioni', 'Torta', 'Make-up', 'Abiti', 'Trasporti', 'Animazione', 'Bomboniere',
]
const CANDIDATE_STATUSES = ['candidate','invited','interested','accepted','onboarded','paused','declined'] as const
type CandidateStatus = typeof CANDIDATE_STATUSES[number]
const STATUS_LABELS: Record<CandidateStatus, string> = {
  candidate: 'Da contattare', invited: 'Invitati', interested: 'Interessati',
  accepted: 'Accettati', onboarded: 'Registrati', paused: 'In pausa', declined: 'Declinati',
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'stats'|'vendors'|'couples'|'invites'|'candidates'>('stats')
  const [vendors, setVendors] = useState<any[]>([])
  const [couples, setCouples] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [customVendors, setCustomVendors] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [stats, setStats] = useState({ couples:0, vendors:0, messages:0, guests:0, invites:0 })
  // New candidate form state
  const [newCandName, setNewCandName] = useState('')
  const [newCandEmail, setNewCandEmail] = useState('')
  const [newCandPhone, setNewCandPhone] = useState('')
  const [newCandCategory, setNewCandCategory] = useState('')
  const [newCandArea, setNewCandArea] = useState('')
  const [newCandPriority, setNewCandPriority] = useState('2')
  const [newCandNotes, setNewCandNotes] = useState('')
  const [addingCand, setAddingCand] = useState(false)

  const login = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: adminRow, error: adminErr } = await supabase
      .from('admin_users').select('id').eq('user_id', data.user.id).single()
    if (adminErr || !adminRow) {
      await supabase.auth.signOut(); setError('Accesso non autorizzato'); setLoading(false); return
    }
    setAuthed(true)
    const [c, va, m, g, inv, cv, vc] = await Promise.all([
      supabase.from('couples').select('*').order('created_at', { ascending: false }),
      supabase.from('vendor_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('id'),
      supabase.from('guests').select('id'),
      supabase.from('vendor_invites').select('*').order('sent_at', { ascending: false }),
      supabase.from('custom_vendors').select('*').order('created_at', { ascending: false }),
      supabase.from('vendor_candidates').select('*').order('created_at', { ascending: false }),
    ])
    if (c.data) setCouples(c.data)
    if (va.data) setVendors(va.data)
    if (inv.data) setInvites(inv.data)
    if (cv.data) setCustomVendors(cv.data)
    if (vc.data) setCandidates(vc.data)
    // "Da contattare" = segnalati dalla coppia (invite_sent=true) ma admin non ha ancora agito
    const pending = (cv.data || []).filter((v: any) => v.invite_sent && !v.admin_contacted).length
    setStats({ couples: c.data?.length||0, vendors: va.data?.length||0,
      messages: m.data?.length||0, guests: g.data?.length||0, invites: pending })
    setLoading(false)
  }

  const verifyVendor = async (id: string, verified: boolean) => {
    await supabase.from('vendor_accounts').update({ verified: !verified }).eq('id', id)
    setVendors(prev => prev.map(v => v.id === id ? { ...v, verified: !verified } : v))
  }

  const activateVendor = async (v: any) => {
    const payload = {
      name: v.business_name, category: v.category, location: v.location || '',
      region: v.regione || v.region || '', province: v.province || null,
      description: v.bio || '', phone: v.phone || null, instagram: v.instagram || null,
      facebook: v.facebook || null, tiktok: v.tiktok || null,
      website: v.website || null, whatsapp: v.whatsapp || null,
      price_from: v.price_from || null, price_to: v.price_to || null,
      logo_url: v.logo_url || null, photo1_url: v.photo1_url || null,
      photo2_url: v.photo2_url || null, photo3_url: v.photo3_url || null,
      specialties: v.specialties || [], languages: v.languages || [],
      years_experience: v.years_experience || 0, awards: v.awards || [],
      lat: v.lat || null, lng: v.lng || null,
      rating: 5.0, review_count: 0, verified: true, featured: false,
    }
    if (v.public_vendor_id) {
      const { error: updErr } = await supabase.from('public_vendors').update(payload).eq('id', v.public_vendor_id)
      if (updErr) { alert('Errore: ' + updErr.message); return }
      await supabase.from('vendor_accounts').update({ verified: true }).eq('id', v.id)
    } else {
      const { data: pv, error: insErr } = await supabase.from('public_vendors').insert(payload).select().single()
      if (insErr) { alert('Errore: ' + insErr.message); return }
      if (pv) {
        await supabase.from('vendor_accounts').update({ verified: true, public_vendor_id: pv.id }).eq('id', v.id)
        setVendors(prev => prev.map(x => x.id === v.id ? { ...x, verified: true, public_vendor_id: pv.id } : x))
        return
      }
    }
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, verified: true } : x))
  }

  const removeFromVetrina = async (v: any) => {
    if (!confirm(`Rimuovere ${v.business_name} dalla vetrina?`)) return
    const { error: delErr } = await supabase.from('public_vendors').delete().eq('id', v.public_vendor_id)
    if (delErr) { alert('Errore: ' + delErr.message); return }
    await supabase.from('vendor_accounts').update({ public_vendor_id: null, verified: false }).eq('id', v.id)
    setVendors(prev => prev.map(x => x.id === v.id ? { ...x, public_vendor_id: null, verified: false } : x))
  }

  const deleteVendor = async (v: any) => {
    if (!confirm(`ELIMINARE DEFINITIVAMENTE ${v.business_name}?\nQuesta azione non è reversibile.`)) return
    if (v.public_vendor_id) await supabase.from('public_vendors').delete().eq('id', v.public_vendor_id)
    const { error: delErr } = await supabase.from('vendor_accounts').delete().eq('id', v.id)
    if (delErr) { alert('Errore: ' + delErr.message); return }
    setVendors(prev => prev.filter(x => x.id !== v.id))
  }

  const markInviteRegistered = async (id: string) => {
    await supabase.from('vendor_invites').update({ registered: true }).eq('id', id)
    setInvites(prev => prev.map(i => i.id === id ? { ...i, registered: true } : i))
  }

  // Admin ha contattato il fornitore custom — segna admin_contacted=true
  const markAdminContacted = async (cv: any) => {
    await supabase.from('custom_vendors').update({ admin_contacted: true }).eq('id', cv.id)
    setCustomVendors(prev => prev.map(v => v.id === cv.id ? { ...v, admin_contacted: true } : v))
  }

  const createCandidate = async () => {
    if (!newCandName.trim() || !newCandCategory) return
    setAddingCand(true)
    const { error: err } = await supabase.from('vendor_candidates').insert({
      vendor_name: newCandName.trim(),
      vendor_email: newCandEmail.trim() || null,
      vendor_phone: newCandPhone.trim() || null,
      category: newCandCategory,
      area_label: newCandArea.trim() || null,
      priority_rank: [1,2,3].includes(parseInt(newCandPriority)) ? parseInt(newCandPriority) : null,
      notes: newCandNotes.trim() || null,
      status: 'candidate',
      source: 'manual',
      is_founding_candidate: true,
    })
    if (err) { alert('Errore: ' + err.message); setAddingCand(false); return }
    const { data: fresh } = await supabase.from('vendor_candidates').select('*').order('created_at', { ascending: false })
    if (fresh) setCandidates(fresh)
    setNewCandName(''); setNewCandEmail(''); setNewCandPhone('')
    setNewCandCategory(''); setNewCandArea(''); setNewCandNotes('')
    setAddingCand(false)
  }

  const updateCandidateStatus = async (id: string, status: CandidateStatus) => {
    await supabase.from('vendor_candidates').update({ status }).eq('id', id)
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }


  if (!authed) return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-gold text-2xl tracking-[0.3em] font-light">VELO</Link>
          <p className="text-muted text-sm mt-1">Pannello Amministrativo</p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-6 space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
            placeholder="Email admin" onKeyDown={e => e.key === 'Enter' && login()} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
            placeholder="Password" onKeyDown={e => e.key === 'Enter' && login()} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={login} disabled={loading}
            className="w-full bg-gold text-bg font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
            {loading ? 'Attendere...' : 'Accedi'}
          </button>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <button onClick={() => { supabase.auth.signOut(); setAuthed(false) }} className="text-red-400 text-sm hover:opacity-70">Esci</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Coppie', value: stats.couples, color: 'text-gold' },
            { label: 'Fornitori', value: stats.vendors, color: 'text-green-400' },
            { label: 'Messaggi', value: stats.messages, color: 'text-blue-400' },
            { label: 'Ospiti', value: stats.guests, color: 'text-cream' },
            { label: 'Da contattare', value: stats.invites, color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-dark border border-border rounded-2xl p-5 text-center">
              <p className={`text-3xl font-light ${s.color}`}>{s.value}</p>
              <p className="text-muted text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {(['stats','vendors','couples','invites','candidates'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm transition-colors ${tab===t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t==='stats' ? '📊 Overview' : t==='vendors' ? '🌸 Fornitori' : t==='couples' ? '💍 Coppie' : t==='invites' ? '📬 Inviti vendor' : '✦ Candidati founding'}
            </button>
          ))}
        </div>


        {/* TAB FORNITORI */}
        {tab === 'vendors' && (
          <div className="space-y-3">
            {[...vendors].sort((a,b) => (a.public_vendor_id?1:-1)-(b.public_vendor_id?1:-1)).map(v => (
              <div key={v.id} className={`bg-dark border rounded-xl p-4 ${!v.public_vendor_id ? 'border-gold/30' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {!v.public_vendor_id && <span className="text-xs bg-gold/10 text-gold border border-gold/30 rounded-full px-2 py-0.5">Nuovo</span>}
                      <p className="text-cream font-medium">{v.business_name}</p>
                    </div>
                    <p className="text-muted text-sm">{v.category} · {v.location || v.region}</p>
                    {v.phone && <p className="text-muted text-xs mt-0.5">📞 {v.phone}</p>}
                    <p className="text-muted text-xs mt-1">{new Date(v.created_at).toLocaleDateString('it-IT')} · {v.plan || 'free'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full border ${v.public_vendor_id ? 'border-green-400 text-green-400' : 'border-border text-muted'}`}>
                      {v.public_vendor_id ? '✓ In vetrina' : 'Non in vetrina'}
                    </span>
                    {!v.public_vendor_id && (
                      <button onClick={() => activateVendor(v)} className="text-xs px-3 py-1 rounded-full border border-gold text-gold hover:bg-gold/10 transition-colors font-medium">
                        🚀 Attiva
                      </button>
                    )}
                    {v.public_vendor_id && (
                      <>
                        <button onClick={() => activateVendor(v)} className="text-xs px-3 py-1 rounded-full border border-border text-muted hover:border-gold hover:text-gold transition-colors">
                          🔄 Aggiorna
                        </button>
                        <button onClick={() => removeFromVetrina(v)} className="text-xs px-3 py-1 rounded-full border border-orange-400/40 text-orange-400 hover:bg-orange-400/10 transition-colors">
                          📤 Rimuovi
                        </button>
                      </>
                    )}
                    <button onClick={() => verifyVendor(v.id, v.verified)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${v.verified ? 'border-green-400 text-green-400' : 'border-border text-muted hover:border-green-400 hover:text-green-400'}`}>
                      {v.verified ? '✓ Verificato' : 'Verifica'}
                    </button>
                    <button onClick={() => deleteVendor(v)} className="text-xs px-3 py-1 rounded-full border border-red-400/40 text-red-400 hover:bg-red-400/10 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <p className="text-muted text-center py-12">Nessun fornitore ancora</p>}
          </div>
        )}

        {/* TAB COPPIE */}
        {tab === 'couples' && (
          <div className="space-y-3">
            {couples.map(c => (
              <div key={c.id} className="bg-dark border border-border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cream font-medium">{c.partner1} & {c.partner2}</p>
                    <p className="text-muted text-sm">{c.nationality === 'foreign' ? '🌍 Destination' : '🇮🇹 Italiana'} · {c.wedding_region || '—'}</p>
                    {c.wedding_date && <p className="text-muted text-xs mt-1">💍 {new Date(c.wedding_date).toLocaleDateString('it-IT', { day:'numeric', month:'long', year:'numeric' })}</p>}
                    {c.budget && <p className="text-gold text-xs mt-1">💶 €{parseInt(c.budget).toLocaleString('it-IT')}</p>}
                  </div>
                  <p className="text-muted text-xs shrink-0">{new Date(c.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            ))}
            {couples.length === 0 && <p className="text-muted text-center py-12">Nessuna coppia ancora</p>}
          </div>
        )}


        {/* TAB INVITI — logica attuale:
            invite_sent=true = coppia ha segnalato (follow-up manuale admin)
            admin_contacted=true = admin ha già contattato
            vendor_invites = lead raccolto dall'app, non email automatica verificata */}
        {tab === 'invites' && (
          <div className="space-y-6">

            {/* 1. Da contattare: segnalati dalla coppia, admin non ancora intervenuto */}
            {(() => {
              const pending = customVendors.filter(v => v.invite_sent && !v.admin_contacted)
              if (pending.length === 0) return null
              return (
                <div>
                  <h3 className="text-cream font-medium mb-1">🔔 Da contattare ({pending.length})</h3>
                  <p className="text-muted text-xs mb-4">Segnalati dalle coppie — follow-up manuale del team VELO ancora da fare</p>
                  <div className="space-y-3">
                    {pending.map(cv => (
                      <div key={cv.id} className="bg-dark border border-gold/30 rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-cream font-medium">{cv.name}</p>
                          {cv.category && <p className="text-muted text-xs">{cv.category}</p>}
                          {cv.email && (
                            <a href={`mailto:${cv.email}?subject=Richiesta valutazione partner VELO&body=Ciao,%0ASei stato segnalato a VELO da una coppia.%0ASe vuoi, puoi richiedere una valutazione partner qui: https://velowedding.it/vendor%0A%0ATeam VELO`}
                              className="text-blue-400 text-sm hover:opacity-70 block mt-1">✉️ {cv.email}</a>
                          )}
                          {cv.phone && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <a href={`https://wa.me/${cv.phone.replace(/[^0-9]/g,'')}?text=Ciao! Sei stato segnalato a VELO da una coppia. Se vuoi, puoi richiedere una valutazione partner qui: https://velowedding.it/vendor`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-green-400 text-xs border border-green-400/30 rounded-full px-3 py-1 hover:opacity-70">📱 WhatsApp</a>
                              <a href={`sms:${cv.phone}&body=Ciao! Sei stato segnalato a VELO da una coppia. Puoi richiedere una valutazione partner qui: https://velowedding.it/vendor`}
                                className="text-green-400 text-xs border border-green-400/30 rounded-full px-3 py-1 hover:opacity-70">💬 SMS</a>
                              <span className="text-muted text-xs">{cv.phone}</span>
                            </div>
                          )}
                          {cv.instagram && <p className="text-muted text-xs mt-1">📷 {cv.instagram}</p>}
                          <p className="text-muted text-xs mt-1">{new Date(cv.created_at).toLocaleDateString('it-IT')}</p>
                        </div>
                        <button onClick={() => markAdminContacted(cv)}
                          className="text-xs px-3 py-1 rounded-full border border-gold/40 text-gold hover:bg-gold/10 shrink-0">
                          ✓ Contattato
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* 2. vendor_invites: segnalazioni raccolte dall'app; il contatto resta manuale */}
            {invites.length > 0 && (
              <div>
                <h3 className="text-cream font-medium mb-1">📬 Segnalazioni raccolte dall'app ({invites.length})</h3>
                <p className="text-muted text-xs mb-4">Questi contatti arrivano dall'app, ma il follow-up resta manuale finché non esiste un invio automatico verificato.</p>
                <div className="space-y-3">
                  {invites.map(i => (
                    <div key={i.id} className="bg-dark border border-border rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-cream font-medium">{i.vendor_name}</p>
                        {i.vendor_email && <a href={`mailto:${i.vendor_email}`} className="text-blue-400 text-sm hover:opacity-70">✉️ {i.vendor_email}</a>}
                        {i.vendor_phone && (
                          <a href={`https://wa.me/${i.vendor_phone.replace(/[^0-9]/g,'')}?text=Ciao! Ti contattiamo dal team VELO per un follow-up manuale sulla valutazione partner: https://velowedding.it/vendor`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-green-400 text-xs border border-green-400/30 rounded-full px-3 py-1 hover:opacity-70 inline-block mt-1">📱 Follow-up WA</a>
                        )}
                        <p className="text-muted text-xs mt-1">Da: {i.couple_names} · {new Date(i.sent_at).toLocaleDateString('it-IT')}</p>
                      </div>
                      <button onClick={() => markInviteRegistered(i.id)}
                        className={`text-xs px-3 py-1 rounded-full border shrink-0 ${i.registered ? 'border-green-400 text-green-400' : 'border-border text-muted hover:border-gold hover:text-gold'}`}>
                        {i.registered ? '✓ Registrato' : 'Segna registrato'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Già contattati dall'admin */}
            {customVendors.filter(v => v.invite_sent && v.admin_contacted).length > 0 && (
              <div>
                <h3 className="text-muted text-sm font-medium mb-3">✓ Già contattati ({customVendors.filter(v => v.invite_sent && v.admin_contacted).length})</h3>
                <div className="space-y-2">
                  {customVendors.filter(v => v.invite_sent && v.admin_contacted).map(cv => (
                    <div key={cv.id} className="bg-dark/50 border border-border/50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-muted text-sm">{cv.name}{cv.category ? ` · ${cv.category}` : ''}</p>
                        {cv.email && <p className="text-muted/60 text-xs">{cv.email}</p>}
                      </div>
                      <span className="text-muted/60 text-xs">Contattato</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customVendors.filter(v => v.invite_sent).length === 0 && invites.length === 0 && (
              <p className="text-muted text-center py-12">Nessun invito ancora</p>
            )}
          </div>
        )}


        {/* TAB CANDIDATI FOUNDING */}
        {tab === 'candidates' && (
          <div className="space-y-8">

            {/* Form aggiunta candidato */}
            <div className="bg-dark border border-border rounded-2xl p-6">
              <h2 className="text-cream font-medium mb-4">Aggiungi candidato founding</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Nome attività *</label>
                  <input type="text" value={newCandName} onChange={e => setNewCandName(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Categoria *</label>
                  <select value={newCandCategory} onChange={e => setNewCandCategory(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold">
                    <option value="">Seleziona...</option>
                    {CANDIDATE_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Email</label>
                  <input type="email" value={newCandEmail} onChange={e => setNewCandEmail(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Telefono</label>
                  <input type="tel" value={newCandPhone} onChange={e => setNewCandPhone(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Area / Zona</label>
                  <input type="text" value={newCandArea} onChange={e => setNewCandArea(e.target.value)}
                    placeholder="es. Toscana, Lago di Como..."
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Priorità</label>
                  <select value={newCandPriority} onChange={e => setNewCandPriority(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold">
                    <option value="1" className="bg-[#1a1a1a]">1 — Alta</option>
                    <option value="2" className="bg-[#1a1a1a]">2 — Media</option>
                    <option value="3" className="bg-[#1a1a1a]">3 — Bassa</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-muted text-xs uppercase tracking-wider block mb-1">Note</label>
                  <textarea value={newCandNotes} onChange={e => setNewCandNotes(e.target.value)} rows={2}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-cream text-sm focus:outline-none focus:border-gold resize-none" />
                </div>
              </div>
              <button onClick={createCandidate} disabled={addingCand || !newCandName.trim() || !newCandCategory}
                className="mt-4 px-5 py-2.5 rounded-full bg-gold text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {addingCand ? 'Aggiungendo...' : 'Aggiungi candidato'}
              </button>
            </div>

            {/* Lista candidati raggruppata per status */}
            {CANDIDATE_STATUSES.map(status => {
              const group = candidates.filter(c => c.status === status)
              if (group.length === 0) return null
              return (
                <div key={status}>
                  <h3 className="text-cream font-medium mb-3">{STATUS_LABELS[status]} ({group.length})</h3>
                  <div className="space-y-2">
                    {group.map(c => (
                      <div key={c.id} className="bg-dark border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {c.priority_rank === 1 && <span className="text-xs text-gold border border-gold/40 rounded-full px-2 py-0.5">P1</span>}
                              {c.priority_rank === 2 && <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5">P2</span>}
                              {c.priority_rank === 3 && <span className="text-xs text-muted/60 border border-border/50 rounded-full px-2 py-0.5">P3</span>}
                              <p className="text-cream font-medium">{c.vendor_name}</p>
                            </div>
                            <p className="text-muted text-sm">{c.category}{c.area_label ? ` · ${c.area_label}` : ''}</p>
                            {c.vendor_email && (
                              <a href={`mailto:${c.vendor_email}?subject=${encodeURIComponent('Programma Partner Fondatore VELO')}&body=${encodeURIComponent('Gentile ' + c.vendor_name + ',\n\nSiamo lieti di invitarvi a far parte dei partner fondatori di VELO.\n\nTeam VELO')}`}
                                className="text-blue-400 text-xs hover:opacity-70 block mt-1 truncate">✉ {c.vendor_email}</a>
                            )}
                            {c.vendor_phone && (
                              <a href={`https://wa.me/${c.vendor_phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent('Ciao ' + c.vendor_name + '! Vi invitiamo a far parte del programma partner fondatori di VELO: velowedding.it')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-green-400 text-xs hover:opacity-70 block mt-0.5">📱 {c.vendor_phone}</a>
                            )}
                            {c.notes && <p className="text-muted/70 text-xs mt-1 italic">{c.notes}</p>}
                            <p className="text-muted/50 text-xs mt-1">{new Date(c.created_at).toLocaleDateString('it-IT')}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 shrink-0">
                            {CANDIDATE_STATUSES.filter(s => s !== status).map(s => (
                              <button key={s} onClick={() => updateCandidateStatus(c.id, s)}
                                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted hover:border-gold hover:text-gold transition-colors">
                                → {STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {candidates.length === 0 && (
              <p className="text-muted text-center py-12">Nessun candidato ancora. Inizia aggiungendone uno.</p>
            )}
          </div>
        )}

        {/* TAB STATS */}
        {tab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark border border-border rounded-2xl p-6">
              <h2 className="text-cream font-medium mb-6">Fornitori per regione</h2>
              {['Toscana','Amalfi Coast','Lago di Como','Langhe & Piemonte','Roma & Lazio','Puglia','Venezia & Veneto'].map(r => (
                <div key={r} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted text-sm">{r}</span>
                  <span className="text-cream text-sm">{vendors.filter(v => v.region === r).length}</span>
                </div>
              ))}
            </div>
            <div className="bg-dark border border-border rounded-2xl p-6">
              <h2 className="text-cream font-medium mb-6">Panoramica</h2>
              {[
                ['🇮🇹 Coppie italiane', couples.filter(c => c.nationality==='italian').length, 'text-cream'],
                ['🌍 Destination wedding', couples.filter(c => c.nationality==='foreign').length, 'text-cream'],
                ['✓ In vetrina', vendors.filter(v => v.public_vendor_id).length, 'text-green-400'],
                ['✓ Verificati', vendors.filter(v => v.verified).length, 'text-green-400'],
                ['🔔 Da contattare', customVendors.filter(v => v.invite_sent && !v.admin_contacted).length, 'text-gold'],
                ['📬 Email invito inviate', invites.length, 'text-muted'],
                ['✓ Admin contattati', customVendors.filter(v => v.admin_contacted).length, 'text-muted'],
              ].map(([label, value, cls]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted text-sm">{label}</span>
                  <span className={`text-sm ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
