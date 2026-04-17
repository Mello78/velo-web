'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

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
  confirmed: { color: '#7A9E7E', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' },
  pending:   { color: '#8A7E6A', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.20)' },
  declined:  { color: '#C4756A', bg: 'rgba(196,117,106,0.08)', border: 'rgba(196,117,106,0.20)' },
}

function useLocale() {
  const [locale, setLocale] = useState('en')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (!navigator.language.startsWith('en')) setLocale('it')
  }, [])
  return locale
}

function getGuestsCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: isIT ? 'OSPITI' : 'GUESTS',
    pageTitle: isIT ? 'I vostri invitati' : 'Your guests',
    readOnly: isIT ? 'Vista in sola lettura — usa l’app VELO per aggiungere ospiti o aggiornare gli RSVP' : 'Read-only view — use the VELO app to add guests or update RSVPs',
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
    noDietary: isIT ? 'Nessuna segnalata' : 'None noted',
    noSideGroup: isIT ? 'Non assegnato' : 'Unassigned',
    emailTitle: isIT ? 'Email' : 'Email',
    phoneTitle: isIT ? 'Telefono' : 'Phone',
    emptyTitle: isIT ? 'Nessun ospite ancora' : 'No guests yet',
    emptyDesc: isIT ? 'Aggiungete i vostri ospiti dall’app VELO per seguire RSVP, gruppi e posti.' : 'Add your guests in the VELO app to track RSVPs, groups, and seats.',
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

function StatusPill({ status, label }: { status: RsvpStatus; label: string }) {
  const cfg = RSVP_CONFIG[status]
  return (
    <span style={{
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20,
      padding: '3px 10px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function ErrorBanner({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      background: 'rgba(196,117,106,0.06)',
      border: '1px solid rgba(196,117,106,0.2)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 13, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function PageHeader({ copy }: { copy: GuestsCopy }) {
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

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 120,
      background: '#1A1915',
      border: `1px solid ${color}20`,
      borderRadius: 12,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 30, fontWeight: 300, color: '#F5EDD6', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function FilterTab({ label, count, color, active, onClick }: {
  label: string
  count: number
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        cursor: 'pointer',
        background: active ? (color ?? '#C9A84C') + '18' : 'transparent',
        border: `1px solid ${active ? (color ?? '#C9A84C') + '50' : '#2A2820'}`,
        color: active ? (color ?? '#C9A84C') : '#8A7E6A',
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label}
      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, fontWeight: 300 }}>{count}</span>
    </button>
  )
}

function GuestRowCard({ guest, copy }: { guest: GuestRow; copy: GuestsCopy }) {
  const status = normalizeRsvp(guest.rsvp)
  const hasDietary = Boolean(guest.dietary?.trim())
  const hasNotes = Boolean(guest.notes?.trim())
  const hasContacts = Boolean(guest.email || guest.phone)

  return (
    <div style={{
      background: '#1A1915',
      border: '1px solid #2A2820',
      borderRadius: 12,
      padding: '18px 20px',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
    }}>
      <div style={{
        flexShrink: 0,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: RSVP_CONFIG[status].color,
        marginTop: 6,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, color: '#F5EDD6', fontWeight: 400 }}>
            {guest.name}
            {guest.plus_one ? ' +1' : ''}
          </span>
          <StatusPill status={status} label={copy.statusLabel(status)} />
        </div>

        <div style={{ fontSize: 12, color: '#8A7E6A', marginBottom: 10 }}>
          {copy.groupValue(guest.group_name)} · {copy.sideValue(guest.side)}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: hasContacts || hasNotes ? 10 : 0 }}>
          <InfoChip label={copy.groupLabel} value={copy.groupValue(guest.group_name)} />
          <InfoChip label={copy.sideLabel} value={copy.sideValue(guest.side)} />
          {guest.plus_one && <InfoChip label={copy.plusOne} value="+1" accent="#C9A84C" />}
          {hasDietary && <InfoChip label={copy.dietaryLabel} value={guest.dietary!.trim()} accent="#7A9E7E" />}
        </div>

        {hasContacts && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#5A5040', marginBottom: hasNotes ? 10 : 0 }}>
            {guest.email && <span>{copy.emailTitle}: {guest.email}</span>}
            {guest.phone && <span>{copy.phoneTitle}: {guest.phone}</span>}
          </div>
        )}

        {hasNotes && (
          <div style={{
            fontSize: 12,
            color: '#8A7E6A',
            lineHeight: 1.6,
            background: 'rgba(138,126,106,0.05)',
            border: '1px solid #24221B',
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <span style={{ color: '#C9A84C' }}>{copy.notesLabel}:</span> {guest.notes!.trim()}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      color: accent ?? '#8A7E6A',
      background: accent ? `${accent}14` : 'rgba(138,126,106,0.08)',
      border: `1px solid ${accent ? `${accent}30` : '#2A2820'}`,
      borderRadius: 999,
      padding: '4px 10px',
    }}>
      <span style={{ textTransform: 'uppercase', letterSpacing: 1, color: '#5A5040' }}>{label}</span>
      <span>{value}</span>
    </span>
  )
}

