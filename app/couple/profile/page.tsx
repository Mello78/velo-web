'use client'
import { useEffect, useState } from 'react'
import { getCoupleLocale, getPreferredSiteLocale, persistCoupleLocale } from '../../../lib/couple-locale'
import { supabase } from '../../../lib/supabase'
import { getT, type Locale } from '../../../lib/translations'
import {
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

const STYLE_LABELS: Record<string, Record<string, string>> = {
  botanical: { it: 'Botanico', en: 'Botanical' },
  coastal: { it: 'Costiero', en: 'Coastal' },
  luxury: { it: 'Lusso', en: 'Luxury' },
  modern: { it: 'Moderno', en: 'Modern' },
  romantic: { it: 'Romantico', en: 'Romantic' },
  rustic: { it: 'Rustico', en: 'Rustic' },
}

const CEREMONY_LABELS: Record<string, Record<string, string>> = {
  civil: { it: 'Civile', en: 'Civil' },
  religious: { it: 'Religioso', en: 'Religious' },
  symbolic: { it: 'Simbolico', en: 'Symbolic' },
}

interface ProfileData {
  id: string
  partner1: string | null
  partner2: string | null
  wedding_date: string | null
  budget: number | null
  wedding_city: string | null
  wedding_region: string | null
  wedding_regione: string | null
  wedding_province: string | null
  wedding_style: string | null
  ceremony_type: string | null
  wedding_size: string | null
  nationality: string | null
  country_of_origin: string | null
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatBudget(n: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function ProfileRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--velo-border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
        {label}
      </div>
      <div className={`text-sm leading-7 sm:max-w-[55%] sm:text-right ${accent ? 'text-[var(--velo-terracotta)]' : 'text-[var(--velo-ink)]'}`}>
        {value}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)] mb-1.5" style={{ fontFamily: VELO_MONO_FONT }}>
      {children}
    </label>
  )
}

