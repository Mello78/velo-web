'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type EngagementStatus = 'lead' | 'quote_sent' | 'agreed' | 'booked' | 'completed' | 'cancelled'

interface VendorRow {
  id: string
  name: string
  category: string
  location: string
  price_from: string | null
  rating: number | null
  public_vendor_id: string | null
}

interface EngagementRow {
  id: string
  vendor_id: string
  status: EngagementStatus
}

interface PublicVendorRow {
  id: string
  photo1_url: string | null
  logo_url: string | null
  verified: boolean
  review_count: number | null
  description: string | null
  description_en: string | null
  region: string | null
  instagram: string | null
  website: string | null
}

interface VendorCard {
  id: string
  name: string
  category: string
  location: string
  price_from: string | null
  rating: number | null
  status: EngagementStatus
  engagementId: string | null
  photo1_url: string | null
  logo_url: string | null
  verified: boolean
  review_count: number
  instagram: string | null
  website: string | null
}

// ─── Status config — mirrored from mobile vendors.tsx STATUS_CONFIG ───────────
// Colors/bg/border only — labels are locale-aware via copy.statusLabel()

const STATUS_CONFIG: Record<EngagementStatus, { color: string; bg: string; border: string }> = {
  lead:       { color: '#8A7E6A', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.2)' },
  quote_sent: { color: '#4A7AB8', bg: 'rgba(74,122,184,0.10)',  border: 'rgba(74,122,184,0.25)' },
  agreed:     { color: '#C9A84C', bg: 'rgba(201,168,76,0.10)',  border: 'rgba(201,168,76,0.35)' },
  booked:     { color: '#7A9E7E', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' },
  completed:  { color: '#7A9E7E', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.2)'  },
  cancelled:  { color: '#C4756A', bg: 'rgba(196,117,106,0.08)', border: 'rgba(196,117,106,0.2)'  },
}

// Pipeline order for display — active statuses first, then terminal
const PIPELINE_ORDER: EngagementStatus[] = ['booked', 'agreed', 'quote_sent', 'lead', 'completed', 'cancelled']

// ─── Locale helper ────────────────────────────────────────────────────────────

function useLocale() {
  const [locale, setLocale] = useState('en')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (!navigator.language.startsWith('en')) setLocale('it')
  }, [])
  return locale
}

// ─── Locale-aware copy ────────────────────────────────────────────────────────

function getVendorsCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel:      isIT ? 'FORNITORI'   : 'VENDORS',
    pageTitle:      isIT ? 'I vostri fornitori' : 'Your vendors',
    filterAll:      isIT ? 'Tutti'       : 'All',
    readOnly:       isIT ? 'Vista in sola lettura — usa l\'app VELO per gestire i fornitori' : 'Read-only view — use the VELO app to manage vendors and advance status',
    agreedNudge:    isIT ? 'Accordo raggiunto — apri l\'app VELO per confermare e bloccare la data.' : 'Agreement reached — open the VELO app to confirm and lock in this vendor.',
    emptyTitle:     isIT ? 'Nessun fornitore' : 'No vendors yet',
    emptyDesc:      isIT ? 'Sfoglia e aggiungi fornitori dall\'app VELO — la lista apparirà qui.' : 'Browse and add vendors in the VELO app — your list will appear here.',
    errorTitle:     isIT ? 'Impossibile caricare i fornitori' : 'Unable to load vendors',
    errorDesc:      isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
    engErrorTitle:  isIT ? 'Stato fornitori non disponibile' : 'Vendor status unavailable',
    engErrorDesc:   isIT ? 'Non è stato possibile caricare lo stato degli engagement. Riprova più tardi.' : 'Engagement status could not be loaded. Please try again later.',
    pubPartialDesc: isIT ? 'Alcuni dettagli fornitore non sono disponibili.' : 'Some vendor details could not be loaded.',
    partnerBadge:   isIT ? 'Partner VELO' : 'VELO Partner',
    instagramTitle: isIT ? 'Instagram' : 'Instagram',
    websiteTitle:   isIT ? 'Sito web' : 'Website',
    statusLabel: (status: EngagementStatus): string => {
      const map: Record<EngagementStatus, [string, string]> = {
        lead:       ['Aggiunto',             'Added'],
        quote_sent: ['Preventivo richiesto', 'Quote requested'],
        agreed:     ['Accordo raggiunto',    'Agreement reached'],
        booked:     ['Confermato',           'Confirmed'],
        completed:  ['Completato',           'Completed'],
        cancelled:  ['Annullato',            'Cancelled'],
      }
      return isIT ? map[status][0] : map[status][1]
    },
  }
}

