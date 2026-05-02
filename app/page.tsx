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
    label: string
    titleA: string
    titleC: string
    sub: string
    coupleCta: string
    secondaryCta: string
    browseText: string
    browseHref: string
    destinationBadge: string
    destinationNote: string
    quickPoints: string[]
    proofLabel: string
    proofTitle: string
    proofItems: string[]
  }
  platform: {
    label: string
    title: string
    sub: string
    cta: string
    workspaceLabel: string
    workspaceTitle: string
    strips: string[]
    panels: { eyebrow: string; title: string; copy: string }[]
  }
  italy: {
    label: string
    title: string
    sub: string
    callout: string
    pillars: { number: string; title: string; copy: string }[]
  }
  nextStep: {
    label: string
    title: string
    sub: string
    cta: string
    cards: { eyebrow: string; title: string; copy: string }[]
  }
  vendors: {
    label: string
    title: string
    sub: string
    curatedLine: string
    browseCta: string
    vendorCta: string
    cardKicker: string
    cardTitle: string
    cardCopy: string
  }
  close: { label: string; title: string; sub: string; coupleCta: string; vendorCta: string; note: string }
  footer: { couples: string; vendors: string; vendorArea: string; admin: string; copy: string }
}

function getCopy(locale: string): Copy {
  if (locale === 'en') {
    return {
      nav: {
        couples: 'Couple Area',
        vendors: 'Professionals',
        forVendors: 'For vendors',
        primaryCta: 'START PLANNING',
      },
      hero: {
        label: 'for weddings in Italy',
        titleA: 'Marry in Italy.',
        titleC: 'With VELO.',
        sub: 'VELO guides couples through documents, priorities, vendors, guests and budget: one clear path instead of scattered decisions.',
        coupleCta: 'Start planning',
        secondaryCta: 'See how it works',
        browseText: 'Browse curated professionals',
        browseHref: '/fornitori',
        destinationBadge: 'Destination wedding support',
        destinationNote: 'Especially useful for couples planning from abroad or organizing Italy from a distance.',
        quickPoints: ['Documents made clearer', 'Your next action, not guesswork', 'Curated vendors in context'],
        proofLabel: 'Inside the couple platform',
        proofTitle: 'The wedding, guided in one calm room.',
        proofItems: ['Documents', 'Checklist', 'Guests', 'Budget', 'Vendors'],
      },
      platform: {
        label: 'Not just vendors',
        title: 'VELO builds the planning path, not just the shortlist.',
        sub: 'It turns an Italian wedding into a clearer sequence: what to prepare first, what matters now, and when curated vendors should enter the picture.',
        cta: 'Start planning',
        workspaceLabel: 'The couple workspace',
        workspaceTitle: 'Planning, documents, guests, and vendors held in one clear flow.',
        strips: ['Dashboard', 'Documents', 'Next steps', 'Guests', 'Budget', 'Vendors'],
        panels: [
          {
            eyebrow: 'Documents',
            title: 'Understand what Italy requires before it becomes stressful.',
            copy: 'Nationality, ceremony type, and timing shape the route, so couples are not left decoding the process alone.',
          },
          {
            eyebrow: 'Priorities',
            title: 'See the next practical move, not a giant to-do list.',
            copy: 'VELO helps couples move step by step instead of losing momentum across too many tabs, notes, and chats.',
          },
          {
            eyebrow: 'Vendors',
            title: 'Meet professionals only when the context is ready.',
            copy: 'Vendor discovery becomes more useful once location, timing, and ceremony reality are already clearer.',
          },
        ],
      },
      italy: {
        label: 'Destination wedding support',
        title: 'Italy changes the planning job.',
        sub: 'Documents, municipality timing, ceremony logic, language, and regional sourcing all matter more when the wedding happens in Italy.',
        callout: 'VELO is designed for that reality, especially when the couple is planning from abroad and needs clarity before beauty turns into admin.',
        pillars: [
          {
            number: '01',
            title: 'Documents first',
            copy: 'Comune declarations, apostilles, translations, ceremony requirements, and timing become part of the plan instead of a separate panic later on.',
          },
          {
            number: '02',
            title: 'Ceremony and timing',
            copy: 'Civil, religious, and symbolic weddings create different practical paths. VELO helps couples understand those differences earlier.',
          },
          {
            number: '03',
            title: 'Regional support',
            copy: 'Selected professionals in key Italian regions become more meaningful once the place, guest flow, and planning sequence are already clear.',
          },
        ],
      },
      nextStep: {
        label: 'Your next action',
        title: 'The next step should feel obvious.',
        sub: 'VELO does not throw the whole wedding at you at once. It helps couples understand what matters now, what can wait, and what to do next.',
        cta: 'See the couple platform',
        cards: [
          {
            eyebrow: 'Step 01',
            title: 'Start from the essentials',
            copy: 'Date, place, ceremony, and couple context shape the path before vendor browsing becomes useful.',
          },
          {
            eyebrow: 'Step 02',
            title: 'Handle the Italian reality',
            copy: 'Documents, timing, and ceremony requirements become easier when they are explained in plain language.',
          },
          {
            eyebrow: 'Step 03',
            title: 'Choose vendors with context',
            copy: 'Once the foundations are clear, curated professionals fit naturally into the plan instead of replacing it.',
          },
        ],
      },
      vendors: {
        label: 'Curated professionals',
        title: 'Curated vendors, at the right moment.',
        sub: 'Photographers, floral designers, venues, caterers, planners, and more, introduced as part of the planning journey, not as the entire promise.',
        curatedLine: 'A quieter kind of vendor access, shaped around place, fit, timing, and the reality of getting married in Italy.',
        browseCta: 'Browse professionals',
        vendorCta: 'VELO Partner Program',
        cardKicker: 'In several regions',
        cardTitle: 'Vendor introductions stay inside the planning context.',
        cardCopy: 'Professionals are introduced with context and operational support as part of a clear planning sequence.',
      },
      close: {
        label: 'Begin with clarity',
        title: 'Bring the wedding into one clear Italian plan.',
        sub: 'Start with the next right action, understand the Italian path, and keep documents, guests, budget, and vendors in one place.',
        coupleCta: 'Start planning',
        vendorCta: 'Vendor area',
        note: 'Wedding professionals have their own entry in the vendor area.',
      },
      footer: {
        couples: 'Couple Area',
        vendors: 'Professionals',
        vendorArea: 'Vendor Area',
        admin: 'Admin',
        copy: '© 2026 VELO · velowedding.it',
      },
    }
  }

  return {
    nav: {
      couples: 'Area Coppie',
      vendors: 'Professionisti',
      forVendors: 'Per fornitori',
      primaryCta: 'INIZIA A PIANIFICARE',
    },
    hero: {
      label: 'per matrimoni in Italia',
      titleA: 'Sposatevi in Italia.',
      titleC: 'Con VELO.',
      sub: 'VELO accompagna la coppia tra documenti, priorità, fornitori, ospiti e budget: tutto in ordine, con meno confusione e più chiarezza.',
      coupleCta: 'Inizia a pianificare',
      secondaryCta: 'Scopri come funziona',
      browseText: 'Esplora i professionisti curati',
      browseHref: '/fornitori',
      destinationBadge: 'Supporto destination wedding',
      destinationNote: 'Particolarmente utile per coppie straniere o per chi sta organizzando l Italia da lontano.',
        quickPoints: ['Documenti resi più chiari', 'La prossima azione, non solo ispirazione', 'Fornitori curati nel momento giusto'],
      proofLabel: 'Dentro la piattaforma coppia',
      proofTitle: 'Il matrimonio, guidato in una sola stanza calma.',
      proofItems: ['Documenti', 'Checklist', 'Ospiti', 'Budget', 'Fornitori'],
    },
    platform: {
      label: 'Non solo fornitori',
        title: 'VELO costruisce il percorso operativo, non solo la shortlist.',
        sub: 'Trasforma il matrimonio in Italia in una sequenza più chiara: cosa preparare prima, cosa conta adesso, e quando ha senso far entrare i fornitori giusti.',
      cta: 'Inizia a pianificare',
      workspaceLabel: 'Lo spazio coppia',
        workspaceTitle: 'Planning, documenti, ospiti e fornitori tenuti in un flusso più chiaro.',
      strips: ['Dashboard', 'Documenti', 'Prossimi passi', 'Ospiti', 'Budget', 'Fornitori'],
      panels: [
          {
            eyebrow: 'Documenti',
            title: "Capire cosa richiede l'Italia prima che diventi stress.",
            copy: 'Nazionalità, rito e tempistiche guidano il percorso, così la coppia non resta sola a interpretare il processo.',
          },
          {
            eyebrow: 'Priorità',
            title: 'Vedere il prossimo passo, non una lista infinita.',
            copy: 'VELO aiuta la coppia a muoversi per ordine invece di perdere energia tra chat, note sparse e decisioni sovrapposte.',
          },
          {
            eyebrow: 'Fornitori',
            title: 'I professionisti entrano quando il contesto è pronto.',
            copy: 'La scelta vendor diventa molto più utile quando luogo, tempi e realtà del rito sono già più chiari.',
          },
      ],
    },
    italy: {
      label: 'Supporto destination wedding',
      title: "Sposarsi in Italia cambia davvero il planning.",
        sub: 'Documenti, logica del rito, tempi del Comune, lingua e sourcing regionale contano molto di più quando il matrimonio si svolge in Italia.',
      callout: 'VELO nasce per questa realta, soprattutto quando la coppia organizza da lontano e ha bisogno di chiarezza prima ancora che di ispirazione.',
      pillars: [
        {
          number: '01',
          title: 'Documenti per primi',
          copy: 'Dichiarazioni al Comune, apostille, traduzioni, requisiti del rito e tempistiche entrano nel piano invece di restare una preoccupazione separata.',
        },
        {
          number: '02',
          title: 'Rito e tempi',
          copy: 'Cerimonia civile, religiosa o simbolica cambiano il percorso pratico. VELO aiuta a capire queste differenze prima.',
        },
        {
          number: '03',
          title: 'Supporto regionale',
            copy: 'I professionisti selezionati in tutta Italia diventano più utili quando luogo, numero ospiti e sequenza del planning sono già più chiari.',
        },
      ],
    },
    nextStep: {
      label: 'La tua prossima azione',
      title: 'Il prossimo passo dovrebbe sembrare evidente.',
        sub: 'VELO non scarica addosso tutto il matrimonio in una volta. Aiuta la coppia a capire cosa conta ora, cosa può aspettare, e cosa fare dopo.',
      cta: 'Scopri la piattaforma coppia',
      cards: [
        {
          eyebrow: 'Step 01',
          title: 'Parti dalle basi vere',
          copy: 'Data, luogo, rito e contesto della coppia cambiano il percorso prima ancora che la ricerca fornitori diventi utile.',
        },
        {
          eyebrow: 'Step 02',
          title: 'Affronta la realta italiana',
            copy: 'Documenti, tempistiche e requisiti del rito diventano più semplici quando qualcuno li traduce in modo comprensibile.',
        },
        {
          eyebrow: 'Step 03',
            title: 'Scegli i fornitori con più contesto',
            copy: 'Quando le fondamenta sono chiare, i professionisti giusti entrano nel piano con più coerenza e meno rumore.',
        },
      ],
    },
vendors: {
        label: 'Professionisti curati',
        title: 'Fornitori curati, al momento giusto.',
        sub: 'Fotografi, fioristi, location, catering, planner e altro, introdotti come parte del percorso di pianificazione, non come promessa intera.',
        curatedLine: "Un accesso ai fornitori più tranquillo, basato su luogo, fit, timing e realtà di sposarsi in Italia.",
        browseCta: 'Esplora professionisti',
        vendorCta: 'Programma Partner VELO',
        cardKicker: 'In diverse regioni',
        cardTitle: "Le presentazioni dei fornitori restano dentro il contesto della pianificazione.",
        cardCopy: 'I professionisti accompagnano la coppia con supporto operativo, dal primo contatto fino alla conferma, quando il resto del matrimonio è già organizzato.',
      },
    close: {
      label: 'Inizia con chiarezza',
        title: 'Portate il matrimonio in un piano italiano più chiaro.',
      sub: 'Partite dalla prossima azione giusta, capite meglio il percorso italiano, e tenete documenti, ospiti, budget e fornitori nello stesso spazio.',
      coupleCta: 'Inizia a pianificare',
      vendorCta: 'Area fornitori',
      note: 'I professionisti del wedding hanno il loro ingresso nell area fornitori.',
    },
    footer: {
      couples: 'Area Coppie',
      vendors: 'Professionisti',
      vendorArea: 'Area Fornitori',
      admin: 'Admin',
      copy: '© 2026 VELO · velowedding.it',
    },
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
  const stamp = locale === 'it' ? 'Area coppia' : 'Couple area'

  return (
    <div className="rounded-[2.2rem] bg-[#e6dac4] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:p-5">
      <div className="rounded-[1.7rem] bg-[#fbf4e5] p-5 shadow-[0_14px_44px_rgba(31,24,18,0.11)] sm:p-6">
        <div className="flex items-center justify-between border-b border-[#e4d4be] pb-3.5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{heroCopy.proofLabel}</p>
          <span className="rounded-full border border-[#d8c7b0] bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{stamp}</span>
        </div>

        <h3 className="mt-3.5 text-[1.2rem] leading-snug text-[#1f1812] sm:text-[1.38rem]" style={{ fontFamily: DISPLAY_FONT }}>
          {heroCopy.proofTitle}
        </h3>

        <div className="mt-4 space-y-3.5">
          {platformCopy.panels.map((panel, i) => {
            const roman = ['i.', 'ii.', 'iii.'][i]
            return (
              <div key={panel.eyebrow} className="flex gap-3.5 border-b border-[#ead9c8] pb-3.5 last:border-0 last:pb-0">
                <span className="mt-0.5 w-5 shrink-0 text-[0.8rem] italic text-[#b85a2e]" style={{ fontFamily: ITALIC_FONT }}>{roman}</span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a3e1e]">{panel.eyebrow}</p>
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
  const plate = {
    kicker: isIT ? 'La promessa italiana' : 'The Italian promise',
    note: isIT ? 'Il matrimonio in Italia, con luogo, luce e misura.' : 'Destination weddings, with place, light, and restraint.',
    caption: isIT
      ? "Per coppie che scelgono l'Italia non come sfondo, ma come modo di sposarsi."
      : 'For couples choosing Italy not as a backdrop, but as a way of getting married.',
  }

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
      <div className="absolute right-[5%] top-[5%] hidden h-[84%] w-[84%] rounded-[3.1rem] border border-[#dcc8b0] bg-[linear-gradient(145deg,#f7efe2_0%,#efe0cd_100%)] shadow-[0_40px_110px_rgba(30,18,10,0.18)] lg:block" />
      <div className="absolute right-0 top-[11%] hidden h-[66%] w-[13%] rounded-[2rem] bg-[#2a1f17] lg:block" />
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
      <div className="absolute right-[7%] top-0 z-10 flex h-9 w-[76%] items-center justify-between rounded-t-[2.8rem] px-5">
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>{isIT ? 'Italia' : 'Italy'}</span>
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>VELO</span>
        <span className="text-[8.5px] uppercase tracking-[0.32em] text-[#f0e4d2]/65" style={{ fontFamily: MONO_FONT }}>{heroImage.plateLabel[isIT ? 'it' : 'en']}</span>
      </div>
      <div className="absolute right-[11%] top-[6%] h-[66%] w-[68%] rounded-[2.35rem] border border-[#e8d4bc]/18" />
      <div className="absolute left-0 top-[8%] z-10 w-[46%] max-w-[260px] rounded-[2rem] border border-[#c8b09a]/28 bg-[rgba(252,246,238,0.94)] p-5 shadow-[0_24px_64px_rgba(30,18,10,0.18),0_2px_8px_rgba(30,18,10,0.07)] backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{plate.kicker}</p>
        <p className="mt-3 text-lg leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{plate.note}</p>
      </div>
      <div className="absolute bottom-[2%] left-[8%] z-10 w-[78%] rounded-[2rem] border border-[#decbb4] bg-[rgba(251,244,229,0.97)] p-5 shadow-[0_24px_64px_rgba(30,18,10,0.18)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2d1bc] pb-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a3e1e]">{copy.label}</p>
          <span className="rounded-full border border-[#ddc9b1] bg-white/55 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#6c5b4b]">
            {copy.destinationBadge}
          </span>
        </div>
        <p className="mt-4 max-w-[33rem] text-[1.05rem] leading-relaxed text-[#5d4e40] sm:text-[1.1rem]" style={{ fontFamily: DISPLAY_FONT }}>
          {plate.caption}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>
            {isIT ? 'Toscana · Amalfi · Como · Langhe' : 'Tuscany · Amalfi · Como · Langhe'}
          </p>
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

        <div className="relative mx-auto flex min-h-[92vh] w-full max-w-[1440px] flex-col px-6 pb-20 pt-28 sm:px-10 lg:px-16 lg:pb-24 lg:pt-32">
          <div className="my-auto grid items-end gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:gap-8">
            <div className="relative z-10 max-w-[660px]">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px w-12 bg-[#c97a52]" />
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a3e1e] sm:text-[12px]">{c.hero.label}</p>
              </div>

              <h1 className="max-w-[720px] font-light leading-[0.88]" style={{ fontSize: 'clamp(3.8rem, 8.8vw, 8.2rem)' }}>
                <span className="block text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{c.hero.titleA}</span>
                <span className="block italic text-[#d38c67]" style={{ fontFamily: ITALIC_FONT }}>{c.hero.titleC}</span>
              </h1>

              <p className="mt-6 max-w-[520px] text-[1rem] leading-relaxed text-[#5f5144] sm:text-[1.08rem]">{c.hero.sub}</p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link
                  href="/couple"
                  className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-[0.95rem] text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]"
                >
                  {c.hero.coupleCta}
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-[#cab59d] bg-[rgba(255,250,244,0.62)] px-7 py-[0.95rem] text-sm tracking-[0.12em] text-[#2c2219] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]"
                >
                  {c.hero.secondaryCta}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {c.hero.quickPoints.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#d9c6b0] bg-[rgba(255,250,244,0.62)] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#6c5b4b]"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 max-w-[470px] rounded-[1.6rem] border border-[#d8c4ad] bg-[rgba(255,249,241,0.7)] p-5 shadow-[0_10px_30px_rgba(49,35,24,0.06)]">
                <div className="flex items-center justify-between gap-3 border-b border-[#e5d7c3] pb-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a3e1e]">{c.hero.destinationBadge}</p>
                  <Link href={c.hero.browseHref} className="text-[11px] uppercase tracking-[0.16em] text-[#8a3e1e] hover:text-[#b85a2e]">
                    {c.hero.browseText}
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#675847]">{c.hero.destinationNote}</p>
              </div>
            </div>

            <div className="relative lg:-ml-10 lg:mt-4">
              <ItalyPlate copy={c.hero} locale={locale} heroImage={heroImage} />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-[#fbf4e5] px-6 py-24 text-[#1f1812] sm:px-10 sm:py-32 lg:px-16">
        <div className="absolute left-0 right-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,90,46,0.08),transparent)]" />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="max-w-[520px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 02</span>
                <div className="h-px w-8 bg-[#c97a52]/50" />
              </div>
              <p className="text-[12px] uppercase tracking-[0.3em] text-[#8a3e1e]">{c.platform.label}</p>
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

            <div className="rounded-[2.8rem] border border-[#d5c4ae] bg-[#e8dece] p-4 shadow-[0_28px_80px_rgba(45,31,22,0.09)] sm:p-5">
              <div className="mb-4 flex items-center justify-between px-1 pt-1">
                <p className="text-[11px] uppercase tracking-[0.26em] text-[#8a3e1e]">{c.platform.workspaceLabel}</p>
                <span className="rounded-full border border-[#d0bfa8] bg-[rgba(255,250,244,0.7)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#7a6554]">
                  {locale === 'it' ? 'Area coppia' : 'Couple area'}
                </span>
              </div>

              <DashboardSurface heroCopy={c.hero} platformCopy={c.platform} locale={locale} />

              <div className="mt-4 flex flex-wrap gap-2 px-1">
                {c.platform.strips.map((item) => (
                  <span key={item} className="rounded-full border border-[#cdb9a2] bg-[rgba(255,250,244,0.68)] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>
                    {item}
                  </span>
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
            <p className="text-[12px] uppercase tracking-[0.3em] text-[#d38c67]">{c.italy.label}</p>
            <h2 className="mt-5 font-light leading-[0.96]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.7rem, 5vw, 5rem)' }}>
              {c.italy.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#d2c3b0] sm:text-[1.05rem]">{c.italy.sub}</p>
            <div className="mt-7 rounded-[1.7rem] border border-[#b85a2e]/22 bg-[linear-gradient(180deg,rgba(184,90,46,0.12),rgba(255,255,255,0.02))] p-5 text-sm leading-relaxed text-[#f1e6d7]">
              {c.italy.callout}
            </div>
          </div>

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

      <section className="bg-[#f7efe4] px-6 py-24 text-[#1f1812] sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="max-w-[680px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 04</span>
              <div className="h-px w-8 bg-[#c97a52]/50" />
            </div>
            <p className="text-[12px] uppercase tracking-[0.3em] text-[#8a3e1e]">{c.nextStep.label}</p>
            <h2 className="mt-5 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.4rem, 4.8vw, 4.3rem)' }}>
              {c.nextStep.title}
            </h2>
            <p className="mt-5 max-w-[620px] text-base leading-relaxed text-[#5d4e40] sm:text-[1.05rem]">{c.nextStep.sub}</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {c.nextStep.cards.map((card) => (
              <div key={card.eyebrow} className="rounded-[2rem] border border-[#dcc8b0] bg-[rgba(255,250,244,0.8)] p-6 shadow-[0_18px_44px_rgba(45,31,22,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{card.eyebrow}</p>
                <h3 className="mt-4 text-[1.35rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{card.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#675847]">{card.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/couple"
              className="inline-flex items-center justify-center rounded-full border border-[#c97a52]/35 bg-white/40 px-7 py-[0.95rem] text-sm tracking-[0.14em] text-[#8a3e1e] transition-colors hover:border-[#b85a2e] hover:text-[#b85a2e]"
            >
              {c.nextStep.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#efe1cd] px-6 py-24 text-[#1f1812] sm:px-10 sm:py-30 lg:px-16">
        <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="max-w-[560px]">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[9px] text-[#b89a5b]" style={{ fontFamily: MONO_FONT }}>No. 05</span>
              <div className="h-px w-8 bg-[#c97a52]/50" />
            </div>
            <p className="text-[12px] uppercase tracking-[0.3em] text-[#8a3e1e]">{c.vendors.label}</p>
            <h2 className="mt-5 font-light leading-[0.98]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.3rem, 4.5vw, 4.1rem)' }}>
              {c.vendors.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5d4e40] sm:text-[1.05rem]">{c.vendors.sub}</p>
            <p className="mt-7 max-w-[430px] border-l-2 border-[#b85a2e]/60 pl-5 text-sm leading-relaxed text-[#5c5144]">{c.vendors.curatedLine}</p>
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/fornitori"
                className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-7 py-[0.95rem] text-sm font-semibold tracking-[0.14em] text-[#fbf4e5] transition-all hover:bg-[#a54d25]"
              >
                {c.vendors.browseCta}
              </Link>
              <Link
                href="/vendor"
                className="inline-flex items-center justify-center rounded-full border border-[#1f1812]/10 bg-transparent px-6 py-[0.9rem] text-[0.82rem] tracking-[0.1em] text-[#5d4e40] transition-colors hover:border-[#b85a2e] hover:text-[#8a3e1e]"
              >
                {c.vendors.vendorCta}
              </Link>
            </div>
          </div>

          <div className="rounded-[2.8rem] border border-[#dcc8b0] bg-[linear-gradient(160deg,#f7efe4_0%,#efe1cd_58%,#ead8c2_100%)] p-6 text-[#1f1812] shadow-[0_28px_80px_rgba(31,24,18,0.10)] sm:p-8">
            <div className="grid gap-5 border-b border-[#dcc8b0] pb-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a3e1e]">{c.vendors.cardKicker}</p>
                <p className="mt-4 max-w-[28rem] text-base leading-relaxed text-[#5f5144]">{c.vendors.cardCopy}</p>
              </div>
              <div className="rounded-[1.7rem] border border-[#2d2118]/10 bg-[rgba(255,250,244,0.74)] p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a3e1e]">{locale === 'it' ? 'Dentro VELO' : 'Inside VELO'}</p>
                <p className="mt-3 text-[1.2rem] leading-snug text-[#1f1812]" style={{ fontFamily: DISPLAY_FONT }}>{c.vendors.cardTitle}</p>
              </div>
            </div>

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

            <div className="mt-7 divide-y divide-[#cdb9a2]">
              {[
                {
                  label: locale === 'it' ? 'Fotografia · Floral' : 'Photography · Floral',
                  title: locale === 'it' ? 'Memoria visiva e paesaggio botanico del giorno.' : 'Visual memory and botanical atmosphere for the day.',
                  region: 'Toscana · Amalfi · Como',
                },
                {
                  label: locale === 'it' ? 'Location · Catering' : 'Venues · Catering',
                  title: locale === 'it' ? 'Luoghi e tavole scelti per stile, misura e ospitalita.' : 'Places and tables chosen for style, scale, and hospitality.',
                  region: 'Langhe · Venezia · Puglia',
                },
                {
                  label: locale === 'it' ? 'Planning · Musica' : 'Planning · Music',
                  title: locale === 'it' ? 'Regia del giorno e ritmo dell esperienza.' : 'Direction of the day and rhythm of the experience.',
                  region: 'Roma · Umbria · Sicilia',
                },
              ].map((plate) => (
                <div key={plate.label} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a3e1e]" style={{ fontFamily: MONO_FONT }}>{plate.label}</p>
                    <p className="mt-2 text-[1.05rem] leading-snug text-[#1f1812] sm:text-lg" style={{ fontFamily: DISPLAY_FONT }}>{plate.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c9b49c] bg-[rgba(255,250,244,0.65)] px-4 py-1.5 text-[11px] tracking-[0.12em] text-[#7a6554]" style={{ fontFamily: MONO_FONT }}>{plate.region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eadb] px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[3rem] border border-[#dcc8b0] bg-[linear-gradient(148deg,#fbf4e5_0%,#f1e5d3_52%,#ead8c2_100%)] p-8 text-[#1f1812] shadow-[0_30px_80px_rgba(45,31,22,0.13)] sm:p-14 lg:p-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-6 text-[0.9rem] italic text-[#b89a5b]" style={{ fontFamily: ITALIC_FONT }}>
                  {locale === 'it' ? 'Dal sì, per sempre.' : 'From yes, to forever.'}
                </p>
                <p className="text-[12px] uppercase tracking-[0.28em] text-[#8a3e1e]">{c.close.label}</p>
                <h2 className="mt-5 max-w-[760px] font-light leading-[0.94]" style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(2.7rem, 5vw, 5.1rem)' }}>
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
                    className="inline-flex items-center justify-center px-1 py-2.5 text-[0.8rem] tracking-[0.08em] text-[#7a6a5a] transition-colors hover:text-[#8a3e1e]"
                  >
                    {c.close.vendorCta} <span aria-hidden="true">{'->'}</span>
                  </Link>
                </div>
                <p className="mt-7 max-w-[320px] text-sm leading-relaxed text-[#7a6a5a]">{c.close.note}</p>
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
            <Link href="/couple" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.couples}</Link>
            <Link href="/fornitori" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.vendors}</Link>
            <Link href="/vendor" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.vendorArea}</Link>
            <Link href="/admin" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]" style={{ fontFamily: MONO_FONT }}>{c.footer.admin}</Link>
          </div>

          <p className="text-[11px] tracking-[0.05em] text-[#7a6e64]" style={{ fontFamily: MONO_FONT }}>{c.footer.copy} - A wedding, in Italian.</p>
        </div>
      </footer>
    </main>
  )
}
