'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { COUNTRIES, ITALY_REGIONS } from '../lib/countries'
import { cercaComuni } from '../lib/comuni'

// ─── Types & constants (mirrored from mobile app/onboarding.tsx) ──────────────

type StepKey = 'nationality' | 'region' | 'country' | 'names' | 'date' | 'budget' | 'style' | 'ceremony'
type Nationality = 'italian' | 'foreign' | ''

const WEDDING_STYLES = [
  { id: 'romantic',  it: 'Romantico',  en: 'Romantic',  itDesc: 'Rose, candele, ambientazioni storiche',              enDesc: 'Roses, candles, historic settings' },
  { id: 'luxury',    it: 'Luxury',     en: 'Luxury',    itDesc: 'Ville esclusive, dettagli preziosi',                 enDesc: 'Exclusive villas, precious details' },
  { id: 'rustic',    it: 'Rustico',    en: 'Rustic',    itDesc: 'Cascine, legno, fiori di campo',                     enDesc: 'Farmhouses, wood, wildflowers' },
  { id: 'botanical', it: 'Botanico',   en: 'Botanical', itDesc: 'Giardini, piante, palette verde',                    enDesc: 'Gardens, greenery, botanical palette' },
  { id: 'modern',    it: 'Moderno',    en: 'Modern',    itDesc: 'Linee pulite, minimalismo, design contemporaneo',    enDesc: 'Clean lines, minimalism, contemporary design' },
  { id: 'coastal',   it: 'Costiero',   en: 'Coastal',   itDesc: 'Mare, brezza, colori naturali',                      enDesc: 'Sea, breeze, natural tones' },
]

const BUDGET_RANGES = [
  { label: '< €15.000',          value: '12000'  },
  { label: '€15.000 – €30.000',  value: '22000'  },
  { label: '€30.000 – €50.000',  value: '40000'  },
  { label: '€50.000 – €80.000',  value: '65000'  },
  { label: '> €80.000',          value: '100000' },
]

const CEREMONY_TYPES = [
  { id: 'civil',     it: 'Civile',    en: 'Civil',     itDesc: 'Comune, valore legale',             enDesc: 'Town hall, legally binding' },
  { id: 'religious', it: 'Religioso', en: 'Religious', itDesc: 'Solo cattolico ha valore legale',   enDesc: 'Catholic only has legal value' },
  { id: 'symbolic',  it: 'Simbolico', en: 'Symbolic',  itDesc: 'Ovunque, nessun valore legale',     enDesc: 'Anywhere, no legal value' },
]

// ─── Step sequencing (same logic as mobile) ───────────────────────────────────

function getSteps(nat: Nationality): StepKey[] {
  if (nat === 'foreign') {
    return ['nationality', 'region', 'country', 'names', 'date', 'budget', 'style', 'ceremony']
  }
  return ['nationality', 'region', 'names', 'date', 'budget', 'style', 'ceremony']
}

// ─── Locale-aware copy ────────────────────────────────────────────────────────

function getCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    guidePhrase:      isIT ? 'Aiutiamo ogni coppia a creare il matrimonio più bello della vita.' : 'We help every couple plan the most beautiful wedding of their lives.',
    typeTitle:        isIT ? 'Chi siete?' : 'Who are you?',
    italianCouple:    isIT ? 'Coppia italiana' : 'Italian couple',
    italianCoupleDesc: isIT ? 'Matrimonio in Italia, documenti italiani' : 'Getting married in Italy with Italian documents',
    destinationWedding: isIT ? 'Destination Wedding' : 'Destination Wedding',
    destDesc:         isIT ? 'Vi sposate in Italia da un altro paese' : 'Getting married in Italy from abroad',
    regionTitle:      isIT ? 'Dove vi sposate?' : 'Where in Italy?',
    regionDescIt:     isIT ? 'Cercate il comune — la zona VELO verrà selezionata automaticamente.' : 'Search your comune — the VELO area will be selected automatically.',
    regionDescForeign: isIT ? 'Selezionate la zona che preferite, o cercate un comune.' : 'Select your preferred area, or search for a specific comune.',
    cityLabel:        isIT ? 'Comune' : 'City / Comune',
    cityPh:           isIT ? 'Es. Firenze, Positano...' : 'e.g. Florence, Positano...',
    cityHint:         isIT ? 'Digitate almeno 2 lettere' : 'Type at least 2 characters',
    zoneLabel:        isIT ? 'Zona VELO' : 'VELO Area',
    countryTitle:     isIT ? 'Di dove siete?' : 'Where are you from?',
    countryDesc:      isIT ? 'Determina i documenti necessari per sposarsi in Italia.' : 'Determines the documents required to marry in Italy.',
    countryOther:     isIT ? 'Altro paese' : 'Other country',
    namesTitle:       isIT ? 'Come vi chiamate?' : 'What are your names?',
    partner1Label:    isIT ? 'Primo partner' : 'First partner',
    partner1Ph:       isIT ? 'Es. Sofia' : 'e.g. Sofia',
    partner2Label:    isIT ? 'Secondo partner' : 'Second partner',
    partner2Ph:       isIT ? 'Es. Luca' : 'e.g. Luca',
    dateTitle:        isIT ? 'Quando vi sposate?' : 'When is the wedding?',
    dateLabel:        isIT ? 'Data del matrimonio' : 'Wedding date',
    dateHint:         isIT ? 'Potrete modificarla dal vostro profilo.' : 'You can change this later from your profile.',
    budgetTitle:      isIT ? 'Qual è il vostro budget?' : 'What is your budget?',
    budgetDesc:       isIT ? 'Media in Italia: €25.000–€45.000. È un punto di partenza, non un limite.' : 'Average in Italy: €25,000–€45,000. A starting point, not a limit.',
    budgetCustomLabel: isIT ? 'O inserite un importo preciso' : 'Or enter a specific amount',
    styleTitle:       isIT ? 'Che stile immaginate?' : 'What is your style?',
    styleDesc:        isIT ? 'Aiuta VELO a suggerire fornitori in linea con la vostra visione.' : 'Helps VELO suggest vendors aligned with your vision.',
    ceremonyTitle:    isIT ? 'Tipo di cerimonia' : 'Ceremony type',
    ceremonyDesc:     isIT ? 'Determina la guida documenti e il percorso di planning.' : 'Determines the document guide and planning path.',
    ceremonyReligiousNote: isIT ? 'Solo la cerimonia cattolica ha valore legale in Italia.' : 'Only the Catholic ceremony has legal value in Italy.',
    ceremonySymbolicNote:  isIT ? 'La cerimonia simbolica non ha valore legale. Spesso si abbina a un rito civile.' : 'The symbolic ceremony has no legal value. Often combined with a civil ceremony.',
    ceremonyOptional: isIT ? 'Potete scegliere in seguito' : 'You can decide later',
    continueBtn:      isIT ? 'Continua' : 'Continue',
    startBtn:         isIT ? 'Inizia il planning' : 'Start planning',
    stepLabel:        isIT ? 'PASSO' : 'STEP',
    stepOf:           isIT ? 'di' : 'of',
    saving:           isIT ? 'Creazione del profilo...' : 'Creating your profile...',
    saveError:        isIT ? 'Errore durante il salvataggio. Riprova.' : 'Error saving your profile. Please try again.',
  }
}

type Copy = ReturnType<typeof getCopy>

