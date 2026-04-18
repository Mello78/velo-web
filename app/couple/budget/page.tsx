'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
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
    pageSub: isIT
      ? 'Una lettura piu chiara di cosa e gia confermato, cosa resta indicativo e come tutto si muove rispetto al budget.'
      : 'A clearer read of what is confirmed, what remains indicative, and how everything moves against the budget.',
    readOnly: isIT ? "Vista in sola lettura — usa l'app VELO per aggiungere voci o confermare importi" : 'Read-only view — use the VELO app to add items or confirm amounts',
    planned: isIT ? 'Budget totale' : 'Planned budget',
    estimated: isIT ? 'Stimato' : 'Estimated',
    confirmed: isIT ? 'Confermato' : 'Confirmed',
    available: isIT ? 'Disponibile' : 'Available',
    overPlanned: isIT ? 'Oltre il budget' : 'Over planned',
    noBudgetSet: isIT ? 'Budget non impostato' : 'No budget set',
    noBudgetSetDesc: isIT ? 'Il budget totale della coppia non e ancora stato impostato. Le voci di spesa sono comunque aggiornate.' : 'The couple planned budget has not been set yet. Expense items are still up to date.',
    budgetLoadErrorTitle: isIT ? 'Budget totale non disponibile' : 'Planned budget unavailable',
    budgetLoadErrorDesc: isIT ? 'Non siamo riusciti a caricare il budget totale della coppia. Le voci di spesa sono comunque aggiornate.' : 'We could not load the couple planned budget total. Expense items are still up to date.',
    all: isIT ? 'Tutti' : 'All',
    toConfirm: isIT ? 'Da confermare' : 'To confirm',
    category: isIT ? 'Categoria' : 'Category',
    amount: isIT ? 'Importo indicativo' : 'Indicative amount',
    emptyTitle: isIT ? 'Nessuna voce ancora' : 'No items yet',
    emptyDesc: isIT ? "Aggiungete le vostre stime dall'app VELO e il budget apparira qui." : 'Add your estimates in the VELO app and your budget will appear here.',
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
    return { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' }
  }
  return { color: 'var(--velo-muted)', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.20)' }
}

function SummaryCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <CouplePanel className="min-w-[150px] flex-1 rounded-[1.25rem] p-4 shadow-none">
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: VELO_MONO_FONT }}>
        {label}
      </div>
      <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 30, fontWeight: 300, color: 'var(--velo-ink)', lineHeight: 1.04 }}>{value}</div>
      {sub && <div className="mt-2 text-[11px] leading-5 text-[var(--velo-muted-soft)]">{sub}</div>}
    </CouplePanel>
  )
}

function StatusPill({ status, copy }: { status: ExpenseStatus; copy: BudgetCopy }) {
  const cfg = statusColor(status)
  return (
    <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 999, padding: '4px 10px', fontFamily: VELO_MONO_FONT }}>
      {copy.statusLabel(status)}
    </span>
  )
}

function ExpenseCardRow({ expense, copy, locale }: { expense: ExpenseRow; copy: BudgetCopy; locale: string }) {
  const status = expenseStatus(expense)
  const category = expense.category ? stripEmoji(expense.category) : copy.uncategorized

  return (
    <CouplePanel className="mb-3 p-5 shadow-none" tone="paper">
      <div className="flex gap-4">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(status).color, marginTop: 8, flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-[var(--velo-ink)]">{expense.title}</span>
            <StatusPill status={status} copy={copy} />
          </div>
          <div className="text-sm text-[var(--velo-muted)]">
            {copy.category}: {category}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 30, fontWeight: 300, color: status === 'confirmed' ? 'var(--velo-success)' : 'var(--velo-terracotta)', lineHeight: 1 }}>
            {formatCurrency(expense.amount ?? 0, locale)}
          </div>
          <div className="mt-1 text-[11px] text-[var(--velo-muted-soft)]">{copy.amount}</div>
        </div>
      </div>
    </CouplePanel>
  )
}

