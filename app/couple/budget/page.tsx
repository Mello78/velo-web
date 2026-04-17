'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type ExpenseStatus = 'confirmed' | 'to_confirm'

interface ExpenseRow {
  id: string
  title: string
  amount: number | null
  category: string | null
  confirmed: boolean | null
}

interface BudgetCategoryGroup {
  category: string
  expenses: ExpenseRow[]
  total: number
  confirmedTotal: number
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

function getBudgetCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: 'BUDGET',
    pageTitle: isIT ? 'Le vostre stime' : 'Your estimates',
    readOnly: isIT ? 'Vista in sola lettura — usa l’app VELO per aggiungere voci o confermare importi' : 'Read-only view — use the VELO app to add items or confirm amounts',
    planned: isIT ? 'Budget totale' : 'Planned budget',
    estimated: isIT ? 'Stimato' : 'Estimated',
    confirmed: isIT ? 'Confermato' : 'Confirmed',
    available: isIT ? 'Disponibile' : 'Available',
    overPlanned: isIT ? 'Oltre il budget' : 'Over planned',
    noBudgetSet: isIT ? 'Budget non impostato' : 'No budget set',
    noBudgetSetDesc: isIT ? 'Il budget totale della coppia non è ancora stato impostato. Le voci di spesa sono comunque aggiornate.' : 'The couple planned budget has not been set yet. Expense items are still up to date.',
    budgetLoadErrorTitle: isIT ? 'Budget totale non disponibile' : 'Planned budget unavailable',
    budgetLoadErrorDesc: isIT ? 'Non siamo riusciti a caricare il budget totale della coppia. Le voci di spesa sono comunque aggiornate.' : 'We could not load the couple planned budget total. Expense items are still up to date.',
    all: isIT ? 'Tutti' : 'All',
    toConfirm: isIT ? 'Da confermare' : 'To confirm',
    category: isIT ? 'Categoria' : 'Category',
    amount: isIT ? 'Importo indicativo' : 'Indicative amount',
    emptyTitle: isIT ? 'Nessuna voce ancora' : 'No items yet',
    emptyDesc: isIT ? 'Aggiungete le vostre stime dall’app VELO — il budget apparirà qui.' : 'Add your estimates in the VELO app — your budget will appear here.',
    errorTitle: isIT ? 'Impossibile caricare il budget' : 'Unable to load budget',
    errorDesc: isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
    estimatedPct: isIT ? '% del budget stimato' : '% of budget estimated',
    disclaimer: isIT ? 'Gli importi sono stime organizzative. VELO non elabora pagamenti.' : 'Amounts are planning estimates. VELO does not process payments.',
    uncategorized: isIT ? 'Altro' : 'Other',
    statusLabel: (status: ExpenseStatus) => isIT
      ? (status === 'confirmed' ? 'Confermato' : 'Da confermare')
      : (status === 'confirmed' ? 'Confirmed' : 'To confirm'),
  }
}

type BudgetCopy = ReturnType<typeof getBudgetCopy>

function expenseStatus(expense: ExpenseRow): ExpenseStatus {
  return expense.confirmed ? 'confirmed' : 'to_confirm'
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function stripEmoji(value: string) {
  return value.replace(/^[^A-Za-zÀ-ÿ]+/, '').trim() || value
}

function statusColor(status: ExpenseStatus) {
  if (status === 'confirmed') {
    return {
      color: '#7A9E7E',
      bg: 'rgba(122,158,126,0.10)',
      border: 'rgba(122,158,126,0.25)',
    }
  }
  return {
    color: '#8A7E6A',
    bg: 'rgba(138,126,106,0.10)',
    border: 'rgba(138,126,106,0.20)',
  }
}

function PageHeader({ copy }: { copy: BudgetCopy }) {
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

function ErrorBanner({ title, desc, tone = 'danger' }: { title: string; desc: string; tone?: 'danger' | 'warning' }) {
  const palette = tone === 'warning'
    ? { bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)', title: '#C9A84C' }
    : { bg: 'rgba(196,117,106,0.06)', border: 'rgba(196,117,106,0.2)', title: '#C4756A' }

  return (
    <div style={{
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 13, color: palette.title, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function SummaryCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 140,
      background: '#1A1915',
      border: `1px solid ${color}20`,
      borderRadius: 12,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 300, color: '#F5EDD6', lineHeight: 1.05 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#5A5040', marginTop: 6 }}>{sub}</div>}
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

function StatusPill({ status, copy }: { status: ExpenseStatus; copy: BudgetCopy }) {
  const cfg = statusColor(status)
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
      {copy.statusLabel(status)}
    </span>
  )
}

function ExpenseCardRow({ expense, copy, locale }: { expense: ExpenseRow; copy: BudgetCopy; locale: string }) {
  const status = expenseStatus(expense)
  const category = expense.category ? stripEmoji(expense.category) : copy.uncategorized

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
      opacity: status === 'confirmed' ? 0.78 : 1,
    }}>
      <div style={{
        flexShrink: 0,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: statusColor(status).color,
        marginTop: 6,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, color: '#F5EDD6', fontWeight: 400 }}>{expense.title}</span>
          <StatusPill status={status} copy={copy} />
        </div>
        <div style={{ fontSize: 12, color: '#8A7E6A', marginBottom: 8 }}>
          {copy.category}: {category}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 300, color: status === 'confirmed' ? '#7A9E7E' : '#C9A84C', lineHeight: 1 }}>
          {formatCurrency(expense.amount ?? 0, locale)}
        </div>
        <div style={{ fontSize: 11, color: '#5A5040', marginTop: 4 }}>{copy.amount}</div>
      </div>
    </div>
  )
}

