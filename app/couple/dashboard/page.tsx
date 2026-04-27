'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { COUNTRIES, type CountryDoc } from '../../../lib/countries'
import { getCoupleLocale, getPreferredSiteLocale, persistCoupleLocale } from '../../../lib/couple-locale'
import { supabase } from '../../../lib/supabase'
import { getT, type Locale } from '../../../lib/translations'
import {
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePanel,
  CoupleProgressBar,
  CoupleReadOnlyNotice,
  CoupleRsvpBar,
  CoupleSection,
  CoupleStatusPill,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

// ─── Types ───────────────────────────────────────────────────────────

type EngagementStatus = 'lead' | 'quote_sent' | 'agreed' | 'booked' | 'completed' | 'cancelled'

interface CoupleRow {
  partner1: string
  partner2: string
  wedding_date: string | null
  budget: number | null
  wedding_city: string | null
  wedding_region: string | null
  ceremony_type: string | null
  nationality: string | null
  country_of_origin: string | null
}

interface EngagementRow {
  id: string
  vendor_id: string
  status: EngagementStatus
}

interface TaskRow {
  id: string
  title: string
  title_it: string | null
  title_en: string | null
  urgent: boolean
  completed: boolean
  phase: string
}

interface GuestRow {
  id: string
  rsvp: string | null
  plus_one: boolean | null
}

interface ExpenseRow {
  id: string
  amount: number | null
  confirmed: boolean | null
}

interface VendorRow {
  id: string
  name: string
  category: string
}

interface DashboardData {
  couple: CoupleRow
  engagements: EngagementRow[]
  tasks: TaskRow[]
  guests: GuestRow[]
  expenses: ExpenseRow[]
  vendors: VendorRow[]
}

// ─── Constants ───────────────────────────────────────────────────────

const PIPELINE_ORDER: EngagementStatus[] = [
  'booked', 'agreed', 'quote_sent', 'lead', 'completed', 'cancelled',
]

// ─── Helpers ─────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function formatDate(dateStr: string, locale: Locale): string {
  return new Date(dateStr).toLocaleDateString(
    locale === 'en' ? 'en-GB' : 'it-IT',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n)
}

function resolveIsForeign(couple: CoupleRow): boolean {
  return (
    couple.nationality === 'foreign' ||
    (!!couple.country_of_origin && couple.country_of_origin !== 'IT')
  )
}

function resolveTaskTitle(task: TaskRow, locale: Locale): string {
  if (locale === 'it' && task.title_it) return task.title_it
  if (locale === 'en' && task.title_en) return task.title_en
  return task.title
}

// ─── Section: Hero ───────────────────────────────────────────────────

function HeroPanel({
  couple,
  days,
  taskTotal,
  taskCompleted,
  locale,
  db,
}: {
  couple: CoupleRow
  days: number | null
  taskTotal: number
  taskCompleted: number
  locale: Locale
  db: Record<string, string>
}) {
  const progress =
    taskTotal > 0 ? Math.min(100, Math.round((taskCompleted / taskTotal) * 100)) : 0
  const location = [couple.wedding_city, couple.wedding_region].filter(Boolean).join(' — ')

  return (
    <CouplePanel tone="dark" className="relative mb-5 overflow-hidden">
      <div className="pointer-events-none absolute right-[-1rem] top-[-1rem] h-28 w-28 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute right-6 top-6 h-14 w-14 rounded-full border border-white/[0.06]" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {(couple.partner1 || couple.partner2) && (
            <p
              className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d7b89d]"
              style={{ fontFamily: VELO_MONO_FONT }}
            >
              {[couple.partner1, couple.partner2].filter(Boolean).join(' & ')}
            </p>
          )}

          {days !== null ? (
            <>
              <div className="flex items-end gap-3">
                <span
                  className="text-[4.8rem] font-light leading-none text-[#f7efe4]"
                  style={{ fontFamily: VELO_DISPLAY_FONT }}
                >
                  {days > 0 ? days : 0}
                </span>
                <span className="pb-2 text-base text-[#d2c3b0]">{db.days}</span>
              </div>
              <p className="mt-3 text-sm text-[#d2c3b0]">
                {formatDate(couple.wedding_date!, locale)}
              </p>
            </>
          ) : (
            <CoupleNotice
              title={db.heroDateMissing}
              tone="neutral"
              className="border-white/10 bg-white/[0.04] text-[#d2c3b0]"
            >
              {locale === 'en'
                ? 'Once confirmed, your countdown will appear here.'
                : 'Quando confermata, il countdown apparirà qui.'}
            </CoupleNotice>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <p
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{
              fontFamily: VELO_MONO_FONT,
              color: location ? '#d7b89d' : '#8a7e6a',
            }}
          >
            {location || db.locationMissing}
          </p>

          <span
            className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
            style={{
              fontFamily: VELO_MONO_FONT,
              color: couple.ceremony_type ? '#d7b89d' : '#8a7e6a',
              borderColor: couple.ceremony_type ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            }}
          >
            {couple.ceremony_type ?? db.ceremonyTbd}
          </span>

          {taskTotal > 0 && (
            <p
              className="text-[10px] text-[#b0a090]"
              style={{ fontFamily: VELO_MONO_FONT }}
            >
              {progress}% {db.progressComplete}
            </p>
          )}
        </div>
      </div>
    </CouplePanel>
  )
}

