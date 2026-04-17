import Link from 'next/link'
import { cookies } from 'next/headers'
import { getT } from '../lib/translations'
import NavBar from '../components/NavBar'

const regions = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function AndroidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C4.98 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M17.82 15.64a2.18 2.18 0 012.18 2.18C20 19 19.02 20 17.82 20c-1.2 0-2.18-1-2.18-2.18a2.18 2.18 0 012.18-2.18M17.82 8.18C18.42 8.18 19 8.64 19 9.27v6.92c0 .63-.58 1.09-1.18 1.09-.6 0-1.18-.46-1.18-1.09V9.27c0-.63.58-1.09 1.18-1.09M6.18 8.18c.6 0 1.18.46 1.18 1.09v6.92c0 .63-.58 1.09-1.18 1.09C5.58 17.28 5 16.82 5 16.19V9.27c0-.63.58-1.09 1.18-1.09M12 1l2.27 4H9.73L12 1M12 3.27L11 5h2l-1-1.73M7 6v10h10V6H7m2-1h6c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1z" />
    </svg>
  )
}

const featureIcons = [
  <svg key="dashboard" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M7 9h10M7 13h6M7 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="documents" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#C9A84C" strokeWidth="1.5" /><path d="M14 2v6h6M9 13h6M9 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="checklist" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M8 8h8M8 12h8M8 16h5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="vendors" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="#C9A84C" strokeWidth="1.5" /><path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="guests" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="9" cy="8" r="3" stroke="#C9A84C" strokeWidth="1.5" /><path d="M4 19c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M20 19c0-2-1.5-3.6-3.4-3.9" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="budget" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="2" y="6" width="20" height="12" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M2 10h20" stroke="#C9A84C" strokeWidth="1.5" /><circle cx="8" cy="14" r="1.5" fill="#C9A84C" /><path d="M14 14h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
]

