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

interface DashboardData {
  partner1: string
  partner2: string
  wedding_date: string | null
  budget: number | null
  wedding_city: string | null
  wedding_region: string | null
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

export default function DashboardPage() {
  const locale = useLocale()
  const d = getT(locale)
  const c = (d as any).couple

  const [couple, setCouple] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      const [coupleRes, engagementsRes, tasksRes, guestsRes, expensesRes] = await Promise.all([
        supabase.from('couples')
          .select('partner1, partner2, wedding_date, budget, wedding_city, wedding_region')
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

      setCouple(coupleRes.data)

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 28, height: 28, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const days = couple?.wedding_date ? daysUntil(couple.wedding_date) : null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>
          {c.dashboard.greeting}{couple?.partner1 ? `, ${couple.partner1}` : ''}
          {couple?.partner2 ? ` & ${couple.partner2}` : ''}
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0, lineHeight: 1.2 }}>
          Dashboard
        </h1>
        {couple?.wedding_city && (
          <div style={{ fontSize: 13, color: '#8A7E6A', marginTop: 6 }}>
            {couple.wedding_city}{couple.wedding_region ? ` · ${couple.wedding_region}` : ''}
          </div>
        )}
      </div>

      {/* Countdown */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1915 0%, #0F0E0C 100%)',
        border: '1px solid #2A2820',
        borderRadius: 16,
        padding: '32px 28px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)' }} />

        {days !== null ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 72, fontWeight: 300, color: '#C9A84C', lineHeight: 1 }}>
                {days > 0 ? days : 0}
              </span>
              <span style={{ fontSize: 16, color: '#8A7E6A', fontWeight: 300 }}>{c.dashboard.days}</span>
            </div>
            <div style={{ fontSize: 14, color: '#8A7E6A', letterSpacing: 1 }}>{c.dashboard.countdown}</div>
            <div style={{ fontSize: 13, color: '#5A5040', marginTop: 8 }}>
              {formatDate(couple!.wedding_date!, locale)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 16, color: '#5A5040', fontStyle: 'italic' }}>{c.dashboard.noDate}</div>
        )}
      </div>

      {/* Stats grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="stats-grid">
          <StatCard
            label={c.dashboard.vendorsStat}
            value={`${stats.confirmedVendors}`}
            sub={stats.totalVendors > 0 ? `/ ${stats.totalVendors}` : undefined}
          />
          <StatCard
            label={c.dashboard.tasksStat}
            value={`${stats.completedTasks}`}
            sub={stats.totalTasks > 0 ? `/ ${stats.totalTasks}` : undefined}
          />
          <StatCard
            label={c.dashboard.guestsStat}
            value={`${stats.guestCount}`}
          />
          <StatCard
            label={c.dashboard.budgetStat}
            value={couple?.budget ? formatBudget(couple.budget) : '—'}
            sub={stats.spentBudget > 0 ? `${formatBudget(stats.spentBudget)} confermato` : undefined}
          />
        </div>
      )}

      {/* App CTA */}
      <div style={{
        border: '1px solid #2A2820',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#F5EDD6', marginBottom: 4 }}>
            {locale === 'en' ? 'Full experience on the VELO app' : 'Esperienza completa sull\'app VELO'}
          </div>
          <div style={{ fontSize: 12, color: '#8A7E6A' }}>
            {locale === 'en'
              ? 'Chat with vendors, manage tasks and guests, track your budget.'
              : 'Chatta con i fornitori, gestisci task e ospiti, tieni traccia del budget.'}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#C9A84C', whiteSpace: 'nowrap' }}>
          {locale === 'en' ? 'App Store →' : 'App Store →'}
        </div>
      </div>

      <style>{`
        @media (min-width: 600px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#1A1915',
      border: '1px solid #2A2820',
      borderRadius: 12,
      padding: '20px 18px',
    }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 36, fontWeight: 300, color: '#F5EDD6', lineHeight: 1 }}>
        {value}
        {sub && <span style={{ fontSize: 14, color: '#8A7E6A', marginLeft: 6 }}>{sub}</span>}
      </div>
    </div>
  )
}
