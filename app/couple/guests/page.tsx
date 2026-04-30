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
      ? 'Una vista piu ordinata di RSVP, gruppi e coperti, con il contesto del matrimonio sempre chiaro.'
      : 'A clearer view of RSVPs, groups, and seats while keeping wedding context in view.',
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
    updateError: isIT ? 'Aggiornamento fallito. Riprova.' : 'Update failed. Try again.',
    notesPlaceholder: isIT ? 'Aggiungi una nota...' : 'Add a note...',
    dietaryPlaceholder: isIT ? 'Esigenze alimentari...' : 'Dietary requirements...',
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
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: VELO_MONO_FONT }}>{label}</div>
      <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 32, fontWeight: 300, color: 'var(--velo-ink)' }}>{value}</div>
    </CouplePanel>
  )
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: accent ?? 'var(--velo-muted)', background: accent ? `${accent}14` : 'rgba(138,126,106,0.08)', border: `1px solid ${accent ? `${accent}30` : 'var(--velo-border)'}`, borderRadius: 999, padding: '4px 10px' }}>
      <span style={{ textTransform: 'uppercase', letterSpacing: 1, color: 'var(--velo-muted-soft)', fontFamily: VELO_MONO_FONT }}>{label}</span>
      <span>{value}</span>
    </span>
  )
}