export default function ProfilePage() {
  const [locale, setLocale] = useState<Locale>('en')
  const d = getT(locale)
  const c = (d as any).couple

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [missingProfile, setMissingProfile] = useState(false)

  // Edit form state — only for the 3 editable fields
  const [editDate, setEditDate] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [editCeremony, setEditCeremony] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [budgetError, setBudgetError] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setFetchError(true)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('couples')
        .select('id, partner1, partner2, wedding_date, budget, wedding_city, wedding_region, wedding_regione, wedding_province, wedding_style, ceremony_type, wedding_size, nationality, country_of_origin')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) {
        setFetchError(true)
        setLoading(false)
        return
      }
      if (!data) {
        setMissingProfile(true)
        setLoading(false)
        return
      }
      const fallbackLocale = getPreferredSiteLocale()
      const nextLocale = getCoupleLocale(data, fallbackLocale)
      persistCoupleLocale(nextLocale)
      setLocale(nextLocale)
      setProfile(data)
      // Seed the edit form from loaded data
      setEditDate(data.wedding_date ?? '')
      setEditBudget(data.budget != null ? String(data.budget) : '')
      setEditCeremony(data.ceremony_type ?? '')
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!profile) return

    // Validate budget
    const rawBudget = editBudget.trim()
    let parsedBudget: number | null = null
    if (rawBudget !== '') {
      const n = Number(rawBudget.replace(/[.,\s]/g, ''))
      if (!Number.isInteger(n) || n <= 0) {
        setBudgetError(true)
        return
      }
      parsedBudget = n
    }
    setBudgetError(false)
    setSaveState('saving')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaveState('error'); return }

    const patch = {
      wedding_date: editDate || null,
      budget: parsedBudget,
      ceremony_type: editCeremony || null,
    }

    const { error } = await supabase
      .from('couples')
      .update(patch)
      .eq('id', profile.id)

    if (error) {
      setSaveState('error')
      return
    }

    setProfile(prev => prev ? { ...prev, ...patch } : prev)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2500)
  }

  if (loading) return <CoupleLoadingBlock />

  const location = profile
    ? [profile.wedding_city, profile.wedding_province, profile.wedding_regione].filter(Boolean).join(' - ')
    : ''

  const rows = profile ? [
    { label: c.profile.partner1, value: profile.partner1 },
    { label: c.profile.partner2, value: profile.partner2 },
    { label: c.profile.weddingDate, value: profile.wedding_date ? formatDate(profile.wedding_date, locale) : null },
    { label: c.profile.location, value: location || null },
    { label: c.profile.style, value: profile.wedding_style ? (STYLE_LABELS[profile.wedding_style]?.[locale] ?? profile.wedding_style) : null },
    { label: c.profile.ceremony, value: profile.ceremony_type ? (CEREMONY_LABELS[profile.ceremony_type]?.[locale] ?? profile.ceremony_type) : null },
  ].filter(r => r.value) : []

  const inputBase = [
    'w-full rounded-xl border px-3 py-2.5 text-sm',
    'bg-[var(--velo-paper-2)] text-[var(--velo-ink)]',
    'border-[var(--velo-border)] focus:border-[var(--velo-terracotta)]',
    'outline-none transition-colors',
  ].join(' ')

  return (
    <div>
      <CouplePageIntro
        eyebrow={c.profile.label}
        title={c.profile.title}
        subtitle={locale === 'en' ? 'The profile that keeps documents, planning, and the rest of your couple area aligned.' : 'Il profilo che tiene allineati documenti, planning e il resto della vostra area coppia.'}
      />

      {fetchError && (
        <CoupleNotice title={locale === 'en' ? 'Unable to load your profile' : 'Impossibile caricare il profilo'} tone="danger">
          {locale === 'en'
            ? 'We could not retrieve your couple details. This may be temporary. Try refreshing the page.'
            : 'Non siamo riusciti a recuperare i dati della coppia. Potrebbe essere temporaneo. Prova ad aggiornare la pagina.'}
        </CoupleNotice>
      )}

      {missingProfile && !fetchError && (
        <CoupleNotice title={locale === 'en' ? 'Complete your profile first' : 'Completa prima il profilo'} tone="warning">
          {locale === 'en'
            ? 'Your couple profile is not available on web yet. Complete or verify your setup in the VELO app and it will appear here.'
            : "Il profilo coppia non e ancora disponibile sul web. Completa o verifica la configurazione nell'app VELO e apparira qui."}
        </CoupleNotice>
      )}

      {profile && (
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <CouplePanel>
            <div className="mb-2 flex items-center justify-between border-b border-[var(--velo-border)] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
                  {locale === 'en' ? 'Couple profile' : 'Profilo coppia'}
                </p>
                <p className="mt-2 text-[1.35rem] text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                  {[profile.partner1, profile.partner2].filter(Boolean).join(' & ') || c.profile.title}
                </p>
              </div>
            </div>
            <div>
              {rows.map((row) => (
                <ProfileRow key={row.label} label={row.label} value={row.value as string} />
              ))}
              {profile.budget != null && <ProfileRow label="Budget" value={formatBudget(profile.budget)} accent />}
            </div>
          </CouplePanel>

          <div className="space-y-5">
            <CouplePanel tone="soft">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
                {locale === 'en' ? 'Planning context' : 'Contesto planning'}
              </p>
              <p className="mt-3 text-[1.3rem] leading-snug text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                {locale === 'en' ? 'This profile helps shape your documents path, checklist logic, and planning flow.' : 'Questo profilo aiuta a tenere coerenti il percorso documenti, la logica checklist e il flusso del planning.'}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--velo-muted)]">
                {locale === 'en'
                  ? 'Keep it accurate in the VELO app so the rest of the couple area stays aligned.'
                  : "Tienilo aggiornato nell'app VELO cosi il resto dell'area coppia resta coerente."}
              </p>
            </CouplePanel>

            {/* Partial edit panel — date, budget, ceremony only */}
            <CouplePanel>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)] mb-2" style={{ fontFamily: VELO_MONO_FONT }}>
                {c.profile.editTitle}
              </p>
              <p className="text-sm leading-6 text-[var(--velo-muted)] mb-5">
                {c.profile.editNotice}
              </p>

              <div className="space-y-4">
                {/* Wedding date */}
                <div>
                  <FieldLabel>{c.profile.editDate}</FieldLabel>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => { setEditDate(e.target.value); setSaveState('idle') }}
                    className={inputBase}
                  />
                </div>

                {/* Budget */}
                <div>
                  <FieldLabel>{c.profile.editBudget}</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editBudget}
                    onChange={e => { setEditBudget(e.target.value); setBudgetError(false); setSaveState('idle') }}
                    placeholder={c.profile.editBudgetPlaceholder}
                    className={`${inputBase} ${budgetError ? 'border-[var(--velo-danger)]' : ''}`}
                  />
                  {budgetError && (
                    <p className="mt-1 text-[11px] text-[var(--velo-danger)]">{c.profile.editBudgetInvalid}</p>
                  )}
                </div>

                {/* Ceremony type */}
                <div>
                  <FieldLabel>{c.profile.editCeremony}</FieldLabel>
                  <select
                    value={editCeremony}
                    onChange={e => { setEditCeremony(e.target.value); setSaveState('idle') }}
                    className={`${inputBase} cursor-pointer`}
                  >
                    <option value="">{c.profile.editCeremonyNone}</option>
                    <option value="civil">{CEREMONY_LABELS.civil[locale]}</option>
                    <option value="religious">{CEREMONY_LABELS.religious[locale]}</option>
                    <option value="symbolic">{CEREMONY_LABELS.symbolic[locale]}</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saveState === 'saving'}
                  className="rounded-xl bg-[var(--velo-terracotta)] px-5 py-2.5 text-sm text-white transition-opacity disabled:opacity-60 hover:opacity-90"
                  style={{ fontFamily: VELO_MONO_FONT }}
                >
                  {saveState === 'saving' ? c.profile.editSaving : c.profile.editSave}
                </button>
                {saveState === 'saved' && (
                  <span className="text-sm text-[var(--velo-success)]">{c.profile.editSaved}</span>
                )}
                {saveState === 'error' && (
                  <span className="text-sm text-[var(--velo-danger)]">{c.profile.editError}</span>
                )}
              </div>
            </CouplePanel>
          </div>
        </div>
      )}
    </div>
  )
}
