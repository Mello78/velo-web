'use client'
import { useEffect, useState } from 'react'
import { getCoupleLocale, getPreferredSiteLocale, hasExplicitLocaleCookie, persistCoupleLocale } from '../../../lib/couple-locale'
import { supabase } from '../../../lib/supabase'
import type { Locale } from '../../../lib/translations'
import {
  CoupleChip,
  CoupleEmptyState,
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

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

const STATUS_CONFIG: Record<EngagementStatus, { color: string; bg: string; border: string }> = {
  lead: { color: 'var(--velo-muted)', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.2)' },
  quote_sent: { color: 'var(--velo-info)', bg: 'rgba(74,122,184,0.10)', border: 'rgba(74,122,184,0.25)' },
  agreed: { color: 'var(--velo-terracotta)', bg: 'rgba(184,90,46,0.10)', border: 'rgba(184,90,46,0.28)' },
  booked: { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' },
  completed: { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.2)' },
  cancelled: { color: 'var(--velo-danger)', bg: 'rgba(196,117,106,0.08)', border: 'rgba(196,117,106,0.2)' },
}

const PIPELINE_ORDER: EngagementStatus[] = ['booked', 'agreed', 'quote_sent', 'lead', 'completed', 'cancelled']

function getVendorsCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: isIT ? 'FORNITORI' : 'VENDORS',
    pageTitle: isIT ? 'I vostri fornitori' : 'Your vendors',
    pageSub: isIT
      ? 'Una lettura piu chiara di chi state valutando, chi e vicino a una conferma e chi fa gia parte del matrimonio.'
      : 'A clearer view of who is still being explored, who is close, and who is already part of the wedding.',
    filterAll: isIT ? 'Tutti' : 'All',
    readOnly: isIT ? "Rivedi sul web - usa l'app VELO per scrivere ai fornitori, salvarli o confermarli e aggiornare lo stato" : 'Review on web - use the VELO app to message vendors, save or confirm them, and update status',
    agreedNudge: isIT ? "Accordo raggiunto - apri l'app VELO per confermare e bloccare la data." : 'Agreement reached - open the VELO app to confirm and lock this vendor.',
    emptyTitle: isIT ? 'Nessun fornitore' : 'No vendors yet',
    emptyDesc: isIT ? "Sfoglia e salva i fornitori dall'app VELO e la lista apparira qui." : 'Browse and save vendors in the VELO app and the list will appear here.',
    errorTitle: isIT ? 'Impossibile caricare i fornitori' : 'Unable to load vendors',
    errorDesc: isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
    engErrorTitle: isIT ? 'Stato fornitori non disponibile' : 'Vendor status unavailable',
    engErrorDesc: isIT ? 'Non e stato possibile caricare lo stato degli engagement. Riprova piu tardi.' : 'Engagement status could not be loaded. Please try again later.',
    pubPartialDesc: isIT ? 'Alcuni dettagli fornitore non sono disponibili.' : 'Some vendor details could not be loaded.',
    partnerBadge: 'Partner VELO',
    statusLabel: (status: EngagementStatus): string => {
      const map: Record<EngagementStatus, [string, string]> = {
        lead: ['Aggiunto', 'Added'],
        quote_sent: ['Preventivo richiesto', 'Quote requested'],
        agreed: ['Accordo raggiunto', 'Agreement reached'],
        booked: ['Confermato', 'Confirmed'],
        completed: ['Completato', 'Completed'],
        cancelled: ['Annullato', 'Cancelled'],
      }
      return isIT ? map[status][0] : map[status][1]
    },
  }
}

type VendorsCopy = ReturnType<typeof getVendorsCopy>

function categoryEmoji(category: string): string {
  const match = category.match(/^[^\u0000-\u007F]+/)
  return match ? match[0].trim() : '◈'
}

function categoryLabel(category: string): string {
  return category.replace(/^[^\u0000-\u007F\w]*/, '').trim() || category
}