// ─── Section: Next Step ───────────────────────────────────────────────

function NextStepPanel({
  couple,
  engagements,
  tasks,
  vendors,
  isForeign,
  locale,
  db,
}: {
  couple: CoupleRow
  engagements: EngagementRow[]
  tasks: TaskRow[]
  vendors: VendorRow[]
  isForeign: boolean
  locale: Locale
  db: Record<string, string>
}) {
  const vendorMap = Object.fromEntries(vendors.map(v => [v.id, v]))
  const agreedEng = engagements.find(e => e.status === 'agreed')
  const agreedVendor = agreedEng ? vendorMap[agreedEng.vendor_id] : undefined
  const urgentTask = tasks.find(t => t.urgent && !t.completed)

  let label: string
  let href: string

  if (agreedEng) {
    label = db.nextStepAgreed.replace('{name}', agreedVendor?.name ?? '—')
    href = '/couple/vendors'
  } else if (couple.ceremony_type == null) {
    label = db.nextStepCeremony
    href = '/couple/profile'
  } else if (couple.wedding_date == null) {
    label = db.nextStepDate
    href = '/couple/profile'
  } else if (isForeign && engagements.length === 0) {
    label = db.nextStepDocs
    href = '/couple/documents'
  } else if (engagements.length === 0) {
    label = db.nextStepVendors
    href = '/couple/vendors'
  } else if (urgentTask) {
    label = resolveTaskTitle(urgentTask, locale)
    href = '/couple/checklist'
  } else {
    label = db.nextStepChecklist
    href = '/couple/checklist'
  }

  return (
    <CouplePanel tone="soft" className="mb-5">
      <p
        className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)]"
        style={{ fontFamily: VELO_MONO_FONT }}
      >
        {db.nextStepTitle}
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p
          className="max-w-[38rem] text-[1.4rem] font-light leading-snug text-[var(--velo-ink)]"
          style={{ fontFamily: VELO_DISPLAY_FONT }}
        >
          {label}
        </p>
        <Link
          href={href}
          className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
          style={{ fontFamily: VELO_MONO_FONT }}
        >
          →
        </Link>
      </div>
    </CouplePanel>
  )
}

// ─── Section: Documents ───────────────────────────────────────────────

function DocumentsSection({
  couple,
  days,
  isForeign,
  locale,
  db,
}: {
  couple: CoupleRow
  days: number | null
  isForeign: boolean
  locale: Locale
  db: Record<string, string>
}) {
  const isSymbolic = couple.ceremony_type === 'symbolic'
  const countryDoc: CountryDoc | undefined = couple.country_of_origin
    ? COUNTRIES.find(c => c.code === couple.country_of_origin) ?? undefined
    : undefined

  const badgeLabel = countryDoc
    ? db.documentsPersonalized
    : couple.nationality || couple.country_of_origin
    ? db.documentsFallback
    : db.documentsCompleteProfile

  const urgencyNotice =
    !isSymbolic && days !== null
      ? days < 60
        ? { tone: 'danger' as const, text: db.documentsUrgent }
        : days < 120
        ? { tone: 'warning' as const, text: db.documentsEarly }
        : null
      : null

  const ctaLink = (
    <Link
      href="/couple/documents"
      className="text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
      style={{ fontFamily: VELO_MONO_FONT }}
    >
      {db.documentsCta}
    </Link>
  )

  return (
    <CoupleSection title={db.documentsTitle} eyebrow={badgeLabel} cta={ctaLink}>
      {isSymbolic ? (
        <CoupleNotice title={db.documentsSymbolicTitle} tone="neutral">
          {db.documentsSymbolicText}
        </CoupleNotice>
      ) : !isForeign ? (
        <CoupleNotice title="VELO" tone="neutral">
          {db.documentsItalianText}
        </CoupleNotice>
      ) : (
        <>
          {urgencyNotice && (
            <div className="mb-4">
              <CoupleNotice
                title={urgencyNotice.tone === 'danger' ? '!' : '→'}
                tone={urgencyNotice.tone}
              >
                {urgencyNotice.text}
              </CoupleNotice>
            </div>
          )}

          {countryDoc ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: db.documentsMainDoc, value: countryDoc.keyDoc },
                {
                  label: db.documentsWhere,
                  value:
                    countryDoc.steps[0].length > 80
                      ? countryDoc.steps[0].slice(0, 80) + '…'
                      : countryDoc.steps[0],
                },
                { label: db.documentsWhen, value: countryDoc.arrivalDays },
              ].map(card => (
                <div
                  key={card.label}
                  className="rounded-[1.1rem] border border-[var(--velo-border)] bg-[var(--velo-paper-2)] p-4"
                >
                  <p
                    className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]"
                    style={{ fontFamily: VELO_MONO_FONT }}
                  >
                    {card.label}
                  </p>
                  <p className="text-sm leading-6 text-[var(--velo-ink)]">{card.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <CoupleNotice title={db.documentsCompleteProfile} tone="neutral">
              {db.documentsItalianText}
            </CoupleNotice>
          )}
        </>
      )}
    </CoupleSection>
  )
}

