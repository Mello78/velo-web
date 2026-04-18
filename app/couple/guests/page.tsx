'use client'
import { useEffect, useState } from 'react'
import { getCoupleLocale, getPreferredSiteLocale, persistCoupleLocale } from '../../../lib/couple-locale'
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

type RsvpStatus = 'confirmed' | 'pending' | 'declined'

interface GuestRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  group_name: string | null
  side: string | null
  rsvp: string | null
  plus_one: boolean | null
  dietary: string | null
  notes: string | null
}

const RSVP_ORDER: RsvpStatus[] = ['confirmed', 'pending', 'declined']

const RSVP_CONFIG: Record<RsvpStatus, { color: string; bg: string; border: string }> = {
  confirmed: { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' },
  pending: { color: 'var(--velo-muted)', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.20)' },
  declined: { color: 'var(--velo-danger)', bg: 'rgba(196,117,106,0.08)', border: 'rgba(196,117,106,0.20)' },
}

function getGuestsCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: isIT ? 'OSPITI' : 'GUESTS',
    pageTitle: isIT ? 'I vostri invitati' : 'Your guests',
    pageSub: isIT
      ? 'Una vista piu ordinata di RSVP, gruppi e coperti senza perdere il contesto del planning.'
      : 'A clearer view of RSVPs, groups, and seats without losing planning context.',
    readOnly: isIT ? "Vista in sola lettura — usa l'app VELO per aggiungere ospiti o aggiornare gli RSVP" : 'Read-only view — use the VELO app to add guests or update RSVPs',
    total: isIT ? 'Invitati' : 'Guests',
    confirmed: isIT ? 'Confermati' : 'Confirmed',
    pending: isIT ? 'In attesa' : 'Pending',
    declined: isIT ? 'Non vengono' : 'Not coming',
    seats: isIT ? 'Totale posti' : 'Total seats',
    all: isIT ? 'Tutti' : 'All',
    sideLabel: isIT ? 'Lato' : 'Side',
    groupLabel: isIT ? 'Gruppo' : 'Group',
    dietaryLabel: isIT ? 'Esigenze alimentari' : 'Dietary requirements',
    notesLabel: isIT ? 'Note' : 'Notes',
    plusOne: isIT ? 'Con accompagnatore' : 'Plus one',
    emailTitle: isIT ? 'Email' : 'Email',
    phoneTitle: isIT ? 'Telefono' : 'Phone',
    emptyTitle: isIT ? 'Nessun ospite ancora' : 'No guests yet',
    emptyDesc: isIT ? "Aggiungete i vostri ospiti dall'app VELO per seguire RSVP, gruppi e posti." : 'Add your guests in the VELO app to track RSVPs, groups, and seats.',
    errorTitle: isIT ? 'Impossibile caricare gli ospiti' : 'Unable to load guests',
    errorDesc: isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
    statusLabel: (status: RsvpStatus) => {
      const map: Record<RsvpStatus, [string, string]> = {
        confirmed: ['Confermato', 'Confirmed'],
        pending: ['In attesa', 'Pending'],
        declined: ['Non viene', 'Not coming'],
      }
      return isIT ? map[status][0] : map[status][1]
    },
    sideValue: (value: string | null) => {
      const map: Record<string, [string, string]> = {
        Sposo: ['Sposo', "Groom's side"],
        Sposa: ['Sposa', "Bride's side"],
        Entrambi: ['Entrambi', 'Both'],
      }
      if (!value) return isIT ? 'Non assegnato' : 'Unassigned'
      return isIT ? (map[value]?.[0] ?? value) : (map[value]?.[1] ?? value)
    },
    groupValue: (value: string | null) => {
      const map: Record<string, [string, string]> = {
        Famiglia: ['Famiglia', 'Family'],
        Parenti: ['Parenti', 'Relatives'],
        Amici: ['Amici', 'Friends'],
        Colleghi: ['Colleghi', 'Colleagues'],
        Altro: ['Altro', 'Other'],
      }
      if (!value) return isIT ? 'Non assegnato' : 'Unassigned'
      return isIT ? (map[value]?.[0] ?? value) : (map[value]?.[1] ?? value)
    },
  }
}

type GuestsCopy = ReturnType<typeof getGuestsCopy>

function normalizeRsvp(value: string | null): RsvpStatus {
  if (value === 'confirmed' || value === 'declined') return value
  return 'pending'
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <CouplePanel className="min-w-[130px] flex-1 rounded-[1.25rem] p-4 shadow-none">
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: VELO_MONO_FONT }}>
        {label}
      </div>
      <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 32, fontWeight: 300, color: 'var(--velo-ink)' }}>{value}</div>
    </CouplePanel>
  )
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: accent ?? 'var(--velo-muted)',
        background: accent ? `${accent}14` : 'rgba(138,126,106,0.08)',
        border: `1px solid ${accent ? `${accent}30` : 'var(--velo-border)'}`,
        borderRadius: 999,
        padding: '4px 10px',
      }}
    >
      <span style={{ textTransform: 'uppercase', letterSpacing: 1, color: 'var(--velo-muted-soft)', fontFamily: VELO_MONO_FONT }}>{label}</span>
      <span>{value}</span>
    </span>
  )
}

