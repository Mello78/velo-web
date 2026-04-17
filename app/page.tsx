import Link from 'next/link'
import { cookies } from 'next/headers'
import NavBar from '../components/NavBar'

const regions = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']

const featureIcons = [
  <svg key="dashboard" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M7 9h10M7 13h6M7 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="documents" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#C9A84C" strokeWidth="1.5" /><path d="M14 2v6h6M9 13h6M9 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="checklist" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="vendors" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="#C9A84C" strokeWidth="1.5" /><path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="guests" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="9" cy="8" r="3" stroke="#C9A84C" strokeWidth="1.5" /><path d="M4 19c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M20 19c0-2-1.5-3.6-3.4-3.9" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="budget" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M2 10h20" stroke="#C9A84C" strokeWidth="1.5" /><circle cx="8" cy="14" r="1.5" fill="#C9A84C" /><path d="M14 14h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
]

type HomeCopy = {
  nav: {
    couples: string
    vendors: string
    forVendors: string
    primaryCta: string
  }
  hero: {
    label: string
    title1: string
    tag: string
    title2: string
    desc: string
    coupleBtn: string
    browseBtn: string
    appNote: string
    couplePreviewLabel: string
    previewTools: string[]
  }
  paths: {
    label: string
    title: string
    couplesBadge: string
    couplesTitle: string
    couplesDesc: string
    couplesPoints: string[]
    couplesBtn: string
    vendorsBadge: string
    vendorsTitle: string
    vendorsDesc: string
    vendorsPoints: string[]
    vendorsBtn: string
  }
  how: {
    label: string
    title: string
    items: { title: string; desc: string }[]
  }
  platform: {
    label: string
    title: string
    desc: string
    cta: string
    cards: { title: string; desc: string }[]
  }
  marketplace: {
    label: string
    title: string
    desc: string
    cta: string
  }
  vendor: {
    badge: string
    title: string
    desc: string
    pricing: string
    btn: string
  }
  footer: {
    couples: string
    vendors: string
    vendorArea: string
    admin: string
    copy: string
  }
}