const stepIcons = [
  <svg key="step-1" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#C9A84C" strokeWidth="1.5" /><path d="M8 8h8M8 12h5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="step-2" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="12" cy="12" r="9" stroke="#C9A84C" strokeWidth="1.5" /><path d="M12 7v5l3 2" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  <svg key="step-3" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M5 12h14" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" /><path d="M13 6l6 6-6 6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
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
    vendorBtn: string
    webNote: string
    couplePreviewLabel: string
    previewTitle: string
    previewDesc: string
    previewTools: string[]
  }
  paths: {
    label: string
    title: string
    desc: string
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
        label: 'The platform for couples getting married in Italy',
        title1: 'Plan your wedding',
        tag: 'in Italy',
        title2: 'with one platform',
        desc: 'VELO brings together dashboard, documents, checklist, vendors, guests, and budget in one dedicated space for couples.',
        coupleBtn: 'Enter the couple area',
        browseBtn: 'Browse vendors',
        vendorBtn: 'Vendor area',
        webNote: 'Couple area available on web. VELO app remains part of the experience.',
        couplePreviewLabel: 'Couple platform preview',
        previewTitle: 'The VELO couple area is now a real planning workspace',
        previewDesc: 'Dashboard, documents, checklist, vendors, guests, and budget now connect inside one authenticated planning flow.',
        previewTools: ['Dashboard', 'Documents', 'Checklist', 'Vendors', 'Guests', 'Budget'],
      },
      paths: {
        label: 'Two clear paths',
        title: 'VELO now serves couples first, while still supporting vendors well',
        desc: 'The homepage now opens with wedding planning for couples, without losing the strength of VELO’s vendor marketplace.',
        couplesBadge: 'For couples',
        couplesTitle: 'Step into your planning platform',
        couplesDesc: 'Sign in to the VELO couple area and manage your wedding in Italy from one authenticated space.',
        couplesPoints: ['Planning dashboard', 'Checklist and documents', 'Vendors, guests, and budget'],
        couplesBtn: 'Open couple area',
        vendorsBadge: 'For vendors',
        vendorsTitle: 'Stay visible inside the VELO marketplace',
        vendorsDesc: 'The vendor side remains important for discovery and conversion, but now as a secondary path next to the couple platform.',
        vendorsPoints: ['Public listing', 'Vendor workspace', 'Couple pipeline and profile management'],
        vendorsBtn: 'Go to vendor area',
      },
      how: {
        label: 'How it works',
        title: 'From first sign-in to wedding day',
        items: [
          { title: '1. Sign in as a couple', desc: 'Enter your VELO area and immediately see the full picture of your wedding.' },
          { title: '2. Follow the real planning flow', desc: 'Checklist, documents, budget, guests, and vendors stay aligned inside one product flow.' },
          { title: '3. Move forward without losing context', desc: 'Each area of the platform connects back to the overall plan and makes next steps clearer.' },
        ],
      },
      platform: {
        label: 'Inside the couple platform',
        title: 'Real tools already live inside VELO',
        desc: 'Not just inspiration or vendor browsing: couples can now enter a real planning platform that is materially built out on web.',
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
        title: 'When you need vendors, the marketplace is still right there',
        desc: 'Photographers, floral designers, caterers, and venues remain part of VELO, but now inside a broader planning story for couples.',
        cta: 'Explore all vendors →',
      },
      vendor: {
        badge: 'For wedding professionals',
        title: 'Are you a wedding vendor?',
        desc: 'The vendor side remains active and visible: public listing, vendor workspace, and direct connection with couples planning a wedding in Italy.',
        pricing: 'First year free — then €20/month, cancel anytime',
        btn: 'Register as a vendor →',
      },
      footer: {
        couples: 'Couple Area',
        vendors: 'Vendors',
        vendorArea: 'Vendor Area',
        admin: 'Admin',
        copy: '© 2026 VELO · velowedding.it',
      },
    }
  }

  return {
    nav: {
      couples: 'Area Coppie',
      vendors: 'Fornitori',
      forVendors: 'Sei un fornitore?',
      primaryCta: 'ENTRA NELL\'AREA COPPIA',
    },
    hero: {
      label: 'La piattaforma per chi si sposa in Italia',
      title1: 'Pianifica il tuo matrimonio',
      tag: 'in Italia',
      title2: 'con una sola piattaforma',
      desc: 'VELO riunisce dashboard, documenti, checklist, fornitori, ospiti e budget in un unico spazio dedicato alle coppie.',
      coupleBtn: 'Entra nell\'area coppia',
      browseBtn: 'Esplora i fornitori',
      vendorBtn: 'Area fornitori',
      webNote: 'Area coppia disponibile sul web. L\'app VELO resta parte dell\'esperienza.',
      couplePreviewLabel: 'Anteprima area coppia',
      previewTitle: 'L’area coppia VELO ora e uno spazio di planning reale',
      previewDesc: 'Dashboard, documenti, checklist, fornitori, ospiti e budget si collegano dentro un unico flusso autenticato.',
      previewTools: ['Dashboard', 'Documenti', 'Checklist', 'Fornitori', 'Ospiti', 'Budget'],
    },
    paths: {
      label: 'Due percorsi chiari',
      title: 'VELO accompagna coppie e professionisti',
      desc: 'La homepage ora apre subito al planning delle coppie, senza perdere la forza del marketplace fornitori.',
      couplesBadge: 'Per le coppie',
      couplesTitle: 'Entrate nella vostra area planning',
      couplesDesc: 'Accedete alla piattaforma VELO per seguire tutto il matrimonio in Italia da un unico spazio autenticato.',
      couplesPoints: ['Dashboard wedding', 'Checklist e documenti', 'Fornitori, ospiti e budget'],
      couplesBtn: 'Apri area coppia',
      vendorsBadge: 'Per i fornitori',
      vendorsTitle: 'Restate visibili nel marketplace VELO',
      vendorsDesc: 'La parte vendor rimane centrale per discovery e conversione, ma come percorso secondario rispetto al planning delle coppie.',
      vendorsPoints: ['Vetrina pubblica', 'Area professionisti', 'Pipeline coppie e gestione profilo'],
      vendorsBtn: 'Vai all\'area fornitori',
    },
    how: {
      label: 'Come funziona',
      title: 'Dal primo accesso al giorno del matrimonio',
      items: [
        { title: '1. Accedete come coppia', desc: 'Entrate nella vostra area VELO e ritrovate il quadro completo del matrimonio.' },
        { title: '2. Seguite il planning reale', desc: 'Checklist, documenti, budget, ospiti e fornitori restano allineati nello stesso flusso.' },
        { title: '3. Avanzate senza perdere contesto', desc: 'Ogni area della piattaforma vi riporta al piano generale e rende piu chiari i prossimi passi.' },
      ],
    },
    platform: {
      label: 'Dentro la piattaforma coppia',
      title: 'Gli strumenti reali gia disponibili nell’area VELO',
      desc: 'Non solo ispirazione o ricerca fornitori: la coppia entra in una piattaforma concreta, gia operativa sul web.',
      cta: 'Accedi alla piattaforma coppia',
      cards: [
        { title: 'Dashboard planning', desc: 'Una vista d’insieme sul matrimonio con conto alla rovescia, task completati, budget e prossime aree da aprire.' },
        { title: 'Guida documenti', desc: 'Percorso documentale dedicato alle coppie straniere che si sposano in Italia, con logica reale per cerimonia e nazionalita.' },
        { title: 'Checklist attiva', desc: 'Task raggruppati per urgenza, ordinati e ora completabili anche dal web senza uscire dal planning.' },
        { title: 'Pipeline fornitori', desc: 'I fornitori seguiti e confermati restano visibili in una vista dedicata, collegata al resto del piano.' },
        { title: 'Gestione ospiti', desc: 'Lista ospiti, RSVP, gruppi e coperti restano leggibili anche da desktop nel flusso coppia.' },
        { title: 'Budget wedding', desc: 'Budget pianificato, confermato e voci di spesa fanno ormai parte della stessa piattaforma coppia.' },
      ],
    },
    marketplace: {
      label: 'Marketplace fornitori',
      title: 'Quando vi serve, il marketplace resta a portata di mano',
      desc: 'Fotografi, floral designer, catering e location restano parte del prodotto VELO, ma dentro una storia piu ampia di planning per le coppie.',
      cta: 'Esplora tutti i fornitori →',
    },
    vendor: {
      badge: 'Per i professionisti del wedding',
      title: 'Sei un fornitore di matrimoni?',
      desc: 'La parte vendor resta viva e visibile: vetrina pubblica, area professionisti e connessione diretta con coppie che stanno pianificando il matrimonio in Italia.',
      pricing: 'Primo anno gratuito — poi €20/mese, cancellazione libera',
      btn: 'Registrati come fornitore →',
    },
    footer: {
      couples: 'Area Coppie',
      vendors: 'Fornitori',
      vendorArea: 'Area Fornitori',
      admin: 'Admin',
      copy: '© 2026 VELO · velowedding.it',
    },
  }
}

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const tr = getT(locale)
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

      <section className="relative min-h-[700px] flex items-center overflow-hidden pt-16 border-b border-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/88 to-bg/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(201,168,76,0.16),transparent_30%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="max-w-[580px]">
              <p className="text-gold text-xs tracking-[0.34em] uppercase mb-5">{copy.hero.label}</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-light leading-[1.02] mb-6">
                {copy.hero.title1} <span className="text-gold">{copy.hero.tag}</span><br />{copy.hero.title2}
              </h1>
              <p className="text-muted text-base sm:text-lg leading-relaxed mb-8 max-w-xl">{copy.hero.desc}</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link href="/couple" className="inline-flex items-center justify-center gap-2 bg-gold text-bg font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm tracking-wide">
                  {copy.hero.coupleBtn}
                </Link>
                <Link href="/fornitori" className="inline-flex items-center justify-center gap-2 border border-border text-cream px-6 py-3.5 rounded-full hover:border-gold transition-colors text-sm tracking-wide">
                  {copy.hero.browseBtn}
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                <Link href="/vendor" className="text-gold hover:opacity-80 transition-opacity tracking-wide">
                  {copy.hero.vendorBtn}
                </Link>
                <span className="text-muted/70">{copy.hero.webNote}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8" id="download">
                <a href="#" className="flex items-center justify-center gap-3 bg-cream/92 text-bg font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
                  <AppleIcon /><span className="text-sm tracking-wide">{tr.hero.appStore}</span>
                </a>
                <a href="#" className="flex items-center justify-center gap-3 border border-border text-cream px-6 py-3.5 rounded-full hover:border-gold transition-colors">
                  <AndroidIcon /><span className="text-sm tracking-wide">{tr.hero.googlePlay}</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-gold/20 bg-[#14120F]/92 backdrop-blur-sm p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gold text-[11px] tracking-[0.28em] uppercase mb-2">{copy.hero.couplePreviewLabel}</p>
                    <h2 className="text-2xl font-light text-cream">{copy.hero.previewTitle}</h2>
                  </div>
                  <Link href="/couple" className="hidden sm:inline-flex bg-gold/12 border border-gold/25 text-gold px-4 py-2 rounded-full text-xs tracking-[0.16em] uppercase">
                    {copy.hero.coupleBtn}
                  </Link>
                </div>

                <p className="text-muted text-sm leading-relaxed mb-6 max-w-xl">{copy.hero.previewDesc}</p>

                <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4">
                  <div className="rounded-2xl border border-border bg-dark/70 p-5 min-h-[220px]">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-[11px] tracking-[0.24em] uppercase text-gold mb-2">{copy.hero.previewTools[0]}</div>
                        <div className="text-2xl font-light text-cream">VELO / Couple</div>
                      </div>
                      <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold">
                        Live
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {copy.hero.previewTools.slice(1, 5).map((tool, index) => (
                        <div key={tool} className="rounded-xl border border-border bg-bg/60 px-4 py-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-gold/80 mb-2">Tool {index + 1}</div>
                          <div className="text-sm text-cream">{tool}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-border bg-bg/60 px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-gold/80 mb-2">{copy.hero.previewTools[5]}</div>
                      <div className="text-sm text-cream">{copy.platform.cards[5].desc}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                    {copy.platform.cards.slice(0, 4).map((card, index) => (
                      <div key={card.title} className="rounded-2xl border border-border bg-dark/70 p-4">
                        <div className="mb-3 opacity-90">{featureIcons[index]}</div>
                        <div className="text-sm text-cream mb-2">{card.title}</div>
                        <div className="text-xs text-muted leading-relaxed">{card.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.paths.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light mb-4">{copy.paths.title}</h2>
            <p className="text-muted leading-relaxed">{copy.paths.desc}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

      <section className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl text-center mx-auto mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.how.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light">{copy.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {copy.how.items.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-border bg-dark p-6">
                <div className="mb-4 opacity-90">{stepIcons[index]}</div>
                <h3 className="text-lg text-cream mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.platform.label}</p>
            <h2 className="text-3xl sm:text-4xl font-light mb-4">{copy.platform.title}</h2>
            <p className="text-muted leading-relaxed">{copy.platform.desc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {copy.platform.cards.map((card, index) => (
              <div key={card.title} className="bg-dark border border-border rounded-2xl p-5 sm:p-6 hover:border-gold/30 transition-colors group">
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

      <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{copy.marketplace.label}</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-4">{copy.marketplace.title}</h2>
          <p className="text-muted mb-10 max-w-3xl mx-auto">{copy.marketplace.desc}</p>
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
