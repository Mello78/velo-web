'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { COUNTRIES, CountryDoc } from '../../../lib/countries'
import { supabase } from '../../../lib/supabase'
import {
  CoupleChip,
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

type CeremonyType = 'civil' | 'religious' | 'symbolic' | null
type DocumentsMode = 'personalized' | 'partial' | 'fallback' | 'italian' | 'profile_missing'

interface CoupleDoc {
  partner1: string | null
  partner2: string | null
  nationality: string | null
  country_of_origin: string | null
  ceremony_type: CeremonyType
  wedding_date: string | null
}

interface OverviewItem {
  label: string
  title: string
  body: string
}

interface GuideSection {
  eyebrow: string
  title: string
  items: string[]
}

interface DocumentsCopy {
  eyebrow: string
  title: string
  subtitle: string
  nextStepLabel: string
  appliesLabel: string
  unfoldsLabel: string
  verifyTitle: string
  verifyBody: string
  profileCta: string
  completeProfileCta: string
  dashboardCta: string
  officialCta: string
  fallbackTitle: string
  fallbackBody: string
  partialTitle: string
  partialBody: string
  profileMissingTitle: string
  profileMissingBody: string
  italianTitle: string
  italianBody: string
  urgentTitle: string
  urgentBody: string
  readGeneralBody: string
  noCountryTitle: string
  mainDocument: string
  whereToGetIt: string
  timing: string
  nextRecommendedStep: string
  whatUnlocks: string
  genericGuide: string
  commonRules: string
  dateUnknown: string
  timingOpen: string
  daysToGo: (days: number) => string
  datePassed: string
  ceremonyLabel: (ceremony: CeremonyType) => string
  internalStatusLabel: (mode: DocumentsMode) => string
}

function useLocale() {
  const [locale, setLocale] = useState('en')
  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) setLocale(match[1])
    else if (!navigator.language.startsWith('en')) setLocale('it')
  }, [])
  return locale
}