function RsvpSelector({ guestId, current, onUpdate, copy }: {
  guestId: string
  current: RsvpStatus
  onUpdate: (id: string, status: RsvpStatus) => Promise<void>
  copy: GuestsCopy
}) {
  const [busy, setBusy] = useState(false)

  const update = async (status: RsvpStatus) => {
    if (status === current || busy) return
    setBusy(true)
    await onUpdate(guestId, status)
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap gap-1">
      {RSVP_ORDER.map(status => {
        const cfg = RSVP_CONFIG[status]
        const active = status === current
        return (
          <button
            key={status}
            onClick={() => update(status)}
            disabled={busy}
            style={{
              fontSize: 10, letterSpacing: 0.8, padding: '4px 10px', borderRadius: 999,
              fontFamily: VELO_MONO_FONT, textTransform: 'uppercase',
              color: active ? cfg.color : 'var(--velo-muted-soft)',
              background: active ? cfg.bg : 'transparent',
              border: `1px solid ${active ? cfg.border : 'var(--velo-border)'}`,
              opacity: busy ? 0.5 : 1,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {copy.statusLabel(status)}
          </button>
        )
      })}
    </div>
  )
}

function InlineEdit({ value, onSave, placeholder }: {
  value: string | null
  onSave: (v: string | null) => Promise<void>
  placeholder: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const next = draft.trim() || null
    if (next === (value?.trim() || null)) { setEditing(false); return }
    setSaving(true)
    await onSave(next)
    setSaving(false)
    setEditing(false)
  }

  if (saving) {
    return <div className="px-3 py-2 text-xs text-[var(--velo-muted-soft)]">...</div>
  }

  if (!editing) {
    return (
      <div
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
        className="cursor-pointer rounded-[0.75rem] border border-dashed border-[var(--velo-border)] px-3 py-2 text-sm leading-6 text-[var(--velo-muted)] transition-colors hover:border-[var(--velo-terracotta)]"
      >
        {value?.trim() || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
      </div>
    )
  }

  return (
    <textarea
      autoFocus
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={save}
      className="w-full resize-none rounded-[0.75rem] border border-[var(--velo-terracotta)] bg-[rgba(255,250,244,0.72)] px-3 py-2 text-sm text-[var(--velo-ink)] outline-none"
      rows={2}
    />
  )
}

function GuestRowCard({
  guest, copy,
  onUpdateRsvp, onUpdateNotes, onUpdateDietary,
}: {
  guest: GuestRow
  copy: GuestsCopy
  onUpdateRsvp: (id: string, status: RsvpStatus) => Promise<void>
  onUpdateNotes: (id: string, notes: string | null) => Promise<void>
  onUpdateDietary: (id: string, dietary: string | null) => Promise<void>
}) {
  const status = normalizeRsvp(guest.rsvp)
  const hasContacts = Boolean(guest.email || guest.phone)
  const cfg = RSVP_CONFIG[status]

  return (
    <CouplePanel className="mb-3 p-5 shadow-none">
      <div className="flex gap-4">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, marginTop: 8, flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-[var(--velo-ink)]">
              {guest.name}{guest.plus_one ? ' +1' : ''}
            </span>
          </div>

          <div className="mb-3">
            <RsvpSelector guestId={guest.id} current={status} onUpdate={onUpdateRsvp} copy={copy} />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <InfoChip label={copy.groupLabel} value={copy.groupValue(guest.group_name)} />
            <InfoChip label={copy.sideLabel} value={copy.sideValue(guest.side)} />
            {guest.plus_one && <InfoChip label={copy.plusOne} value="+1" accent="var(--velo-terracotta)" />}
          </div>

          {hasContacts && (
            <div className="mb-3 flex flex-wrap gap-4 text-xs text-[var(--velo-muted-soft)]">
              {guest.email && <span>{copy.emailTitle}: {guest.email}</span>}
              {guest.phone && <span>{copy.phoneTitle}: {guest.phone}</span>}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>{copy.dietaryLabel}</div>
              <InlineEdit
                value={guest.dietary}
                onSave={v => onUpdateDietary(guest.id, v)}
                placeholder={copy.dietaryPlaceholder}
              />
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>{copy.notesLabel}</div>
              <InlineEdit
                value={guest.notes}
                onSave={v => onUpdateNotes(guest.id, v)}
                placeholder={copy.notesPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>
    </CouplePanel>
  )
}

function StatusGroup({
  status, guests, copy,
  onUpdateRsvp, onUpdateNotes, onUpdateDietary,
}: {
  status: RsvpStatus
  guests: GuestRow[]
  copy: GuestsCopy
  onUpdateRsvp: (id: string, status: RsvpStatus) => Promise<void>
  onUpdateNotes: (id: string, notes: string | null) => Promise<void>
  onUpdateDietary: (id: string, dietary: string | null) => Promise<void>
}) {
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
      {!collapsed && (
        <div className="mt-4">
          {guests.map(guest => (
            <GuestRowCard
              key={guest.id}
              guest={guest}
              copy={copy}
              onUpdateRsvp={onUpdateRsvp}
              onUpdateNotes={onUpdateNotes}
              onUpdateDietary={onUpdateDietary}
            />
          ))}
        </div>
      )}
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
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const coupleLocaleRes = await supabase
        .from('couples')
        .select('nationality, country_of_origin')
        .eq('user_id', session.user.id)
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

      const { data, error } = await supabase
        .from('guests')
        .select('id, name, email, phone, group_name, side, rsvp, plus_one, dietary, notes')
        .eq('user_id', session.user.id)
        .order('group_name', { ascending: true })
        .order('name', { ascending: true })

      if (error) { setFetchError(true); setLoading(false); return }
      setGuests((data ?? []) as GuestRow[])
      setLoading(false)
    }
    load()
  }, [])

  const updateRsvp = async (id: string, status: RsvpStatus) => {
    const snapshot = guests
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp: status } : g))
    setActionError('')
    const { error } = await supabase.from('guests').update({ rsvp: status }).eq('id', id)
    if (error) { setGuests(snapshot); setActionError(copy.updateError) }
  }

  const updateNotes = async (id: string, notes: string | null) => {
    const snapshot = guests
    setGuests(prev => prev.map(g => g.id === id ? { ...g, notes } : g))
    setActionError('')
    const { error } = await supabase.from('guests').update({ notes }).eq('id', id)
    if (error) { setGuests(snapshot); setActionError(copy.updateError) }
  }

  const updateDietary = async (id: string, dietary: string | null) => {
    const snapshot = guests
    setGuests(prev => prev.map(g => g.id === id ? { ...g, dietary } : g))
    setActionError('')
    const { error } = await supabase.from('guests').update({ dietary }).eq('id', id)
    if (error) { setGuests(snapshot); setActionError(copy.updateError) }
  }

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
    seats: guests.reduce((sum, g) => sum + (g.plus_one ? 2 : 1), 0),
  }

  const statusesPresent = RSVP_ORDER.filter(status => guests.some(g => normalizeRsvp(g.rsvp) === status))
  const filteredGuests = filterStatus === 'all' ? guests : guests.filter(g => normalizeRsvp(g.rsvp) === filterStatus)
  const groupedStatuses = RSVP_ORDER.filter(status => filteredGuests.some(g => normalizeRsvp(g.rsvp) === status))

  return (
    <div>
      <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />

      {actionError && (
        <div className="mb-4 rounded-[1rem] border border-[rgba(196,117,106,0.28)] bg-[rgba(196,117,106,0.09)] px-5 py-3 text-sm text-[var(--velo-danger)]">
          {actionError}
        </div>
      )}

      {guests.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          <SummaryCard label={copy.total} value={counts.total} accent="var(--velo-terracotta)" />
          <SummaryCard label={copy.confirmed} value={counts.confirmed} accent="var(--velo-success)" />
          <SummaryCard label={copy.pending} value={counts.pending} accent="var(--velo-muted)" />
          <SummaryCard label={copy.seats} value={counts.seats} accent="var(--velo-info)" />
        </div>
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
                <StatusGroup
                  key={status}
                  status={status}
                  guests={filteredGuests.filter(g => normalizeRsvp(g.rsvp) === status)}
                  copy={copy}
                  onUpdateRsvp={updateRsvp}
                  onUpdateNotes={updateNotes}
                  onUpdateDietary={updateDietary}
                />
              ))
            : filteredGuests.map(guest => (
                <GuestRowCard
                  key={guest.id}
                  guest={guest}
                  copy={copy}
                  onUpdateRsvp={updateRsvp}
                  onUpdateNotes={updateNotes}
                  onUpdateDietary={updateDietary}
                />
              ))}
        </>
      )}
    </div>
  )
}
