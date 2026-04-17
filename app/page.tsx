import Link from 'next/link'
import { cookies } from 'next/headers'
import NavBar from '../components/NavBar'

const REGIONS = [
  'Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte',
  'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria',
]

// Platform icons — gold stroke, used in platform section
const ICONS = [
  // Dashboard
  <svg key="i0" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M7 9h10M7 13h6M7 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // Documents
  <svg key="i1" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M14 2v6h6M9 13h6M9 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // Checklist
  <svg key="i2" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // Vendors
  <svg key="i3" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Guests
  <svg key="i4" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <circle cx="9" cy="8" r="3" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M4 19c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="17" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M20 19c0-2-1.5-3.6-3.4-3.9" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // Budget
  <svg key="i5" viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="#C9A84C" strokeWidth="1.5" />
    <path d="M2 10h20" stroke="#C9A84C" strokeWidth="1.5" />
    <circle cx="8" cy="14" r="1.5" fill="#C9A84C" />
    <path d="M14 14h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
]

// ── Copy type ──────────────────────────────────────────────────────

type Copy = {
  nav: { couples: string; vendors: string; forVendors: string; primaryCta: string }
  hero: {
    label: string
    h1a: string
    h1b: string
    h1c: string
    sub: string
    coupleCta: string
    vendorCta: string
    toolBarItems: string[]
    toolBarCta: string
  }
  platform: {
    label: string
    title: string
    sub: string
    cta: string
    dashboardTitle: string
    dashboardDesc: string
    dashboardCta: string
    tools: { title: string; desc: string }[]
  }
  italy: {
    label: string
    title: string
    sub: string
    points: { title: string; desc: string }[]
    cta: string
  }
  vendors: { label: string; title: string; sub: string; cta: string }
  vendorCta: { badge: string; title: string; desc: string; pricing: string; btn: string }
  footer: { couples: string; vendors: string; vendorArea: string; admin: string; copy: string }
}

// ── Copy ───────────────────────────────────────────────────────────

