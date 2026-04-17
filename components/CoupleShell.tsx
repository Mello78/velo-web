'use client'
import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { getT } from '../lib/translations'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type AuthState = 'loading' | 'login' | 'dashboard'

function useLocale() {
  const [locale, setLocale] = useState('it')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (navigator.language.startsWith('en')) setLocale('en')
  }, [])
  return locale
}

interface CoupleData {
  partner1: string
  partner2: string
  wedding_date: string | null
  budget: number | null
  wedding_city: string | null
  wedding_region: string | null
  wedding_style: string | null
  ceremony_type: string | null
  nationality: string | null
}

export default function CoupleShell({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const d = getT(locale)
  const c = (d as any).couple
  const pathname = usePathname()

  const [authState, setAuthState] = useState<AuthState>('loading')
  const [couple, setCouple] = useState<CoupleData | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthState('login'); return }
      const { data } = await supabase
        .from('couples')
        .select('partner1, partner2, wedding_date, budget, wedding_city, wedding_region, wedding_style, ceremony_type, nationality')
        .eq('user_id', session.user.id)
        .single()
      if (!data) { setAuthState('login'); return }
      setCouple(data)
      setAuthState('dashboard')
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      setLoginError(c.login.error)
      setLoginLoading(false)
      return
    }
    const { data: coupleData } = await supabase
      .from('couples')
      .select('partner1, partner2, wedding_date, budget, wedding_city, wedding_region, wedding_style, ceremony_type, nationality')
      .eq('user_id', data.session.user.id)
      .single()
    if (!coupleData) {
      setLoginError(c.login.notCouple)
      await supabase.auth.signOut()
      setLoginLoading(false)
      return
    }
    setCouple(coupleData)
    setAuthState('dashboard')
    setLoginLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCouple(null)
    setAuthState('login')
  }

  const NAV_ITEMS = [
    { href: '/couple/dashboard', label: c.nav.dashboard },
    { href: '/couple/profile', label: c.nav.profile },
    { href: '/couple/documents', label: c.nav.documents },
    { href: '/couple/checklist', label: c.nav.checklist },
    { href: '/couple/vendors', label: c.nav.vendors },
    { href: '/couple/guests', label: c.nav.guests },
    { href: '/couple/budget', label: c.nav.budget },
  ]

  if (authState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0E0C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (authState === 'login') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0E0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 36, fontWeight: 300, letterSpacing: 8, color: '#C9A84C' }}>VELO</div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#8A7E6A', marginTop: 4, textTransform: 'uppercase' }}>Wedding</div>
        </div>

        {/* Login card */}
        <div style={{ width: '100%', maxWidth: 400, background: '#1A1915', border: '1px solid #2A2820', borderRadius: 12, padding: 36 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, fontWeight: 400, color: '#F5EDD6', margin: '0 0 8px' }}>{c.login.title}</h2>
          <p style={{ fontSize: 13, color: '#8A7E6A', margin: '0 0 28px' }}>{c.login.subtitle}</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.login.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: '#0F0E0C', border: '1px solid #2A2820', borderRadius: 8, padding: '12px 14px', color: '#F5EDD6', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.login.passwordLabel}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', background: '#0F0E0C', border: '1px solid #2A2820', borderRadius: 8, padding: '12px 14px', color: '#F5EDD6', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {loginError && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)', borderRadius: 8, fontSize: 13, color: '#C4756A' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{ width: '100%', padding: '13px', background: loginLoading ? '#2A2820' : '#C9A84C', color: loginLoading ? '#8A7E6A' : '#0F0E0C', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', cursor: loginLoading ? 'default' : 'pointer' }}
            >
              {loginLoading ? c.login.loading : c.login.loginBtn}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: '#8A7E6A', textAlign: 'center', lineHeight: 1.6 }}>{c.login.noAccount}</p>
        </div>

        {/* Back to site */}
        <Link href="/" style={{ marginTop: 24, fontSize: 12, color: '#8A7E6A', textDecoration: 'none' }}>
          ← velowedding.it
        </Link>
      </div>
    )
  }

  // Dashboard shell
  const greeting = couple?.partner1 ? `${c.dashboard.greeting}, ${couple.partner1}` : c.dashboard.greeting

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E0C', display: 'flex' }}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'block' }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : -260, width: 240, height: '100vh',
        background: '#0F0E0C', borderRight: '1px solid #1E1D1A',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, transition: 'left 0.25s ease',
        // Desktop: always visible via media query handled in style tag below
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #1E1D1A' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 300, letterSpacing: 6, color: '#C9A84C' }}>VELO</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: '#8A7E6A', marginTop: 2, textTransform: 'uppercase' }}>Wedding</div>
        </div>

        {/* Greeting */}
        <div style={{ padding: '16px 24px 8px' }}>
          <div style={{ fontSize: 12, color: '#8A7E6A', marginBottom: 2 }}>{greeting}</div>
          {couple?.partner2 && (
            <div style={{ fontSize: 11, color: '#5A5040' }}>& {couple.partner2}</div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(201,168,76,0.10)' : 'transparent',
                  color: isActive ? '#C9A84C' : '#8A7E6A',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1E1D1A' }}>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#5A5040', fontSize: 12, cursor: 'pointer', padding: 0, letterSpacing: 1 }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="couple-main">
        {/* Top bar (mobile hamburger) */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1E1D1A' }} className="couple-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: 0 }}
            className="couple-hamburger"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, fontWeight: 300, letterSpacing: 5, color: '#C9A84C' }}>VELO</div>
          <div style={{ width: 22 }} />
        </header>

        <main style={{ flex: 1, padding: '28px 24px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .couple-main { margin-left: 240px; }
          .couple-topbar { display: none !important; }
          aside { left: 0 !important; }
        }
        @media (max-width: 767px) {
          .couple-hamburger { display: block; }
        }
      `}</style>
    </div>
  )
}