function getStepTitle(step: StepKey, copy: Copy): string {
  const map: Record<StepKey, string> = {
    nationality: copy.typeTitle,
    region:      copy.regionTitle,
    country:     copy.countryTitle,
    names:       copy.namesTitle,
    date:        copy.dateTitle,
    budget:      copy.budgetTitle,
    style:       copy.styleTitle,
    ceremony:    copy.ceremonyTitle,
  }
  return map[step]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeSeason(dateStr: string): string {
  const m = new Date(dateStr).getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChoiceCard({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 18px', marginBottom: 10,
        background: active ? 'rgba(201,168,76,0.07)' : '#1A1915',
        border: `1px solid ${active ? '#C9A84C' : '#2A2820'}`,
        borderRadius: 12, cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      {children}
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        {active && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 5" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialLocale: string
  onComplete: () => void
}

type ExistingCoupleRow = { id: string }

export default function CoupleOnboarding({ initialLocale, onComplete }: Props) {
  const [locale, setLocale] = useState(initialLocale)
  const copy = getCopy(locale)

  // Step state
  const [stepIndex, setStepIndex] = useState(0)

  // Form state (mirrored from mobile onboarding.tsx)
  const [nationality, setNationality] = useState<Nationality>('')
  const [weddingRegion, setWeddingRegion]   = useState('')
  const [weddingCity, setWeddingCity]       = useState('')
  const [weddingProvince, setWeddingProvince] = useState('')
  const [weddingRegione, setWeddingRegione] = useState('')
  const [comuni, setComuni] = useState<{ nome: string; provincia: string; regione: string; veloZona: string }[]>([])
  const [countryCode, setCountryCode] = useState('other')
  const [partner1, setPartner1] = useState('')
  const [partner2, setPartner2] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [budget, setBudget] = useState('')
  const [wStyle, setWStyle]     = useState('')
  const [wCeremony, setWCeremony] = useState('')
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const steps = getSteps(nationality)
  const totalSteps = steps.length
  const currentStep = steps[stepIndex]

  // ─── Navigation guard (same as mobile canProceed) ──────────────────────────

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'nationality': return nationality !== ''
      case 'region':      return weddingRegion !== '' || weddingCity.trim() !== ''
      case 'names':       return partner1.trim().length > 0 && partner2.trim().length > 0
      case 'budget':      return budget.trim().length > 0
      case 'style':       return wStyle !== ''
      default:            return true // country, date, ceremony: optional
    }
  }

  // ─── Nationality selection — mirrors setLang in mobile ────────────────────

  const selectNationality = (nat: Nationality) => {
    setNationality(nat)
    const newLocale = nat === 'italian' ? 'it' : 'en'
    setLocale(newLocale)
    // Persist cookie so CoupleShell re-reads correct locale after onboarding
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
  }

  // ─── Comune autocomplete ──────────────────────────────────────────────────

  const handleCityChange = (v: string) => {
    setWeddingCity(v)
    setComuni(cercaComuni(v))
  }

  const selectComune = (c: { nome: string; provincia: string; regione: string; veloZona: string }) => {
    setWeddingCity(c.nome)
    setWeddingProvince(c.provincia)
    setWeddingRegione(c.regione)
    setComuni([])
    if (c.veloZona) setWeddingRegion(c.veloZona)
  }

  const fetchExistingCouple = async (userId: string): Promise<ExistingCoupleRow | null> => {
    const { data, error } = await supabase
      .from('couples')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  }

  // ─── Save — writes to couples table, same fields as mobile ───────────────

  const save = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      const userId = session.user.id
      const payload = {
        user_id:         userId,
        partner1:        partner1.trim(),
        partner2:        partner2.trim(),
        wedding_date:    weddingDate || null,
        budget:          budget ? (parseInt(budget) || null) : null,
        nationality:     nationality || null,
        country_of_origin: nationality === 'foreign' ? countryCode : null,
        wedding_region:  weddingRegion || null,
        wedding_style:   wStyle || null,
        ceremony_type:   wCeremony || null,
        wedding_city:    weddingCity || null,
        wedding_province: weddingProvince || null,
        wedding_regione: weddingRegione || null,
        wedding_season:  weddingDate ? computeSeason(weddingDate) : null,
      }

      const existingCouple = await fetchExistingCouple(userId)
      if (existingCouple) {
        const { error: updateError } = await supabase
          .from('couples')
          .update(payload)
          .eq('id', existingCouple.id)

        if (updateError) throw updateError
        onComplete()
        return
      }

      const { error: insertError } = await supabase.from('couples').insert(payload)
      if (insertError) {
        const recoveredCouple = await fetchExistingCouple(userId)
        if (!recoveredCouple) throw insertError

        const { error: recoveryUpdateError } = await supabase
          .from('couples')
          .update(payload)
          .eq('id', recoveredCouple.id)

        if (recoveryUpdateError) throw recoveryUpdateError
      }

      onComplete()
    } catch {
      setSaveError(copy.saveError)
      setSaving(false)
    }
  }

  // ─── Step navigation ──────────────────────────────────────────────────────

  const next = () => {
    if (stepIndex < totalSteps - 1) { setStepIndex(stepIndex + 1) }
    else { save() }
  }

  const back = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1) }

  // ─── Styles ───────────────────────────────────────────────────────────────

  const fieldDesc: React.CSSProperties = { fontSize: 13, color: '#8A7E6A', marginBottom: 16, lineHeight: 1.7 }
  const fieldLabel: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8, marginTop: 18 }
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0F0E0C', border: '1px solid #2A2820', borderRadius: 10,
    padding: '13px 14px', color: '#F5EDD6', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const hintStyle: React.CSSProperties = { fontSize: 11, color: '#5A5040', marginTop: 6 }
  const noteBoxStyle: React.CSSProperties = {
    background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 10, padding: '12px 14px', marginTop: 10,
    fontSize: 12, color: '#C8B99A', lineHeight: 1.7,
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 24px 80px' }}>
      <div style={{ width: '100%', maxWidth: 540 }}>

        {/* VELO wordmark */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 300, letterSpacing: 8, color: '#C9A84C' }}>VELO</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#8A7E6A', marginTop: 3, textTransform: 'uppercase' }}>Wedding</div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= stepIndex ? '#C9A84C' : '#2A2820',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step counter */}
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', marginBottom: 6 }}>
          {copy.stepLabel} {stepIndex + 1} {copy.stepOf} {totalSteps}
        </div>

        {/* Step title */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 30, fontWeight: 300, color: '#F5EDD6', margin: '0 0 6px', lineHeight: 1.3 }}>
          {getStepTitle(currentStep, copy)}
        </h1>

        {/* Guide phrase on first step */}
        {stepIndex === 0 && (
          <p style={{ fontSize: 13, color: '#8A7E6A', marginBottom: 28, lineHeight: 1.7, fontStyle: 'italic' }}>
            {copy.guidePhrase}
          </p>
        )}

        <div style={{ height: 24 }} />

        {/* ── STEP: nationality ─────────────────────────────────────────────── */}
        {currentStep === 'nationality' && (
          <div>
            <ChoiceCard active={nationality === 'italian'} onClick={() => selectNationality('italian')}>
              <span style={{ fontSize: 26 }}>🇮🇹</span>
              <div>
                <div style={{ fontSize: 15, color: nationality === 'italian' ? '#F5EDD6' : '#8A7E6A', fontWeight: 500, marginBottom: 3 }}>
                  {copy.italianCouple}
                </div>
                <div style={{ fontSize: 12, color: '#5A5040' }}>{copy.italianCoupleDesc}</div>
              </div>
            </ChoiceCard>
            <ChoiceCard active={nationality === 'foreign'} onClick={() => selectNationality('foreign')}>
              <span style={{ fontSize: 26 }}>🌍</span>
              <div>
                <div style={{ fontSize: 15, color: nationality === 'foreign' ? '#F5EDD6' : '#8A7E6A', fontWeight: 500, marginBottom: 3 }}>
                  {copy.destinationWedding}
                </div>
                <div style={{ fontSize: 12, color: '#5A5040' }}>{copy.destDesc}</div>
              </div>
            </ChoiceCard>
          </div>
        )}

        {/* ── STEP: region ──────────────────────────────────────────────────── */}
        {currentStep === 'region' && (
          <div>
            <p style={fieldDesc}>{nationality === 'foreign' ? copy.regionDescForeign : copy.regionDescIt}</p>

            {/* Comune autocomplete */}
            <label style={fieldLabel}>{copy.cityLabel}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={weddingCity}
                onChange={e => handleCityChange(e.target.value)}
                placeholder={copy.cityPh}
                style={inputStyle}
                autoComplete="off"
              />
              {comuni.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: '#1A1915', border: '1px solid #C9A84C', borderTop: 'none',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden',
                }}>
                  {comuni.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => selectComune(c)}
                      style={{
                        width: '100%', padding: '11px 14px', background: 'none',
                        border: 'none', borderTop: i > 0 ? '1px solid #2A2820' : 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: 14, color: '#F5EDD6', fontWeight: 500 }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: '#8A7E6A', marginTop: 2 }}>{c.provincia} · {c.regione}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p style={hintStyle}>{copy.cityHint}</p>

            {/* VELO zone grid */}
            <label style={fieldLabel}>{copy.zoneLabel}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
              {ITALY_REGIONS.map(r => (
                <button
                  key={r.name}
                  onClick={() => setWeddingRegion(r.name)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    background: weddingRegion === r.name ? 'rgba(201,168,76,0.08)' : '#1A1915',
                    border: `1px solid ${weddingRegion === r.name ? '#C9A84C' : '#2A2820'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 12, color: weddingRegion === r.name ? '#F5EDD6' : '#8A7E6A', fontWeight: 500 }}>
                    {r.name}
                  </div>
                  {nationality === 'foreign' && (
                    <div style={{ fontSize: 10, color: '#5A5040', marginTop: 2 }}>{r.desc}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: country ─────────────────────────────────────────────────── */}
        {currentStep === 'country' && (
          <div>
            <p style={fieldDesc}>{copy.countryDesc}</p>
            {COUNTRIES.map(co => (
              <button
                key={co.code}
                onClick={() => setCountryCode(co.code)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', marginBottom: 6,
                  background: countryCode === co.code ? 'rgba(201,168,76,0.07)' : '#1A1915',
                  border: `1px solid ${countryCode === co.code ? '#C9A84C' : '#2A2820'}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{co.flag}</span>
                <span style={{ flex: 1, fontSize: 14, color: countryCode === co.code ? '#F5EDD6' : '#8A7E6A' }}>{co.name}</span>
                <span style={{
                  fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
                  background: co.difficulty === 'complex' ? 'rgba(196,117,106,0.15)' : co.difficulty === 'easy' ? 'rgba(122,158,126,0.15)' : 'rgba(201,168,76,0.10)',
                  color: co.difficulty === 'complex' ? '#C4756A' : co.difficulty === 'easy' ? '#7A9E7E' : '#C9A84C',
                }}>
                  {co.difficulty}
                </span>
              </button>
            ))}
            <button
              onClick={() => setCountryCode('other')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', marginBottom: 6,
                background: countryCode === 'other' ? 'rgba(201,168,76,0.07)' : '#1A1915',
                border: `1px solid ${countryCode === 'other' ? '#C9A84C' : '#2A2820'}`,
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>🌐</span>
              <span style={{ flex: 1, fontSize: 14, color: countryCode === 'other' ? '#F5EDD6' : '#8A7E6A' }}>{copy.countryOther}</span>
            </button>
          </div>
        )}

        {/* ── STEP: names ───────────────────────────────────────────────────── */}
        {currentStep === 'names' && (
          <div>
            <label style={fieldLabel}>{copy.partner1Label}</label>
            <input
              type="text"
              value={partner1}
              onChange={e => setPartner1(e.target.value)}
              placeholder={copy.partner1Ph}
              style={inputStyle}
              autoFocus
            />
            <label style={fieldLabel}>{copy.partner2Label}</label>
            <input
              type="text"
              value={partner2}
              onChange={e => setPartner2(e.target.value)}
              placeholder={copy.partner2Ph}
              style={inputStyle}
            />
          </div>
        )}

        {/* ── STEP: date ────────────────────────────────────────────────────── */}
        {currentStep === 'date' && (
          <div>
            <label style={fieldLabel}>{copy.dateLabel}</label>
            <input
              type="date"
              value={weddingDate}
              onChange={e => setWeddingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
            <p style={hintStyle}>{copy.dateHint}</p>
          </div>
        )}

        {/* ── STEP: budget ──────────────────────────────────────────────────── */}
        {currentStep === 'budget' && (
          <div>
            <p style={fieldDesc}>{copy.budgetDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {BUDGET_RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setBudget(r.value)}
                  style={{
                    padding: '14px 18px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    background: budget === r.value ? 'rgba(201,168,76,0.08)' : '#1A1915',
                    border: `1px solid ${budget === r.value ? '#C9A84C' : '#2A2820'}`,
                    fontSize: 14, color: budget === r.value ? '#F5EDD6' : '#8A7E6A',
                    fontWeight: budget === r.value ? 500 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <label style={fieldLabel}>{copy.budgetCustomLabel}</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="35000"
              style={inputStyle}
            />
          </div>
        )}

        {/* ── STEP: style ───────────────────────────────────────────────────── */}
        {currentStep === 'style' && (
          <div>
            <p style={fieldDesc}>{copy.styleDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {WEDDING_STYLES.map(s => (
                <ChoiceCard key={s.id} active={wStyle === s.id} onClick={() => setWStyle(s.id)}>
                  <div>
                    <div style={{ fontSize: 14, color: wStyle === s.id ? '#F5EDD6' : '#8A7E6A', fontWeight: 500, marginBottom: 3 }}>
                      {locale === 'it' ? s.it : s.en}
                    </div>
                    <div style={{ fontSize: 12, color: '#5A5040' }}>
                      {locale === 'it' ? s.itDesc : s.enDesc}
                    </div>
                  </div>
                </ChoiceCard>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: ceremony ────────────────────────────────────────────────── */}
        {currentStep === 'ceremony' && (
          <div>
            <p style={fieldDesc}>{copy.ceremonyDesc}</p>
            {CEREMONY_TYPES.map(ct => (
              <div key={ct.id}>
                <ChoiceCard active={wCeremony === ct.id} onClick={() => setWCeremony(ct.id)}>
                  <div>
                    <div style={{ fontSize: 14, color: wCeremony === ct.id ? '#F5EDD6' : '#8A7E6A', fontWeight: 500, marginBottom: 3 }}>
                      {locale === 'it' ? ct.it : ct.en}
                    </div>
                    <div style={{ fontSize: 12, color: '#5A5040' }}>
                      {locale === 'it' ? ct.itDesc : ct.enDesc}
                    </div>
                  </div>
                </ChoiceCard>
                {wCeremony === ct.id && ct.id === 'religious' && (
                  <div style={noteBoxStyle}>{copy.ceremonyReligiousNote}</div>
                )}
                {wCeremony === ct.id && ct.id === 'symbolic' && (
                  <div style={noteBoxStyle}>{copy.ceremonySymbolicNote}</div>
                )}
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#5A5040', marginTop: 16, textAlign: 'center' }}>
              {copy.ceremonyOptional}
            </p>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div style={{
            marginTop: 16, padding: '12px 14px',
            background: 'rgba(196,117,106,0.10)', border: '1px solid rgba(196,117,106,0.3)',
            borderRadius: 8, fontSize: 13, color: '#C4756A',
          }}>
            {saveError}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
          {stepIndex > 0 && (
            <button
              onClick={back}
              disabled={saving}
              style={{
                padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
                background: 'transparent', border: '1px solid #2A2820',
                color: '#8A7E6A', fontSize: 13,
              }}
            >
              ←
            </button>
          )}
          <button
            onClick={next}
            disabled={!canProceed() || saving}
            style={{
              flex: 1, padding: '14px', borderRadius: 10, cursor: canProceed() && !saving ? 'pointer' : 'default',
              background: canProceed() && !saving ? '#C9A84C' : '#2A2820',
              border: 'none',
              color: canProceed() && !saving ? '#0F0E0C' : '#5A5040',
              fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            {saving ? copy.saving : stepIndex < totalSteps - 1 ? copy.continueBtn : copy.startBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