function getCopy(locale: string): Copy {
  if (locale === 'en') return {
    nav: {
      couples: 'Couple Area',
      vendors: 'Vendors',
      forVendors: 'Are you a vendor?',
      primaryCta: 'ENTER COUPLE AREA',
    },
    hero: {
      label: 'from yes to forever',
      h1a: 'Your wedding',
      h1b: 'in Italy',
      h1c: 'with VELO.',
      sub: 'One planning space for couples getting married in Italy. Dashboard, documents, vendors, guests, and budget\u2014connected.',
      coupleCta: 'Start planning',
      vendorCta: 'Explore vendors',
      toolBarItems: ['Dashboard', 'Documents', 'Checklist', 'Vendors', 'Guests', 'Budget'],
      toolBarCta: 'Enter couple area',
    },
    platform: {
      label: 'The couple platform',
      title: 'Every tool your wedding needs.',
      sub: 'One authenticated planning space designed around the real needs of a wedding in Italy.',
      cta: 'Enter the couple area',
      dashboardTitle: 'Planning dashboard',
      dashboardDesc: 'Your complete wedding at a glance. Countdown, completed tasks, confirmed vendors, budget status, and the next areas to open\u2014all in one view.',
      dashboardCta: 'Open dashboard',
      tools: [
        { title: 'Documents', desc: 'A guided path for international couples: what to prepare, when, and where\u2014based on your nationality and ceremony type.' },
        { title: 'Checklist', desc: 'Tasks grouped by urgency and phase, completable directly from web without losing your place in the plan.' },
        { title: 'Vendors', desc: 'Track and confirm vendors from the same space where you manage guests, budget, and checklist.' },
        { title: 'Guests', desc: 'Guest list, RSVP status, dietary notes, and seating\u2014visible from desktop alongside the rest of your plan.' },
        { title: 'Budget', desc: 'Planned and confirmed spend, expense rows, and category summaries\u2014part of the same couple platform.' },
      ],
    },
    italy: {
      label: 'Built for Italy',
      title: 'Italy is different. VELO was built for it.',
      sub: 'Getting married in Italy means comune declarations, international document flows, and a planning process unlike anywhere else. VELO is designed around this reality\u2014not around a generic wedding checklist.',
      points: [
        { title: 'Document guidance', desc: 'Step-by-step guidance for foreign couples navigating Italian marriage documents, apostilles, and comune requirements.' },
        { title: 'Destination planning', desc: 'From Tuscan villas to the Amalfi cliffs, VELO connects you with selected professionals across 11 curated Italian regions.' },
        { title: 'Ceremony support', desc: 'Civil, religious, or symbolic\u2014VELO organizes your planning flow around the ceremony type that fits your wedding.' },
      ],
      cta: 'Open the couple area',
    },
    vendors: {
      label: 'Vendor marketplace',
      title: 'Curated professionals. Across all of Italy.',
      sub: 'Photographers, floral designers, caterers, and venues\u2014selected for couples planning an Italian wedding.',
      cta: 'Explore all vendors \u2192',
    },
    vendorCta: {
      badge: 'For wedding professionals',
      title: 'Are you a wedding vendor?',
      desc: 'Get listed on velowedding.it, manage your couple pipeline, and connect with couples planning their Italian wedding.',
      pricing: 'First year free\u2014then \u20ac20/month, cancel anytime',
      btn: 'Register as a vendor \u2192',
    },
    footer: {
      couples: 'Couple Area',
      vendors: 'Vendors',
      vendorArea: 'Vendor Area',
      admin: 'Admin',
      copy: '\u00a9 2026 VELO \u00b7 velowedding.it',
    },
  }

  return {
    nav: {
      couples: 'Area Coppie',
      vendors: 'Fornitori',
      forVendors: 'Sei un fornitore?',
      primaryCta: "ENTRA NELL'AREA COPPIA",
    },
    hero: {
      label: 'dal s\u00ec per sempre',
      h1a: 'Il tuo matrimonio',
      h1b: 'in Italia',
      h1c: 'con VELO.',
      sub: "Uno spazio di planning per chi si sposa in Italia. Dashboard, documenti, fornitori, ospiti e budget\u2014connessi.",
      coupleCta: 'Inizia a pianificare',
      vendorCta: 'Esplora i fornitori',
      toolBarItems: ['Dashboard', 'Documenti', 'Checklist', 'Fornitori', 'Ospiti', 'Budget'],
      toolBarCta: "Entra nell'area coppia",
    },
    platform: {
      label: 'La piattaforma coppia',
      title: 'Ogni strumento per il tuo matrimonio.',
      sub: "Un unico spazio autenticato progettato intorno alle esigenze reali di un matrimonio in Italia.",
      cta: "Accedi all'area coppia",
      dashboardTitle: 'Dashboard planning',
      dashboardDesc: "Il tuo matrimonio completo a colpo d'occhio. Conto alla rovescia, task completati, fornitori confermati, stato del budget e prossime aree da aprire\u2014tutto in una sola vista.",
      dashboardCta: 'Apri dashboard',
      tools: [
        { title: 'Documenti', desc: "Un percorso guidato per le coppie straniere: cosa preparare, quando e dove\u2014in base alla nazionalit\u00e0 e al tipo di cerimonia." },
        { title: 'Checklist', desc: 'Task raggruppati per urgenza e fase, completabili dal web senza perdere il filo del planning.' },
        { title: 'Fornitori', desc: 'Segui e conferma i fornitori nello stesso spazio dove gestisci ospiti, budget e checklist.' },
        { title: 'Ospiti', desc: 'Lista ospiti, RSVP, intolleranze e coperti\u2014visibili da desktop accanto al resto del piano.' },
        { title: 'Budget', desc: "Spesa pianificata e confermata, voci di spesa e riepilogo per categorie\u2014parte della stessa piattaforma." },
      ],
    },
    italy: {
      label: "Pensato per l'Italia",
      title: "L'Italia \u00e8 diversa. VELO \u00e8 fatto per questo.",
      sub: "Sposarsi in Italia significa dichiarazioni al comune, documenti internazionali e un processo di planning unico. VELO \u00e8 progettato intorno a questa realt\u00e0\u2014non intorno a una checklist matrimoniale generica.",
      points: [
        { title: 'Guida documenti', desc: 'Percorso passo-passo per le coppie straniere: apostille, dichiarazioni al comune e requisiti per la cerimonia in Italia.' },
        { title: 'Planning destinazione', desc: 'Dalle ville in Toscana alle scogliere di Amalfi, VELO vi connette con professionisti selezionati in 11 zone italiane.' },
        { title: 'Supporto cerimonia', desc: "Civile, religiosa o simbolica\u2014VELO organizza il vostro planning attorno al tipo di cerimonia che si adatta al vostro matrimonio." },
      ],
      cta: "Apri l'area coppia",
    },
    vendors: {
      label: 'Marketplace fornitori',
      title: 'I professionisti giusti, in tutta Italia.',
      sub: 'Fotografi, floral designer, catering e location\u2014selezionati per chi si sposa in Italia.',
      cta: 'Esplora tutti i fornitori \u2192',
    },
    vendorCta: {
      badge: 'Per i professionisti del wedding',
      title: 'Sei un fornitore di matrimoni?',
      desc: 'Fatevi trovare su velowedding.it, gestite la pipeline delle coppie e connettetevi con chi pianifica il matrimonio in Italia.',
      pricing: 'Primo anno gratuito\u2014poi \u20ac20/mese, cancellazione libera',
      btn: 'Registrati come fornitore \u2192',
    },
    footer: {
      couples: 'Area Coppie',
      vendors: 'Fornitori',
      vendorArea: 'Area Fornitori',
      admin: 'Admin',
      copy: '\u00a9 2026 VELO \u00b7 velowedding.it',
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const c = getCopy(locale)

  return (
    <main className="min-h-screen bg-bg text-cream">
      <NavBar
        locale={locale}
        couplesLabel={c.nav.couples}
        vendorLabel={c.nav.vendors}
        forVendorLabel={c.nav.forVendors}
        primaryCtaLabel={c.nav.primaryCta}
      />

      {/* ═══════════════════════════════════════════════════════
          HERO — cinematic, full viewport, bottom-anchored text
      ═══════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=85')",
            backgroundPosition: 'center 25%',
          }}
        />

        {/* Gradient stack — creates dark reading zone at bottom */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0F0E0C 0%, #0F0E0C 22%, rgba(15,14,12,0.86) 48%, rgba(15,14,12,0.18) 78%, transparent 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(15,14,12,0.7) 0%, rgba(15,14,12,0.2) 50%, transparent 100%)' }}
        />
        {/* Atmospheric gold glow — upper right */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 68% 32%, rgba(201,168,76,0.13) 0%, transparent 42%)' }}
        />

        {/* NavBar spacer */}
        <div className="h-16 shrink-0" />

        {/* Editorial content — anchored to lower section */}
        <div className="relative mt-auto px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full pb-8">
          {/* Gold rule + label */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-gold/60" />
            <p className="text-gold text-[10px] sm:text-[11px] tracking-[0.48em] uppercase">{c.hero.label}</p>
          </div>

          {/* Headline — 3 editorial lines */}
          <h1
            className="font-light leading-[0.96] mb-7 sm:mb-9 max-w-3xl"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.25rem)' }}
          >
            <span className="block text-cream">{c.hero.h1a}</span>
            <span className="block text-gold italic">{c.hero.h1b}</span>
            <span className="block text-cream">{c.hero.h1c}</span>
          </h1>

          {/* Sub */}
          <p className="text-muted text-base sm:text-lg leading-relaxed max-w-[440px] mb-9 sm:mb-11">
            {c.hero.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/couple"
              className="inline-flex items-center justify-center bg-gold text-bg font-semibold px-7 py-4 rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              {c.hero.coupleCta}
            </Link>
            <Link
              href="/fornitori"
              className="inline-flex items-center justify-center border border-cream/22 text-cream px-7 py-4 rounded-full text-sm tracking-wide hover:border-cream/50 transition-colors"
            >
              {c.hero.vendorCta}
            </Link>
          </div>
        </div>

        {/* Platform toolbar — floating, bleeds into next section */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 mt-10 -mb-12">
          <div className="max-w-6xl mx-auto">
            <div
              className="border border-white/8 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
              style={{ background: 'rgba(14,12,9,0.96)', backdropFilter: 'blur(16px)' }}
            >
              <div className="flex flex-wrap gap-2">
                {c.hero.toolBarItems.map(item => (
                  <span
                    key={item}
                    className="text-[11px] text-cream/45 tracking-[0.22em] uppercase border border-white/10 rounded-full px-3 py-1.5 whitespace-nowrap"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/couple"
                className="text-gold text-[11px] tracking-[0.26em] uppercase shrink-0 hover:opacity-70 transition-opacity whitespace-nowrap hidden sm:block"
              >
                {c.hero.toolBarCta} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PLATFORM — asymmetric featured layout
      ═══════════════════════════════════════════════════════ */}
      <section className="pt-28 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">

          {/* Section heading — two-column editorial layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-12 sm:mb-16">
            <div>
              <p className="text-gold text-[11px] tracking-[0.36em] uppercase mb-5">{c.platform.label}</p>
              <h2
                className="font-light leading-[1.04]"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                {c.platform.title}
              </h2>
            </div>
            <div className="lg:pb-1">
              <p className="text-muted leading-relaxed mb-7">{c.platform.sub}</p>
              <Link
                href="/couple"
                className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-6 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity"
              >
                {c.platform.cta}
              </Link>
            </div>
          </div>

          {/* Featured Dashboard + 2×2 grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            {/* Dashboard — featured card */}
            <div className="bg-dark border border-gold/22 rounded-3xl p-8 sm:p-10 flex flex-col" style={{ minHeight: '360px' }}>
              <div className="mb-7">{ICONS[0]}</div>
              <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-2">{c.platform.label}</p>
              <h3
                className="font-light text-cream mb-4 leading-[1.1]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                {c.platform.dashboardTitle}
              </h3>
              <p className="text-muted text-sm leading-relaxed flex-1">{c.platform.dashboardDesc}</p>
              <Link
                href="/couple"
                className="mt-8 inline-flex items-center gap-2 text-gold text-sm hover:opacity-70 transition-opacity"
              >
                {c.platform.dashboardCta} &rarr;
              </Link>
            </div>

            {/* Secondary tools — 2×2 */}
            <div className="grid grid-cols-2 gap-5">
              {c.platform.tools.slice(0, 4).map((tool, i) => (
                <div
                  key={tool.title}
                  className="bg-dark border border-border rounded-2xl p-5 hover:border-gold/30 transition-colors group"
                >
                  <div className="mb-4 opacity-75 group-hover:opacity-100 transition-opacity">
                    {ICONS[i + 1]}
                  </div>
                  <h3 className="text-cream text-sm font-medium mb-2 tracking-wide">{tool.title}</h3>
                  <p className="text-muted text-xs leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget — full-width accent row */}
          {c.platform.tools[4] && (
            <div className="bg-dark border border-border rounded-2xl px-7 py-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-gold/25 transition-colors group">
              <div className="opacity-75 group-hover:opacity-100 transition-opacity shrink-0">{ICONS[5]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-cream text-sm font-medium mb-1 tracking-wide">{c.platform.tools[4].title}</h3>
                <p className="text-muted text-sm leading-relaxed">{c.platform.tools[4].desc}</p>
              </div>
              <Link href="/couple" className="text-gold text-[11px] tracking-[0.24em] uppercase shrink-0 hover:opacity-70 transition-opacity hidden sm:block">
                {c.platform.cta} &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ITALY — warm section, destination differentiator
          Contrast break: cream background, dark text
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-start">

            {/* Left: headline + CTA */}
            <div className="lg:sticky lg:top-24">
              <p className="text-muted text-[11px] tracking-[0.36em] uppercase mb-5">{c.italy.label}</p>
              <h2
                className="font-light text-bg leading-[1.08] mb-6"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                {c.italy.title}
              </h2>
              <p className="text-dark/70 leading-relaxed mb-9 text-base max-w-sm">{c.italy.sub}</p>
              <Link
                href="/couple"
                className="inline-flex items-center gap-2 bg-bg text-cream font-semibold px-6 py-3.5 rounded-full text-sm hover:opacity-85 transition-opacity"
              >
                {c.italy.cta}
              </Link>
            </div>

            {/* Right: 3 differentiator points — editorial ruled list */}
            <div className="space-y-10 pt-2 lg:pt-10">
              {c.italy.points.map((point) => (
                <div key={point.title}>
                  <div className="w-10 h-px bg-gold mb-5" />
                  <h3 className="text-bg font-medium mb-3 tracking-[0.02em]">{point.title}</h3>
                  <p className="text-dark/65 text-sm leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VENDORS — curated, editorial, not marketplace-heavy
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">

          {/* Editorial heading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end mb-12">
            <div>
              <p className="text-gold text-[11px] tracking-[0.36em] uppercase mb-5">{c.vendors.label}</p>
              <h2
                className="font-light leading-[1.06]"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                {c.vendors.title}
              </h2>
            </div>
            <div className="lg:pb-1">
              <p className="text-muted leading-relaxed">{c.vendors.sub}</p>
            </div>
          </div>

          {/* Region grid — clean, generous spacing */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-10">
            {REGIONS.map(region => (
              <Link
                key={region}
                href={`/fornitori?region=${encodeURIComponent(region)}`}
                className="border border-border text-muted rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm hover:border-gold hover:text-gold transition-colors"
              >
                {region}
              </Link>
            ))}
          </div>

          <Link href="/fornitori" className="text-gold text-sm tracking-[0.14em] hover:opacity-70 transition-opacity">
            {c.vendors.cta}
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VENDOR CTA — for professionals
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-dark border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-gold/10 border border-gold/25 rounded-full px-5 py-2 text-xs text-gold tracking-widest uppercase mb-8">
            {c.vendorCta.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-light mb-5">{c.vendorCta.title}</h2>
          <p className="text-muted text-base sm:text-lg mb-3 leading-relaxed">{c.vendorCta.desc}</p>
          <p className="text-gold text-sm mb-10 tracking-wide">{c.vendorCta.pricing}</p>
          <Link
            href="/vendor"
            className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-8 py-4 rounded-full text-sm hover:opacity-90 transition-opacity tracking-wide"
          >
            {c.vendorCta.btn}
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-border py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-8 w-auto" />
            <div>
              <span className="text-gold text-xl tracking-[0.35em] font-light">VELO</span>
              <p className="text-muted text-xs tracking-widest uppercase">from yes to forever</p>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-8 flex-wrap justify-center">
            <Link href="/couple" className="text-muted text-sm hover:text-cream transition-colors">{c.footer.couples}</Link>
            <Link href="/fornitori" className="text-muted text-sm hover:text-cream transition-colors">{c.footer.vendors}</Link>
            <Link href="/vendor" className="text-muted text-sm hover:text-cream transition-colors">{c.footer.vendorArea}</Link>
            <Link href="/admin" className="text-muted text-sm hover:text-cream transition-colors">{c.footer.admin}</Link>
          </div>
          <p className="text-muted text-xs">{c.footer.copy}</p>
        </div>
      </footer>
    </main>
  )
}