function PipelineSummary({ vendors, copy }: { vendors: VendorCard[]; copy: VendorsCopy }) {
  const counts = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = vendors.filter(v => v.status === s).length
    return acc
  }, {} as Record<EngagementStatus, number>)

  const active = PIPELINE_ORDER.filter(s => counts[s] > 0)
  if (active.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {active.map(s => {
        const cfg = STATUS_CONFIG[s]
        return (
          <CouplePanel key={s} className="min-w-[120px] flex-1 rounded-[1.25rem] p-4 shadow-none">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: cfg.color, fontFamily: VELO_MONO_FONT }}>
              {copy.statusLabel(s)}
            </div>
            <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 30, fontWeight: 300, color: 'var(--velo-ink)' }}>{counts[s]}</div>
          </CouplePanel>
        )
      })}
    </div>
  )
}

function VendorCardRow({ vendor, copy }: { vendor: VendorCard; copy: VendorsCopy }) {
  const isAgreed = vendor.status === 'agreed'
  const isCancelled = vendor.status === 'cancelled'
  const showRating = (vendor.review_count ?? 0) > 0 && (vendor.rating ?? 0) > 0
  const cfg = STATUS_CONFIG[vendor.status]

  return (
    <CouplePanel className={`mb-3 p-5 shadow-none ${isCancelled ? 'opacity-55' : ''}`}>
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[0.95rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] text-lg">
          {vendor.logo_url || vendor.photo1_url ? (
            <img src={vendor.logo_url || vendor.photo1_url!} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{categoryEmoji(vendor.category)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-[var(--velo-ink)]">{vendor.name}</span>
            {vendor.verified && (
              <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--velo-terracotta)', border: '1px solid rgba(184,90,46,0.22)', borderRadius: 999, padding: '4px 10px', fontFamily: VELO_MONO_FONT }}>
                {copy.partnerBadge}
              </span>
            )}
            <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 999, padding: '4px 10px', fontFamily: VELO_MONO_FONT }}>
              {copy.statusLabel(vendor.status)}
            </span>
          </div>
          <div className="text-sm text-[var(--velo-muted)]">
            {categoryLabel(vendor.category)} - {vendor.location}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--velo-muted-soft)]">
            {showRating && <span>★ {vendor.rating?.toFixed(1)}</span>}
            {vendor.price_from && <span>{vendor.price_from}</span>}
          </div>
          {isAgreed && <div className="mt-3 text-sm leading-7 text-[var(--velo-terracotta)]">{copy.agreedNudge}</div>}
        </div>

        <div className="flex shrink-0 flex-col gap-2 text-xs text-[var(--velo-muted-soft)]">
          {vendor.instagram && (
            <a href={`https://www.instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--velo-terracotta)]">
              IG
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--velo-terracotta)]">
              ↗
            </a>
          )}
        </div>
      </div>
    </CouplePanel>
  )
}

function StatusGroup({ status, vendors, copy }: { status: EngagementStatus; vendors: VendorCard[]; copy: VendorsCopy }) {
  const cfg = STATUS_CONFIG[status]
  const [collapsed, setCollapsed] = useState(status === 'cancelled' || status === 'completed')

  return (
    <div className="mb-4">
      <button onClick={() => setCollapsed(c => !c)} className="flex w-full items-center gap-3 border-b border-[var(--velo-border)] pb-2">
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600, fontFamily: VELO_MONO_FONT }}>
          {copy.statusLabel(status)}
        </span>
        <span className="text-xs text-[var(--velo-muted-soft)]">{vendors.length}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {!collapsed && <div className="mt-4">{vendors.map(v => <VendorCardRow key={v.id} vendor={v} copy={copy} />)}</div>}
    </div>
  )
}

export default function VendorsPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [vendors, setVendors] = useState<VendorCard[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [engFailed, setEngFailed] = useState(false)
  const [pubPartial, setPubPartial] = useState(false)
  const [filterStatus, setFilterStatus] = useState<EngagementStatus | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const uid = session.user.id

      // Fetch couple first
      const coupleLocaleRes = await supabase
        .from('couples')
        .select('nationality, country_of_origin')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)

      const fallbackLocale = getPreferredSiteLocale()
      const coupleLocaleData = coupleLocaleRes.data?.[0]
      if (coupleLocaleData) {
        const nextLocale = hasExplicitLocaleCookie() ? fallbackLocale : getCoupleLocale(coupleLocaleData, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
      }

      const { data: vendorRows, error: vErr } = await supabase
        .from('vendors')
        .select('id, name, category, location, price_from, rating, public_vendor_id')
        .eq('user_id', uid)
        .order('created_at', { ascending: true })

      if (vErr) { setFetchError(true); setLoading(false); return }
      if (!vendorRows || vendorRows.length === 0) { setLoading(false); return }

      const { data: engRows, error: engErr } = await supabase
        .from('engagements')
        .select('id, vendor_id, status')
        .eq('user_id', uid)

      if (engErr) {
        setEngFailed(true)
        setLoading(false)
        return
      }

      const engMap: Record<string, EngagementRow> = {}
      if (engRows) engRows.forEach((e: EngagementRow) => { engMap[e.vendor_id] = e })

      const pubIds = vendorRows.map((v: VendorRow) => v.public_vendor_id).filter(Boolean) as string[]

      const pubMap: Record<string, PublicVendorRow> = {}
      if (pubIds.length > 0) {
        const { data: pubRows, error: pubErr } = await supabase
          .from('public_vendors')
          .select('id, photo1_url, logo_url, verified, review_count, description, description_en, region, instagram, website')
          .in('id', pubIds)

        if (pubErr) setPubPartial(true)
        else if (pubRows) pubRows.forEach((p: PublicVendorRow) => { pubMap[p.id] = p })
      }

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
  }, [])

  const copy = getVendorsCopy(locale)

  if (loading) return <CoupleLoadingBlock />

  if (fetchError) {
    return (
      <div>
        <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />
        <CoupleNotice title={copy.errorTitle} tone="danger">{copy.errorDesc}</CoupleNotice>
      </div>
    )
  }

  if (engFailed) {
    return (
      <div>
        <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />
        <CoupleNotice title={copy.engErrorTitle} tone="danger">{copy.engErrorDesc}</CoupleNotice>
      </div>
    )
  }

  const statusesPresent = PIPELINE_ORDER.filter(s => vendors.some(v => v.status === s))
  const filtered = filterStatus === 'all' ? vendors : vendors.filter(v => v.status === filterStatus)
  const groupedByStatus = PIPELINE_ORDER.filter(s => filtered.some(v => v.status === s))

  return (
    <div>
      <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />

      {pubPartial && (
        <div className="mb-5">
          <CoupleNotice title={locale === 'en' ? 'Some details unavailable' : 'Alcuni dettagli non disponibili'} tone="warning">{copy.pubPartialDesc}</CoupleNotice>
        </div>
      )}

      {vendors.length === 0 ? (
        <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} />
      ) : (
        <>
          <PipelineSummary vendors={vendors} copy={copy} />

          {statusesPresent.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <CoupleChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
                {copy.filterAll} <span>{vendors.length}</span>
              </CoupleChip>
              {statusesPresent.map(status => (
                <CoupleChip key={status} accent={STATUS_CONFIG[status].color} active={filterStatus === status} onClick={() => setFilterStatus(status)}>
                  {copy.statusLabel(status)} <span>{vendors.filter(v => v.status === status).length}</span>
                </CoupleChip>
              ))}
            </div>
          )}

          <CoupleNotice title={locale === 'en' ? 'Review on web, manage in app' : "Rivedi sul web, gestisci nell'app"} className="mb-6">
            {copy.readOnly}
          </CoupleNotice>

          {filterStatus === 'all'
            ? groupedByStatus.map(status => <StatusGroup key={status} status={status} vendors={filtered.filter(v => v.status === status)} copy={copy} />)
            : filtered.map(v => <VendorCardRow key={v.id} vendor={v} copy={copy} />)}
        </>
      )}
    </div>
  )
}