// ─── Section: Vendors ─────────────────────────────────────────────────

function VendorsSection({
  engagements,
  vendors,
  locale,
  db,
}: {
  engagements: EngagementRow[]
  vendors: VendorRow[]
  locale: Locale
  db: Record<string, string>
}) {
  const isIT = locale === 'it'
  const vendorMap = Object.fromEntries(vendors.map(v => [v.id, v]))

  const STATUS_LABEL: Record<EngagementStatus, [string, string]> = {
    lead: ['Aggiunto', 'Added'],
    quote_sent: ['Preventivo', 'Quote'],
    agreed: ['Accordo', 'Agreed'],
    booked: ['Confermato', 'Confirmed'],
    completed: ['Completato', 'Completed'],
    cancelled: ['Annullato', 'Cancelled'],
  }
  const statusLabel = (s: EngagementStatus) => (isIT ? STATUS_LABEL[s][0] : STATUS_LABEL[s][1])

  const ACTIVE_STATUSES: EngagementStatus[] = ['booked', 'agreed', 'quote_sent', 'lead']
  const counts = ACTIVE_STATUSES.reduce((acc, s) => {
    acc[s] = engagements.filter(e => e.status === s).length
    return acc
  }, {} as Record<EngagementStatus, number>)
  const activePills = ACTIVE_STATUSES.filter(s => counts[s] > 0)

  const topThree = [...engagements]
    .sort((a, b) => {
      const ai = PIPELINE_ORDER.indexOf(a.status)
      const bi = PIPELINE_ORDER.indexOf(b.status)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    .slice(0, 3)

  const ctaLink = (
    <Link
      href="/couple/vendors"
      className="text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
      style={{ fontFamily: VELO_MONO_FONT }}
    >
      {db.vendorsCta}
    </Link>
  )

  if (engagements.length === 0) {
    return (
      <CoupleSection title={db.vendorsTitle} cta={ctaLink}>
        <p className="text-sm text-[var(--velo-muted)]">{db.vendorsEmpty}</p>
      </CoupleSection>
    )
  }

  return (
    <CoupleSection title={db.vendorsTitle} cta={ctaLink}>
      {activePills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activePills.map(s => (
            <CoupleStatusPill
              key={s}
              status={s}
              label={`${statusLabel(s)} ${counts[s]}`}
            />
          ))}
        </div>
      )}

      <div className="space-y-0">
        {topThree.map(eng => {
          const v = vendorMap[eng.vendor_id]
          return (
            <div
              key={eng.id}
              className="flex items-center justify-between gap-3 border-b border-[var(--velo-border)] py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--velo-ink)]">{v?.name ?? '—'}</p>
                {v?.category && (
                  <p className="text-[11px] text-[var(--velo-muted-soft)]">{v.category}</p>
                )}
              </div>
              <CoupleStatusPill status={eng.status} label={statusLabel(eng.status)} />
            </div>
          )
        })}
      </div>

      <CoupleReadOnlyNotice text={db.vendorsReadOnly} />
    </CoupleSection>
  )
}

// ─── Section: Guests ──────────────────────────────────────────────────

