'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_EMAIL = 'fabio@velowedding.it'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'stats'|'vendors'|'couples'>('stats')
  const [vendors, setVendors] = useState<any[]>([])
  const [couples, setCouples] = useState<any[]>([])
  const [stats, setStats] = useState({ couples: 0, vendors: 0, messages: 0, guests: 0 })

  const login = async () => {
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err || data.user?.email !== ADMIN_EMAIL) { setError('Accesso non autorizzato'); return }
    setAuthed(true)
    const [c, va, m, g] = await Promise.all([
      supabase.from('couples').select('*').order('created_at', { ascending: false }),
      supabase.from('vendor_accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('id'),
      supabase.from('guests').select('id'),
    ])
    if (c.data) setCouples(c.data)
    if (va.data) setVendors(va.data)
    setStats({ couples: c.data?.length || 0, vendors: va.data?.length || 0, messages: m.data?.length || 0, guests: g.data?.length || 0 })
  }

  const verifyVendor = async (id: string, verified: boolean) => {
    await supabase.from('vendor_accounts').update({ verified: !verified }).eq('id', id)
    setVendors(prev => prev.map(v => v.id === id ? { ...v, verified: !verified } : v))
  }

  if (!authed) return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-gold text-2xl tracking-[0.3em]">VELO</Link>
          <p className="text-muted text-sm mt-1">Pannello Amministrativo</p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-6 space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
            placeholder="Email admin" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
            placeholder="Password" />
          {error && <p className="text-red text-sm">{error}</p>}
          <button onClick={login} className="w-full bg-gold text-bg font-semibold py-3 rounded-xl hover:opacity-90">
            Accedi
          </button>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-gold text-xl tracking-[0.3em]">VELO Admin</Link>
          <button onClick={() => { supabase.auth.signOut(); setAuthed(false) }} className="text-red text-sm">Esci</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Coppie', value: stats.couples, color: 'text-gold' },
            { label: 'Fornitori', value: stats.vendors, color: 'text-green' },
            { label: 'Messaggi', value: stats.messages, color: 'text-blue' },
            { label: 'Ospiti', value: stats.guests, color: 'text-cream' },
          ].map(s => (
            <div key={s.label} className="bg-dark border border-border rounded-2xl p-5 text-center">
              <p className={`text-3xl font-light ${s.color}`}>{s.value}</p>
              <p className="text-muted text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-8">
          {(['stats','vendors','couples'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm transition-colors ${tab === t ? 'bg-gold text-bg font-semibold' : 'border border-border text-muted hover:text-cream'}`}>
              {t === 'stats' ? '📊 Overview' : t === 'vendors' ? '🌸 Fornitori' : '💍 Coppie'}
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
                  <p className="text-muted text-xs mt-1">{new Date(v.created_at).toLocaleDateString('it-IT')}</p>
                </div>
                <button onClick={() => verifyVendor(v.id, v.verified)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors shrink-0 ${v.verified ? 'border-green text-green' : 'border-border text-muted hover:border-green hover:text-green'}`}>
                  {v.verified ? '✓ Verificato' : 'Verifica'}
                </button>
              </div>
            ))}
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
                    {c.wedding_date && <p className="text-muted text-xs mt-1">💍 {new Date(c.wedding_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                  </div>
                  <p className="text-muted text-xs shrink-0">{new Date(c.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'stats' && (
          <div className="bg-dark border border-border rounded-2xl p-6">
            <h2 className="text-cream font-medium mb-6">Panoramica piattaforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted text-sm mb-3">Fornitori per regione</p>
                {['Toscana','Amalfi Coast','Lago di Como','Langhe & Piemonte','Roma & Lazio'].map(r => (
                  <div key={r} className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted text-sm">{r}</span>
                    <span className="text-cream text-sm">{vendors.filter(v => v.region === r).length} fornitori</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-muted text-sm mb-3">Coppie per nazionalità</p>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted text-sm">🇮🇹 Italiane</span>
                  <span className="text-cream text-sm">{couples.filter(c => c.nationality === 'italian').length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted text-sm">🌍 Destination wedding</span>
                  <span className="text-cream text-sm">{couples.filter(c => c.nationality === 'foreign').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