function StatusGroup({ status, guests, copy }: { status: RsvpStatus; guests: GuestRow[]; copy: GuestsCopy }) {
  const cfg = RSVP_CONFIG[status]
  const [collapsed, setCollapsed] = useState(status === 'declined')

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderBottom: `1px solid ${collapsed ? '#1E1D1A' : 'transparent'}`,
          marginBottom: collapsed ? 0 : 10,
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600 }}>
          {copy.statusLabel(status)}
        </span>
        <span style={{ fontSize: 12, color: '#3A3830', marginLeft: 4 }}>{guests.length}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {!collapsed && guests.map(guest => <GuestRowCard key={guest.id} guest={guest} copy={copy} />)}
    </div>
  )
}

export default function GuestsPage() {
  const locale = useLocale()
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

  const counts = {
    total: guests.length,
    confirmed: guests.filter(g => normalizeRsvp(g.rsvp) === 'confirmed').length,
    pending: guests.filter(g => normalizeRsvp(g.rsvp) === 'pending').length,
    declined: guests.filter(g => normalizeRsvp(g.rsvp) === 'declined').length,
    seats: guests.reduce((sum, guest) => sum + (guest.plus_one ? 2 : 1), 0),
  }

  const statusesPresent = RSVP_ORDER.filter(status => guests.some(g => normalizeRsvp(g.rsvp) === status))
  const filteredGuests = filterStatus === 'all'
    ? guests
    : guests.filter(g => normalizeRsvp(g.rsvp) === filterStatus)

  const groupedStatuses = RSVP_ORDER.filter(status => filteredGuests.some(g => normalizeRsvp(g.rsvp) === status))

  return (
    <div>
      <PageHeader copy={copy} />

      {guests.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <SummaryCard label={copy.total} value={counts.total} color="#C9A84C" />
            <SummaryCard label={copy.confirmed} value={counts.confirmed} color={RSVP_CONFIG.confirmed.color} />
            <SummaryCard label={copy.pending} value={counts.pending} color={RSVP_CONFIG.pending.color} />
            <SummaryCard label={copy.seats} value={counts.seats} color="#4A7AB8" />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            padding: '10px 14px',
            background: 'rgba(138,126,106,0.06)',
            border: '1px solid #2A2820',
            borderRadius: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E6A" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: 12, color: '#8A7E6A' }}>{copy.readOnly}</span>
          </div>
        </>
      )}

      {guests.length === 0 ? (
        <div style={{
          background: '#1A1915',
          border: '1px solid #2A2820',
          borderRadius: 14,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#5A5040', marginBottom: 10 }}>{copy.emptyTitle}</div>
          <div style={{ fontSize: 12, color: '#3A3830', lineHeight: 1.7 }}>{copy.emptyDesc}</div>
        </div>
      ) : (
        <>
          {statusesPresent.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              <FilterTab
                label={copy.all}
                count={guests.length}
                active={filterStatus === 'all'}
                onClick={() => setFilterStatus('all')}
              />
              {statusesPresent.map(status => (
                <FilterTab
                  key={status}
                  label={copy.statusLabel(status)}
                  count={guests.filter(g => normalizeRsvp(g.rsvp) === status).length}
                  color={RSVP_CONFIG[status].color}
                  active={filterStatus === status}
                  onClick={() => setFilterStatus(status)}
                />
              ))}
            </div>
          )}

          {filterStatus === 'all'
            ? groupedStatuses.map(status => (
                <StatusGroup
                  key={status}
                  status={status}
                  guests={filteredGuests.filter(g => normalizeRsvp(g.rsvp) === status)}
                  copy={copy}
                />
              ))
            : filteredGuests.map(guest => <GuestRowCard key={guest.id} guest={guest} copy={copy} />)}
        </>
      )}
    </div>
  )
}