function getDocumentsCopy(locale: string): DocumentsCopy {
  const isIT = locale === 'it'
  return {
    eyebrow: isIT ? 'DOCUMENTI' : 'DOCUMENTS',
    title: isIT ? 'La guida documenti per sposarsi in Italia' : 'The documents guide for marrying in Italy',
    subtitle: isIT
      ? 'Una lettura piu calma e utile di cosa serve, dove si ottiene e quando conviene muoversi.'
      : 'A calmer, more useful read of what is needed, where to get it, and when to move.',
    nextStepLabel: isIT ? 'Prossimo passo consigliato' : 'Next recommended step',
    appliesLabel: isIT ? 'Quello che di solito conta' : 'What usually applies',
    unfoldsLabel: isIT ? 'Come si svolge di solito il percorso' : 'How the process usually unfolds',
    verifyTitle: isIT ? 'Verifica sempre con le fonti ufficiali' : 'Always verify with official sources',
    verifyBody: isIT
      ? "Le richieste possono cambiare per Comune, nazionalita e rito. VELO aiuta a fare ordine, ma l'ultima parola resta al Comune e alla tua ambasciata o consolato."
      : 'Requirements can shift by Comune, nationality, and ceremony type. VELO helps create order, but the final word remains with the Comune and your embassy or consulate.',
    profileCta: isIT ? 'Rivedi il profilo coppia' : 'Review couple profile',
    completeProfileCta: isIT ? 'Completa il profilo coppia' : 'Complete couple profile',
    dashboardCta: isIT ? 'Torna alla dashboard' : 'Back to dashboard',
    officialCta: isIT ? 'Apri la fonte ufficiale' : 'Open official source',
    fallbackTitle: isIT ? 'Guida generale disponibile' : 'General guidance available',
    fallbackBody: isIT
      ? "Non abbiamo ancora una scheda paese dedicata per questa nazionalita, ma VELO puo comunque guidarti sul flusso generale per sposarsi in Italia."
      : "We do not yet have a dedicated country sheet for this nationality, but VELO can still guide the general flow for marrying in Italy.",
    partialTitle: isIT ? 'Piu dati rendono la guida piu precisa' : 'More profile detail makes this guide more precise',
    partialBody: isIT
      ? 'Con tipo di cerimonia e paese di origine possiamo mostrarti un percorso piu preciso, con documenti principali, tempistiche e punti di attenzione.'
      : 'With ceremony type and country of origin, we can show a more precise path with the main documents, timing, and key watchpoints.',
    profileMissingTitle: isIT ? 'Profilo web non ancora completo' : 'Web profile not fully available yet',
    profileMissingBody: isIT
      ? "Non abbiamo trovato un profilo coppia completo su web. Intanto trovi una guida generale, ma il percorso si personalizza meglio appena il profilo e allineato."
      : 'We could not find a complete couple profile on web yet. You still have a general guide here, but the path becomes more precise as soon as the profile is aligned.',
    italianTitle: isIT ? 'Per coppie italiane il flusso e piu leggero' : 'For Italian couples the flow is lighter',
    italianBody: isIT
      ? "Questa area nasce soprattutto per le coppie destination. Per una coppia italiana, il riferimento resta prima di tutto il Comune della cerimonia e, se serve, la parrocchia."
      : 'This area is built mainly for destination couples. For an Italian couple, the primary reference remains the wedding Comune and, when relevant, the parish.',
    urgentTitle: isIT ? 'Muoviti questa settimana' : 'Move this week',
    urgentBody: isIT
      ? 'Mancano meno di 90 giorni. Apostille, traduzioni e appuntamenti consolari possono richiedere tempo reale: non lasciare questa parte alla fine.'
      : 'There are fewer than 90 days left. Apostilles, translations, and consular appointments take real time, so this should not be left to the end.',
    readGeneralBody: isIT
      ? 'Anche senza una personalizzazione completa, VELO puo aiutarti a leggere il percorso con piu ordine.'
      : 'Even without full personalization, VELO can still help you read the process with more order.',
    noCountryTitle: isIT ? 'Paese non ancora impostato' : 'Country not set yet',
    mainDocument: isIT ? 'Documento principale' : 'Main document',
    whereToGetIt: isIT ? 'Dove ottenerlo' : 'Where to get it',
    timing: isIT ? 'Quando muoversi' : 'Timing',
    nextRecommendedStep: isIT ? 'La prossima mossa piu utile per non accumulare stress.' : 'The next most useful move so this never turns into stress.',
    whatUnlocks: isIT ? 'Cosa sblocca una guida migliore' : 'What unlocks a better guide',
    genericGuide: isIT ? 'Guida generale Italia' : 'General Italy guide',
    commonRules: isIT ? 'Regole che tornano quasi sempre' : 'Rules that usually apply',
    dateUnknown: isIT ? 'Data non ancora impostata' : 'Date not set yet',
    timingOpen: isIT ? 'Meglio iniziare 4-6 mesi prima' : 'Best started 4-6 months ahead',
    daysToGo: (days: number) => isIT ? `${days} giorni alla data` : `${days} days to go`,
    datePassed: isIT ? 'La data registrata e gia passata' : 'The saved date has already passed',
    ceremonyLabel: (ceremony) => {
      if (ceremony === 'civil') return isIT ? 'Rito civile' : 'Civil ceremony'
      if (ceremony === 'religious') return isIT ? 'Rito religioso' : 'Religious ceremony'
      if (ceremony === 'symbolic') return isIT ? 'Rito simbolico' : 'Symbolic ceremony'
      return isIT ? 'Cerimonia da definire' : 'Ceremony to be confirmed'
    },
    internalStatusLabel: (mode) => {
      if (mode === 'personalized') return isIT ? 'Guida personalizzata' : 'Personalized guide'
      if (mode === 'fallback') return isIT ? 'Fallback elegante' : 'Graceful fallback'
      if (mode === 'italian') return isIT ? 'Coppia italiana' : 'Italian couple'
      return isIT ? 'Da completare' : 'To complete'
    },
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function primaryButtonClass() {
  return 'inline-flex items-center justify-center rounded-full bg-[var(--velo-terracotta)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--velo-paper-2)] transition-colors hover:bg-[var(--velo-terracotta-deep)]'
}

function stripEmoji(value: string) {
  return value.replace(/^[^A-Za-z0-9À-ÿ]+/, '').trim() || value
}

function getWhereToGetIt(countryDoc: CountryDoc | null, ceremony: CeremonyType, mode: DocumentsMode, copy: DocumentsCopy) {
  if (mode === 'italian') {
    return ceremony === 'religious'
      ? `${copy.ceremonyLabel(ceremony)} / Comune + parrocchia`
      : `${copy.ceremonyLabel(ceremony)} / Comune della cerimonia`
  }
  if (ceremony === 'symbolic') return copy.ceremonyLabel(ceremony)
  if (!countryDoc) return copy.genericGuide
  if (['US', 'CA', 'AU'].includes(countryDoc.code)) return 'Italian consulate at home + Comune in Italy'
  if (countryDoc.difficulty === 'complex') return 'Embassy or consulate + Comune in Italy'
  return 'Home registry or embassy + Comune in Italy'
}

function getTimingSummary(countryDoc: CountryDoc | null, weddingDate: string | null, copy: DocumentsCopy) {
  if (!weddingDate) return countryDoc ? `${copy.timingOpen} / ${countryDoc.arrivalDays}` : copy.timingOpen
  const days = daysUntil(weddingDate)
  if (days < 0) return copy.datePassed
  return `${copy.daysToGo(days)} / ${countryDoc?.arrivalDays ?? copy.timingOpen}`
}

function getMissingProfilePrompt(
  locale: string,
  nationality: string | null,
  countryCode: string | null,
  ceremony: CeremonyType,
) {
  const missing: string[] = []

  if (!nationality) missing.push(locale === 'it' ? 'nazionalita' : 'nationality')
  if (!countryCode) missing.push(locale === 'it' ? 'paese di origine' : 'country of origin')
  if (!ceremony) missing.push(locale === 'it' ? 'tipo di rito' : 'ceremony type')

  if (missing.length === 0) return ''
  if (missing.length === 1) return missing[0]

  const joiner = locale === 'it' ? ' e ' : ' and '
  return `${missing.slice(0, -1).join(', ')}${joiner}${missing[missing.length - 1]}`
}

function getGeneralRules(locale: string, ceremony: CeremonyType) {
  const isIT = locale === 'it'
  const rules = [
    isIT
      ? 'Il Comune resta il riferimento finale: verifica sempre con l Ufficio di Stato Civile della location.'
      : 'The wedding Comune remains the final reference point, so always verify with the local civil office.',
    isIT
      ? 'Documenti esteri richiedono spesso apostille o legalizzazione e traduzione in italiano.'
      : 'Foreign records often require apostille or legalization plus an Italian translation.',
    isIT
      ? 'Se la cerimonia e civile e non parlate italiano, puo servire un interprete.'
      : 'If the ceremony is civil and you do not speak Italian, an interpreter may be required.',
  ]

  if (ceremony === 'religious') {
    rules.push(
      isIT
        ? 'Per i riti religiosi la parte civile puo seguire regole diverse: chiariscila presto con parrocchia e Comune.'
        : 'For religious ceremonies, the civil side may follow different rules, so align early with both parish and Comune.',
    )
  }
  if (ceremony === 'symbolic') {
    rules.push(
      isIT
        ? 'Il rito simbolico non crea effetti legali: la parte civile va organizzata separatamente.'
        : 'A symbolic ceremony has no legal effect, so the legal marriage needs to be handled separately.',
    )
  }

  return rules
}

function getGuideSections(locale: string, mode: DocumentsMode, countryDoc: CountryDoc | null, ceremony: CeremonyType): GuideSection[] {
  const isIT = locale === 'it'

  if (mode === 'italian') {
    return [
      {
        eyebrow: isIT ? 'Comune o parrocchia' : 'Comune or parish',
        title: isIT ? 'Partite dall ufficio giusto, non da una ricerca generica.' : 'Start with the right office, not with generic searching.',
        items: [
          isIT
            ? 'Contattate il Comune della cerimonia non appena data e luogo sono abbastanza chiari.'
            : 'Contact the wedding Comune as soon as date and venue are reasonably clear.',
          isIT
            ? 'Se il rito e religioso, allineate presto anche la parrocchia.'
            : 'If the ceremony is religious, align with the parish early as well.',
        ],
      },
      {
        eyebrow: isIT ? 'Cosa chiedere' : 'What to ask',
        title: isIT ? 'Serve chiarezza pratica, non una lista infinita.' : 'You need practical clarity, not an endless list.',
        items: [
          isIT
            ? 'Chiedete quali documenti servono davvero per il vostro rito e con quali tempi.'
            : 'Ask which documents really apply to your ceremony and on what timing.',
          isIT
            ? 'Verificate testimoni, eventuale interprete e margine di consegna.'
            : 'Verify witnesses, any interpreter requirement, and the delivery margin.',
        ],
      },
      {
        eyebrow: isIT ? 'Tono del planning' : 'Planning tone',
        title: isIT ? 'Tenete i documenti ordinati dentro il resto del matrimonio.' : 'Keep the paperwork orderly inside the rest of the wedding.',
        items: [
          isIT
            ? 'Annotate scadenze e nomi dei referenti nello stesso flusso del planning.'
            : 'Keep deadlines and contact names inside the same planning flow as the rest of the wedding.',
          isIT
            ? 'Una volta chiarita la parte documentale, il resto del progetto diventa piu leggero.'
            : 'Once the document side is clear, the rest of the project becomes lighter.',
        ],
      },
    ]
  }

  if (ceremony === 'symbolic') {
    return [
      {
        eyebrow: isIT ? 'Valore legale' : 'Legal value',
        title: isIT ? 'Il rito simbolico non richiede documenti italiani per esistere.' : 'A symbolic ceremony does not need Italian paperwork to exist.',
        items: [
          isIT
            ? 'Potete scegliere location, lingua e officiante con grande liberta.'
            : 'You can choose the venue, language, and officiant with broad freedom.',
          isIT
            ? 'La parte civile, se la volete, va gestita separatamente.'
            : 'The legal marriage, if you want it, needs to be handled separately.',
        ],
      },
      {
        eyebrow: isIT ? 'Scelta migliore' : 'Best choice',
        title: isIT ? 'Decidete presto dove rendere il matrimonio legalmente valido.' : 'Decide early where the marriage becomes legally valid.',
        items: [
          isIT
            ? 'Molte coppie fanno la parte legale nel proprio paese e tengono in Italia il momento simbolico principale.'
            : 'Many couples handle the legal marriage at home and keep Italy as the main symbolic celebration.',
          isIT
            ? 'In alternativa si puo aggiungere un piccolo rito civile in Italia.'
            : 'Alternatively, a small civil step can be added in Italy.',
        ],
      },
      {
        eyebrow: isIT ? 'Ordine' : 'Order',
        title: isIT ? 'Anche senza burocrazia, la chiarezza resta utile.' : 'Even without bureaucracy, clarity still matters.',
        items: [
          isIT
            ? 'Definite presto se servono interprete, testimoni o coordinamento con il luogo.'
            : 'Define early whether you need an interpreter, witnesses, or venue coordination.',
          isIT
            ? 'Tenete la scelta legale e quella simbolica nello stesso disegno del planning.'
            : 'Keep the legal choice and the symbolic celebration in the same planning view.',
        ],
      },
    ]
  }

  if (!countryDoc) {
    return [
      {
        eyebrow: isIT ? 'A casa' : 'At home',
        title: isIT ? 'Partite dal vostro consolato o registro civile.' : 'Start with your embassy, consulate, or civil registry.',
        items: [
          isIT
            ? 'Chiedete quale certificato sostituisce il nulla osta nel vostro paese.'
            : 'Ask which document in your country plays the role of a no-impediment certificate.',
          isIT
            ? 'Verificate gia se sono richieste apostille o legalizzazioni.'
            : 'Confirm early whether apostilles or legalizations are required.',
        ],
      },
      {
        eyebrow: isIT ? 'Preparazione' : 'Preparation',
        title: isIT ? 'Traduzioni e coerenza dei dati fanno la differenza.' : 'Translations and name consistency make the difference.',
        items: [
          isIT
            ? 'Usate traduzioni in italiano dove il Comune le richiede.'
            : 'Use Italian translations wherever the Comune requires them.',
          isIT
            ? 'Controllate che nomi e date coincidano su ogni documento.'
            : 'Check that names and dates match across every document.',
        ],
      },
      {
        eyebrow: isIT ? 'In Italia' : 'In Italy',
        title: isIT ? 'Il Comune resta il punto finale di conferma.' : 'The Comune remains the final point of confirmation.',
        items: [
          isIT
            ? 'Confermate sempre tempistiche, dichiarazioni e margini di arrivo con la location pubblica giusta.'
            : 'Always confirm timing, declarations, and arrival margins with the correct public office.',
          isIT
            ? 'Se la guida paese manca, il Comune puo chiarire i documenti minimi ancora prima del viaggio.'
            : 'If the country guide is missing, the Comune can still clarify the minimum document set before travel.',
        ],
      },
    ]
  }

  const first = countryDoc.steps.slice(0, 2)
  const middle = countryDoc.steps.slice(2, 4)
  const last = countryDoc.steps.slice(4)

  return [
    {
      eyebrow: isIT ? 'Prima di partire' : 'Before leaving home',
      title: isIT ? 'La parte piu importante si costruisce ancora a casa.' : 'The most important part is still built at home.',
      items: first.length > 0 ? first : countryDoc.steps.slice(0, 1),
    },
    {
      eyebrow: isIT ? 'Legalizzazione' : 'Legalisation',
      title: isIT ? 'Apostille, traduzioni e coerenza dei dati vanno curate bene.' : 'Apostilles, translations, and clean records need careful handling.',
      items: middle.length > 0
        ? middle
        : [
            isIT
              ? 'Preparate traduzioni in italiano e controllate che i dati coincidano.'
              : 'Prepare Italian translations and verify that all personal details match.',
            isIT
              ? 'Se il vostro paese richiede apostille o legalizzazione, trattatela come una tappa propria.'
              : 'If your country needs apostille or legalisation, treat that as a step of its own.',
          ],
    },
    {
      eyebrow: isIT ? 'Arrivo in Italia' : 'Arrival in Italy',
      title: isIT ? 'Gli ultimi passaggi si chiudono con il Comune giusto.' : 'The final steps close with the right Comune.',
      items: last.length > 0
        ? last
        : [
            isIT
              ? `Arrivate con margine: ${countryDoc.arrivalDays}.`
              : `Arrive with margin: ${countryDoc.arrivalDays}.`,
            isIT
              ? 'Chiudete dichiarazioni e verifiche con il Comune prima del rito.'
              : 'Complete declarations and checks with the Comune before the ceremony.',
          ],
    },
  ]
}

function ActionButton({ href, label, external = false }: { href: string; label: string; external?: boolean }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={primaryButtonClass()} style={{ fontFamily: VELO_MONO_FONT }}>
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={primaryButtonClass()} style={{ fontFamily: VELO_MONO_FONT }}>
      {label}
    </Link>
  )
}

function OverviewCard({ item }: { item: OverviewItem }) {
  return (
    <CouplePanel className="h-full">
      <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
        {item.label}
      </div>
      <p className="text-[1.25rem] leading-snug text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
        {item.title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--velo-muted)]">{item.body}</p>
    </CouplePanel>
  )
}

