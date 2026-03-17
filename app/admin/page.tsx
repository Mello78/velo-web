'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'stats'|'vendors'|'couples'|'invites'>('stats')
  const [vendors, setVendors] = useState<any[]>([])
  const [couples, setCouples] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [stats, setStats] = useState({ couples:0, vendors:0, messages:0, guests:0, invites:0 })

  const login = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    // Controlla nella tabella admin_users invece di hardcodare l'email
    const { data: adminRow, error: adminErr } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', data.user.id)
      .single()

    if (adminErr || !adminRow) {
      await supabase.auth.signOut()
      setError('Accesso non autorizzato')
      setLoading(false)
      return
    }

    setAuthed(true)
    const [c, va, m, g, inv] = await Promise.all([
      supabase.from('couples').select('*').order('created_at', { ascending: false }),
      supabase.from('vendor_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('id'),
      supabase.from('guests').select('id'),
      supabase.from('vendor_invites').select('*').order('sent_at', { ascending: false }),
    ])
    if (c.data) setCouples(c.data)
    if (va.data) setVendors(va.data)
    if (inv.data) setInvites(inv.data)
    setStats({ couples: c.data?.length||0, vendors: va.data?.length||0, messages: m.data?.length||0, guests: g.data?.length||0, invites: inv.data?.length||0 })
    setLoading(false)
  }

  const verifyVendor = async (id: string, verified: boolean) => {
    await supabase.from('vendor_accounts').update({ verified: !verified }).eq('id', id)
    setVendors(prev => prev.map(v => v.id === id ? { ...v, verified: !verified } : v))
  }

  const markInviteRegistered = async (id: string) => {
    await supabase.from('vendor_invites').update({ registered: true }).eq('id', id)
    setInvites(prev => prev.map(i => i.id === id ? { ...i, registered: true } : i))
  }

  if (!authed) return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-gold text-2xl tracking-[0.3em] font-light">VELO</Link>
          <p className="text-muted text-sm mt-1 tracking-wide">Pannello Amministrativo</p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-6 space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
            placeholder="Email admin" onKeyDown={e => e.key === 'Enter' && login()} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold transition-colors"
            placeholder="Password" onKeyDown={e => e.key === 'Enter' && login()} />
          {error && <p className="text-red text-sm">{error}</p>}
          <button onClick={login} disabled={loading}
            className="w-full bg-gold text-bg font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Attendere...' : 'Accedi'}
          </button>
        </div>
        <p className="text-muted text-xs text-center mt-4">Accesso riservato agli amministratori VELO</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center"><img src="/logo_velo.png" alt="VELO" className="h-8 w-auto" /></Link>
          <button onClick={() => { supabase.auth.signOut(); setAuthed(false) }} className="text-red text-sm hover:opacity-70 transition-opacity">Esci</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Coppie', value: stats.couples, color: 'text-gold' },
            { label: 'Fornitori', value: stats.vendors, color: 'text-green' },
            { label: 'Messaggi', value: stats.messages, color: 'text-blue' },
            { label: 'Ospiti', value: stats.guests, color: 'text-cream' },
            { label: 'Inviti vendor', value: stats.invites, color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-dark border border-border rounded-2xl p-5 text-center">
              <p className={`text-3xl font-light ${s.color}`}>{s.value}</p>
              <p className="text-muted text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['stats','vendors','couples','invites'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm transition-colors ${tab===t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t==='stats' ? '📊 Overview' : t==='vendors' ? '🌸 Fornitori' : t==='couples' ? '💍 Coppie' : '📬 Inviti vendor'}
            </button>
          ))}
        </div>

        {tab === 'vendors' && (
          <div className="space-y-3">
            {vendors.map(v => (
              <div key={v.id} className="bg-dark border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-cream font-medium">{v.business_name}</p>
                  <p className="text-muted text-sm">{v.category} · {v.region}</p>
                  <p className="text-muted text-xs mt-1">{new Date(v.created_at).toLocaleDateString('it-IT')} · {v.plan || 'free'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full border ${v.public_vendor_id ? 'border-green text-green' : 'border-border text-muted'}`}>
                    {v.public_vendor_id ? '✓ In vetrina' : 'Non in vetrina'}
                  </span>
                  <button onClick={() => verifyVendor(v.id, v.verified)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${v.verified ? 'border-green text-green' : 'border-border text-muted hover:border-green hover:text-green'}`}>
                    {v.verified ? '✓ Verificato' : 'Verifica'}
                  </button>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <p className="text-muted text-center py-12">Nessun fornitore ancora</p>}
          </div>
        )}

        {tab === 'couples' && (
          <div className="space-y-3">
            {couples.map(c => (
              <div key={c.id} className="bg-dark border border-border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cream font-medium">{c.partner1} & {c.partner2}</p>
                    <p className="text-muted text-sm">{c.nationality === 'foreign' ? '🌍 Destination' : '🇮🇹 Italiana'} · {c.wedding_region || '—'}</p>
                    {c.wedding_date && <p className="text-muted text-xs mt-1">💍 {new Date(c.wedding_date).toLocaleDateString('it-IT', { day:'numeric', month:'long', year:'numeric' })}</p>}
                    {c.budget && <p className="text-gold text-xs mt-1">💶 Budget: €{parseInt(c.budget).toLocaleString('it-IT')}</p>}
                  </div>
                  <p className="text-muted text-xs shrink-0">{new Date(c.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            ))}
            {couples.length === 0 && <p className="text-muted text-center py-12">Nessuna coppia ancora</p>}
          </div>
        )}

        {tab === 'invites' && (
          <div className="space-y-3">
            <p className="text-muted text-sm mb-4">Fornitori segnalati dalle coppie — da contattare per invitarli su VELO</p>
            {invites.map(i => (
              <div key={i.id} className="bg-dark border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-cream font-medium">{i.vendor_name}</p>
                  {i.vendor_email && <p className="text-blue text-sm">{i.vendor_email}</p>}
                  <p className="text-muted text-xs mt-1">Segnalato da: {i.couple_names}</p>
                  <p className="text-muted text-xs">{new Date(i.sent_at).toLocaleDateString('it-IT')}</p>
                </div>
                <button onClick={() => markInviteRegistered(i.id)}
                  className={`text-xs px-3 py-1 rounded-full border shrink-0 transition-colors ${i.registered ? 'border-green text-green' : 'border-border text-muted hover:border-gold hover:text-gold'}`}>
                  {i.registered ? '✓ Registrato' : 'Segna registrato'}
                </button>
              </div>
            ))}
            {invites.length === 0 && <p className="text-muted text-center py-12">Nessun invito ancora</p>}
          </div>
        )}

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
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted text-sm">🇮🇹 Coppie italiane</span><span className="text-cream text-sm">{couples.filter(c => c.nationality==='italian').length}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted text-sm">🌍 Destination wedding</span><span className="text-cream text-sm">{couples.filter(c => c.nationality==='foreign').length}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted text-sm">✓ Fornitori verificati</span><span className="text-green text-sm">{vendors.filter(v => v.verified).length}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted text-sm">📬 Vendor da contattare</span><span className="text-gold text-sm">{invites.filter(i => !i.registered).length}</span></div>
              <div className="flex justify-between py-2"><span className="text-muted text-sm">✓ In vetrina</span><span className="text-cream text-sm">{vendors.filter(v => v.public_vendor_id).length}</span></div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
