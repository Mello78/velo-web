'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { COUNTRIES, CountryDoc } from '../../../lib/countries'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoupleDoc {
  nationality: string | null
  country_of_origin: string | null
  ceremony_type: string | null
  wedding_date: string | null
}

type Difficulty = 'easy' | 'medium' | 'complex'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const t = new Date(dateStr); t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - now.getTime()) / 86400000)
}

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: '#7A9E7E',
  medium: '#C9A84C',
  complex: '#C4756A',
}
const DIFF_LABEL: Record<Difficulty, string> = {
  easy: 'Straightforward',
  medium: 'Some steps required',
  complex: 'Plan well in advance',
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function PageHeader({ flag, title, sub, badge, badgeColor }: {
  flag?: string; title: string; sub?: string; badge?: string; badgeColor?: string
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
        DOCUMENTS
      </div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: '0 0 6px', lineHeight: 1.2 }}>
        {flag ? `${flag} ` : ''}{title}
      </h1>
      {sub && <div style={{ fontSize: 14, color: '#8A7E6A', marginBottom: 10 }}>{sub}</div>}
      {badge && (
        <span style={{
          display: 'inline-block', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
          color: badgeColor ?? '#C9A84C',
          border: `1px solid ${badgeColor ?? '#C9A84C'}40`,
          background: `${badgeColor ?? '#C9A84C'}12`,
          borderRadius: 20, padding: '4px 12px',
        }}>
          {badge}
        </span>
      )}
    </div>
  )
}

function Card({ children, border }: { children: React.ReactNode; border?: string }) {
  return (
    <div style={{
      background: '#1A1915', border: `1px solid ${border ?? '#2A2820'}`,
      borderRadius: 14, padding: '20px 22px', marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.8 }}>{children}</div>
}

function StepList({ steps, civil_note }: { steps: string[]; civil_note?: string }) {
  return (
    <div>
      {civil_note && (
        <div style={{ fontSize: 12, color: '#8A7E6A', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.7 }}>
          {civil_note}
        </div>
      )}
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
          <div style={{
            flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#C9A84C', fontWeight: 700, marginTop: 1,
          }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7, flex: 1 }}>{step}</div>
        </div>
      ))}
    </div>
  )
}