function getHomeCopy(locale: string): HomeCopy {
  if (locale === 'en') {
    return {
      nav: {
        couples: 'Couple Area',
        vendors: 'Vendors',
        forVendors: 'Are you a vendor?',
        primaryCta: 'ENTER COUPLE AREA',
      },
      hero: {
        label: 'from yes to forever',
        title1: 'Your wedding',
        tag: 'in Italy',
        title2: 'planned together.',
        desc: 'Dashboard, documents, checklist, vendors, guests, and budget — one dedicated planning space for couples marrying in Italy.',
        coupleBtn: 'Enter the couple area',
        browseBtn: 'Browse vendors',
        appNote: 'App also available on iOS & Android',
        couplePreviewLabel: 'Couple platform',
        previewTools: ['Dashboard', 'Documents', 'Checklist', 'Vendors', 'Guests', 'Budget'],
      },
      paths: {
        label: 'Two paths',
        title: 'Built for couples. Open for vendors.',
        couplesBadge: 'For couples',
        couplesTitle: 'Step into your planning platform',
        couplesDesc: 'Sign in to the VELO couple area and manage your entire wedding in Italy from one authenticated space.',
        couplesPoints: ['Planning dashboard', 'Checklist and documents', 'Vendors, guests, and budget'],
        couplesBtn: 'Open couple area',
        vendorsBadge: 'For vendors',
        vendorsTitle: 'Get listed in the VELO marketplace',
        vendorsDesc: 'Get listed on velowedding.it, manage your couple pipeline, and connect directly with couples planning their Italian wedding.',
        vendorsPoints: ['Public listing on velowedding.it', 'Vendor workspace and calendar', 'Direct messages from couples'],
        vendorsBtn: 'Go to vendor area',
      },
      how: {
        label: 'How it works',
        title: 'From yes to wedding day',
        items: [
          { title: 'Sign in as a couple', desc: 'Enter your VELO area and immediately see the full picture of your wedding in one place.' },
          { title: 'Work through the real planning flow', desc: 'Checklist, documents, budget, guests, and vendors stay aligned inside one connected product flow.' },
          { title: 'Arrive ready for your wedding day', desc: 'Every decision made, every vendor confirmed, every guest counted. VELO keeps the whole plan in focus.' },
        ],
      },
      platform: {
        label: 'Inside the couple platform',
        title: 'Six tools. One planning space.',
        desc: 'Dashboard, documents, checklist, vendors, guests, and budget already live inside the VELO couple area on web.',
        cta: 'Enter the couple platform',
        cards: [
          { title: 'Planning dashboard', desc: 'A couple overview with countdown, completed tasks, planned budget, and the next areas to open.' },
          { title: 'Documents guidance', desc: 'A real documents flow for foreign couples marrying in Italy, based on ceremony and nationality logic.' },
          { title: 'Active checklist', desc: 'Tasks grouped by urgency, ordered clearly, and completable directly from web.' },
          { title: 'Vendor pipeline', desc: 'Tracked and confirmed vendors remain visible in a dedicated couple view connected to the wider plan.' },
          { title: 'Guest management', desc: 'Guests, RSVP status, groups, and seat counts stay visible from desktop inside the same couple area.' },
          { title: 'Wedding budget', desc: 'Planned budget, confirmed spend, and expense rows are now part of the same couple platform.' },
        ],
      },
      marketplace: {
        label: 'Vendor marketplace',
        title: 'Discover exceptional vendors across Italy',
        desc: 'Photographers, floral designers, caterers, and venues — selected for couples planning an Italian wedding.',
        cta: 'Explore all vendors \u2192',
      },
      vendor: {
        badge: 'For wedding professionals',
        title: 'Are you a wedding vendor?',
        desc: 'The vendor side remains active and visible: public listing, vendor workspace, and direct connection with couples planning a wedding in Italy.',
        pricing: 'First year free \u2014 then \u20ac20/month, cancel anytime',
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
      title1: 'Il tuo matrimonio',
      tag: 'in Italia',
      title2: 'pianificato insieme.',
      desc: 'Dashboard, documenti, checklist, fornitori, ospiti e budget in un unico spazio dedicato a chi si sposa in Italia.',
      coupleBtn: "Entra nell'area coppia",
      browseBtn: 'Esplora i fornitori',
      appNote: 'App disponibile anche su iOS e Android',
      couplePreviewLabel: 'Piattaforma coppia',
      previewTools: ['Dashboard', 'Documenti', 'Checklist', 'Fornitori', 'Ospiti', 'Budget'],
    },
    paths: {
      label: 'Due percorsi',
      title: 'Prima le coppie. Aperto ai professionisti.',
      couplesBadge: 'Per le coppie',
      couplesTitle: 'Entrate nella vostra area planning',
      couplesDesc: "Accedete alla piattaforma VELO e gestite tutto il vostro matrimonio in Italia da un unico spazio autenticato.",
      couplesPoints: ['Dashboard wedding', 'Checklist e documenti', 'Fornitori, ospiti e budget'],
      couplesBtn: 'Apri area coppia',
      vendorsBadge: 'Per i fornitori',
      vendorsTitle: 'Entrate nel marketplace VELO',
      vendorsDesc: 'Fatevi trovare su velowedding.it, gestite la pipeline delle coppie e connettevi direttamente con chi pianifica il matrimonio in Italia.',
      vendorsPoints: ['Vetrina su velowedding.it', 'Area professionisti e calendario', 'Messaggi diretti dalle coppie'],
      vendorsBtn: "Vai all'area fornitori",
    },
    how: {
      label: 'Come funziona',
      title: 'Dal s\u00ec al giorno del matrimonio',
      items: [
        { title: 'Accedete come coppia', desc: "Entrate nella vostra area VELO e ritrovate subito il quadro completo del matrimonio in un unico posto." },
        { title: 'Seguite il planning in ogni fase', desc: 'Checklist, documenti, budget, ospiti e fornitori restano allineati dentro un unico flusso connesso.' },
        { title: 'Arrivate pronti al giorno del matrimonio', desc: 'Ogni decisione presa, ogni fornitore confermato, ogni ospite contato. VELO tiene tutto il piano in focus.' },
      ],
    },
    platform: {
      label: 'Dentro la piattaforma coppia',
      title: 'Sei strumenti. Una piattaforma.',
      desc: 'Dashboard, documenti, checklist, fornitori, ospiti e budget gi\u00e0 disponibili nell\u2019area coppia VELO sul web.',
      cta: 'Accedi alla piattaforma coppia',
      cards: [
        { title: 'Dashboard planning', desc: "Una vista d'insieme sul matrimonio con conto alla rovescia, task completati, budget e prossime aree da aprire." },
        { title: 'Guida documenti', desc: 'Percorso documentale dedicato alle coppie straniere che si sposano in Italia, con logica reale per cerimonia e nazionalit\u00e0.' },
        { title: 'Checklist attiva', desc: 'Task raggruppati per urgenza, ordinati e ora completabili anche dal web senza uscire dal planning.' },
        { title: 'Pipeline fornitori', desc: 'I fornitori seguiti e confermati restano visibili in una vista dedicata, collegata al resto del piano.' },
        { title: 'Gestione ospiti', desc: 'Lista ospiti, RSVP, gruppi e coperti restano leggibili anche da desktop nel flusso coppia.' },
        { title: 'Budget wedding', desc: 'Budget pianificato, confermato e voci di spesa fanno ormai parte della stessa piattaforma coppia.' },
      ],
    },
    marketplace: {
      label: 'Marketplace fornitori',
      title: 'Scopri i professionisti in tutta Italia',
      desc: 'Fotografi, floral designer, catering e location selezionati per chi si sposa in Italia.',
      cta: 'Esplora tutti i fornitori \u2192',
    },
    vendor: {
      badge: 'Per i professionisti del wedding',
      title: 'Sei un fornitore di matrimoni?',
      desc: 'La parte vendor resta viva e visibile: vetrina pubblica, area professionisti e connessione diretta con coppie che stanno pianificando il matrimonio in Italia.',
      pricing: 'Primo anno gratuito \u2014 poi \u20ac20/mese, cancellazione libera',
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

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const copy = getHomeCopy(locale)

  return (
    <main className="min-h-screen bg-bg text-cream">
      <NavBar
        locale={locale}
        couplesLabel={copy.nav.couples}
        vendorLabel={copy.nav.vendors}
        forVendorLabel={copy.nav.forVendors}
        primaryCtaLabel={copy.nav.primaryCta}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden pt-16 border-b border-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/88 to-bg/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(201,168,76,0.16),transparent_30%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">

            {/* Left: headline + CTAs */}
            <div className="max-w-[580px]">
              <div className="w-8 h-px bg-gold/50 mb-5" />
              <p className="text-gold text-xs tracking-[0.34em] uppercase mb-5">{copy.hero.label}</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] mb-6">
                {copy.hero.title1}<br />
                <span className="text-gold">{copy.hero.tag}</span><br />
                <span className="italic opacity-90">{copy.hero.title2}</span>
              </h1>
              <p className="text-muted text-base sm:text-lg leading-relaxed mb-8 max-w-xl">{copy.hero.desc}</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/couple"
                  className="inline-flex items-center justify-center gap-2 bg-gold text-bg font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm tracking-wide"
                >
                  {copy.hero.coupleBtn}
                </Link>
                <Link
                  href="/fornitori"
                  className="inline-flex items-center justify-center gap-2 border border-border text-cream px-6 py-3.5 rounded-full hover:border-gold transition-colors text-sm tracking-wide"
                >
                  {copy.hero.browseBtn}
                </Link>
              </div>

              <p className="text-[11px] text-muted/50 tracking-wide">{copy.hero.appNote}</p>
            </div>

            {/* Right: clean platform preview */}
            <div className="relative">
              <div className="rounded-[28px] border border-gold/20 bg-[#14120F]/92 backdrop-blur-sm p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gold text-[11px] tracking-[0.28em] uppercase mb-1.5">{copy.hero.couplePreviewLabel}</p>
                    <p className="text-cream text-xl font-light">VELO / Couple Area</p>
                  </div>
                  <span className="bg-gold/10 border border-gold/20 text-gold px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em]">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {copy.hero.previewTools.map((tool, i) => (
                    <div
                      key={tool}
                      className="flex items-center gap-3 rounded-xl border border-border bg-dark/60 px-4 py-3"
                    >
                      <div className="[&>svg]:w-5 [&>svg]:h-5 shrink-0 opacity-80">{featureIcons[i]}</div>
                      <span className="text-sm text-cream">{tool}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/couple"
                  className="flex items-center justify-center gap-2 border border-gold/30 bg-gold/8 text-gold px-4 py-3 rounded-xl text-xs uppercase tracking-[0.2em] hover:bg-gold/15 transition-colors w-full"
                >
                  {copy.hero.coupleBtn} &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Two paths ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.paths.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light">{copy.paths.title}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Couples — primary */}
            <div className="rounded-[24px] border border-gold/20 bg-dark p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-gold mb-5">
                {copy.paths.couplesBadge}
              </div>
              <h3 className="text-2xl font-light mb-3">{copy.paths.couplesTitle}</h3>
              <p className="text-muted mb-6 leading-relaxed">{copy.paths.couplesDesc}</p>
              <div className="space-y-3 mb-7">
                {copy.paths.couplesPoints.map(point => (
                  <div key={point} className="flex items-center gap-3 text-sm text-cream/90">
                    <span className="h-2 w-2 rounded-full bg-gold shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/couple" className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
                {copy.paths.couplesBtn}
              </Link>
            </div>

            {/* Vendors — secondary */}
            <div className="rounded-[24px] border border-border bg-dark p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-border bg-bg/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted mb-5">
                {copy.paths.vendorsBadge}
              </div>
              <h3 className="text-2xl font-light mb-3">{copy.paths.vendorsTitle}</h3>
              <p className="text-muted mb-6 leading-relaxed">{copy.paths.vendorsDesc}</p>
              <div className="space-y-3 mb-7">
                {copy.paths.vendorsPoints.map(point => (
                  <div key={point} className="flex items-center gap-3 text-sm text-cream/90">
                    <span className="h-2 w-2 rounded-full bg-muted/60 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link href="/vendor" className="inline-flex items-center gap-2 border border-border text-cream px-6 py-3 rounded-full text-sm hover:border-gold transition-colors">
                {copy.paths.vendorsBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl text-center mx-auto mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.how.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light">{copy.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {copy.how.items.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-border bg-dark p-6 relative overflow-hidden">
                {/* Watermark step number */}
                <div className="text-[80px] font-light text-gold/[0.07] absolute -top-3 right-4 select-none leading-none pointer-events-none">
                  {index + 1}
                </div>
                <div className="relative">
                  <div className="w-6 h-px bg-gold/40 mb-5" />
                  <h3 className="text-lg text-cream mb-3">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform tools ───────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.platform.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light mb-4">{copy.platform.title}</h2>
            <p className="text-muted leading-relaxed">{copy.platform.desc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {copy.platform.cards.map((card, index) => (
              <div
                key={card.title}
                className={`bg-dark rounded-2xl p-5 sm:p-6 hover:border-gold/40 transition-colors group border ${
                  index === 0 ? 'border-gold/25' : 'border-border'
                }`}
              >
                <div className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity">{featureIcons[index]}</div>
                <h3 className="text-cream font-medium mb-2 tracking-wide">{card.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/couple" className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-7 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity">
              {copy.platform.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marketplace ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.marketplace.label}</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-4">{copy.marketplace.title}</h2>
          <p className="text-muted mb-10 max-w-2xl mx-auto">{copy.marketplace.desc}</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {regions.map(region => (
              <Link
                key={region}
                href={`/fornitori?region=${encodeURIComponent(region)}`}
                className="border border-border rounded-full px-4 py-2 text-sm text-muted hover:border-gold hover:text-gold transition-colors"
              >
                {region}
              </Link>
            ))}
          </div>
          <Link href="/fornitori" className="inline-block mt-10 text-gold text-sm hover:opacity-70 transition-opacity tracking-wide">
            {copy.marketplace.cta}
          </Link>
        </div>
      </section>

      {/* ── Vendor CTA ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-dark border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-gold/10 border border-gold/25 rounded-full px-5 py-2 text-xs text-gold tracking-widest uppercase mb-8">
            {copy.vendor.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-light mb-6">{copy.vendor.title}</h2>
          <p className="text-muted text-base sm:text-lg mb-3 leading-relaxed">{copy.vendor.desc}</p>
          <p className="text-gold text-sm mb-10 tracking-wide">{copy.vendor.pricing}</p>
          <Link href="/vendor" className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-8 py-4 rounded-full text-sm hover:opacity-90 transition-opacity tracking-wide">
            {copy.vendor.btn}
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-8 w-auto" />
            <div>
              <span className="text-gold text-xl tracking-[0.35em] font-light">VELO</span>
              <p className="text-muted text-xs tracking-widest uppercase">from yes to forever</p>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-8 flex-wrap justify-center">
            <Link href="/couple" className="text-muted text-sm hover:text-cream transition-colors">{copy.footer.couples}</Link>
            <Link href="/fornitori" className="text-muted text-sm hover:text-cream transition-colors">{copy.footer.vendors}</Link>
            <Link href="/vendor" className="text-muted text-sm hover:text-cream transition-colors">{copy.footer.vendorArea}</Link>
            <Link href="/admin" className="text-muted text-sm hover:text-cream transition-colors">{copy.footer.admin}</Link>
          </div>
          <p className="text-muted text-xs">{copy.footer.copy}</p>
        </div>
      </footer>
    </main>
  )
}