function GuestRowCard({ guest, copy }: { guest: GuestRow; copy: GuestsCopy }) {
  const status = normalizeRsvp(guest.rsvp)
  const hasDietary = Boolean(guest.dietary?.trim())
  const hasNotes = Boolean(guest.notes?.trim())
  const hasContacts = Boolean(guest.email || guest.phone)
  const cfg = RSVP_CONFIG[status]

  return (
    <CouplePanel className="mb-3 p-5 shadow-none">
      <div className="flex gap-4">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, marginTop: 8, flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-[var(--velo-ink)]">
              {guest.name}
              {guest.plus_one ? ' +1' : ''}
            </span>
            <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 999, padding: '4px 10px', fontFamily: VELO_MONO_FONT }}>
              {copy.statusLabel(status)}
            </span>
          </div>

          <div className="mb-3 text-sm text-[var(--velo-muted)]">
            {copy.groupValue(guest.group_name)} · {copy.sideValue(guest.side)}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <InfoChip label={copy.groupLabel} value={copy.groupValue(guest.group_name)} />
            <InfoChip label={copy.sideLabel} value={copy.sideValue(guest.side)} />
            {guest.plus_one && <InfoChip label={copy.plusOne} value="+1" accent="var(--velo-terracotta)" />}
            {hasDietary && <InfoChip label={copy.dietaryLabel} value={guest.dietary!.trim()} accent="var(--velo-success)" />}
          </div>

          {hasContacts && (
            <div className="mb-3 flex flex-wrap gap-4 text-xs text-[var(--velo-muted-soft)]">
              {guest.email && <span>{copy.emailTitle}: {guest.email}</span>}
              {guest.phone && <span>{copy.phoneTitle}: {guest.phone}</span>}
            </div>
          )}

          {hasNotes && (
            <div className="rounded-[1rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-4 py-3 text-sm leading-7 text-[var(--velo-muted)]">
              <span className="text-[var(--velo-terracotta)]">{copy.notesLabel}:</span> {guest.notes!.trim()}
            </div>
          )}
        </div>
      </div>
    </CouplePanel>
  )
}

function StatusGroup({ status, guests, copy }: { status: RsvpStatus; guests: GuestRow[]; copy: GuestsCopy }) {
  const cfg = RSVP_CONFIG[status]
  const [collapsed, setCollapsed] = useState(status === 'declined')

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center gap-3 border-b border-[var(--velo-border)] pb-2"
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600, fontFamily: VELO_MONO_FONT }}>
          {copy.statusLabel(status)}
        </span>
        <span className="text-xs text-[var(--velo-muted-soft)]">{guests.length}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {!collapsed && <div className="mt-4">{guests.map(guest => <GuestRowCard key={guest.id} guest={guest} copy={copy} />)}</div>}
    </div>
  )
}

export default function GuestsPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const copy = getGuestsCopy(locale)
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [filterStatus, setFilterStatus] = useState<RsvpStatus | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      // Fetch couple first
      const coupleLocaleRes = await supabase
        .from('couples')
        .select('nationality, country_of_origin')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const fallbackLocale = getPreferredSiteLocale()
      const coupleLocaleData = coupleLocaleRes.data?.[0]
      if (coupleLocaleData) {
        const nextLocale = getCoupleLocale(coupleLocaleData, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
      }

      const { data, error } = await supabase
        .from('guests')
        .select('id, name, email, phone, group_name, side, rsvp, plus_one, dietary, notes')
        .eq('user_id', session.user.id)
        .order('group_name', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        setFetchError(true)
        setLoading(false)
        return
      }

      setGuests((data ?? []) as GuestRow[])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <CoupleLoadingBlock />

  if (fetchError) {
    return (
      <div>
        <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />
        <CoupleNotice title={copy.errorTitle} tone="danger">{copy.errorDesc}</CoupleNotice>
      </div>
    )
  }

  const counts = {
    total: guests.length,
    confirmed: guests.filter(g => normalizeRsvp(g.rsvp) === 'confirmed').length,
    pending: guests.filter(g => normalizeRsvp(g.rsvp) === 'pending').length,
    declined: guests.filter(g => normalizeRsvp(g.rsvp) === 'declined').length,
    seats: guests.reduce((sum, guest) => sum + (guest.plus_one ? 2 : 1), 0),
  }

  const statusesPresent = RSVP_ORDER.filter(status => guests.some(g => normalizeRsvp(g.rsvp) === status))
  const filteredGuests = filterStatus === 'all' ? guests : guests.filter(g => normalizeRsvp(g.rsvp) === filterStatus)
  const groupedStatuses = RSVP_ORDER.filter(status => filteredGuests.some(g => normalizeRsvp(g.rsvp) === status))

  return (
    <div>
      <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />

      {guests.length > 0 && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <SummaryCard label={copy.total} value={counts.total} accent="var(--velo-terracotta)" />
            <SummaryCard label={copy.confirmed} value={counts.confirmed} accent="var(--velo-success)" />
            <SummaryCard label={copy.pending} value={counts.pending} accent="var(--velo-muted)" />
            <SummaryCard label={copy.seats} value={counts.seats} accent="var(--velo-info)" />
          </div>

          <CoupleNotice title={locale === 'en' ? 'Read-only on web' : 'Sola lettura sul web'} className="mb-6">
            {copy.readOnly}
          </CoupleNotice>
        </>
      )}

      {guests.length === 0 ? (
        <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} />
      ) : (
        <>
          {statusesPresent.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <CoupleChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
                {copy.all} <span>{guests.length}</span>
              </CoupleChip>
              {statusesPresent.map(status => (
                <CoupleChip key={status} accent={RSVP_CONFIG[status].color} active={filterStatus === status} onClick={() => setFilterStatus(status)}>
                  {copy.statusLabel(status)} <span>{guests.filter(g => normalizeRsvp(g.rsvp) === status).length}</span>
                </CoupleChip>
              ))}
            </div>
          )}

          {filterStatus === 'all'
            ? groupedStatuses.map(status => (
                <StatusGroup key={status} status={status} guests={filteredGuests.filter(g => normalizeRsvp(g.rsvp) === status)} copy={copy} />
              ))
            : filteredGuests.map(guest => <GuestRowCard key={guest.id} guest={guest} copy={copy} />)}
        </>
      )}
    </div>
  )
}