function CategoryGroup({ group, locale, copy }: { group: BudgetCategoryGroup; locale: string; copy: BudgetCopy }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-4">
      <button onClick={() => setCollapsed(c => !c)} className="flex w-full items-center gap-3 border-b border-[var(--velo-border)] pb-2">
        <div className="h-[7px] w-[7px] rounded-full bg-[var(--velo-terracotta)]" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
          {group.category}
        </span>
        <span className="text-xs text-[var(--velo-muted-soft)]">{group.expenses.length}</span>
        <span className="ml-2 text-xs text-[var(--velo-muted)]">{formatCurrency(group.total, locale)}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4L6 8L10 4" stroke="var(--velo-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {!collapsed && (
        <div className="mt-4">
          {group.expenses.map(expense => <ExpenseCardRow key={expense.id} expense={expense} copy={copy} locale={locale} />)}
          {group.confirmedTotal > 0 && (
            <div className="mb-2 pl-4 text-[11px] text-[var(--velo-muted-soft)]">
              {copy.confirmed}: {formatCurrency(group.confirmedTotal, locale)}
            </div>
          )}
        </div>
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
        supabase.from('expenses').select('id, title, amount, category, confirmed').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('couples').select('budget').eq('user_id', uid).single(),
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

  if (loading) return <CoupleLoadingBlock />

  if (fetchError) {
    return (
      <div>
        <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />
        <CoupleNotice title={copy.errorTitle} tone="danger">{copy.errorDesc}</CoupleNotice>
      </div>
    )
  }

  const estimated = expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
  const confirmedTotal = expenses.filter(expense => expense.confirmed).reduce((sum, expense) => sum + (expense.amount ?? 0), 0)
  const available = typeof budgetTotal === 'number' ? budgetTotal - estimated : null
  const pct = typeof budgetTotal === 'number' && budgetTotal > 0 ? Math.min(100, Math.round((estimated / budgetTotal) * 100)) : 0
  const filteredExpenses = filterStatus === 'all' ? expenses : expenses.filter(expense => expenseStatus(expense) === filterStatus)

  const categories = filteredExpenses.reduce<Record<string, BudgetCategoryGroup>>((acc, expense) => {
    const key = expense.category ? stripEmoji(expense.category) : copy.uncategorized
    if (!acc[key]) acc[key] = { category: key, expenses: [], total: 0, confirmedTotal: 0 }
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
      <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />

      {budgetLoadError && (
        <div className="mb-5">
          <CoupleNotice title={copy.budgetLoadErrorTitle} tone="warning">{copy.budgetLoadErrorDesc}</CoupleNotice>
        </div>
      )}

      {budgetMissing && (
        <div className="mb-5">
          <CoupleNotice title={copy.noBudgetSet} tone="warning">{copy.noBudgetSetDesc}</CoupleNotice>
        </div>
      )}

      {expenses.length > 0 && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <SummaryCard label={copy.planned} value={typeof budgetTotal === 'number' ? formatCurrency(budgetTotal, locale) : '—'} accent="var(--velo-info)" sub={typeof budgetTotal === 'number' ? undefined : (budgetLoadError ? copy.budgetLoadErrorTitle : copy.noBudgetSet)} />
            <SummaryCard label={copy.estimated} value={formatCurrency(estimated, locale)} accent="var(--velo-terracotta)" />
            <SummaryCard label={copy.confirmed} value={formatCurrency(confirmedTotal, locale)} accent="var(--velo-success)" />
            {typeof available === 'number' && (
              <SummaryCard label={available >= 0 ? copy.available : copy.overPlanned} value={formatCurrency(Math.abs(available), locale)} accent={available >= 0 ? 'var(--velo-success)' : 'var(--velo-danger)'} />
            )}
          </div>

          {typeof budgetTotal === 'number' && (
            <div className="mb-6">
              <div className="h-[5px] overflow-hidden rounded-full bg-[rgba(140,104,74,0.16)]">
                <div style={{ height: '100%', width: `${pct}%`, background: estimated > budgetTotal ? 'var(--velo-danger)' : 'var(--velo-terracotta)', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-3 text-[11px] text-[var(--velo-muted-soft)]">
                <span>{pct}% {copy.estimatedPct}</span>
                <span>{copy.disclaimer}</span>
              </div>
            </div>
          )}

          <CoupleNotice title={locale === 'en' ? 'Read-only on web' : 'Sola lettura sul web'} className="mb-6">
            {copy.readOnly}
          </CoupleNotice>
        </>
      )}

      {expenses.length === 0 ? (
        <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <CoupleChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
              {copy.all} <span>{expenses.length}</span>
            </CoupleChip>
            <CoupleChip accent="var(--velo-success)" active={filterStatus === 'confirmed'} onClick={() => setFilterStatus('confirmed')}>
              {copy.confirmed} <span>{confirmedCount}</span>
            </CoupleChip>
            <CoupleChip accent="var(--velo-muted)" active={filterStatus === 'to_confirm'} onClick={() => setFilterStatus('to_confirm')}>
              {copy.toConfirm} <span>{toConfirmCount}</span>
            </CoupleChip>
          </div>

          {categoryGroups.map(group => <CategoryGroup key={group.category} group={group} locale={locale} copy={copy} />)}
        </>
      )}
    </div>
  )
}
