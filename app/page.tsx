import Link from 'next/link'
import { cookies } from 'next/headers'
import NavBar from '../components/NavBar'

const REGIONS = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']
const DISPLAY_FONT = 'DM Serif Display, Georgia, serif'
const ITALIC_FONT = 'Fraunces, Georgia, serif'
const MONO_FONT = "'JetBrains Mono', monospace"

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
        destinationNote: 'For destination couples balancing place, paperwork, people, and time.',
        proofLabel: 'Inside the couple platform',
        proofTitle: 'The wedding, kept in one calm room.',
        proofItems: ['Dashboard', 'Documents', 'Checklist', 'Guests', 'Budget', 'Vendors'],
        regionsLine: 'Across Tuscany, Amalfi, Como, Puglia, Rome, Venice, and beyond.',
      },
      platform: {
        label: 'Platform proof',
        title: 'Not a dashboard. A planning room.',
        sub: 'VELO turns scattered planning into one elegant workspace for documents, decisions, guests, budget, and curated professionals in Italy.',
        cta: 'Open VELO',
        workspaceLabel: 'The couple workspace',
        workspaceTitle: 'Planning, documents, guests, and vendors held in one calm room.',
        workspaceCopy: 'Instead of splitting the wedding across spreadsheets, chats, and generic tools, VELO keeps the real planning flow together from first decisions to final confirmations.',
        strips: ['Dashboard', 'Document path', 'Checklist', 'Guest list', 'Budget overview', 'Vendor shortlists'],
        panels: [
          { eyebrow: 'Documents guidance', title: 'Know what Italy requires before it becomes stressful.', copy: 'Nationality, ceremony type, and timing inform the path so international couples are not left translating the process alone.' },
          { eyebrow: 'Guests and budget', title: 'Keep decisions visible.', copy: 'RSVPs, spend, and vendor choices stay close to the rest of the plan instead of becoming separate admin.' },
          { eyebrow: 'Curated vendors', title: 'Selection without losing context.', copy: 'Browse professionals for your wedding in Italy from the same platform where the rest of the wedding already lives.' },
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
        sub: 'Open VELO and begin with clarity, from the first document to the final table plan.',
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
      destinationNote: "Per coppie che organizzano dall'estero, tenendo insieme luogo, documenti, persone e tempo.",
      proofLabel: 'Dentro la piattaforma coppia',
      proofTitle: 'Il matrimonio, tenuto in una sola stanza calma.',
      proofItems: ['Dashboard', 'Documenti', 'Checklist', 'Ospiti', 'Budget', 'Fornitori'],
      regionsLine: 'Tra Toscana, Amalfi, Como, Puglia, Roma, Venezia e oltre.',
    },
    platform: {
      label: 'Piattaforma',
      title: 'Non una dashboard. Una regia del matrimonio.',
      sub: 'VELO trasforma un planning disperso in uno spazio elegante per documenti, decisioni, ospiti, budget e professionisti selezionati in Italia.',
      cta: 'Apri VELO',
      workspaceLabel: 'Lo spazio coppia',
      workspaceTitle: 'Planning, documenti, ospiti e fornitori tenuti in una sola regia calma.',
      workspaceCopy: 'Invece di dividere il matrimonio tra fogli, chat e strumenti generici, VELO tiene collegato il flusso reale del planning, dalle prime decisioni fino alle conferme finali.',
      strips: ['Dashboard', 'Guida documenti', 'Checklist', 'Lista ospiti', 'Budget', 'Shortlist fornitori'],
      panels: [
        { eyebrow: 'Guida documenti', title: "Sapere cosa richiede l'Italia prima che diventi stress.", copy: 'Nazionalita, tipo di cerimonia e tempistiche guidano il percorso, cosi le coppie straniere non restano sole a interpretare il processo.' },
        { eyebrow: 'Ospiti e budget', title: 'Decisioni sempre visibili.', copy: 'RSVP, spese e scelte sui fornitori restano vicini al resto del planning invece di diventare amministrazione separata.' },
        { eyebrow: 'Fornitori selezionati', title: 'Scelta senza perdere il contesto.', copy: 'Esplorate professionisti per il vostro matrimonio in Italia dallo stesso spazio in cui vive gia il resto del progetto.' },
      ],
    },
    italy: {
      label: "L'Italia come metodo",
      title: "L'Italia non e uno sfondo. E il metodo.",
      sub: "Documenti, logica della cerimonia, sourcing regionale e decisioni da lontano cambiano il lavoro del planning. VELO nasce da questa realta.",
      callout: "Soprattutto per coppie che organizzano dall'estero, dove la certezza conta quanto la bellezza.",
      pillars: [
        { number: '01', title: 'Documenti per primi', copy: 'Dichiarazioni al comune, apostille, traduzioni, requisiti per la cerimonia e tempistiche entrano nel piano invece di restare un pensiero separato.' },
        { number: '02', title: 'Logica destination', copy: 'La piattaforma nasce per matrimoni organizzati da lontano, dove chiarezza e fiducia contano piu di un browsing infinito.' },
        { number: '03', title: 'Curation regionale', copy: 'VELO connette le coppie con professionisti selezionati in tutta Italia, cosi la scelta sembra coerente con il luogo e non con un marketplace generico.' },
      ],
    },
    vendors: {
      label: 'Professionisti selezionati',
      title: 'Introdotti con cura, non gettati in una directory.',
      sub: 'Fotografi, floral designer, location, catering, planner e altri professionisti scelti in tutta Italia, dentro lo stesso mondo del vostro planning.',
      curatedLine: 'Un accesso ai fornitori piu silenzioso, pensato intorno a luogo, coerenza e tempi in Italia.',
      browseCta: 'Esplora i professionisti',
      vendorCta: 'Diventa fornitore',
    },
    close: {
      label: 'Inizia bene',
      title: "Portate l'intero matrimonio in una sola stanza italiana.",
      sub: 'Apri VELO e comincia con chiarezza, dal primo documento fino al tavolo finale.',
      coupleCta: "Entra nell'area coppia",
      vendorCta: 'Area fornitori',
      note: "I professionisti del wedding hanno il loro ingresso nell'area fornitori.",
    },
    footer: { couples: 'Area Coppie', vendors: 'Professionisti', vendorArea: 'Area Fornitori', admin: 'Admin', copy: '© 2026 VELO · velowedding.it' },
  }
}

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
  const ui = {
    stamp: isIT ? 'Area coppia' : 'Couple area',
    destination: isIT ? 'Destination' : 'Destination',
  }

  return (
    <div className="rounded-[2.4rem] bg-[#e6dac4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_0_rgba(43,31,22,0.06)] sm:p-6">
      {/* Floating planning page */}
      <div className="rounded-[1.9rem] bg-[#fbf4e5] p-5 shadow-[0_18px_54px_rgba(31,24,18,0.13)] sm:p-7">
        <div className="flex items-center justify-between border-b border-[#e4d4be] pb-4">
          <p className="text-[10px] uppercase tracking-[0.36em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{heroCopy.proofLabel}</p>
          <span className="rounded-full border border-[#d8c7b0] bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{ui.stamp}</span>
        </div>
        <h3 className="mt-4 text-[1.35rem] leading-snug text-[#1f1812] sm:text-[1.6rem]" style={{ fontFamily: DISPLAY_FONT }}>{heroCopy.proofTitle}</h3>

        {/* Planning items as flowing literary list */}
        <div className="mt-6 space-y-5">
          {platformCopy.panels.map((panel, i) => {
            const roman = ['i.', 'ii.', 'iii.'][i]
            return (
              <div key={panel.eyebrow} className="flex gap-4 border-b border-[#ead9c8] pb-5 last:border-0 last:pb-0">
                <span className="mt-0.5 w-5 shrink-0 text-sm italic text-[#b85a2e]" style={{ fontFamily: ITALIC_FONT }}>{roman}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a3e1e]">{panel.eyebrow}</p>
                  <p className="mt-1.5 text-[1.05rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{panel.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#665547]">{panel.copy}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Proof items strip */}
      <div className="mt-4 flex flex-wrap gap-2">
        {heroCopy.proofItems.map((item) => (
          <span key={item} className="rounded-full border border-[#cdb9a2] bg-[rgba(255,250,244,0.72)] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>
            {item}
          </span>
        ))}
      </div>

      {/* Destination note */}
      <div className="mt-3 rounded-[1.4rem] border border-[#c9b49c]/40 bg-[rgba(255,250,244,0.55)] p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{heroCopy.destinationBadge}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#5d4e40]">{heroCopy.destinationNote}</p>
      </div>
    </div>
  )
}

function ItalyPlate({ copy, locale }: { copy: Copy['hero']; locale: string }) {
  const isIT = locale === 'it'
  const plate = {
    kicker: isIT ? 'La promessa italiana' : 'The Italian promise',
    note: isIT ? 'Il matrimonio in Italia, con luogo, luce e misura.' : 'Destination weddings, with place, light, and restraint.',
    caption: isIT ? "Per coppie che scelgono l'Italia non come sfondo, ma come modo di sposarsi." : 'For couples choosing Italy not as a backdrop, but as a way of getting married.',
    cta: isIT ? 'Toscana, Amalfi, Como, Langhe' : 'Tuscany, Amalfi, Como, Langhe',
  }

  return (
    <div className="relative h-[420px] sm:h-[520px] lg:h-[620px]">
      <div className="absolute right-[5%] top-[5%] hidden h-[84%] w-[84%] rounded-[3.1rem] border border-[#dcc8b0] bg-[linear-gradient(145deg,#f7efe2_0%,#efe0cd_100%)] shadow-[0_40px_110px_rgba(30,18,10,0.18)] lg:block" />
      <div className="absolute right-0 top-[11%] hidden h-[66%] w-[13%] rounded-[2rem] bg-[#2a1f17] lg:block" />
      <div
        className="absolute right-[7%] top-0 h-[78%] w-[76%] rounded-[2.8rem] border border-[#e4cdb4]/70 bg-cover shadow-[0_36px_100px_rgba(18,10,5,0.32),inset_0_1px_0_rgba(255,255,255,0.05)]"
        style={{
          backgroundPosition: '50% 25%',
          backgroundImage:
            "linear-gradient(180deg, rgba(22,14,8,0.04) 0%, rgba(22,14,8,0.15) 55%, rgba(22,14,8,0.52) 100%), url('https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=85')",
        }}
      />
      {/* Cinematic label bar */}
      <div className="absolute right-[7%] top-0 z-10 flex h-10 w-[76%] items-center justify-between rounded-t-[2.8rem] px-5">
        <span className="text-[9px] uppercase tracking-[0.32em] text-[#f0e4d2]/70" style={{ fontFamily: MONO_FONT }}>{isIT ? 'Italia' : 'Italy'}</span>
        <span className="text-[9px] uppercase tracking-[0.32em] text-[#f0e4d2]/70" style={{ fontFamily: MONO_FONT }}>VELO</span>
        <span className="text-[9px] uppercase tracking-[0.32em] text-[#f0e4d2]/70" style={{ fontFamily: MONO_FONT }}>{isIT ? 'Destination · Civil' : 'Destination · Civil'}</span>
      </div>
      <div className="absolute right-[11%] top-[6%] h-[66%] w-[68%] rounded-[2.35rem] border border-[#e8d4bc]/18" />
      <div className="absolute left-0 top-[8%] z-10 w-[48%] max-w-[270px] rounded-[2rem] border border-[#c8b09a]/28 bg-[rgba(252,246,238,0.94)] p-5 shadow-[0_24px_64px_rgba(30,18,10,0.18),0_2px_8px_rgba(30,18,10,0.07)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{plate.kicker}</p>
        <p className="mt-4 text-xl leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{plate.note}</p>
      </div>
      <div className="absolute bottom-[2%] left-[10%] z-10 w-[76%] rounded-[2.2rem] border border-[#decbb4] bg-[rgba(251,244,229,0.97)] p-5 shadow-[0_28px_70px_rgba(30,18,10,0.20)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2d1bc] pb-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{copy.label}</p>
          <span className="rounded-full border border-[#ddc9b1] bg-white/55 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#6c5b4b]">{copy.destinationBadge}</span>
        </div>
        <p className="mt-5 max-w-[33rem] text-[1.08rem] leading-relaxed text-[#5d4e40] sm:text-[1.15rem]" style={{ fontFamily: DISPLAY_FONT }}>{plate.caption}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#ead3bc] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#8a3e1e]">{plate.cta}</span>
          <span className="text-xs uppercase tracking-[0.22em] text-[#7a6754]">{copy.regionsLine}</span>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const c = getCopy(locale)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3eadb] text-[#1f1812]">
      <NavBar
        locale={locale}
        couplesLabel={c.nav.couples}
        vendorLabel={c.nav.vendors}
        forVendorLabel={c.nav.forVendors}
        primaryCtaLabel={c.nav.primaryCta}
      />

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

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pb-24 lg:pt-36">
          <div className="my-auto grid items-end gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:gap-8">
            <div className="relative z-10 max-w-[680px]">
              <div className="mb-10 flex flex-wrap items-center gap-4">
                <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 01</span>
                <div className="h-px w-10 bg-[#c97a52]" />
                <p className="text-[10px] uppercase tracking-[0.44em] text-[#8a3e1e] sm:text-[11px]">{c.hero.label}</p>
                <span className="rounded-full border border-[#d8c3ab] bg-[rgba(255,250,244,0.74)] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#6f5b49]">
                  {c.hero.destinationBadge}
                </span>
              </div>

              <h1 className="max-w-[760px] font-light leading-[0.88]" style={{ fontSize: 'clamp(3.9rem, 9vw, 8.35rem)' }}>
                <span className="block text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{c.hero.titleA}</span>
                <span className="block italic text-[#d38c67]" style={{ fontFamily: ITALIC_FONT }}>{c.hero.titleC}</span>
              </h1>

              <p className="mt-8 max-w-[470px] text-base leading-relaxed text-[#5f5144] sm:text-[1.05rem]">{c.hero.sub}</p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/couple" className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-4 text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]">
                  {c.hero.coupleCta}
                </Link>
                <Link href="/fornitori" className="inline-flex items-center justify-center rounded-full border border-[#cab59d] bg-[rgba(255,250,244,0.62)] px-7 py-4 text-sm tracking-[0.12em] text-[#2c2219] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]">
                  {c.hero.vendorCta}
                </Link>
              </div>

              <div className="mt-12 flex items-start gap-4 border-l border-[#c97a52]/55 pl-5 text-sm leading-relaxed text-[#5f5144] sm:max-w-[400px]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#c97a52]" />
                <p>{c.hero.destinationNote}</p>
              </div>
            </div>

            <div className="relative lg:-ml-10 lg:mt-4">
              <ItalyPlate copy={c.hero} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#fbf4e5] px-6 py-24 text-[#1f1812] sm:px-10 sm:py-32 lg:px-16">
        <div className="absolute left-0 right-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,90,46,0.09),transparent)]" />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="max-w-[520px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 02</span>
                <div className="h-px w-8 bg-[#c97a52]/50" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#8a3e1e]">{c.platform.label}</p>
              <h2 className="mt-6 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.7rem, 5vw, 4.95rem)' }}>
                {c.platform.title}
              </h2>
              <p className="mt-7 text-base leading-relaxed text-[#5d4e40] sm:text-lg">{c.platform.sub}</p>
              <Link href="/couple" className="mt-9 inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-4 text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]">
                {c.platform.cta}
              </Link>
            </div>

            <div className="relative rounded-[3rem] border border-[#d5c4ae] bg-[#e8dece] p-5 text-[#1f1812] shadow-[0_34px_90px_rgba(45,31,22,0.10)] sm:p-8">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#d9c5ae] pb-5">
                <div className="max-w-[560px]">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[#8a3e1e]">{c.platform.workspaceLabel}</p>
                  <h3 className="mt-3 text-2xl font-light leading-tight text-[#1f1812] sm:text-3xl" style={{ fontFamily: DISPLAY_FONT }}>{c.platform.workspaceTitle}</h3>
                  <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-[#625344] sm:text-base">{c.platform.workspaceCopy}</p>
                </div>
                <div className="rounded-full border border-[#d7c4ad] bg-[rgba(255,250,244,0.74)] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#6f5b49]">{locale === 'it' ? 'Area coppia' : 'Couple area'}</div>
              </div>
              <DashboardSurface heroCopy={c.hero} platformCopy={c.platform} locale={locale} />
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#dccab3] pt-5">
                {c.platform.strips.map((item) => (
                  <span key={item} className="rounded-full border border-[#d8c7b2] bg-white/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#685848]">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#3e2f23] bg-[#201813] px-6 py-24 text-[#fbf4e5] sm:px-10 sm:py-32 lg:px-16">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,90,46,0.48),transparent)]" />
        <div className="mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="max-w-[560px] lg:sticky lg:top-28 lg:self-start">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 03</span>
              <div className="h-px w-8 bg-[#d38c67]/40" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#d38c67]">{c.italy.label}</p>
            <h2 className="mt-6 font-light leading-[0.96]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.8rem, 5vw, 5.1rem)' }}>
              {c.italy.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#d2c3b0] sm:text-lg">{c.italy.sub}</p>
            <div className="mt-8 rounded-[1.9rem] border border-[#b85a2e]/25 bg-[linear-gradient(180deg,rgba(184,90,46,0.14),rgba(255,255,255,0.03))] p-5 text-sm leading-relaxed text-[#f1e6d7]">{c.italy.callout}</div>
          </div>
          <div className="divide-y divide-white/10 border-t border-white/10">
            {c.italy.pillars.map((pillar, i) => {
              const roman = ['i.', 'ii.', 'iii.'][i]
              return (
                <div key={pillar.number} className="flex gap-7 py-9 sm:py-11">
                  <span className="mt-1 w-6 shrink-0 text-sm italic text-[#cf8b60]" style={{ fontFamily: ITALIC_FONT }}>{roman}</span>
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

      <section className="bg-[#efe1cd] px-6 py-28 text-[#1f1812] sm:px-10 sm:py-36 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-[560px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 04</span>
              <div className="h-px w-8 bg-[#c97a52]/50" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-[#8a3e1e]">{c.vendors.label}</p>
            <h2 className="mt-6 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.6rem, 5vw, 4.7rem)' }}>
              {c.vendors.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#5d4e40] sm:text-lg">{c.vendors.sub}</p>
            <p className="mt-8 max-w-[430px] border-l-2 border-[#b85a2e]/70 pl-5 text-sm leading-relaxed text-[#5c5144]">{c.vendors.curatedLine}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/fornitori" className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-4 text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]">
                {c.vendors.browseCta}
              </Link>
              <Link href="/vendor" className="inline-flex items-center justify-center rounded-full border border-[#1f1812]/12 bg-transparent px-7 py-4 text-sm tracking-[0.12em] text-[#1f1812] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]">
                {c.vendors.vendorCta}
              </Link>
            </div>
          </div>

          <div className="rounded-[2.8rem] border border-[#dcc8b0] bg-[linear-gradient(160deg,#f7efe4_0%,#efe1cd_58%,#ead8c2_100%)] p-6 text-[#1f1812] shadow-[0_30px_90px_rgba(31,24,18,0.12)] sm:p-8">
            <div className="grid gap-5 border-b border-[#dcc8b0] pb-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{locale === 'it' ? 'In tutta Italia' : 'Across Italy'}</p>
                <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-[#5f5144]">
                  {locale === 'it'
                    ? 'Professionisti introdotti quando il luogo, il tono e il formato del matrimonio sono gia chiari.'
                    : 'Professionals introduced once the place, tone, and format of the wedding are already clear.'}
                </p>
              </div>

              <div className="rounded-[1.9rem] border border-[#2d2118]/10 bg-[rgba(255,250,244,0.74)] p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a3e1e]">{locale === 'it' ? 'Dentro VELO' : 'Inside VELO'}</p>
                <p className="mt-3 text-[1.3rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>
                  {locale === 'it' ? 'Le introduzioni restano nel contesto del planning.' : 'Introductions stay inside the context of planning.'}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#675847]">{locale === 'it' ? 'Dal primo contatto alla conferma, tutto avviene nello stesso spazio del vostro planning.' : 'From first contact to confirmation, everything stays within your planning space.'}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
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

            {/* Editorial plates */}
            <div className="mt-8 divide-y divide-[#cdb9a2]">
              {[
                {
                  label: locale === 'it' ? 'Fotografia · Floral' : 'Photography · Floral',
                  title: locale === 'it' ? 'La memoria visiva e il paesaggio botanico del giorno.' : 'The visual memory and botanical landscape of the day.',
                  region: 'Toscana · Amalfi · Como',
                },
                {
                  label: locale === 'it' ? 'Location · Catering' : 'Venues · Catering',
                  title: locale === 'it' ? 'Luoghi e tavole selezionati per ogni stile.' : 'Places and tables selected for every style.',
                  region: 'Langhe · Venezia · Puglia',
                },
                {
                  label: locale === 'it' ? 'Planning · Musica' : 'Planning · Music',
                  title: locale === 'it' ? 'La regia del giorno e la sua colonna sonora.' : 'The direction of the day and its score.',
                  region: 'Roma · Umbria · Sicilia',
                },
              ].map((plate) => (
                <div key={plate.label} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{plate.label}</p>
                    <p className="mt-2 text-lg leading-snug text-[#1f1812] sm:text-xl" style={{ fontFamily: DISPLAY_FONT }}>{plate.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c9b49c] bg-[rgba(255,250,244,0.65)] px-4 py-1.5 text-[10px] tracking-[0.18em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{plate.region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eadb] px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[3.3rem] border border-[#dcc8b0] bg-[linear-gradient(145deg,#fbf4e5_0%,#f1e5d3_52%,#ead8c2_100%)] p-8 text-[#1f1812] shadow-[0_34px_90px_rgba(45,31,22,0.14)] sm:p-16 lg:p-[5rem]">
            {/* Tagline accent */}
            <p className="mb-10 text-sm italic text-[#b89a5b]" style={{ fontFamily: ITALIC_FONT }}>
              {locale === 'it' ? 'Dal sì, per sempre.' : 'From yes, to forever.'}
            </p>

            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div className="max-w-[720px]">
                <p className="text-[11px] uppercase tracking-[0.38em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{c.close.label}</p>
                <h2 className="mt-7 max-w-[820px] font-light leading-[0.94]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.8rem, 5vw, 5.35rem)' }}>
                  {c.close.title}
                </h2>
                <p className="mt-6 max-w-[540px] text-base leading-relaxed text-[#5d4e40] sm:text-lg">{c.close.sub}</p>
              </div>

              <div className="lg:justify-self-end lg:text-left">
                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-start">
                  <Link href="/couple" className="inline-flex items-center justify-center rounded-full bg-[#1f1812] px-8 py-4 text-sm font-semibold tracking-[0.14em] text-[#f3eadb] transition-all hover:bg-[#2c2219]">
                    {c.close.coupleCta}
                  </Link>
                  <Link href="/vendor" className="inline-flex items-center justify-center px-1 py-3 text-sm tracking-[0.14em] text-[#6b5947] transition-colors hover:text-[#8a3e1e]">
                    {c.close.vendorCta} &rarr;
                  </Link>
                </div>

                <p className="mt-8 max-w-[340px] text-sm leading-relaxed text-[#615547]">{c.close.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
