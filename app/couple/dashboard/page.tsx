'use client'
import { useEffect, useState } from 'react'
import { getCoupleLocale, getPreferredSiteLocale, persistCoupleLocale } from '../../../lib/couple-locale'
import { supabase } from '../../../lib/supabase'
import { getT, type Locale } from '../../../lib/translations'
import {
  CoupleLoadingBlock,
  CoupleMetricCard,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

interface DashboardData {
  partner1: string
  partner2: string
  wedding_date: string | null
  budget: number | null
  wedding_city: string | null
  wedding_region: string | null
  nationality: string | null
  country_of_origin: string | null
}

interface Stats {
  confirmedVendors: number
  totalVendors: number
  completedTasks: number
  totalTasks: number
  guestCount: number
  spentBudget: number
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatBudget(n: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function getDashboardCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    title: isIT ? 'La dashboard del matrimonio' : 'The wedding dashboard',
    subtitle: isIT
      ? 'Una vista calma su data, progressi, fornitori, ospiti e budget.'
      : 'A calm overview of date, progress, vendors, guests, and budget.',
    confirmedBudget: isIT ? 'confermato' : 'confirmed',
    appTitle: isIT ? "L'esperienza completa continua nell'app VELO" : 'The full experience continues in the VELO app',
    appDesc: isIT
      ? 'Chat con i fornitori, gestione task e aggiornamenti rapidi restano sincronizzati con questo spazio.'
      : 'Vendor chat, task management, and quick updates stay in sync with this space.',
    appCta: isIT ? 'Continua su App Store →' : 'Continue on App Store →',
    noDateTitle: isIT ? 'Data non ancora definita' : 'Date not set yet',
    noDateBody: isIT
      ? 'Quando la data sara confermata, il countdown apparira qui insieme al ritmo del planning.'
      : 'Once the date is confirmed, your countdown will appear here with the planning rhythm.',
  }
}

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const d = getT(locale)
  const c = (d as any).couple
  const copy = getDashboardCopy(locale)

  const [couple, setCouple] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const fallbackLocale = getPreferredSiteLocale()
      setLocale(fallbackLocale)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      const [coupleRes, engagementsRes, tasksRes, guestsRes, expensesRes] = await Promise.all([
        supabase.from('couples')
          .select('partner1, partner2, wedding_date, budget, wedding_city, wedding_region, nationality, country_of_origin')
          .eq('user_id', userId).single(),
        supabase.from('engagements')
          .select('status').eq('user_id', userId),
        supabase.from('tasks')
          .select('completed').eq('user_id', userId),
        supabase.from('guests')
          .select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('expenses')
          .select('amount, confirmed').eq('user_id', userId),
      ])

      const coupleData = coupleRes.data
      if (coupleData) {
        const nextLocale = getCoupleLocale(coupleData, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
      }

      setCouple(coupleData)

      const engagements = engagementsRes.data ?? []
      const tasks = tasksRes.data ?? []
      const guests = guestsRes.count ?? 0
      const expenses = expensesRes.data ?? []

      setStats({
        confirmedVendors: engagements.filter(e => e.status === 'booked').length,
        totalVendors: engagements.length,
        completedTasks: tasks.filter(t => t.completed).length,
        totalTasks: tasks.length,
        guestCount: guests,
        spentBudget: expenses.filter(e => e.confirmed).reduce((sum, e) => sum + (e.amount ?? 0), 0),
      })

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CoupleLoadingBlock />

  const days = couple?.wedding_date ? daysUntil(couple.wedding_date) : null
  const meta = couple?.wedding_city
    ? (
      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
        {couple.wedding_city}{couple.wedding_region ? ` · ${couple.wedding_region}` : ''}
      </p>
    )
    : undefined

  return (
    <div>
      <CouplePageIntro
        eyebrow={c.dashboard.greeting + (couple?.partner1 ? `, ${couple.partner1}` : '') + (couple?.partner2 ? ` & ${couple.partner2}` : '')}
        title={copy.title}
        subtitle={copy.subtitle}
        meta={meta}
      />

      <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <CouplePanel tone="dark" className="relative overflow-hidden">
          <div className="absolute right-[-1rem] top-[-1rem] h-28 w-28 rounded-full border border-white/10" />
          <div className="absolute right-6 top-6 h-14 w-14 rounded-full border border-white/8" />
          {days !== null ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d7b89d]" style={{ fontFamily: VELO_MONO_FONT }}>
                {c.dashboard.countdown}
              </p>
              <div className="mt-5 flex items-end gap-4">
                <span className="text-[4.8rem] font-light leading-none text-[#f7efe4]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
                  {days > 0 ? days : 0}
                </span>
                <span className="pb-2 text-base text-[#d2c3b0]">{c.dashboard.days}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#d2c3b0]">
                {couple?.wedding_date ? formatDate(couple.wedding_date, locale) : ''}
              </p>
            </>
          ) : (
            <CoupleNotice title={copy.noDateTitle} tone="neutral" className="border-white/10 bg-white/[0.04] text-[#d2c3b0]">
              {copy.noDateBody}
            </CoupleNotice>
          )}
        </CouplePanel>

        <CouplePanel>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {copy.appTitle}
          </p>
          <p className="mt-4 text-[1.35rem] leading-snug text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
            {locale === 'en' ? 'The couple space stays connected across web and app.' : "Lo spazio coppia resta connesso tra web e app."}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--velo-muted)]">{copy.appDesc}</p>
          <div className="mt-6 inline-flex rounded-full border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {copy.appCta}
          </div>
        </CouplePanel>
      </div>

      {stats && (
        <div className="mt-5 flex flex-wrap gap-4">
          <CoupleMetricCard
            label={c.dashboard.vendorsStat}
            value={<>{stats.confirmedVendors}<span className="ml-2 text-sm text-[var(--velo-muted-soft)]">/ {stats.totalVendors}</span></>}
            accent="var(--velo-success)"
          />
          <CoupleMetricCard
            label={c.dashboard.tasksStat}
            value={<>{stats.completedTasks}<span className="ml-2 text-sm text-[var(--velo-muted-soft)]">/ {stats.totalTasks}</span></>}
            accent="var(--velo-terracotta)"
          />
          <CoupleMetricCard label={c.dashboard.guestsStat} value={stats.guestCount} accent="var(--velo-info)" />
          <CoupleMetricCard
            label={c.dashboard.budgetStat}
            value={couple?.budget ? formatBudget(couple.budget) : '—'}
            accent="var(--velo-terracotta)"
            sub={stats.spentBudget > 0 ? `${formatBudget(stats.spentBudget)} ${copy.confirmedBudget}` : undefined}
          />
        </div>
      )}
    </div>
  )
}
