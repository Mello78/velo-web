import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import NavBar from '../components/NavBar'

const REGIONS = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']
const DISPLAY_FONT = 'DM Serif Display, Georgia, serif'
const ITALIC_FONT = 'Fraunces, Georgia, serif'
const MONO_FONT = "'JetBrains Mono', monospace"

type HeroImage = {
  src: string
  alt: string
  objectPosition: string
  overlay: string
  plateLabel: { it: string; en: string }
  footLeft: { it: string; en: string }
  footRight: { it: string; en: string }
}

const HERO_IMAGES: HeroImage[] = [
  {
    src: '/images/home/hero-coastal-01.png',
    alt: 'An Italian coastal terrace ceremony setup overlooking the sea at golden hour.',
    objectPosition: '68% 52%',
    overlay:
      'linear-gradient(180deg, rgba(23,15,9,0.02) 0%, rgba(23,15,9,0.14) 55%, rgba(23,15,9,0.44) 100%), linear-gradient(90deg, rgba(248,240,228,0.14) 0%, rgba(248,240,228,0.02) 34%, rgba(23,15,9,0.16) 100%)',
    plateLabel: { it: 'Costiera Amalfitana', en: 'Amalfi Coast' },
    footLeft: { it: 'Terrazza sul mare', en: 'Sea terrace' },
    footRight: { it: 'Plate 01', en: 'Plate 01' },
  },
  {
    src: '/images/home/hero-masseria-01.png',
    alt: 'A warm masseria courtyard dinner with candlelight and a bride seen from the back.',
    objectPosition: '72% 52%',
    overlay:
      'linear-gradient(180deg, rgba(25,16,9,0.02) 0%, rgba(25,16,9,0.16) 58%, rgba(25,16,9,0.36) 100%), linear-gradient(90deg, rgba(249,242,233,0.2) 0%, rgba(249,242,233,0.06) 40%, rgba(25,16,9,0.2) 100%)',
    plateLabel: { it: 'Masseria italiana', en: 'Italian masseria' },
    footLeft: { it: 'Cena in corte', en: 'Courtyard dinner' },
    footRight: { it: 'Plate 02', en: 'Plate 02' },
  },
]

type Copy = {
  nav: { couples: string; vendors: string; forVendors: string; primaryCta: string }
  hero: {
    label: string; titleA: string; titleB: string; titleC: string; sub: string
    coupleCta: string; vendorCta: string; destinationBadge: string; destinationNote: string
    proofLabel: string; proofTitle: string; proofItems: string[]; regionsLine: string
  }
  platform: {
    label: string; title: string; sub: string; cta: string
    workspaceLabel: string; workspaceTitle: string; workspaceCopy: string
    strips: string[]; panels: { eyebrow: string; title: string; copy: string }[]
  }
  italy: {
    label: string; title: string; sub: string; callout: string
    pillars: { number: string; title: string; copy: string }[]
  }
  vendors: { label: string; title: string; sub: string; curatedLine: string; browseCta: string; vendorCta: string }
  close: { label: string; title: string; sub: string; coupleCta: string; vendorCta: string; note: string }
  footer: { couples: string; vendors: string; vendorArea: string; admin: string; copy: string }
}

