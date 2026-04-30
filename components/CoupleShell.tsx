'use client'
import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CoupleOnboarding from './CoupleOnboarding'
import { getCoupleLocale, getPreferredSiteLocale, hasExplicitLocaleCookie, persistCoupleLocale } from '../lib/couple-locale'
import { supabase } from '../lib/supabase'
import { getT, type Locale } from '../lib/translations'
import {
  CoupleLoadingBlock,
  CoupleNotice,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from './couple-ui'

type AuthState = 'loading' | 'login' | 'dashboard' | 'vendor' | 'not_couple' | 'error'

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
  country_of_origin: string | null
}

const COUPLE_SELECT = 'partner1, partner2, wedding_date, budget, wedding_city, wedding_region, wedding_style, ceremony_type, nationality, country_of_origin'

async function resolveAuthenticatedUser(userId: string): Promise<
  { state: 'dashboard'; couple: CoupleData } |
  { state: 'vendor' } |
  { state: 'not_couple' } |
  { state: 'error' }
> {
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .select(COUPLE_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (coupleError) return { state: 'error' }
  if (couple) return { state: 'dashboard', couple }

  const { data: vendors, error: vendorError } = await supabase
    .from('vendor_accounts')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (vendorError) return { state: 'error' }
  if (vendors && vendors.length > 0) return { state: 'vendor' }
  return { state: 'not_couple' }
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--velo-paper)_0%,#efe1cd_58%,#f8f0e4_100%)] px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1120px] items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default function CoupleShell({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
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
    let mounted = true

    const load = async () => {
      const fallbackLocale = getPreferredSiteLocale()
      if (mounted) setLocale(fallbackLocale)

      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (!session) {
        setLocale(fallbackLocale)
        setAuthState('login')
        return
      }

      const result = await resolveAuthenticatedUser(session.user.id)
      if (!mounted) return

      if (result.state === 'dashboard') {
        // Explicit locale cookie always wins. Never override user preference.
        const hasCookie = hasExplicitLocaleCookie()
        const nextLocale = hasCookie ? getPreferredSiteLocale() : getCoupleLocale(result.couple, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
        setCouple(result.couple)
        setAuthState('dashboard')
        return
      }

      setLocale(fallbackLocale)
      setCouple(null)
      setAuthState(result.state)
    }

    load()
    return () => { mounted = false }
  }, [])

  const retryAuthenticatedLoad = async () => {
    setAuthState('loading')
    const fallbackLocale = getPreferredSiteLocale()
    setLocale(fallbackLocale)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setCouple(null)
      setAuthState('login')
      return
    }

    const result = await resolveAuthenticatedUser(session.user.id)
    if (result.state === 'dashboard') {
      // Explicit locale cookie always wins. Never override user preference.
      const hasCookie = hasExplicitLocaleCookie()
      const nextLocale = hasCookie ? getPreferredSiteLocale() : getCoupleLocale(result.couple, fallbackLocale)
      persistCoupleLocale(nextLocale)
      setLocale(nextLocale)
      setCouple(result.couple)
      setAuthState('dashboard')
      return
    }

    setLocale(fallbackLocale)
    setCouple(null)
    setAuthState(result.state)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const fallbackLocale = getPreferredSiteLocale()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      setLoginError(c.login.error)
      setLoginLoading(false)
      return
    }

    const result = await resolveAuthenticatedUser(data.session.user.id)
    if (result.state === 'dashboard') {
      // Explicit locale cookie always wins. Never override user preference.
      const hasCookie = hasExplicitLocaleCookie()
      const nextLocale = hasCookie ? getPreferredSiteLocale() : getCoupleLocale(result.couple, fallbackLocale)
      persistCoupleLocale(nextLocale)
      setLocale(nextLocale)
      setCouple(result.couple)
      setAuthState('dashboard')
    } else {
      setLocale(fallbackLocale)
      setCouple(null)
      setAuthState(result.state)
    }

    setLoginLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCouple(null)
    setAuthState('login')
  }

  const navItems = [
    { href: '/couple/dashboard', label: c.nav.dashboard },
    { href: '/couple/profile', label: c.nav.profile },
    { href: '/couple/documents', label: c.nav.documents },
    { href: '/couple/checklist', label: c.nav.checklist },
    { href: '/couple/vendors', label: c.nav.vendors },
    { href: '/couple/guests', label: c.nav.guests },
    { href: '/couple/budget', label: c.nav.budget },
  ].filter(item => item.href !== '/couple/documents' || couple?.nationality !== 'italian')

  if (authState === 'loading') {
    return (
      <AuthFrame>
        <CoupleLoadingBlock />
      </AuthFrame>
    )
  }

  if (authState === 'login') {
    return (
      <AuthFrame>
        <div className="grid w-full max-w-[1080px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-[420px]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
              {c.login.title}
            </p>
            <h1 className="text-[2.6rem] font-light leading-[0.96] text-[var(--velo-ink)] sm:text-[3.1rem]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              {locale === 'en' ? 'Plan the wedding in one calm room.' : 'Tenete il matrimonio in una sola stanza calma.'}
            </h1>
            <p className="mt-5 text-sm leading-7 text-[var(--velo-muted)] sm:text-[1rem]">
              {locale === 'en'
                ? 'Sign in to your VELO couple area for documents, checklist, guests, vendors, and budget.'
                : 'Entrate nella vostra area coppia VELO per documenti, checklist, ospiti, fornitori e budget.'}
            </p>
            <div className="mt-8 rounded-[1.4rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
                VELO
              </p>
              <p className="mt-3 text-lg leading-snug text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                {locale === 'en' ? 'For couples marrying in Italy, especially from abroad.' : "Per coppie che si sposano in Italia, soprattutto dall'estero."}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--velo-border)] bg-[var(--velo-card)] p-6 shadow-[0_24px_70px_rgba(45,31,22,0.1)] sm:p-8">
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-[0.34em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
                VELO
              </div>
              <h2 className="mt-3 text-[2rem] font-light text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                {c.login.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--velo-muted)]">{c.login.subtitle}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
                  {c.login.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-4 py-3 text-sm text-[var(--velo-ink)] outline-none transition-colors focus:border-[var(--velo-terracotta)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
                  {c.login.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-[1rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-4 py-3 text-sm text-[var(--velo-ink)] outline-none transition-colors focus:border-[var(--velo-terracotta)]"
                />
              </div>

              {loginError && (
                <CoupleNotice title={locale === 'en' ? 'Sign-in issue' : 'Problema di accesso'} tone="danger">
                  {loginError}
                </CoupleNotice>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--velo-terracotta)] px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-paper-2)] transition-colors hover:bg-[var(--velo-terracotta-deep)] disabled:cursor-default disabled:opacity-60"
                style={{ fontFamily: VELO_MONO_FONT }}
              >
                {loginLoading ? c.login.loading : c.login.loginBtn}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-7 text-[var(--velo-muted)]">{c.login.noAccount}</p>
            <Link href="/" className="mt-4 inline-flex text-xs uppercase tracking-[0.18em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
              ← velowedding.it
            </Link>
          </div>
        </div>
      </AuthFrame>
    )
  }

  if (authState === 'not_couple') {
    return <CoupleOnboarding initialLocale={locale} onComplete={retryAuthenticatedLoad} />
  }

  if (authState === 'vendor') {
    const title = locale === 'en' ? 'This account is already set up as a vendor.' : 'Questo account e gia impostato come fornitore.'
    const body = locale === 'en'
      ? 'The couple area is reserved for couple accounts. Open your vendor workspace instead, or sign out and use a different account.'
      : "L'area coppia e riservata agli account coppia. Apri il tuo spazio fornitore oppure esci e usa un altro account."

    return (
      <AuthFrame>
        <div className="w-full max-w-[640px]">
          <CoupleNotice title="VELO" tone="warning" className="p-8">
            <p className="text-[2rem] font-light leading-[1] text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              {title}
            </p>
            <p className="mt-4 text-sm leading-7">{body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/vendor"
                className="inline-flex items-center justify-center rounded-full bg-[var(--velo-terracotta)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-paper-2)]"
                style={{ fontFamily: VELO_MONO_FONT }}
              >
                {locale === 'en' ? 'Open vendor area' : 'Apri area fornitore'}
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-[var(--velo-border-strong)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-muted)]"
                style={{ fontFamily: VELO_MONO_FONT }}
              >
                {locale === 'en' ? 'Sign out' : 'Esci'}
              </button>
            </div>
          </CoupleNotice>
        </div>
      </AuthFrame>
    )
  }

  if (authState === 'error') {
    const title = locale === 'en' ? 'Unable to load your couple area.' : "Impossibile caricare l'area coppia."
    const body = locale === 'en'
      ? 'You are signed in, but we could not retrieve your couple data. This may be temporary. Please try again.'
      : "Hai effettuato l'accesso, ma non siamo riusciti a recuperare i dati della coppia. Potrebbe essere temporaneo. Riprova."

    return (
      <AuthFrame>
        <div className="w-full max-w-[640px]">
          <CoupleNotice title="VELO" tone="danger" className="p-8">
            <p className="text-[2rem] font-light leading-[1] text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              {title}
            </p>
            <p className="mt-4 text-sm leading-7">{body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={retryAuthenticatedLoad}
                className="inline-flex items-center justify-center rounded-full bg-[var(--velo-terracotta)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-paper-2)]"
                style={{ fontFamily: VELO_MONO_FONT }}
              >
                {locale === 'en' ? 'Try again' : 'Riprova'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-[var(--velo-border-strong)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-muted)]"
                style={{ fontFamily: VELO_MONO_FONT }}
              >
                {locale === 'en' ? 'Sign out' : 'Esci'}
              </button>
            </div>
          </CoupleNotice>
        </div>
      </AuthFrame>
    )
  }

  const greeting = couple?.partner1 ? `${c.dashboard.greeting}, ${couple.partner1}` : c.dashboard.greeting
  const webCompanionNotice = locale === 'en'
    ? {
        title: 'Web couple area',
        body: 'This web space is a calm companion to the VELO app. Here you can review your dashboard, profile, documents, checklist, and the current status of vendors and guests. Budget items and guest RSVPs, notes, and dietary requirements are editable here too. Vendor messaging and saved-vendor actions still happen in the VELO app.',
      }
    : {
        title: 'Area coppia web',
        body: "Questo spazio web accompagna l'app VELO con una vista chiara del vostro matrimonio. Qui potete rivedere dashboard, profilo, documenti, checklist e lo stato attuale di fornitori e ospiti. Le voci di budget e gli RSVP, note ed esigenze alimentari degli ospiti si aggiornano anche dal web. Messaggi ai fornitori e salvataggi/conferme dei fornitori restano nell'app VELO.",
      }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--velo-paper)_0%,#efe1cd_58%,#f8f0e4_100%)] text-[var(--velo-ink)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(31,24,18,0.42)] md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[256px] border-r border-[#3a2b20] bg-[var(--velo-sidebar)] text-[var(--velo-paper-2)] transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-[#3a2b20] px-6 pb-5 pt-7">
          <div className="text-[1.5rem] font-light tracking-[0.32em] text-[var(--velo-paper-2)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
            VELO
          </div>
          <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[#c9b49d]" style={{ fontFamily: VELO_MONO_FONT }}>
            {c.login.title}
          </p>
        </div>

        <div className="border-b border-[#3a2b20] px-6 py-5">
          <p className="text-sm text-[var(--velo-paper-2)]">{greeting}</p>
          {couple?.partner2 && <p className="mt-1 text-xs text-[#c9b49d]">&amp; {couple.partner2}</p>}
          {(couple?.wedding_city || couple?.wedding_region) && (
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#b89a5b]" style={{ fontFamily: VELO_MONO_FONT }}>
              {[couple?.wedding_city, couple?.wedding_region].filter(Boolean).join(' - ')}
            </p>
          )}
        </div>

        <nav className="flex-1 px-4 py-5">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center rounded-[1rem] px-4 py-3 text-sm transition-colors ${isActive ? 'bg-[rgba(184,90,46,0.18)] text-[var(--velo-paper-2)]' : 'text-[#d2c3b0] hover:bg-white/[0.04] hover:text-[var(--velo-paper-2)]'}`}
                >
                  <span className={`mr-3 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[var(--velo-terracotta)]' : 'bg-[#7a6653]'}`} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-[#3a2b20] px-6 py-5">
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.24em] text-[#c9b49d] transition-colors hover:text-[var(--velo-paper-2)]"
            style={{ fontFamily: VELO_MONO_FONT }}
          >
            {c.nav.logout}
          </button>
        </div>
      </aside>

      <div className="md:pl-[256px]">
        <header className="sticky top-0 z-30 border-b border-[var(--velo-border)] bg-[rgba(251,244,229,0.86)] backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--velo-border)] text-[var(--velo-terracotta)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
            <div className="text-[1.2rem] font-light tracking-[0.28em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              VELO
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <CoupleNotice title={webCompanionNotice.title} className="mb-6">
            {webCompanionNotice.body}
          </CoupleNotice>
          {children}
        </main>
      </div>
    </div>
  )
}