function GuideCard({ section }: { section: GuideSection }) {
  return (
    <CouplePanel className="h-full">
      <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
        {section.eyebrow}
      </div>
      <p className="text-[1.18rem] leading-snug text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
        {section.title}
      </p>
      <div className="mt-4 space-y-3">
        {section.items.map((item) => (
          <div key={item} className="flex gap-3">
            <span className="mt-[0.45rem] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--velo-terracotta)]" />
            <p className="text-sm leading-7 text-[var(--velo-muted)]">{item}</p>
          </div>
        ))}
      </div>
    </CouplePanel>
  )
}

export default function DocumentsPage() {
  const locale = useLocale()
  const copy = useMemo(() => getDocumentsCopy(locale), [locale])

  const [couple, setCouple] = useState<CoupleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [missingProfile, setMissingProfile] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session?.user) {
          if (!cancelled) {
            setMissingProfile(true)
            setLoading(false)
          }
          return
        }

        const { data, error } = await supabase
          .from('couples')
          .select('partner1, partner2, nationality, country_of_origin, ceremony_type, wedding_date')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) throw error

        if (cancelled) return

        if (!data || data.length === 0) {
          setCouple(null)
          setMissingProfile(true)
        } else {
          setCouple(data[0] as CoupleDoc)
          setMissingProfile(false)
        }
      } catch (error) {
        console.error('documents page load failed', error)
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const nationality = couple?.nationality?.toLowerCase().trim() ?? null
  const countryCode = couple?.country_of_origin?.toUpperCase().trim() ?? null
  const ceremony = (couple?.ceremony_type ?? null) as CeremonyType
  const weddingDate = couple?.wedding_date ?? null
  const countryDoc = countryCode ? COUNTRIES.find((entry) => entry.code === countryCode) ?? null : null

  const mode: DocumentsMode = useMemo(() => {
    if (missingProfile) return 'profile_missing'
    if (nationality === 'italian') return 'italian'
    if (!nationality || !countryCode || !ceremony) return 'partial'
    if (countryDoc) return 'personalized'
    return 'fallback'
  }, [ceremony, countryCode, countryDoc, missingProfile, nationality])

  const days = weddingDate ? daysUntil(weddingDate) : null
  const isUrgent = days !== null && days >= 0 && days < 90

  const mainDocumentTitle =
    mode === 'italian'
      ? ceremony === 'religious'
        ? locale === 'it'
          ? 'Conferma da Comune e parrocchia'
          : 'Confirmation from Comune and parish'
        : locale === 'it'
          ? 'Conferma richiesta del Comune'
          : 'Comune requirement check'
      : ceremony === 'symbolic'
        ? locale === 'it'
          ? 'Nessun fascicolo civile italiano'
          : 'No Italian civil file needed'
        : countryDoc?.keyDoc ?? (locale === 'it' ? 'Certificato di stato libero o nulla osta' : 'No-impediment or freedom-to-marry document')

  const mainDocumentBody =
    mode === 'italian'
      ? locale === 'it'
        ? 'Per una coppia italiana conta soprattutto capire presto quali passaggi chiede davvero il Comune della cerimonia.'
        : 'For an Italian couple, the key is clarifying early what the wedding Comune actually requires.'
      : ceremony === 'symbolic'
        ? locale === 'it'
          ? 'Il rito simbolico non crea effetti civili in Italia, quindi la parte legale puo vivere altrove.'
          : 'A symbolic ceremony has no civil effect in Italy, so the legal step can happen elsewhere.'
        : countryDoc
          ? locale === 'it'
            ? `${stripEmoji(countryDoc.keyDoc)} e il punto da cui parte quasi tutto per ${stripEmoji(countryDoc.name)}.`
            : `${stripEmoji(countryDoc.keyDoc)} is the document that anchors most of the process for ${stripEmoji(countryDoc.name)}.`
          : copy.readGeneralBody

  const overview: OverviewItem[] = [
    {
      label: copy.mainDocument,
      title: mainDocumentTitle,
      body: mainDocumentBody,
    },
    {
      label: copy.whereToGetIt,
      title: getWhereToGetIt(countryDoc, ceremony, mode, copy),
      body:
        mode === 'personalized'
          ? locale === 'it'
            ? 'Parti prima dalla fonte del tuo paese, poi usa il Comune in Italia per confermare i passaggi finali.'
            : 'Start with the right source in your home country, then use the Comune in Italy to confirm the final steps.'
          : mode === 'italian'
            ? locale === 'it'
              ? 'La conferma pratica arriva dall ufficio giusto, non da una ricerca generica.'
              : 'Practical clarity comes from the right office, not from generic searching.'
            : locale === 'it'
              ? 'La guida resta utile anche senza una scheda paese dedicata, soprattutto per capire l ordine delle tappe.'
              : 'The guide is still useful without a dedicated country sheet, especially to understand the order of the steps.',
    },
    {
      label: copy.timing,
      title: getTimingSummary(countryDoc, weddingDate, copy),
      body:
        days === null
          ? locale === 'it'
            ? 'Se la data non e ancora fissa, tratta i documenti come una preparazione anticipata e non come un adempimento finale.'
            : 'If the date is not fixed yet, treat documents as early preparation rather than a last-minute task.'
          : days < 0
            ? locale === 'it'
              ? 'Aggiorna la data del matrimonio se il planning e cambiato, cosi anche questa guida resta affidabile.'
              : 'Update the wedding date if the plan has moved, so this guide remains reliable.'
            : locale === 'it'
              ? 'Apostille, traduzioni e appuntamenti consolari si muovono meglio con margine reale.'
              : 'Apostilles, translations, and consular appointments work better with real margin.',
    },
  ]

  const profilePrompt = getMissingProfilePrompt(locale, nationality, countryCode, ceremony)

  const nextStepTitle =
    mode === 'personalized'
      ? locale === 'it'
        ? 'Apri la fonte ufficiale e blocca l elenco reale.'
        : 'Open the official source and lock the real checklist.'
      : mode === 'italian'
        ? locale === 'it'
          ? 'Contatta il Comune della cerimonia.'
          : 'Contact the wedding Comune.'
        : mode === 'fallback'
          ? locale === 'it'
            ? 'Individua il documento equivalente nel tuo paese.'
            : 'Confirm the equivalent document used in your home country.'
          : locale === 'it'
            ? 'Completa il profilo per sbloccare la guida personalizzata.'
            : 'Complete the profile to unlock the personalized guide.'

  const nextStepBody =
    mode === 'personalized'
      ? locale === 'it'
        ? 'Usa la scheda paese per capire il documento chiave, poi confrontala con il Comune italiano che celebrera il matrimonio.'
        : 'Use the country sheet to understand the key document, then align it with the Italian Comune that will host the marriage.'
      : mode === 'italian'
        ? locale === 'it'
          ? 'Per una coppia italiana la parte documentale vive soprattutto nel dialogo con il Comune e, se serve, con la parrocchia.'
          : 'For an Italian couple, the document path lives mainly in the dialogue with the Comune and, when needed, the parish.'
        : mode === 'fallback'
          ? locale === 'it'
            ? 'VELO puo guidarti sul flusso generale, ma per essere davvero precisa questa pagina deve partire dal documento che il tuo paese usa davvero.'
            : 'VELO can guide the general flow, but this page becomes truly precise once the right document for your country is confirmed.'
          : locale === 'it'
            ? 'Con pochi dati in piu questa pagina diventa molto piu utile: niente muri di testo, solo i passi che contano davvero.'
            : 'With a little more data this page becomes much more useful: no long walls of text, only the steps that really matter.'

  const appliesList =
    mode === 'italian'
      ? [
          locale === 'it'
            ? 'Il Comune della cerimonia resta il riferimento finale.'
            : 'The wedding Comune remains the final reference point.',
          ceremony === 'religious'
            ? locale === 'it'
              ? 'Per il rito religioso va chiarita presto anche la parte parrocchiale.'
              : 'For a religious ceremony, the parish side should be clarified early as well.'
            : locale === 'it'
              ? 'Testimoni, interprete e margini di consegna vanno verificati sul caso reale.'
              : 'Witnesses, interpreter needs, and delivery margins should be verified for the real case.',
        ]
      : getGeneralRules(locale, ceremony)

  const sections = getGuideSections(locale, mode, countryDoc, ceremony)

  const action =
    mode === 'personalized' && countryDoc?.officialUrl
      ? { href: countryDoc.officialUrl, label: copy.officialCta, external: true }
      : mode === 'italian'
        ? { href: '/couple/dashboard', label: copy.dashboardCta, external: false }
        : mode === 'partial' || mode === 'profile_missing'
          ? { href: '/couple/profile', label: copy.completeProfileCta, external: false }
        : { href: '/couple/profile', label: copy.profileCta, external: false }

  const meta = (
    <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
      <CoupleChip accent="var(--velo-terracotta)">{copy.internalStatusLabel(mode)}</CoupleChip>
      {countryDoc ? <CoupleChip>{stripEmoji(countryDoc.name)}</CoupleChip> : countryCode ? <CoupleChip>{countryCode}</CoupleChip> : null}
      <CoupleChip>{copy.ceremonyLabel(ceremony)}</CoupleChip>
      <CoupleChip accent={isUrgent ? 'var(--velo-danger)' : 'var(--velo-info)'}>
        {weddingDate ? formatDate(weddingDate, locale) : copy.dateUnknown}
      </CoupleChip>
    </div>
  )

  if (loading) return <CoupleLoadingBlock />

  if (fetchError) {
    return (
      <div className="space-y-6">
        <CouplePageIntro eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <CoupleNotice title={locale === 'it' ? 'Impossibile caricare la guida' : 'Unable to load the guide'} tone="danger">
          {locale === 'it'
            ? 'Riprova tra poco. Se il problema resta, puoi comunque controllare il profilo coppia o tornare alla dashboard.'
            : 'Please try again shortly. If the problem continues, you can still review the couple profile or return to the dashboard.'}
        </CoupleNotice>
        <div className="flex flex-wrap gap-3">
          <ActionButton href="/couple/profile" label={copy.profileCta} />
          <ActionButton href="/couple/dashboard" label={copy.dashboardCta} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      <CouplePageIntro
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        meta={meta}
        action={<ActionButton href={action.href} label={action.label} external={action.external} />}
      />

      {mode === 'profile_missing' && (
        <CoupleNotice title={copy.profileMissingTitle} tone="warning">
          {copy.profileMissingBody}
        </CoupleNotice>
      )}

      {mode === 'partial' && (
        <CoupleNotice title={copy.partialTitle} tone="warning">
          {copy.partialBody} {profilePrompt ? `${copy.whatUnlocks}: ${profilePrompt}.` : null}
        </CoupleNotice>
      )}

      {mode === 'fallback' && (
        <CoupleNotice title={copy.fallbackTitle} tone="neutral">
          {copy.fallbackBody}
        </CoupleNotice>
      )}

      {mode === 'italian' && (
        <CoupleNotice title={copy.italianTitle} tone="neutral">
          {copy.italianBody}
        </CoupleNotice>
      )}

      {isUrgent && (
        <CoupleNotice title={copy.urgentTitle} tone="danger">
          {copy.urgentBody}
        </CoupleNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {overview.map((item) => (
          <OverviewCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <CouplePanel tone="dark" className="relative overflow-hidden">
          <div className="absolute right-[-1rem] top-[-1rem] h-28 w-28 rounded-full border border-white/10" />
          <div className="relative">
            <div className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#d7b89d]" style={{ fontFamily: VELO_MONO_FONT }}>
              {copy.nextStepLabel}
            </div>
            <p className="max-w-[28rem] text-[2rem] leading-[1.02] text-[var(--velo-paper-2)] sm:text-[2.35rem]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              {nextStepTitle}
            </p>
            <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[#d2c3b0]">{nextStepBody}</p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#c9b29a]" style={{ fontFamily: VELO_MONO_FONT }}>
              {copy.nextRecommendedStep}
            </p>
          </div>
        </CouplePanel>

        <CouplePanel tone="soft">
          <div className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {copy.appliesLabel}
          </div>
          <div className="space-y-3">
            {appliesList.map((item) => (
              <div key={item} className="flex gap-3">
                <span className="mt-[0.42rem] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--velo-terracotta)]" />
                <p className="text-sm leading-7 text-[var(--velo-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </CouplePanel>
      </div>

      <CouplePanel className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-[var(--velo-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
              {copy.unfoldsLabel}
            </div>
            <p className="max-w-[34rem] text-[1.9rem] leading-[1.05] text-[var(--velo-ink)] sm:text-[2.2rem]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
              {locale === 'it' ? 'Documenti, ma con ordine.' : 'Paperwork, but with order.'}
            </p>
          </div>
          <p className="max-w-[21rem] text-sm leading-7 text-[var(--velo-muted)]">
            {locale === 'it'
              ? 'Il punto non e sapere tutto insieme. Il punto e capire cosa succede prima, cosa succede in Italia, e cosa richiede verifica.'
              : 'The goal is not to know everything at once. The goal is to understand what happens first, what happens in Italy, and what needs verification.'}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <GuideCard key={section.title} section={section} />
          ))}
        </div>
      </CouplePanel>

      {countryDoc?.notes && (
        <CoupleNotice title={locale === 'it' ? 'Nota utile' : 'Useful note'} tone="neutral">
          {stripEmoji(countryDoc.notes)}
        </CoupleNotice>
      )}

      <CoupleNotice title={copy.verifyTitle} tone="neutral">
        {copy.verifyBody}
      </CoupleNotice>
    </div>
  )
}