type VendorsCopy = ReturnType<typeof getVendorsCopy>

// ─── Category icon — strip emoji prefix from mobile category strings ──────────
// Mobile uses e.g. "📷 Fotografia", "🎵 Musica" — extract the leading emoji

function categoryEmoji(category: string): string {
  const match = category.match(/^[^\u0000-\u007F]+/)
  return match ? match[0].trim() : '◈'
}

function categoryLabel(category: string): string {
  return category.replace(/^[^\u0000-\u007F\w]*/, '').trim() || category
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status, label }: { status: EngagementStatus; label: string }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function ErrorBanner({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      background: 'rgba(196,117,106,0.06)', border: '1px solid rgba(196,117,106,0.2)',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <div style={{ fontSize: 13, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function PipelineSummary({ vendors, copy }: { vendors: VendorCard[]; copy: VendorsCopy }) {
  const counts = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = vendors.filter(v => v.status === s).length
    return acc
  }, {} as Record<EngagementStatus, number>)

  const active = PIPELINE_ORDER.filter(s => counts[s] > 0)
  if (active.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
      {active.map(s => {
        const cfg = STATUS_CONFIG[s]
        return (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 20,
          }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 18, fontWeight: 300, color: cfg.color, lineHeight: 1,
            }}>
              {counts[s]}
            </span>
            <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: cfg.color }}>
              {copy.statusLabel(s)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function VendorCardRow({ vendor, copy }: { vendor: VendorCard; copy: VendorsCopy }) {
  const isAgreed = vendor.status === 'agreed'
  const isBooked = vendor.status === 'booked'
  const isCancelled = vendor.status === 'cancelled'
  const showRating = (vendor.review_count ?? 0) > 0 && (vendor.rating ?? 0) > 0

  return (
    <div style={{
      background: '#1A1915',
      border: `1px solid ${isAgreed ? 'rgba(201,168,76,0.35)' : isBooked ? 'rgba(122,158,126,0.2)' : '#2A2820'}`,
      borderRadius: 12,
      padding: '18px 20px',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      opacity: isCancelled ? 0.5 : 1,
      position: 'relative',
    }}>
      {/* Agreed: left gold accent bar */}
      {isAgreed && (
        <div style={{
          position: 'absolute', left: 0, top: 12, bottom: 12,
          width: 3, borderRadius: '0 3px 3px 0',
          background: '#C9A84C',
        }} />
      )}

      {/* Category icon / logo */}
      <div style={{
        flexShrink: 0, width: 42, height: 42, borderRadius: 10,
        background: '#0F0E0C', border: '1px solid #2A2820',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, overflow: 'hidden',
      }}>
        {vendor.logo_url || vendor.photo1_url
          ? <img src={vendor.logo_url || vendor.photo1_url!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
          : <span>{categoryEmoji(vendor.category)}</span>
        }
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, color: '#F5EDD6', fontWeight: 400 }}>{vendor.name}</span>
          {vendor.verified && (
            <span style={{
              fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
              color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              {copy.partnerBadge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#8A7E6A', marginBottom: 6 }}>
          {categoryLabel(vendor.category)} · {vendor.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <StatusPill status={vendor.status} label={copy.statusLabel(vendor.status)} />
          {showRating && (
            <span style={{ fontSize: 12, color: '#8A7E6A' }}>
              ★ {vendor.rating?.toFixed(1)}
            </span>
          )}
          {vendor.price_from && (
            <span style={{ fontSize: 12, color: '#5A5040' }}>{vendor.price_from}</span>
          )}
        </div>

        {/* Agreed nudge */}
        {isAgreed && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#C9A84C', lineHeight: 1.5 }}>
            {copy.agreedNudge}
          </div>
        )}
      </div>

      {/* External links (read-only) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {vendor.instagram && (
          <a
            href={`https://www.instagram.com/${vendor.instagram.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#8A7E6A', textDecoration: 'none' }}
            title={copy.instagramTitle}
          >
            IG
          </a>
        )}
        {vendor.website && (
          <a
            href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#8A7E6A', textDecoration: 'none' }}
            title={copy.websiteTitle}
          >
            ↗
          </a>
        )}
      </div>
    </div>
  )
}

function StatusGroup({ status, vendors, copy }: { status: EngagementStatus; vendors: VendorCard[]; copy: VendorsCopy }) {
  const cfg = STATUS_CONFIG[status]
  const [collapsed, setCollapsed] = useState(status === 'cancelled' || status === 'completed')

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: `1px solid ${collapsed ? '#1E1D1A' : 'transparent'}`,
          marginBottom: collapsed ? 0 : 10,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600 }}>
          {copy.statusLabel(status)}
        </span>
        <span style={{ fontSize: 12, color: '#3A3830', marginLeft: 4 }}>{vendors.length}</span>
        <svg
          width="10" height="10" viewBox="0 0 12 12" fill="none"
          style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {!collapsed && vendors.map(v => <VendorCardRow key={v.id} vendor={v} copy={copy} />)}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const locale = useLocale()
  const [vendors, setVendors] = useState<VendorCard[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)   // vendors table failed
  const [engFailed, setEngFailed] = useState(false)     // engagements failed — statuses unreliable
  const [pubPartial, setPubPartial] = useState(false)   // public_vendors failed — soft-degrade
  const [filterStatus, setFilterStatus] = useState<EngagementStatus | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const uid = session.user.id

      // 1 — fetch couple's vendor list
      const { data: vendorRows, error: vErr } = await supabase
        .from('vendors')
        .select('id, name, category, location, price_from, rating, public_vendor_id')
        .eq('user_id', uid)
        .order('created_at', { ascending: true })

      if (vErr) { setFetchError(true); setLoading(false); return }
      if (!vendorRows || vendorRows.length === 0) { setLoading(false); return }

      // 2 — fetch engagements — CRITICAL: without this, all statuses default to 'lead' (misleading)
      const { data: engRows, error: engErr } = await supabase
        .from('engagements')
        .select('id, vendor_id, status')
        .eq('user_id', uid)

      if (engErr) {
        // Showing the list with all statuses silently forced to 'lead' would be misleading.
        // Hard-fail with a clear message instead.
        setEngFailed(true)
        setLoading(false)
        return
      }

      const engMap: Record<string, EngagementRow> = {}
      if (engRows) {
        engRows.forEach((e: EngagementRow) => { engMap[e.vendor_id] = e })
      }

      // 3 — fetch public vendor details (supplementary enrichment — soft-degrade if unavailable)
      const pubIds = vendorRows
        .map((v: VendorRow) => v.public_vendor_id)
        .filter(Boolean) as string[]

      let pubMap: Record<string, PublicVendorRow> = {}
      if (pubIds.length > 0) {
        const { data: pubRows, error: pubErr } = await supabase
          .from('public_vendors')
          .select('id, photo1_url, logo_url, verified, review_count, description, description_en, region, instagram, website')
          .in('id', pubIds)

        if (pubErr) {
          // Core pipeline (name/status) still works — signal partial degradation via banner
          setPubPartial(true)
        } else if (pubRows) {
          pubRows.forEach((p: PublicVendorRow) => { pubMap[p.id] = p })
        }
      }

      // 4 — join and sort by pipeline order
      const joined: VendorCard[] = vendorRows.map((v: VendorRow) => {
        const eng = engMap[v.id]
        const pub = v.public_vendor_id ? pubMap[v.public_vendor_id] : undefined
        return {
          id: v.id,
          name: v.name,
          category: v.category,
          location: v.location,
          price_from: v.price_from,
          rating: v.rating,
          status: (eng?.status ?? 'lead') as EngagementStatus,
          engagementId: eng?.id ?? null,
          photo1_url: pub?.photo1_url ?? null,
          logo_url: pub?.logo_url ?? null,
          verified: pub?.verified ?? false,
          review_count: pub?.review_count ?? 0,
          instagram: pub?.instagram ?? null,
          website: pub?.website ?? null,
        }
      })

      joined.sort((a, b) => {
        const ai = PIPELINE_ORDER.indexOf(a.status)
        const bi = PIPELINE_ORDER.indexOf(b.status)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })

      setVendors(joined)
      setLoading(false)
    }

    load()
  }, [locale])

  const copy = getVendorsCopy(locale)

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
        <PageHeader copy={copy} />
        <ErrorBanner title={copy.errorTitle} desc={copy.errorDesc} />
      </div>
    )
  }

  if (engFailed) {
    return (
      <div>
        <PageHeader copy={copy} />
        <ErrorBanner title={copy.engErrorTitle} desc={copy.engErrorDesc} />
      </div>
    )
  }

  // Filter by status tab
  const statusesPresent = PIPELINE_ORDER.filter(s => vendors.some(v => v.status === s))
  const filtered = filterStatus === 'all' ? vendors : vendors.filter(v => v.status === filterStatus)
  const groupedByStatus = PIPELINE_ORDER.filter(s => filtered.some(v => v.status === s))

  return (
    <div>
      <PageHeader copy={copy} />

      {/* Public vendor data partial failure — soft-degrade banner */}
      {pubPartial && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 20, padding: '10px 14px',
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 12, color: '#8A7E6A' }}>{copy.pubPartialDesc}</span>
        </div>
      )}

      {vendors.length === 0 ? (
        <div style={{
          background: '#1A1915', border: '1px solid #2A2820',
          borderRadius: 14, padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#5A5040', marginBottom: 10 }}>{copy.emptyTitle}</div>
          <div style={{ fontSize: 12, color: '#3A3830', lineHeight: 1.7 }}>{copy.emptyDesc}</div>
        </div>
      ) : (
        <>
          {/* Pipeline summary pills */}
          <PipelineSummary vendors={vendors} copy={copy} />

          {/* Status filter tabs */}
          {statusesPresent.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              <FilterTab
                label={copy.filterAll}
                count={vendors.length}
                active={filterStatus === 'all'}
                onClick={() => setFilterStatus('all')}
              />
              {statusesPresent.map(s => (
                <FilterTab
                  key={s}
                  label={copy.statusLabel(s)}
                  count={vendors.filter(v => v.status === s).length}
                  color={STATUS_CONFIG[s].color}
                  active={filterStatus === s}
                  onClick={() => setFilterStatus(s)}
                />
              ))}
            </div>
          )}

          {/* Read-only notice */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 20, padding: '10px 14px',
            background: 'rgba(138,126,106,0.06)', border: '1px solid #2A2820',
            borderRadius: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E6A" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span style={{ fontSize: 12, color: '#8A7E6A' }}>{copy.readOnly}</span>
          </div>

          {/* Vendor list grouped by status */}
          {filterStatus === 'all'
            ? groupedByStatus.map(status => (
                <StatusGroup
                  key={status}
                  status={status}
                  vendors={filtered.filter(v => v.status === status)}
                  copy={copy}
                />
              ))
            : filtered.map(v => <VendorCardRow key={v.id} vendor={v} copy={copy} />)
          }
        </>
      )}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader({ copy }: { copy: VendorsCopy }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
        {copy.pageLabel}
      </div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>
        {copy.pageTitle}
      </h1>
    </div>
  )
}

// ─── Filter tab ───────────────────────────────────────────────────────────────

function FilterTab({ label, count, color, active, onClick }: {
  label: string; count: number; color?: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
        background: active ? (color ?? '#C9A84C') + '18' : 'transparent',
        border: `1px solid ${active ? (color ?? '#C9A84C') + '50' : '#2A2820'}`,
        color: active ? (color ?? '#C9A84C') : '#8A7E6A',
        fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {label}
      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, fontWeight: 300 }}>{count}</span>
    </button>
  )
}