function JourneySteps({ steps }: { steps: { title: string; sub: string }[] }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < steps.length - 1 ? 0 : 0 }}>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#C9A84C',
            }}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 1, flex: 1, minHeight: 20, background: 'rgba(201,168,76,0.15)', margin: '4px 0' }} />
            )}
          </div>
          {/* Content */}
          <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
            <div style={{ fontSize: 14, color: '#F5EDD6', fontWeight: 400, marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: '#8A7E6A', lineHeight: 1.6 }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NoteBadge({ text }: { text: string }) {
  return (
    <div style={{
      background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 10, padding: '14px 18px', marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 6 }}>
        Good to know
      </div>
      <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

function WarningBox({ title, text }: { title: string; text: string }) {
  return (
    <div style={{
      background: 'rgba(196,117,106,0.06)', border: '1px solid rgba(196,117,106,0.2)',
      borderRadius: 10, padding: '14px 18px', marginBottom: 12,
    }}>
      <div style={{ fontSize: 12, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#9A9080', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

function Footer() {
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: '#5A5040', lineHeight: 1.8, fontStyle: 'italic', borderTop: '1px solid #1E1D1A', paddingTop: 20 }}>
      Need personalised help? Consider consulting an Italian lawyer (avvocato) or a wedding planner experienced in destination weddings.
    </div>
  )
}

// ─── Country overview block ───────────────────────────────────────────────────

function CountryOverview({ doc }: { doc: CountryDoc }) {
  const color = DIFF_COLOR[doc.difficulty]
  return (
    <div style={{
      background: '#1A1915', border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 14, padding: '20px 22px', marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 16 }}>
        At a glance — {doc.name}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="overview-grid">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#8A7E6A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Main document</div>
          <div style={{ fontSize: 12, color: '#F5EDD6', lineHeight: 1.5 }}>{doc.keyDoc}</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid #2A2820', borderRight: '1px solid #2A2820' }}>
          <div style={{ fontSize: 10, color: '#8A7E6A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Arrive in Italy</div>
          <div style={{ fontSize: 12, color: '#F5EDD6', lineHeight: 1.5 }}>{doc.arrivalDays}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#8A7E6A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Process</div>
          <div style={{ fontSize: 12, color: color, fontWeight: 600 }}>{DIFF_LABEL[doc.difficulty]}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Page paths ───────────────────────────────────────────────────────────────

function ProfileIncomplete() {
  return (
    <div>
      <PageHeader title="Getting married in Italy" sub="Complete your profile to see your personalised guide" />
      <Card border="rgba(201,168,76,0.25)">
        <SectionTitle>Complete your profile first</SectionTitle>
        <BodyText>
          To show you the right document guide, we need to know your nationality and ceremony type.
          Complete your profile in the VELO app and your personalised checklist will appear here.
        </BodyText>
        <div style={{ marginTop: 16, fontSize: 13, color: '#C9A84C' }}>Open the VELO app to update your profile →</div>
      </Card>
      <Footer />
    </div>
  )
}

function LoadError() {
  return (
    <div>
      <PageHeader title="Getting married in Italy" />
      <div style={{
        background: 'rgba(196,117,106,0.06)', border: '1px solid rgba(196,117,106,0.2)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 13, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>
          Unable to load your profile
        </div>
        <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>
          We could not retrieve your wedding details. This may be a temporary connection issue.
          Try refreshing the page — if the problem persists, open the VELO app and make sure your profile is complete.
        </div>
      </div>
      <Footer />
    </div>
  )
}

function CoupleProfileUnavailable() {
  return (
    <div>
      <PageHeader title="Getting married in Italy" />
      <div style={{
        background: '#1A1915', border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 13, color: '#C9A84C', fontWeight: 600, marginBottom: 6 }}>
          Couple profile not available yet
        </div>
        <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>
          We could not find an active VELO couple profile for this signed-in account on web yet.
          Complete or verify your setup in the VELO app, then come back here for your personalised documents guide.
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Italian religious guide — data mirrored from components/ReligiousCeremonyGuide.tsx (isForeign=false)
const IT_RELIGIOUS_CHECKLIST = [
  { phase: '12+ mesi prima', items: [
    'Contattare il parroco per verificare la disponibilità della data',
    'Verificare che entrambi i partner siano battezzati (e cresimati)',
    'Richiedere i documenti di stato libero alla propria parrocchia',
  ]},
  { phase: '6–9 mesi prima', items: [
    'Iscriversi al corso di preparazione al matrimonio (prematrimoniale)',
    'Scegliere i testimoni (almeno 2, anche non cattolici)',
    'Iniziare a definire la liturgia con il parroco',
  ]},
  { phase: '3–6 mesi prima', items: [
    'Consegnare i documenti richiesti alla parrocchia',
    'Scegliere le letture bibliche e i canti',
    'Accordarsi con il parroco sulla musica (organista, coro)',
    'Verificare le regole della chiesa per fotografi e videomaker',
  ]},
  { phase: '1–3 mesi prima', items: [
    'Confermare il programma della cerimonia con il parroco',
    'Comunicare le regole fotografiche al fotografo',
    'Definire l\'allestimento floreale con il fiorista (regole della chiesa)',
    'Preparare le fedi e gli altri elementi liturgici',
  ]},
  { phase: '1–2 settimane prima', items: [
    'Consegnare il libretto della messa all\'officina tipografica',
    'Verificare l\'orario preciso con il parroco',
    'Briefing finale con fotografo e fiorista sulle regole',
  ]},
]

function ItalianReligiousGuide() {
  const [openPhase, setOpenPhase] = useState<string | null>('12+ mesi prima')

  return (
    <div>
      <PageHeader
        title="La tua guida al rito religioso"
        badge="Cerimonia religiosa"
      />

      <Card>
        <SectionTitle>Scadenziario</SectionTitle>
        {IT_RELIGIOUS_CHECKLIST.map(({ phase, items }) => (
          <div key={phase} style={{ marginBottom: 6 }}>
            <button
              onClick={() => setOpenPhase(openPhase === phase ? null : phase)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: openPhase === phase ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                border: '1px solid #2A2820',
                borderBottom: openPhase === phase ? 'none' : undefined,
                borderRadius: openPhase === phase ? '8px 8px 0 0' : 8,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 1 }}>{phase}</span>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
                style={{ transform: openPhase === phase ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s', flexShrink: 0 }}>
                <path d="M2 4L6 8L10 4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {openPhase === phase && (
              <div style={{
                background: '#1A1915', border: '1px solid #2A2820', borderTop: 'none',
                borderRadius: '0 0 8px 8px', padding: '12px 14px',
              }}>
                {items.map((item, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7, marginBottom: i < items.length - 1 ? 6 : 0 }}>
                    · {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <SectionTitle>Fotografia &amp; video in chiesa</SectionTitle>
        <BodyText>
          <div style={{ marginBottom: 6 }}>· Molte chiese vietano il flash durante la celebrazione — verifica sempre in anticipo</div>
          <div style={{ marginBottom: 6 }}>· Alcune chiese limitano i movimenti del fotografo (es. solo dall'ultima fila)</div>
          <div style={{ marginBottom: 6 }}>· Il video può essere vietato o limitato al solo presbiterio</div>
          <div>· Suggerimento: porta il fotografo alla visita della chiesa per capire le regole</div>
        </BodyText>
      </Card>

      <Card>
        <SectionTitle>Musica</SectionTitle>
        <BodyText>
          <div style={{ marginBottom: 6 }}>· La musica deve essere approvata dal parroco</div>
          <div style={{ marginBottom: 6 }}>· La musica profana (pop, colonne sonore) è generalmente vietata durante la messa</div>
          <div>· Ave Maria, Pachelbel Canon, Bach sono classici sempre accettati</div>
        </BodyText>
      </Card>

      <WarningBox
        title="Dubbi sui documenti?"
        text="Contatta l'Ufficio di Stato Civile del Comune dove ti sposi — sono l'autorità competente e possono darti le istruzioni precise per la tua situazione."
      />
      <Footer />
    </div>
  )
}

function ItalianCouple({ ceremony }: { ceremony: string | null }) {
  // Italian + religious → dedicated guide (mirrors mobile ReligiousCeremonyGuide isForeign=false path)
  if (ceremony === 'religious') return <ItalianReligiousGuide />

  return (
    <div>
      <PageHeader
        title="Getting married in Italy"
        sub="Coppia italiana"
        badge={ceremony === 'civil' ? 'Civil ceremony' : ceremony === 'symbolic' ? 'Symbolic ceremony' : undefined}
      />

      <Card>
        <SectionTitle>This guide is for foreign couples</SectionTitle>
        <BodyText>
          {ceremony === 'symbolic'
            ? 'Il matrimonio simbolico non ha requisiti burocratici. Sei libero di scegliere location, officiante, lingua e rito. Per la validità legale, procedete separatamente in Comune.'
            : 'La guida documenti di VELO è pensata per le coppie straniere che si sposano in Italia (destination wedding). Per un matrimonio civile in Italia, le coppie italiane si rivolgono direttamente all\'Ufficio di Stato Civile del proprio Comune. Contatta il Comune della tua location per le istruzioni specifiche.'}
        </BodyText>
      </Card>

      {ceremony === 'symbolic' && (
        <Card border="rgba(201,168,76,0.2)">
          <SectionTitle>Matrimonio simbolico — cosa preparare</SectionTitle>
          <BodyText>
            <div style={{ marginBottom: 8 }}>• Nessun documento legale richiesto per il rito in sé</div>
            <div style={{ marginBottom: 8 }}>• Libertà totale su location, lingua, script, voti</div>
            <div style={{ marginBottom: 8 }}>• Scegli un officiante di fiducia (professionista o amico)</div>
            <div style={{ marginTop: 16, marginBottom: 8 }}>Per la validità legale, le opzioni comuni sono:</div>
            <div style={{ marginBottom: 4 }}>1. Matrimonio civile in Comune nella stessa data o il giorno prima</div>
            <div>2. Matrimonio civile nel proprio comune di residenza in un'altra data</div>
          </BodyText>
        </Card>
      )}

      <WarningBox
        title="Dubbi sui documenti?"
        text="Contatta l'Ufficio di Stato Civile del Comune dove ti sposi — sono l'autorità competente e possono darti le istruzioni precise per la tua situazione."
      />
      <Footer />
    </div>
  )
}

function SymbolicForeign({ countryDoc }: { countryDoc: CountryDoc | null }) {
  const SYMBOLIC_STEPS = [
    { title: 'Choose your location', sub: 'No restrictions — beach, vineyard, private villa, rooftop, garden' },
    { title: 'Find your officiant', sub: 'A professional celebrant or a trusted friend — no official requirements' },
    { title: 'Plan your ceremony', sub: 'Any language, any script, any tradition you love' },
    { title: 'Write your vows', sub: 'Complete freedom — this is the most personal part' },
  ]

  return (
    <div>
      <PageHeader
        title={countryDoc ? `${countryDoc.flag} ${countryDoc.name}` : 'Getting married in Italy'}
        badge="Symbolic ceremony"
        badgeColor="#7A9E7E"
      />

      <Card border="rgba(122,158,126,0.3)">
        <SectionTitle>Good news — no Italian paperwork needed</SectionTitle>
        <BodyText>
          <div style={{ marginBottom: 12 }}>A symbolic ceremony in Italy has no legal value in itself, so Italy does not require any official documents from you.</div>
          <div style={{ marginBottom: 8 }}>You do not need:</div>
          <div style={{ marginBottom: 4 }}>• Nulla Osta or Certificate of No Impediment</div>
          <div style={{ marginBottom: 4 }}>• Apostilles or certified translations</div>
          <div style={{ marginBottom: 4 }}>• Declaring intention to marry at the Comune</div>
          <div style={{ marginTop: 12 }}>The ceremony can be held anywhere, in any language, with any script you choose.</div>
        </BodyText>
      </Card>

      <Card>
        <SectionTitle>Your symbolic ceremony journey</SectionTitle>
        <JourneySteps steps={SYMBOLIC_STEPS} />
      </Card>

      <Card>
        <SectionTitle>What about legal recognition?</SectionTitle>
        <BodyText>
          <div style={{ marginBottom: 12 }}>If you want to be legally married, you have two common options:</div>
          <div style={{ marginBottom: 8 }}>1. Marry legally in your home country before or after your Italian celebration</div>
          <div style={{ marginBottom: 16 }}>2. Add a small civil ceremony at the local Comune the day before — this requires standard documents from your country</div>
          <div>Many couples choose option 1: the symbolic ceremony in Italy becomes the main celebration, while the legal paperwork stays simple and local.</div>
        </BodyText>
      </Card>

      <WarningBox
        title="Always verify"
        text="If you decide to add a legal civil ceremony in Italy, you will need the standard documents for your country. Always confirm requirements with the Italian Comune and your country's embassy in Italy."
      />
      <Footer />
    </div>
  )
}

function ForeignWithCivil({
  countryDoc, ceremony, isOther, urgentDocs, ceremonyUnset,
}: {
  countryDoc: CountryDoc | null; ceremony: string | null; isOther: boolean; urgentDocs: boolean; ceremonyUnset: boolean
}) {
  const CIVIL_STEPS = [
    { title: 'Check your documents', sub: 'See exactly what your country requires — no surprises' },
    { title: 'Prepare with time', sub: 'Most documents need to be requested 3–6 months before' },
    { title: 'Translations & legalisation', sub: 'Every document needs apostille + Italian translation' },
    { title: 'Arrive in Italy', sub: 'Sign at the Comune — then celebrate' },
  ]

  const GENERIC_STEPS = [
    'Valid passport for both partners',
    'Birth certificate — apostilled + translated into Italian by a certified translator',
    "Certificate of No Impediment / Nulla Osta — from your country's embassy or consulate in Italy",
    'If previously married: divorce decree or death certificate — apostilled + translated',
    'Declaration of Intention to Marry — signed at the local Comune (Ufficio di Stato Civile)',
    'Two witnesses at the ceremony (any nationality, over 18, with valid ID)',
  ]

  const APPLIES_ALL = [
    'All foreign documents must be apostilled (Hague Convention) or legalised',
    'All documents must be translated into Italian by a certified translator',
    'If neither partner speaks Italian, an interpreter must be present at civil ceremonies',
    'Civil banns are typically waived for non-residents',
  ]

  const badgeLabel = ceremony === 'civil' ? 'Civil ceremony' : ceremony === 'religious' ? 'Religious ceremony' : undefined

  return (
    <div>
      <PageHeader
        title={countryDoc ? `${countryDoc.flag} ${countryDoc.name}` : 'Getting married in Italy'}
        sub={countryDoc ? undefined : 'Destination wedding guide'}
        badge={badgeLabel}
      />

      {/* Difficulty + arrival time for known country */}
      {countryDoc && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, letterSpacing: 1,
            color: DIFF_COLOR[countryDoc.difficulty],
            border: `1px solid ${DIFF_COLOR[countryDoc.difficulty]}40`,
            background: `${DIFF_COLOR[countryDoc.difficulty]}10`,
            borderRadius: 20, padding: '4px 12px',
          }}>
            {DIFF_LABEL[countryDoc.difficulty]}
          </span>
          <span style={{ fontSize: 11, color: '#8A7E6A', display: 'flex', alignItems: 'center' }}>
            Arrive {countryDoc.arrivalDays}
          </span>
        </div>
      )}

      {/* Ceremony unset nudge — mirrors mobile ceremonyUnsetBanner */}
      {ceremonyUnset && (
        <div style={{
          background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: '#C9A84C', fontSize: 15, flexShrink: 0, marginTop: 1 }}>◎</div>
          <div style={{ fontSize: 12, color: '#9A9080', lineHeight: 1.7 }}>
            Ceremony type not set — showing the civil marriage guide.{' '}
            <span style={{ color: '#C9A84C' }}>Update your profile in the VELO app</span>{' '}
            to get a guide tailored to your ceremony.
          </div>
        </div>
      )}

      {/* Urgency banner */}
      {urgentDocs && (
        <div style={{
          background: 'rgba(196,117,106,0.08)', border: '1px solid rgba(196,117,106,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: '#C4756A', fontSize: 16, flexShrink: 0, marginTop: 1 }}>!</div>
          <div style={{ fontSize: 12, color: '#9A9080', lineHeight: 1.7 }}>
            Your wedding is in under 90 days. Some of these documents — apostilles, certified translations, consulate filings — can take 3 to 6 months to arrange. If you haven't started yet, contact your nearest Italian consulate this week.
          </div>
        </div>
      )}

      {/* Reassurance */}
      <div style={{ fontSize: 13, color: '#8A7E6A', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.7 }}>
        Don't worry — we'll help you understand what you need, one step at a time.
      </div>

      {/* Journey overview */}
      <Card>
        <SectionTitle>Your path to getting married in Italy</SectionTitle>
        <JourneySteps steps={CIVIL_STEPS} />
      </Card>

      {/* Country overview */}
      {countryDoc && <CountryOverview doc={countryDoc} />}

      {/* Civil ceremony note */}
      {ceremony === 'civil' && (
        <Card>
          <SectionTitle>Civil ceremony — what to expect</SectionTitle>
          <BodyText>
            <div style={{ marginBottom: 8 }}>Performed by the Mayor or official delegate at the Comune (town hall) or an approved venue.</div>
            <div style={{ marginBottom: 4 }}>• The ceremony is conducted in Italian — an interpreter must be present if needed</div>
            <div style={{ marginBottom: 4 }}>• Duration: typically 20–45 minutes</div>
            <div style={{ marginBottom: 4 }}>• Two witnesses required (any nationality, over 18, with valid ID)</div>
            <div>• Legally binding in Italy and internationally recognised</div>
          </BodyText>
        </Card>
      )}

      {/* Religious ceremony note */}
      {ceremony === 'religious' && (
        <Card border="rgba(196,117,106,0.2)">
          <SectionTitle>Religious ceremony — important notes</SectionTitle>
          <BodyText>
            <div style={{ marginBottom: 12 }}>Only Catholic ceremonies have legal civil value in Italy (Concordato 1929).</div>
            <div style={{ marginBottom: 8 }}>For a legally valid Catholic ceremony:</div>
            <div style={{ marginBottom: 4 }}>• Contact your local parish months in advance</div>
            <div style={{ marginBottom: 4 }}>• Both partners must complete pre-marital preparation (corso prematrimoniale)</div>
            <div style={{ marginBottom: 16 }}>• Additional paperwork from your home parish required</div>
            <div style={{ marginBottom: 8 }}>For other religions (Protestant, Jewish, Muslim, Orthodox, etc.):</div>
            <div style={{ marginBottom: 4 }}>• A separate civil ceremony at the Comune is required for legal recognition</div>
            <div>• The religious ceremony can follow as a symbolic celebration</div>
          </BodyText>
        </Card>
      )}

      {/* Country step-by-step */}
      {countryDoc && (
        <Card>
          <SectionTitle>Step-by-step guide</SectionTitle>
          <StepList
            steps={countryDoc.steps}
            civil_note={ceremony === 'religious' ? 'These steps cover civil registration — required even for religious ceremonies with legal standing in Italy.' : undefined}
          />
        </Card>
      )}

      {/* Generic guide for unknown country */}
      {isOther && (
        <Card>
          <SectionTitle>General requirements — all foreigners</SectionTitle>
          <StepList steps={GENERIC_STEPS} />
        </Card>
      )}

      {/* Good to know */}
      {countryDoc?.notes && <NoteBadge text={countryDoc.notes} />}

      {/* Official resource link */}
      {countryDoc?.officialUrl && (
        <div style={{ marginBottom: 12 }}>
          <a
            href={countryDoc.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#4A7AB8', textDecoration: 'none',
              padding: '10px 16px',
              background: 'rgba(74,122,184,0.06)',
              border: '1px solid rgba(74,122,184,0.2)',
              borderRadius: 10,
            }}
          >
            Open official {countryDoc.name} resource →
          </a>
        </div>
      )}

      {/* Applies to all */}
      <Card>
        <SectionTitle>Applies to every country</SectionTitle>
        <div>
          {APPLIES_ALL.map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7, marginBottom: i < APPLIES_ALL.length - 1 ? 8 : 0 }}>
              • {item}
            </div>
          ))}
        </div>
      </Card>

      <WarningBox
        title="Always verify"
        text="Requirements can change and vary by municipality and ceremony type. Always confirm with the Italian Comune and your country's embassy in Italy."
      />
      <Footer />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [couple, setCouple] = useState<CoupleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [missingCoupleRow, setMissingCoupleRow] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setFetchError(true); setLoading(false); return }
      const { data, error } = await supabase
        .from('couples')
        .select('nationality, country_of_origin, ceremony_type, wedding_date')
        .eq('user_id', session.user.id)
        .single()
      // Distinguish a genuine query error from a couple row that simply has no nationality set.
      // supabase-js returns error.code 'PGRST116' when .single() finds no rows.
      if (error && error.code !== 'PGRST116') {
        setFetchError(true)
        setLoading(false)
        return
      }
      if (error?.code === 'PGRST116' || !data) {
        setMissingCoupleRow(true)
        setLoading(false)
        return
      }
      setCouple(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Network error or unexpected Supabase failure
  if (fetchError) return <LoadError />
  if (missingCoupleRow) return <CoupleProfileUnavailable />

  // ── Derive state (same logic as mobile documents.tsx) ──────────────────────

  const nationality = couple?.nationality ?? null
  const countryCode = couple?.country_of_origin ?? null
  const ceremony = couple?.ceremony_type ?? null      // null = unset
  const weddingDate = couple?.wedding_date ?? null

  // Genuine incomplete profile: couple row exists but nationality was never saved
  if (!nationality) return <ProfileIncomplete />

  if (nationality === 'italian') return <ItalianCouple ceremony={ceremony} />

  // Foreign couple
  const isSymbolic = ceremony === 'symbolic'
  if (isSymbolic) {
    const countryDoc = countryCode && countryCode !== 'other'
      ? (COUNTRIES.find(c => c.code === countryCode) ?? null)
      : null
    return <SymbolicForeign countryDoc={countryDoc} />
  }

  // Foreign + civil / religious, or ceremony unset (falls through to civil guide with nudge banner)
  const ceremonyUnset = ceremony === null
  const countryDoc = countryCode && countryCode !== 'other'
    ? (COUNTRIES.find(c => c.code === countryCode) ?? null)
    : null
  const isOther = !countryDoc
  const urgentDocs = !!(
    countryDoc?.difficulty === 'complex' &&
    weddingDate &&
    daysUntil(weddingDate) > 0 &&
    daysUntil(weddingDate) < 90
  )

  return (
    <ForeignWithCivil
      countryDoc={countryDoc}
      ceremony={ceremony}
      isOther={isOther}
      urgentDocs={urgentDocs}
      ceremonyUnset={ceremonyUnset}
    />
  )
}
