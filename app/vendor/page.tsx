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
      else setSuccess('Controlla la tua email per confermare l\'account. Poi accedi dall\'app VELO per completare il profilo.')
    }
    setLoading(false)
  }

  if (loggedIn && vendorData) return <VendorDashboard vendor={vendorData} onLogout={() => { supabase.auth.signOut(); setLoggedIn(false); setVendorData(null) }} />

  return (
    <main className="min-h-screen bg-bg text-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-gold text-3xl tracking-[0.3em] font-light">VELO</Link>
          <p className="text-muted text-sm mt-2">Area Fornitori</p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-8">
          <div className="flex gap-2 mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>
              Accedi
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${!isLogin ? 'bg-gold text-bg' : 'border border-border text-muted hover:text-cream'}`}>
              Registrati
            </button>
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
          <p className="text-muted text-sm leading-relaxed">
            Entra ora gratuitamente. Dal 2026 saranno €20/mese senza vincoli e cancellazione libera in qualsiasi momento.
          </p>
        </div>
      </div>
    </main>
  )
}

function VendorDashboard({ vendor, onLogout }: { vendor: any, onLogout: () => void }) {
  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-gold text-xl tracking-[0.3em] font-light">VELO</Link>
          <div className="flex items-center gap-4">
            <span className="text-muted text-sm">{vendor.business_name}</span>
            <button onClick={onLogout} className="text-red text-sm hover:opacity-70 transition-opacity">Esci</button>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-muted text-sm tracking-wider uppercase mb-2">Dashboard</p>
          <h1 className="text-3xl font-light">{vendor.business_name}</h1>
          <p className="text-muted mt-1">{vendor.category} · {vendor.region}</p>
        </div>
        <div className="bg-gold/5 border border-gold/30 rounded-2xl p-6 mb-8">
          <p className="text-gold font-medium mb-1">⭐ Piano Pro — gratuito per il primo anno</p>
          <p className="text-muted text-sm leading-relaxed">
            Sei tra i primi fornitori su VELO. Il tuo account è gratuito per il primo anno.
            Dal 2026 sarà €20/mese, senza vincoli e cancellazione libera in qualsiasi momento.
          </p>
        </div>
        <div className="bg-dark border border-border rounded-2xl p-6">
          <h2 className="text-cream font-medium mb-4">Il tuo profilo</h2>
          <div className="space-y-3">
            {[
              { label: 'Categoria', value: vendor.category },
              { label: 'Zona', value: vendor.region },
              { label: 'Instagram', value: vendor.instagram || 'Non inserito' },
              { label: 'Sito web', value: vendor.website || 'Non inserito' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3 border-b border-border last:border-0">
                <span className="text-muted text-sm">{label}</span>
                <span className="text-cream text-sm">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-muted text-xs mt-4">Per modificare il profilo usa l'app VELO dal tuo telefono.</p>
        </div>
      </div>
    </main>
  )
}
