'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getT } from '../../../lib/translations'
import {
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

function useLocale() {
  const [locale, setLocale] = useState('en')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (!navigator.language.startsWith('en')) setLocale('it')
  }, [])
  return locale
}

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

export default function ProfilePage() {
  const locale = useLocale()
  const d = getT(locale)
  const c = (d as any).couple

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [missingProfile, setMissingProfile] = useState(false)

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
        .select('partner1, partner2, wedding_date, budget, wedding_city, wedding_region, wedding_regione, wedding_province, wedding_style, ceremony_type, wedding_size, nationality')
        .eq('user_id', session.user.id)
        .single()
      if (error) {
        if (error.code === 'PGRST116') setMissingProfile(true)
        else setFetchError(true)
        setLoading(false)
        return
      }
      if (!data) {
        setMissingProfile(true)
        setLoading(false)
        return
      }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CoupleLoadingBlock />

  const location = profile
    ? [profile.wedding_city, profile.wedding_province, profile.wedding_regione].filter(Boolean).join(' · ')
    : ''

  const rows = profile ? [
    { label: c.profile.partner1, value: profile.partner1 },
    { label: c.profile.partner2, value: profile.partner2 },
    { label: c.profile.weddingDate, value: profile.wedding_date ? formatDate(profile.wedding_date, locale) : null },
    { label: c.profile.location, value: location || null },
    { label: c.profile.style, value: profile.wedding_style ? (STYLE_LABELS[profile.wedding_style]?.[locale] ?? profile.wedding_style) : null },
    { label: c.profile.ceremony, value: profile.ceremony_type ? (CEREMONY_LABELS[profile.ceremony_type]?.[locale] ?? profile.ceremony_type) : null },
  ].filter(r => r.value) : []

  return (
    <div>
      <CouplePageIntro
        eyebrow={c.profile.label}
        title={c.profile.title}
        subtitle={locale === 'en' ? 'The profile that anchors documents, planning, and the rest of your couple area.' : 'Il profilo che tiene insieme documenti, planning e il resto della vostra area coppia.'}
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
            : 'Il profilo coppia non e ancora disponibile sul web. Completa o verifica la configurazione nell app VELO e apparira qui.'}
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
                {locale === 'en' ? 'This profile shapes your documents path, checklist logic, and planning flow.' : 'Questo profilo definisce il percorso documenti, la logica checklist e il flusso del planning.'}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--velo-muted)]">
                {locale === 'en'
                  ? 'Keep it accurate in the VELO app so the rest of the couple area stays aligned.'
                  : "Tienilo aggiornato nell'app VELO cosi il resto dell area coppia resta coerente."}
              </p>
            </CouplePanel>

            <CouplePanel tone="dark">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d7b89d]" style={{ fontFamily: VELO_MONO_FONT }}>
                {locale === 'en' ? 'Editing' : 'Modifiche'}
              </p>
              <p className="mt-3 text-[1.2rem] leading-snug text-[var(--velo-paper-2)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                {locale === 'en' ? 'Profile edits still live in the app.' : 'Le modifiche al profilo restano nell app.'}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#d2c3b0]">{c.profile.editInApp}</p>
            </CouplePanel>
          </div>
        </div>
      )}
    </div>
  )
}