function getCopy(locale: string): Copy {
  if (locale === 'en') {
    return {
      nav: { couples: 'Couple Area', vendors: 'Professionals', forVendors: 'For vendors', primaryCta: 'ENTER COUPLE AREA' },
      hero: {
        label: 'for weddings in Italy',
        titleA: 'Marry in Italy.',
        titleB: '',
        titleC: 'With VELO.',
        sub: 'The planning platform for couples bringing an Italian wedding together from abroad.',
        coupleCta: 'Enter couple area',
        vendorCta: 'Explore professionals',
        destinationBadge: 'Destination couples',
        destinationNote: 'For couples planning from abroad — balancing place, paperwork, people, and time across borders.',
        proofLabel: 'Inside the couple platform',
        proofTitle: 'The wedding, kept in one calm room.',
        proofItems: ['Dashboard', 'Documents', 'Checklist', 'Guests', 'Budget', 'Vendors'],
        regionsLine: 'Across Tuscany, Amalfi, Como, Puglia, Rome, Venice, and beyond.',
      },
      platform: {
        label: 'Platform proof',
        title: 'Not a dashboard. A planning room.',
        sub: 'VELO unifies documents, guests, budget, and curated Italian professionals in one quiet workspace — so the wedding stays whole instead of scattered.',
        cta: 'Open VELO',
        workspaceLabel: 'The couple workspace',
        workspaceTitle: 'Planning, documents, guests, and vendors held in one calm room.',
        workspaceCopy: 'Instead of splitting the wedding across spreadsheets, chats, and generic tools, VELO keeps the real planning flow together from first decisions to final confirmations.',
        strips: ['Dashboard', 'Document path', 'Checklist', 'Guest list', 'Budget', 'Vendors'],
        panels: [
          { eyebrow: 'Documents', title: 'Know what Italy requires, before it becomes stressful.', copy: 'Nationality, ceremony type, and timing inform the path so international couples are not left translating the process alone.' },
          { eyebrow: 'Guests & budget', title: 'Every decision visible, in one place.', copy: 'RSVPs, spend, and vendor choices stay close to the rest of the plan instead of becoming separate admin.' },
          { eyebrow: 'Curated vendors', title: 'The right professionals, in context.', copy: 'Browse professionals for your wedding in Italy from the same platform where the rest of the wedding already lives.' },
        ],
      },
      italy: {
        label: 'Italy as method',
        title: 'Italy is not a backdrop. It is the method.',
        sub: 'Documents, ceremony logic, regional sourcing, and long-distance decisions change the planning job. VELO is built around that reality from the start.',
        callout: 'Especially for couples planning from abroad, where certainty matters as much as beauty.',
        pillars: [
          { number: '01', title: 'Documents first', copy: 'Comune declarations, apostilles, translations, ceremony requirements, and timing are treated as part of the plan rather than an afterthought.' },
          { number: '02', title: 'Destination logic', copy: 'The platform is shaped around weddings planned from another country, where confidence and clarity matter more than endless browsing.' },
          { number: '03', title: 'Regional curation', copy: 'VELO connects couples with selected professionals across Italy so vendor discovery feels aligned with the place, not like a generic directory.' },
        ],
      },
      vendors: {
        label: 'Curated professionals',
        title: 'Introduced with care, not thrown into a directory.',
        sub: 'Selected photographers, floral designers, venues, caterers, planners, and more, across Italy and inside the same world as your planning.',
        curatedLine: 'A quieter kind of vendor access, shaped around place, fit, and timing in Italy.',
        browseCta: 'Browse professionals',
        vendorCta: 'Join as a vendor',
      },
      close: {
        label: 'Begin beautifully',
        title: 'Bring the whole wedding into one Italian room.',
        sub: 'Open VELO and begin with clarity — from the first document to the final table plan.',
        coupleCta: 'Enter couple area',
        vendorCta: 'Vendor area',
        note: 'Wedding professionals have their own entry in the vendor area.',
      },
      footer: { couples: 'Couple Area', vendors: 'Professionals', vendorArea: 'Vendor Area', admin: 'Admin', copy: '© 2026 VELO · velowedding.it' },
    }
  }

  return {
    nav: { couples: 'Area Coppie', vendors: 'Professionisti', forVendors: 'Per fornitori', primaryCta: "ENTRA NELL'AREA COPPIA" },
    hero: {
      label: 'per matrimoni in Italia',
      titleA: 'Sposatevi in Italia.',
      titleB: '',
      titleC: 'Con VELO.',
      sub: "La piattaforma di planning per coppie che costruiscono il loro matrimonio in Italia dall'estero.",
      coupleCta: "Entra nell'area coppia",
      vendorCta: 'Esplora i professionisti',
      destinationBadge: "Per coppie dall'estero",
      destinationNote: "Per coppie che organizzano dall'estero — tenendo insieme luogo, documenti, persone e tempo tra due paesi.",
      proofLabel: 'Dentro la piattaforma coppia',
      proofTitle: 'Il matrimonio, tenuto in una sola stanza calma.',
      proofItems: ['Dashboard', 'Documenti', 'Checklist', 'Ospiti', 'Budget', 'Fornitori'],
      regionsLine: 'Tra Toscana, Amalfi, Como, Puglia, Roma, Venezia e oltre.',
    },
    platform: {
      label: 'Piattaforma',
      title: 'Non una dashboard. Una regia del matrimonio.',
      sub: 'VELO riunisce documenti, ospiti, budget e professionisti italiani selezionati in uno spazio calmo — così il matrimonio resta intero invece di perdersi.',
      cta: 'Apri VELO',
      workspaceLabel: 'Lo spazio coppia',
      workspaceTitle: 'Planning, documenti, ospiti e fornitori tenuti in una sola regia calma.',
      workspaceCopy: 'Invece di dividere il matrimonio tra fogli, chat e strumenti generici, VELO tiene collegato il flusso reale del planning, dalle prime decisioni fino alle conferme finali.',
      strips: ['Dashboard', 'Guida documenti', 'Checklist', 'Lista ospiti', 'Budget', 'Fornitori'],
      panels: [
        { eyebrow: 'Documenti', title: "Sapere cosa richiede l'Italia, prima che diventi stress.", copy: 'Nazionalita, tipo di cerimonia e tempistiche guidano il percorso, cosi le coppie straniere non restano sole a interpretare il processo.' },
        { eyebrow: 'Ospiti e budget', title: 'Ogni decisione visibile, in un solo posto.', copy: 'RSVP, spese e scelte sui fornitori restano vicini al resto del planning invece di diventare amministrazione separata.' },
        { eyebrow: 'Fornitori selezionati', title: 'I professionisti giusti, nel contesto giusto.', copy: 'Esplorate professionisti per il vostro matrimonio in Italia dallo stesso spazio in cui vive gia il resto del progetto.' },
      ],
    },
    italy: {
      label: "L'Italia come metodo",
      title: "L'Italia non è uno sfondo. È il metodo.",
      sub: "Documenti, logica della cerimonia, sourcing regionale e decisioni da lontano cambiano il lavoro del planning. VELO nasce da questa realtà.",
      callout: "Soprattutto per coppie che organizzano dall'estero, dove la certezza conta quanto la bellezza.",
      pillars: [
        { number: '01', title: 'Documenti per primi', copy: "Dichiarazioni al comune, apostille, traduzioni, requisiti per la cerimonia e tempistiche entrano nel piano invece di restare un pensiero separato." },
        { number: '02', title: 'Logica destination', copy: "La piattaforma nasce per matrimoni organizzati da lontano, dove chiarezza e fiducia contano più di un browsing infinito." },
        { number: '03', title: 'Curation regionale', copy: "VELO connette le coppie con professionisti selezionati in tutta Italia, così la scelta sembra coerente con il luogo e non con un marketplace generico." },
      ],
    },
    vendors: {
      label: 'Professionisti selezionati',
      title: 'Introdotti con cura, non gettati in una directory.',
      sub: "Fotografi, floral designer, location, catering, planner e altri professionisti scelti in tutta Italia, dentro lo stesso mondo del vostro planning.",
      curatedLine: "Un accesso ai fornitori più silenzioso, pensato intorno a luogo, coerenza e tempi in Italia.",
      browseCta: 'Esplora i professionisti',
      vendorCta: 'Diventa fornitore',
    },
    close: {
      label: 'Inizia bene',
      title: "Portate l'intero matrimonio in una sola stanza italiana.",
      sub: 'Apri VELO e comincia con chiarezza — dal primo documento fino al tavolo finale.',
      coupleCta: "Entra nell'area coppia",
      vendorCta: 'Area fornitori',
      note: "I professionisti del wedding hanno il loro ingresso nell'area fornitori.",
    },
    footer: { couples: 'Area Coppie', vendors: 'Professionisti', vendorArea: 'Area Fornitori', admin: 'Admin', copy: '© 2026 VELO · velowedding.it' },
  }
}

