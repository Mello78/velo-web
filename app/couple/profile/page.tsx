'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { getT } from '../../../lib/translations'

function useLocale() {
  const [locale, setLocale] = useState('it')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (navigator.language.startsWith('en')) setLocale('en')
  }, [])
  return locale
}

const STYLE_LABELS: Record<string, Record<string, string>> = {
  botanical:  { it: 'Botanico',    en: 'Botanical' },
  coastal:    { it: 'Costiero',    en: 'Coastal' },
  luxury:     { it: 'Lusso',       en: 'Luxury' },
  modern:     { it: 'Moderno',     en: 'Modern' },
  romantic:   { it: 'Romantico',   en: 'Romantic' },
  rustic:     { it: 'Rustico',     en: 'Rustic' },
}

const CEREMONY_LABELS: Record<string, Record<string, string>> = {
  civil:      { it: 'Civile',     en: 'Civil' },
  religious:  { it: 'Religioso',  en: 'Religious' },
  symbolic:   { it: 'Simbolico',  en: 'Symbolic' },
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.profile.label}</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>{c.profile.title}</h1>
        </div>
        <div style={{ background: 'rgba(196,117,106,0.06)', border: '1px solid rgba(196,117,106,0.2)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>
            {locale === 'en' ? 'Unable to load your profile' : 'Impossibile caricare il profilo'}
          </div>
          <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>
            {locale === 'en'
              ? 'We could not retrieve your couple details. This may be a temporary connection issue. Try refreshing the page.'
              : 'Non siamo riusciti a recuperare i dati della coppia. Potrebbe essere un problema temporaneo di connessione. Prova ad aggiornare la pagina.'}
          </div>
        </div>
      </div>
    )
  }

  if (missingProfile || !profile) {
    return (
      <div>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.profile.label}</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>{c.profile.title}</h1>
        </div>
        <div style={{ background: '#1A1915', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: '24px 24px 22px' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 10 }}>
            {locale === 'en' ? 'Complete your profile first' : 'Completa prima il profilo'}
          </div>
          <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.8 }}>
            {locale === 'en'
              ? 'Your couple profile is not available on web yet. Complete or verify your setup in the VELO app and it will appear here.'
              : 'Il profilo coppia non è ancora disponibile sul web. Completa o verifica la configurazione nell’app VELO e apparirà qui.'}
          </div>
        </div>
      </div>
    )
  }

  const location = [profile.wedding_city, profile.wedding_province, profile.wedding_regione].filter(Boolean).join(' · ')

  const rows = [
    { label: c.profile.partner1,    value: profile.partner1 },
    { label: c.profile.partner2,    value: profile.partner2 },
    { label: c.profile.weddingDate, value: profile.wedding_date ? formatDate(profile.wedding_date, locale) : null },
    { label: c.profile.location,    value: location || null },
    { label: c.profile.style,       value: profile.wedding_style ? (STYLE_LABELS[profile.wedding_style]?.[locale] ?? profile.wedding_style) : null },
    { label: c.profile.ceremony,    value: profile.ceremony_type ? (CEREMONY_LABELS[profile.ceremony_type]?.[locale] ?? profile.ceremony_type) : null },
  ].filter(r => r.value)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.profile.label}</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>{c.profile.title}</h1>
      </div>

      {/* Profile card */}
      <div style={{ background: '#1A1915', border: '1px solid #2A2820', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px',
            borderBottom: i < rows.length - 1 ? '1px solid #1E1D1A' : 'none',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase' }}>{row.label}</div>
            <div style={{ fontSize: 14, color: '#F5EDD6', textAlign: 'right', maxWidth: '60%' }}>{row.value}</div>
          </div>
        ))}

        {profile.budget != null && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase' }}>Budget</div>
            <div style={{ fontSize: 14, color: '#C9A84C', fontWeight: 600 }}>{formatBudget(profile.budget)}</div>
          </div>
        )}
      </div>

      {/* Edit in app notice */}
      <div style={{
        border: '1px solid #2A2820',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A7E6A" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: 13, color: '#8A7E6A' }}>{c.profile.editInApp}</span>
      </div>
    </div>
  )
}