function CategoryGroup({ group, locale, copy }: { group: BudgetCategoryGroup; locale: string; copy: BudgetCopy }) {
  const [collapsed, setCollapsed] = useState(false)

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
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
        <span style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', fontWeight: 600 }}>
          {group.category}
        </span>
        <span style={{ fontSize: 12, color: '#3A3830', marginLeft: 4 }}>{group.expenses.length}</span>
        <span style={{ fontSize: 12, color: '#8A7E6A', marginLeft: 8 }}>
          {formatCurrency(group.total, locale)}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M2 4L6 8L10 4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {!collapsed && (
        <>
          {group.expenses.map(expense => (
            <ExpenseCardRow key={expense.id} expense={expense} copy={copy} locale={locale} />
          ))}
          {group.confirmedTotal > 0 && (
            <div style={{ fontSize: 11, color: '#5A5040', marginTop: -2, marginBottom: 8, paddingLeft: 18 }}>
              {copy.confirmed}: {formatCurrency(group.confirmedTotal, locale)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function BudgetPage() {
  const locale = useLocale()
  const copy = getBudgetCopy(locale)
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [budgetTotal, setBudgetTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [budgetMissing, setBudgetMissing] = useState(false)
  const [budgetLoadError, setBudgetLoadError] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setFetchError(true)
        setLoading(false)
        return
      }

      const uid = session.user.id

      const [expensesRes, coupleRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('id, title, amount, category, confirmed')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('couples')
          .select('budget')
          .eq('user_id', uid)
          .single(),
      ])

      if (expensesRes.error) {
        setFetchError(true)
        setLoading(false)
        return
      }

      if (coupleRes.error) {
        if (coupleRes.error.code === 'PGRST116') setBudgetMissing(true)
        else setBudgetLoadError(true)
      } else {
        setBudgetTotal(coupleRes.data?.budget ?? null)
        if (coupleRes.data?.budget == null) setBudgetMissing(true)
      }

      setExpenses((expensesRes.data ?? []) as ExpenseRow[])
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

  const estimated = expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
  const confirmedTotal = expenses.filter(expense => expense.confirmed).reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
  const available = typeof budgetTotal === 'number' ? budgetTotal - estimated : null
  const pct = typeof budgetTotal === 'number' && budgetTotal > 0 ? Math.min(100, Math.round((estimated / budgetTotal) * 100)) : 0
  const filteredExpenses = filterStatus === 'all'
    ? expenses
    : expenses.filter(expense => expenseStatus(expense) === filterStatus)

  const categories = filteredExpenses.reduce<Record<string, BudgetCategoryGroup>>((acc, expense) => {
    const key = expense.category ? stripEmoji(expense.category) : copy.uncategorized
    if (!acc[key]) {
      acc[key] = { category: key, expenses: [], total: 0, confirmedTotal: 0 }
    }
    acc[key].expenses.push(expense)
    acc[key].total += expense.amount ?? 0
    if (expense.confirmed) acc[key].confirmedTotal += expense.amount ?? 0
    return acc
  }, {})

  const categoryGroups = Object.values(categories).sort((a, b) => b.total - a.total)
  const confirmedCount = expenses.filter(expense => expense.confirmed).length
  const toConfirmCount = expenses.length - confirmedCount

  return (
    <div>
      <PageHeader copy={copy} />

      {budgetLoadError && (
        <div style={{ marginBottom: 20 }}>
          <ErrorBanner title={copy.budgetLoadErrorTitle} desc={copy.budgetLoadErrorDesc} tone="warning" />
        </div>
      )}

      {budgetMissing && (
        <div style={{ marginBottom: 20 }}>
          <ErrorBanner title={copy.noBudgetSet} desc={copy.noBudgetSetDesc} tone="warning" />
        </div>
      )}

      {expenses.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <SummaryCard
              label={copy.planned}
              value={typeof budgetTotal === 'number' ? formatCurrency(budgetTotal, locale) : '—'}
              color="#4A7AB8"
              sub={typeof budgetTotal === 'number' ? undefined : (budgetLoadError ? copy.budgetLoadErrorTitle : copy.noBudgetSet)}
            />
            <SummaryCard label={copy.estimated} value={formatCurrency(estimated, locale)} color="#C9A84C" />
            <SummaryCard label={copy.confirmed} value={formatCurrency(confirmedTotal, locale)} color="#7A9E7E" />
            {typeof available === 'number' && (
              <SummaryCard
                label={available >= 0 ? copy.available : copy.overPlanned}
                value={formatCurrency(Math.abs(available), locale)}
                color={available >= 0 ? '#7A9E7E' : '#C4756A'}
              />
            )}
          </div>

          {typeof budgetTotal === 'number' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 3, background: '#1E1D1A', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: estimated > budgetTotal ? '#C4756A' : '#C9A84C',
                    borderRadius: 2,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, color: '#8A7E6A' }}>{pct}% {copy.estimatedPct}</div>
                <div style={{ fontSize: 11, color: '#5A5040' }}>{copy.disclaimer}</div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
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

      {expenses.length === 0 ? (
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            <FilterTab
              label={copy.all}
              count={expenses.length}
              active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            />
            <FilterTab
              label={copy.confirmed}
              count={confirmedCount}
              color="#7A9E7E"
              active={filterStatus === 'confirmed'}
              onClick={() => setFilterStatus('confirmed')}
            />
            <FilterTab
              label={copy.toConfirm}
              count={toConfirmCount}
              color="#8A7E6A"
              active={filterStatus === 'to_confirm'}
              onClick={() => setFilterStatus('to_confirm')}
            />
          </div>

          {categoryGroups.map(group => (
            <CategoryGroup key={group.category} group={group} locale={locale} copy={copy} />
          ))}
        </>
      )}
    </div>
  )
}