// Planning room — light stone composition, scannable
function DashboardSurface({
  heroCopy,
  platformCopy,
  locale,
}: {
  heroCopy: Copy['hero']
  platformCopy: Copy['platform']
  locale: string
}) {
  const isIT = locale === 'it'
  const stamp = isIT ? 'Area coppia' : 'Couple area'

  return (
    <div className="rounded-[2.2rem] bg-[#e6dac4] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:p-5">
      {/* Floating planning page */}
      <div className="rounded-[1.7rem] bg-[#fbf4e5] p-5 shadow-[0_14px_44px_rgba(31,24,18,0.11)] sm:p-6">
        <div className="flex items-center justify-between border-b border-[#e4d4be] pb-3.5">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{heroCopy.proofLabel}</p>
          <span className="rounded-full border border-[#d8c7b0] bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{stamp}</span>
        </div>

        <h3 className="mt-3.5 text-[1.2rem] leading-snug text-[#1f1812] sm:text-[1.38rem]" style={{ fontFamily: DISPLAY_FONT }}>{heroCopy.proofTitle}</h3>

        {/* Three planning areas — scannable, eyebrow + title only */}
        <div className="mt-4 space-y-3.5">
          {platformCopy.panels.map((panel, i) => {
            const roman = ['i.', 'ii.', 'iii.'][i]
            return (
              <div key={panel.eyebrow} className="flex gap-3.5 border-b border-[#ead9c8] pb-3.5 last:border-0 last:pb-0">
                <span className="mt-0.5 w-5 shrink-0 text-[0.8rem] italic text-[#b85a2e]" style={{ fontFamily: ITALIC_FONT }}>{roman}</span>
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.28em] text-[#8a3e1e]">{panel.eyebrow}</p>
                  <p className="mt-1 text-[0.97rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{panel.title}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ItalyPlate({ copy, locale, heroImage }: { copy: Copy['hero']; locale: string; heroImage: HeroImage }) {
  const isIT = locale === 'it'
  const plateCta = isIT ? 'Toscana · Amalfi · Como · Langhe' : 'Tuscany · Amalfi · Como · Langhe'
  const plate = {
    kicker: isIT ? 'La promessa italiana' : 'The Italian promise',
    note: isIT ? 'Il matrimonio in Italia, con luogo, luce e misura.' : 'Destination weddings, with place, light, and restraint.',
    caption: isIT ? "Per coppie che scelgono l'Italia non come sfondo, ma come modo di sposarsi." : 'For couples choosing Italy not as a backdrop, but as a way of getting married.',
    cta: isIT ? 'Toscana · Amalfi · Como · Langhe' : 'Tuscany · Amalfi · Como · Langhe',
  }

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
      {/* Shadow backing card */}
      <div className="absolute right-[5%] top-[5%] hidden h-[84%] w-[84%] rounded-[3.1rem] border border-[#dcc8b0] bg-[linear-gradient(145deg,#f7efe2_0%,#efe0cd_100%)] shadow-[0_40px_110px_rgba(30,18,10,0.18)] lg:block" />
      {/* Dark accent strip */}
      <div className="absolute right-0 top-[11%] hidden h-[66%] w-[13%] rounded-[2rem] bg-[#2a1f17] lg:block" />
      {/* Main image */}
      <div className="absolute right-[7%] top-0 h-[78%] w-[76%] overflow-hidden rounded-[2.8rem] border border-[#e4cdb4]/70 shadow-[0_36px_100px_rgba(18,10,5,0.32),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="(max-width: 1024px) 76vw, 820px"
          className="object-cover"
          style={{ objectPosition: heroImage.objectPosition }}
        />
        <div className="absolute inset-0" style={{ background: heroImage.overlay }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_22%,rgba(32,24,18,0.08)_100%)]" />
      </div>
      {/* Cinematic label bar */}
      <div className="absolute right-[7%] top-0 z-10 flex h-9 w-[76%] items-center justify-between rounded-t-[2.8rem] px-5">
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>{isIT ? 'Italia' : 'Italy'}</span>
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>VELO</span>
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>{heroImage.plateLabel[isIT ? 'it' : 'en']}</span>
      </div>
      {/* Inner framing ring */}
      <div className="absolute right-[11%] top-[6%] h-[66%] w-[68%] rounded-[2.35rem] border border-[#e8d4bc]/18" />
      {/* Top-left info card */}
      <div className="absolute left-0 top-[8%] z-10 w-[46%] max-w-[260px] rounded-[2rem] border border-[#c8b09a]/28 bg-[rgba(252,246,238,0.94)] p-5 shadow-[0_24px_64px_rgba(30,18,10,0.18),0_2px_8px_rgba(30,18,10,0.07)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{plate.kicker}</p>
        <p className="mt-3 text-lg leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{plate.note}</p>
      </div>
      {/* Bottom caption card */}
      <div className="absolute bottom-[2%] left-[8%] z-10 w-[78%] rounded-[2rem] border border-[#decbb4] bg-[rgba(251,244,229,0.97)] p-5 shadow-[0_24px_64px_rgba(30,18,10,0.18)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2d1bc] pb-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{copy.label}</p>
          <span className="rounded-full border border-[#ddc9b1] bg-white/55 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#6c5b4b]">{copy.destinationBadge}</span>
        </div>
        <p className="mt-4 max-w-[33rem] text-[1.05rem] leading-relaxed text-[#5d4e40] sm:text-[1.1rem]" style={{ fontFamily: DISPLAY_FONT }}>{plate.caption}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{plateCta}</p>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>
            <span>{heroImage.footLeft[isIT ? 'it' : 'en']}</span>
            <span className="h-px w-6 bg-[#c97a52]/55" />
            <span>{heroImage.footRight[isIT ? 'it' : 'en']}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const c = getCopy(locale)
  const heroImage = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)] ?? HERO_IMAGES[0]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3eadb] text-[#1f1812]">
      <NavBar
        locale={locale}
        couplesLabel={c.nav.couples}
        vendorLabel={c.nav.vendors}
        forVendorLabel={c.nav.forVendors}
        primaryCtaLabel={c.nav.primaryCta}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#ddc9b2] bg-[linear-gradient(180deg,#f5edde_0%,#f0e2cf_58%,#f7efe4_100%)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 12% 18%, rgba(184,90,46,0.12) 0%, transparent 24%), radial-gradient(circle at 38% 8%, rgba(255,255,255,0.48) 0%, transparent 28%), radial-gradient(circle at 72% 24%, rgba(140,104,74,0.08) 0%, transparent 24%), radial-gradient(circle at 86% 72%, rgba(184,90,46,0.09) 0%, transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 22%, rgba(243,234,219,0.24) 100%)',
          }}
        />
        <div className="absolute left-[-10rem] top-[6rem] h-[24rem] w-[24rem] rounded-full bg-white/45 blur-[110px]" />
        <div className="absolute left-[18%] top-[22rem] h-[18rem] w-[18rem] rounded-full bg-[#d8b79a]/16 blur-[100px]" />
        <div className="absolute right-[-8rem] top-[7rem] hidden h-[34rem] w-[44rem] rounded-[4rem] border border-[#3a2b20]/8 bg-[linear-gradient(160deg,rgba(43,32,24,0.12),rgba(43,32,24,0.02)_48%,rgba(255,255,255,0)_100%)] lg:block" />

        <div className="relative mx-auto flex min-h-[90vh] w-full max-w-[1440px] flex-col px-6 pb-20 pt-28 sm:px-10 lg:px-16 lg:pb-24 lg:pt-32">
          <div className="my-auto grid items-end gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:gap-8">

            {/* Left — headline + copy + CTAs */}
            <div className="relative z-10 max-w-[660px]">
              {/* Eyebrow */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-12 bg-[#c97a52]" />
                <p className="text-[10px] uppercase tracking-[0.44em] text-[#8a3e1e] sm:text-[11px]">{c.hero.label}</p>
              </div>

              {/* Headline */}
              <h1 className="max-w-[720px] font-light leading-[0.88]" style={{ fontSize: 'clamp(3.8rem, 8.8vw, 8.2rem)' }}>
                <span className="block text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{c.hero.titleA}</span>
                <span className="block italic text-[#d38c67]" style={{ fontFamily: ITALIC_FONT }}>{c.hero.titleC}</span>
              </h1>

              {/* Sub */}
              <p className="mt-6 max-w-[460px] text-[1rem] leading-relaxed text-[#5f5144] sm:text-[1.05rem]">{c.hero.sub}</p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link
                  href="/couple"
                  className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-[0.95rem] text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]"
                >
                  {c.hero.coupleCta}
                </Link>
                <Link
                  href="/fornitori"
                  className="inline-flex items-center justify-center rounded-full border border-[#cab59d] bg-[rgba(255,250,244,0.62)] px-7 py-[0.95rem] text-sm tracking-[0.12em] text-[#2c2219] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]"
                >
                  {c.hero.vendorCta}
                </Link>
              </div>

              {/* Destination note — support line, not a third CTA */}
              <p className="mt-8 max-w-[400px] border-l border-[#c97a52]/50 pl-4 text-sm leading-relaxed text-[#6a5a4c]">
                {c.hero.destinationNote}
              </p>
            </div>

            {/* Right — Italy plate */}
            <div className="relative lg:-ml-10 lg:mt-4">
              <ItalyPlate copy={c.hero} locale={locale} heroImage={heroImage} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANNING ROOM ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#fbf4e5] px-6 py-24 text-[#1f1812] sm:px-10 sm:py-32 lg:px-16">
        <div className="absolute left-0 right-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,90,46,0.08),transparent)]" />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">

            {/* Left — headline + value prop + CTA */}
            <div className="max-w-[520px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 02</span>
                <div className="h-px w-8 bg-[#c97a52]/50" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#8a3e1e]">{c.platform.label}</p>
              <h2 className="mt-5 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.6rem, 5vw, 4.7rem)' }}>
                {c.platform.title}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#5d4e40] sm:text-[1.05rem]">{c.platform.sub}</p>
              <Link
                href="/couple"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-[0.95rem] text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]"
              >
                {c.platform.cta}
              </Link>
            </div>

            {/* Right — stone card with floating planning page */}
            <div className="rounded-[2.8rem] border border-[#d5c4ae] bg-[#e8dece] p-4 shadow-[0_28px_80px_rgba(45,31,22,0.09)] sm:p-5">
              {/* Minimal card header */}
              <div className="mb-4 flex items-center justify-between px-1 pt-1">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a3e1e]">{c.platform.workspaceLabel}</p>
                <span className="rounded-full border border-[#d0bfa8] bg-[rgba(255,250,244,0.7)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#7a6554]">{locale === 'it' ? 'Area coppia' : 'Couple area'}</span>
              </div>

              <DashboardSurface heroCopy={c.hero} platformCopy={c.platform} locale={locale} />

              {/* Feature strip */}
              <div className="mt-4 flex flex-wrap gap-2 px-1">
                {c.platform.strips.map((item) => (
                  <span key={item} className="rounded-full border border-[#cdb9a2] bg-[rgba(255,250,244,0.68)] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ITALY AS METHOD ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-[#3e2f23] bg-[#201813] px-6 py-24 text-[#fbf4e5] sm:px-10 sm:py-32 lg:px-16">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,90,46,0.48),transparent)]" />
        <div className="mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">

          {/* Left — sticky heading */}
          <div className="max-w-[560px] lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 03</span>
              <div className="h-px w-8 bg-[#d38c67]/40" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#d38c67]">{c.italy.label}</p>
            <h2 className="mt-5 font-light leading-[0.96]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.7rem, 5vw, 5rem)' }}>
              {c.italy.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#d2c3b0] sm:text-[1.05rem]">{c.italy.sub}</p>
            <div className="mt-7 rounded-[1.7rem] border border-[#b85a2e]/22 bg-[linear-gradient(180deg,rgba(184,90,46,0.12),rgba(255,255,255,0.02))] p-5 text-sm leading-relaxed text-[#f1e6d7]">{c.italy.callout}</div>
          </div>

          {/* Right — pillars as literary index */}
          <div className="divide-y divide-white/10 border-t border-white/10">
            {c.italy.pillars.map((pillar, i) => {
              const roman = ['i.', 'ii.', 'iii.'][i]
              return (
                <div key={pillar.number} className="flex gap-7 py-9 sm:py-11">
                  <span className="mt-1 w-6 shrink-0 text-[0.8rem] italic text-[#cf8b60]" style={{ fontFamily: ITALIC_FONT }}>{roman}</span>
                  <div className="max-w-[640px]">
                    <h3 className="text-xl leading-tight text-[#fbf4e5] sm:text-2xl" style={{ fontFamily: DISPLAY_FONT }}>{pillar.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#d2c3b0] sm:text-[0.95rem]">{pillar.copy}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CURATED PROFESSIONALS ───────────────────────────── */}
      <section className="bg-[#efe1cd] px-6 py-28 text-[#1f1812] sm:px-10 sm:py-36 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">

          {/* Left — section copy + CTAs */}
          <div className="max-w-[560px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 04</span>
              <div className="h-px w-8 bg-[#c97a52]/50" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#8a3e1e]">{c.vendors.label}</p>
            <h2 className="mt-5 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.5rem, 5vw, 4.6rem)' }}>
              {c.vendors.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5d4e40] sm:text-[1.05rem]">{c.vendors.sub}</p>
            <p className="mt-7 max-w-[420px] border-l-2 border-[#b85a2e]/60 pl-5 text-sm leading-relaxed text-[#5c5144]">{c.vendors.curatedLine}</p>
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/fornitori"
                className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-[0.95rem] text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]"
              >
                {c.vendors.browseCta}
              </Link>
              <Link
                href="/vendor"
                className="inline-flex items-center justify-center rounded-full border border-[#1f1812]/14 bg-transparent px-7 py-[0.95rem] text-sm tracking-[0.12em] text-[#1f1812] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]"
              >
                {c.vendors.vendorCta}
              </Link>
            </div>
          </div>

          {/* Right — editorial card */}
          <div className="rounded-[2.8rem] border border-[#dcc8b0] bg-[linear-gradient(160deg,#f7efe4_0%,#efe1cd_58%,#ead8c2_100%)] p-6 text-[#1f1812] shadow-[0_28px_80px_rgba(31,24,18,0.10)] sm:p-8">
            <div className="grid gap-5 border-b border-[#dcc8b0] pb-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{locale === 'it' ? 'In tutta Italia' : 'Across Italy'}</p>
                <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-[#5f5144]">
                  {locale === 'it'
                    ? 'Professionisti introdotti quando il luogo, il tono e il formato del matrimonio sono già chiari.'
                    : 'Professionals introduced once the place, tone, and format of the wedding are already clear.'}
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-[#2d2118]/10 bg-[rgba(255,250,244,0.74)] p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a3e1e]">{locale === 'it' ? 'Dentro VELO' : 'Inside VELO'}</p>
                <p className="mt-3 text-[1.2rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>
                  {locale === 'it' ? 'Le introduzioni restano nel contesto del planning.' : 'Introductions stay inside the context of planning.'}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#675847]">{locale === 'it' ? 'Dal primo contatto alla conferma, tutto avviene nello stesso spazio.' : 'From first contact to confirmation, everything stays in one space.'}</p>
              </div>
            </div>

            {/* Region links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <Link
                  key={region}
                  href={`/fornitori?region=${encodeURIComponent(region)}`}
                  className="rounded-full border border-[#d5c1aa] bg-[rgba(255,250,244,0.68)] px-4 py-2 text-xs tracking-[0.14em] text-[#5f5144] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]"
                >
                  {region}
                </Link>
              ))}
            </div>

            {/* Editorial plates — discipline × region */}
            <div className="mt-7 divide-y divide-[#cdb9a2]">
              {[
                {
                  label: locale === 'it' ? 'Fotografia · Floral' : 'Photography · Floral',
                  title: locale === 'it' ? 'La memoria visiva e il paesaggio botanico del giorno.' : 'The visual memory and botanical landscape of the day.',
                  region: 'Toscana · Amalfi · Como',
                },
                {
                  label: locale === 'it' ? 'Location · Catering' : 'Venues · Catering',
                  title: locale === 'it' ? 'Luoghi e tavole scelti per ogni stile e misura.' : 'Places and tables chosen for every style and scale.',
                  region: 'Langhe · Venezia · Puglia',
                },
                {
                  label: locale === 'it' ? 'Planning · Musica' : 'Planning · Music',
                  title: locale === 'it' ? 'La regia del giorno e la sua colonna sonora.' : 'The direction of the day and its score.',
                  region: 'Roma · Umbria · Sicilia',
                },
              ].map((plate) => (
                <div key={plate.label} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{plate.label}</p>
                    <p className="mt-2 text-[1.05rem] leading-snug text-[#1f1812] sm:text-lg" style={{ fontFamily: DISPLAY_FONT }}>{plate.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c9b49c] bg-[rgba(255,250,244,0.65)] px-4 py-1.5 text-[10px] tracking-[0.18em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{plate.region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="bg-[#f3eadb] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[3rem] border border-[#dcc8b0] bg-[linear-gradient(148deg,#fbf4e5_0%,#f1e5d3_52%,#ead8c2_100%)] p-8 text-[#1f1812] shadow-[0_30px_80px_rgba(45,31,22,0.13)] sm:p-14 lg:p-20">

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                {/* Tagline as section anchor */}
                <p className="mb-6 text-[0.9rem] italic text-[#b89a5b]" style={{ fontFamily: ITALIC_FONT }}>
                  {locale === 'it' ? 'Dal sì, per sempre.' : 'From yes, to forever.'}
                </p>
                <h2 className="max-w-[760px] font-light leading-[0.94]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.7rem, 5vw, 5.1rem)' }}>
                  {c.close.title}
                </h2>
                <p className="mt-5 max-w-[520px] text-base leading-relaxed text-[#5d4e40] sm:text-[1.05rem]">{c.close.sub}</p>
              </div>

              <div className="lg:justify-self-end">
                <div className="flex flex-col gap-3.5 sm:flex-row lg:flex-col lg:items-start">
                  <Link
                    href="/couple"
                    className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-9 py-[1.05rem] text-sm font-semibold tracking-[0.16em] text-[#fbf4e5] shadow-[0_12px_32px_rgba(184,90,46,0.28)] transition-all hover:bg-[#a54d25] hover:shadow-[0_16px_40px_rgba(184,90,46,0.36)]"
                  >
                    {c.close.coupleCta}
                  </Link>
                  <Link
                    href="/vendor"
                    className="inline-flex items-center justify-center px-1 py-3 text-sm tracking-[0.14em] text-[#6b5947] transition-colors hover:text-[#8a3e1e]"
                  >
                    {c.close.vendorCta} &rarr;
                  </Link>
                </div>
                <p className="mt-7 max-w-[320px] text-sm leading-relaxed text-[#7a6a5a]">{c.close.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#2c2219] px-6 py-14 text-[#f3eadb] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-4">
            <img src="/favicon.png" alt="" className="h-8 w-auto opacity-80" />
            <div>
              <span className="text-2xl font-light tracking-[0.35em] text-[#f3eadb]" style={{ fontFamily: DISPLAY_FONT }}>VELO</span>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>from yes to forever</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
            <Link href="/couple" className="text-[11px] tracking-[0.12em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.couples}</Link>
            <Link href="/fornitori" className="text-[11px] tracking-[0.12em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.vendors}</Link>
            <Link href="/vendor" className="text-[11px] tracking-[0.12em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.vendorArea}</Link>
            <Link href="/admin" className="text-[11px] tracking-[0.12em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.admin}</Link>
          </div>

          <p className="text-[10px] tracking-[0.06em] text-[#7a6e64]" style={{ fontFamily: MONO_FONT }}>{c.footer.copy} — A wedding, in Italian.</p>
        </div>
      </footer>
    </main>
  )
}