function GuestsSection({
  guests,
  locale,
  db,
}: {
  guests: GuestRow[]
  locale: Locale
  db: Record<string, string>
}) {
  const isIT = locale === 'it'
  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp === 'confirmed').length
  const declined = guests.filter(g => g.rsvp === 'declined').length
  const pending = total - confirmed - declined
  const seats = total + guests.filter(g => g.plus_one === true).length

  const ctaLink = (
    <Link
      href="/couple/guests"
      className="text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
      style={{ fontFamily: VELO_MONO_FONT }}
    >
      {db.guestsCta}
    </Link>
  )

  return (
    <CoupleSection title={db.guestsTitle} cta={ctaLink}>
      <div className="mb-4 flex flex-wrap gap-4">
        {[
          { label: isIT ? 'Totale' : 'Total', value: total, color: 'var(--velo-terracotta)' },
          { label: isIT ? 'Confermati' : 'Confirmed', value: confirmed, color: 'var(--velo-success)' },
          { label: isIT ? 'In attesa' : 'Pending', value: pending, color: 'var(--velo-muted)' },
        ].map(stat => (
          <div key={stat.label} className="min-w-[72px]">
            <p
              className="mb-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: VELO_MONO_FONT, color: stat.color }}
            >
              {stat.label}
            </p>
            <p
              className="text-[2rem] font-light text-[var(--velo-ink)]"
              style={{ fontFamily: VELO_DISPLAY_FONT }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mb-3">
          <CoupleRsvpBar
            confirmed={confirmed}
            pending={pending}
            declined={declined}
            total={total}
          />
        </div>
      )}

      {seats > total && (
        <p className="mb-1 text-[11px] text-[var(--velo-muted-soft)]">
          {seats} {db.guestsSeats}
        </p>
      )}

      <CoupleReadOnlyNotice text={db.guestsReadOnly} />
    </CoupleSection>
  )
}

// ─── Section: Budget ──────────────────────────────────────────────────

function BudgetSection({
  couple,
  expenses,
  locale,
  db,
}: {
  couple: CoupleRow
  expenses: ExpenseRow[]
  locale: Locale
  db: Record<string, string>
}) {
  const isIT = locale === 'it'
  const planned = couple.budget
  const confirmed = expenses
    .filter(e => e.confirmed === true)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const pct =
    planned && planned > 0
      ? Math.min(100, Math.round((confirmed / planned) * 100))
      : 0
  const isOver = planned !== null && confirmed > planned

  const ctaLink = (
    <Link
      href="/couple/budget"
      className="text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
      style={{ fontFamily: VELO_MONO_FONT }}
    >
      {db.budgetCta}
    </Link>
  )

  return (
    <CoupleSection title={db.budgetTitle} cta={ctaLink}>
      {planned == null ? (
        <CoupleNotice title={db.budgetNotSet} tone="neutral">
          {isIT
            ? "Imposta il budget nell'app VELO per vedere i progressi qui."
            : 'Set your budget in the VELO app to see progress here.'}
        </CoupleNotice>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-4">
            {[
              {
                label: isIT ? 'Budget totale' : 'Total budget',
                value: formatCurrency(planned),
                color: 'var(--velo-info)',
              },
              {
                label: isIT ? 'Confermato' : 'Confirmed',
                value: formatCurrency(confirmed),
                color: 'var(--velo-success)',
              },
            ].map(stat => (
              <div key={stat.label} className="min-w-[120px]">
                <p
                  className="mb-1 text-[10px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: VELO_MONO_FONT, color: stat.color }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-[1.8rem] font-light text-[var(--velo-ink)]"
                  style={{ fontFamily: VELO_DISPLAY_FONT }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-2">
            <CoupleProgressBar pct={pct} tone={isOver ? 'danger' : 'default'} />
          </div>
          <p className="mb-1 text-[11px] text-[var(--velo-muted-soft)]">{pct}%</p>
        </>
      )}

      <CoupleReadOnlyNotice text={db.budgetReadOnly} />
    </CoupleSection>
  )
}

// ─── Section: Checklist ───────────────────────────────────────────────

function ChecklistSection({
  tasks,
  locale,
  db,
}: {
  tasks: TaskRow[]
  locale: Locale
  db: Record<string, string>
}) {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const urgentTasks = tasks.filter(t => t.urgent && !t.completed).slice(0, 3)

  const ctaLink = (
    <Link
      href="/couple/checklist"
      className="text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)] transition-opacity hover:opacity-70"
      style={{ fontFamily: VELO_MONO_FONT }}
    >
      {db.checklistCta}
    </Link>
  )

  return (
    <CoupleSection title={db.checklistTitle} cta={ctaLink}>
      {total === 0 ? (
        <p className="text-sm text-[var(--velo-muted)]">{db.noUrgentTasks}</p>
      ) : (
        <>
          <div className="mb-2">
            <CoupleProgressBar pct={pct} />
          </div>
          <p className="mb-4 text-[11px] text-[var(--velo-muted-soft)]">
            {completed} / {total} {db.checklistCompleted}
          </p>

          {urgentTasks.length > 0 ? (
            <div>
              {urgentTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--velo-border)] py-3 last:border-0"
                >
                  <p className="text-sm text-[var(--velo-ink)]">
                    {resolveTaskTitle(task, locale)}
                  </p>
                  <span
                    className="inline-block shrink-0 rounded-full px-[10px] py-1 text-[10px] uppercase tracking-[0.06em]"
                    style={{
                      color: 'var(--velo-danger)',
                      background: 'rgba(196,117,106,0.08)',
                      border: '1px solid rgba(196,117,106,0.2)',
                      fontFamily: VELO_MONO_FONT,
                    }}
                  >
                    {locale === 'it' ? 'Urgente' : 'Urgent'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--velo-muted)]">{db.noUrgentTasks}</p>
          )}
        </>
      )}
    </CoupleSection>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const uid = session.user.id

      // Round 1: couple + locale
      const coupleRes = await supabase
        .from('couples')
        .select(
          'partner1, partner2, wedding_date, budget, wedding_city, wedding_region, ceremony_type, nationality, country_of_origin',
        )
        .eq('user_id', uid)
        .single()

      if (coupleRes.error || !coupleRes.data) {
        setFetchError(true)
        setLoading(false)
        return
      }

      const fallbackLocale = getPreferredSiteLocale()
      const resolvedLocale = getCoupleLocale(coupleRes.data, fallbackLocale)
      persistCoupleLocale(resolvedLocale)
      setLocale(resolvedLocale)

      // Round 2: parallel fetch
      const [engRes, taskRes, guestRes, expenseRes, vendorRes] = await Promise.all([
        supabase
          .from('engagements')
          .select('id, vendor_id, status')
          .eq('user_id', uid),
        supabase
          .from('tasks')
          .select('id, title, title_it, title_en, urgent, completed, phase')
          .eq('user_id', uid),
        supabase
          .from('guests')
          .select('id, rsvp, plus_one')
          .eq('user_id', uid),
        supabase
          .from('expenses')
          .select('id, amount, confirmed')
          .eq('user_id', uid),
        supabase
          .from('vendors')
          .select('id, name, category')
          .eq('user_id', uid),
      ])

      setData({
        couple: coupleRes.data as CoupleRow,
        engagements: (engRes.data ?? []) as EngagementRow[],
        tasks: (taskRes.data ?? []) as TaskRow[],
        guests: (guestRes.data ?? []) as GuestRow[],
        expenses: (expenseRes.data ?? []) as ExpenseRow[],
        vendors: (vendorRes.data ?? []) as VendorRow[],
      })

      setLoading(false)
    }

    load()
  }, [])

  const d = getT(locale)
  const db = (d as any).couple.dashboard as Record<string, string>

  if (loading) return <CoupleLoadingBlock />

  if (fetchError || !data) {
    return (
      <CoupleNotice
        title={locale === 'en' ? 'Unable to load dashboard' : 'Impossibile caricare la dashboard'}
        tone="danger"
      >
        {locale === 'en'
          ? 'This may be a temporary issue. Try refreshing the page.'
          : 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.'}
      </CoupleNotice>
    )
  }

  const { couple, engagements, tasks, guests, expenses, vendors } = data
  const days = couple.wedding_date ? daysUntil(couple.wedding_date) : null
  const isForeign = resolveIsForeign(couple)
  const taskCompleted = tasks.filter(t => t.completed).length

  return (
    <div>
      <HeroPanel
        couple={couple}
        days={days}
        taskTotal={tasks.length}
        taskCompleted={taskCompleted}
        locale={locale}
        db={db}
      />

      <NextStepPanel
        couple={couple}
        engagements={engagements}
        tasks={tasks}
        vendors={vendors}
        isForeign={isForeign}
        locale={locale}
        db={db}
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <DocumentsSection
          couple={couple}
          days={days}
          isForeign={isForeign}
          locale={locale}
          db={db}
        />
        <VendorsSection
          engagements={engagements}
          vendors={vendors}
          locale={locale}
          db={db}
        />
        <GuestsSection
          guests={guests}
          locale={locale}
          db={db}
        />
        <BudgetSection
          couple={couple}
          expenses={expenses}
          locale={locale}
          db={db}
        />
      </div>

      <ChecklistSection
        tasks={tasks}
        locale={locale}
        db={db}
      />
    </div>
  )
}
