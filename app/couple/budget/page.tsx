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

const BUDGET_CATEGORIES = ['Venue', 'Photography', 'Catering', 'Flowers', 'Music', 'Attire', 'Beauty', 'Transport', 'Accommodation', 'Honeymoon', 'Other']
const BUDGET_CATEGORIES_IT = ['Location', 'Fotografia', 'Catering', 'Fiori', 'Musica', 'Abiti', 'Beauty', 'Trasporti', 'Alloggio', 'Luna di miele', 'Altro']

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) || parsed <= 0 ? null : parsed
}

function getBudgetCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: 'BUDGET',
    pageTitle: isIT ? 'Le vostre stime' : 'Your estimates',
    pageSub: isIT
      ? 'Una lettura piu chiara di cosa e confermato, cosa resta indicativo e come tutto si muove rispetto al budget.'
      : 'A clearer read of what is confirmed, what remains indicative, and how everything sits against the budget.',
    planned: isIT ? 'Budget totale' : 'Planned budget',
    estimated: isIT ? 'Stimato' : 'Estimated',
    confirmed: isIT ? 'Confermato' : 'Confirmed',
    available: isIT ? 'Disponibile' : 'Available',
    overPlanned: isIT ? 'Oltre il budget' : 'Over planned',
    noBudgetSet: isIT ? 'Budget non impostato' : 'No budget set',
    noBudgetSetDesc: isIT ? 'Il budget totale non e ancora stato impostato. Le voci di spesa sono comunque visibili qui.' : 'The couple planned budget has not been set yet. Expense items are still visible here.',
    budgetLoadErrorTitle: isIT ? 'Budget totale non disponibile' : 'Planned budget unavailable',
    budgetLoadErrorDesc: isIT ? 'Non siamo riusciti a caricare il budget totale. Le voci di spesa sono comunque aggiornate.' : 'We could not load the couple planned budget total. Expense items are still up to date.',
    all: isIT ? 'Tutti' : 'All',
    toConfirm: isIT ? 'Da confermare' : 'To confirm',
    category: isIT ? 'Categoria' : 'Category',
    amount: isIT ? 'Importo indicativo' : 'Indicative amount',
    emptyTitle: isIT ? 'Nessuna voce ancora' : 'No items yet',
    emptyDesc: isIT ? "Usate il tasto 'Aggiungi voce' per inserire le prime stime." : "Use the 'Add item' button to enter your first estimates.",
    errorTitle: isIT ? 'Impossibile caricare il budget' : 'Unable to load budget',
    errorDesc: isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
    estimatedPct: isIT ? '% del budget stimato' : '% of budget estimated',
    disclaimer: isIT ? 'Gli importi sono stime organizzative. VELO non elabora pagamenti.' : 'Amounts are planning estimates. VELO does not process payments.',
    uncategorized: isIT ? 'Altro' : 'Other',
    statusLabel: (status: ExpenseStatus) =>
      isIT ? (status === 'confirmed' ? 'Confermato' : 'Da confermare') : (status === 'confirmed' ? 'Confirmed' : 'To confirm'),
    addItem: isIT ? 'Aggiungi voce' : 'Add item',
    titleLabel: isIT ? 'Descrizione' : 'Description',
    titleRequired: isIT ? 'La descrizione e obbligatoria' : 'Description is required',
    amountLabel: isIT ? 'Importo (€)' : 'Amount (€)',
    categoryPlaceholder: isIT ? 'Categoria (opzionale)' : 'Category (optional)',
    cancel: isIT ? 'Annulla' : 'Cancel',
    save: isIT ? 'Salva' : 'Save',
    saveError: isIT ? 'Errore nel salvataggio. Riprova.' : 'Save failed. Try again.',
    sessionExpired: isIT ? 'Sessione scaduta. Ricarica la pagina.' : 'Session expired. Refresh the page.',
    deleteConfirm: isIT ? 'Eliminare questa voce?' : 'Delete this item?',
    deleteError: isIT ? 'Eliminazione fallita. Riprova.' : 'Delete failed. Try again.',
    toggleError: isIT ? 'Aggiornamento fallito. Riprova.' : 'Update failed. Try again.',
    markConfirmed: isIT ? 'Conferma' : 'Confirm',
    markPending: isIT ? 'Rimuovi conferma' : 'Unconfirm',
    editItem: isIT ? 'Modifica' : 'Edit',
    categories: isIT ? BUDGET_CATEGORIES_IT : BUDGET_CATEGORIES,
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
  if (status === 'confirmed') return { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.10)', border: 'rgba(122,158,126,0.25)' }
  return { color: 'var(--velo-muted)', bg: 'rgba(138,126,106,0.10)', border: 'rgba(138,126,106,0.20)' }
}

function SummaryCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <CouplePanel className="min-w-[150px] flex-1 rounded-[1.25rem] p-4 shadow-none">
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: accent, fontFamily: VELO_MONO_FONT }}>{label}</div>
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

function ExpenseCardRow({
  expense, copy, locale, isEditing,
  onToggle, onEdit, onSaveEdit, onCancelEdit, onDelete,
}: {
  expense: ExpenseRow
  copy: BudgetCopy
  locale: string
  isEditing: boolean
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onSaveEdit: (id: string, data: { title: string; amount: string; category: string }) => Promise<void>
  onCancelEdit: () => void
  onDelete: (id: string) => void
}) {
  const [draftTitle, setDraftTitle] = useState(expense.title)
  const [draftAmount, setDraftAmount] = useState(expense.amount?.toString() ?? '')
  const [draftCategory, setDraftCategory] = useState(expense.category ?? '')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isEditing) {
      setDraftTitle(expense.title)
      setDraftAmount(expense.amount?.toString() ?? '')
      setDraftCategory(expense.category ?? '')
      setFormError('')
    }
  }, [isEditing]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!draftTitle.trim()) { setFormError(copy.titleRequired); return }
    setSaving(true)
    await onSaveEdit(expense.id, { title: draftTitle, amount: draftAmount, category: draftCategory })
    setSaving(false)
  }

  const status = expenseStatus(expense)
  const category = expense.category ? stripEmoji(expense.category) : copy.uncategorized
  const inputCls = 'w-full rounded-[0.75rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-3 py-2.5 text-sm text-[var(--velo-ink)] outline-none focus:border-[var(--velo-terracotta)]'

  if (isEditing) {
    return (
      <CouplePanel className="mb-3 p-5 shadow-none" tone="paper">
        <div className="flex flex-col gap-3">
          <input className={inputCls} placeholder={copy.titleLabel} value={draftTitle} onChange={e => setDraftTitle(e.target.value)} autoFocus />
          <div className="flex gap-3">
            <input className={inputCls} placeholder={copy.amountLabel} value={draftAmount} onChange={e => setDraftAmount(e.target.value)} type="text" inputMode="decimal" />
            <select className={inputCls} value={draftCategory} onChange={e => setDraftCategory(e.target.value)}>
              <option value="">{copy.categoryPlaceholder}</option>
              {copy.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {formError && <div className="text-xs text-[var(--velo-danger)]">{formError}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={onCancelEdit} className="rounded-full border border-[var(--velo-border)] px-4 py-2 text-xs text-[var(--velo-muted)] hover:border-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>{copy.cancel}</button>
            <button onClick={handleSave} disabled={saving} className="rounded-full bg-[var(--velo-terracotta)] px-4 py-2 text-xs text-white disabled:opacity-60" style={{ fontFamily: VELO_MONO_FONT }}>{saving ? '...' : copy.save}</button>
          </div>
        </div>
      </CouplePanel>
    )
  }

  return (
    <CouplePanel className="mb-3 p-5 shadow-none" tone="paper">
      <div className="flex gap-4">
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(status).color, marginTop: 8, flexShrink: 0 }} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[15px] text-[var(--velo-ink)]">{expense.title}</span>
            <StatusPill status={status} copy={copy} />
          </div>
          <div className="mb-3 text-sm text-[var(--velo-muted)]">{copy.category}: {category}</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onToggle(expense.id)}
              style={{ fontSize: 10, letterSpacing: 0.8, padding: '4px 10px', borderRadius: 999, fontFamily: VELO_MONO_FONT, textTransform: 'uppercase', color: status === 'confirmed' ? 'var(--velo-muted)' : 'var(--velo-success)', background: status === 'confirmed' ? 'rgba(138,126,106,0.06)' : 'rgba(122,158,126,0.08)', border: `1px solid ${status === 'confirmed' ? 'var(--velo-border)' : 'rgba(122,158,126,0.30)'}` }}
            >
              {status === 'confirmed' ? copy.markPending : copy.markConfirmed}
            </button>
            <button
              onClick={() => onEdit(expense.id)}
              style={{ fontSize: 10, letterSpacing: 0.8, padding: '4px 10px', borderRadius: 999, fontFamily: VELO_MONO_FONT, textTransform: 'uppercase', color: 'var(--velo-muted)', background: 'rgba(138,126,106,0.06)', border: '1px solid var(--velo-border)' }}
            >
              {copy.editItem}
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              style={{ fontSize: 10, letterSpacing: 0.8, padding: '4px 10px', borderRadius: 999, fontFamily: VELO_MONO_FONT, textTransform: 'uppercase', color: 'var(--velo-danger)', background: 'rgba(196,117,106,0.06)', border: '1px solid rgba(196,117,106,0.20)' }}
            >
              ×
            </button>
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

function CategoryGroup({
  group, locale, copy, editingId,
  onToggle, onEdit, onSaveEdit, onCancelEdit, onDelete,
}: {
  group: BudgetCategoryGroup
  locale: string
  copy: BudgetCopy
  editingId: string | null
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onSaveEdit: (id: string, data: { title: string; amount: string; category: string }) => Promise<void>
  onCancelEdit: () => void
  onDelete: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-4">
      <button onClick={() => setCollapsed(c => !c)} className="flex w-full items-center gap-3 border-b border-[var(--velo-border)] pb-2">
        <div className="h-[7px] w-[7px] rounded-full bg-[var(--velo-terracotta)]" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>{group.category}</span>
        <span className="text-xs text-[var(--velo-muted-soft)]">{group.expenses.length}</span>
        <span className="ml-2 text-xs text-[var(--velo-muted)]">{formatCurrency(group.total, locale)}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto', transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M2 4L6 8L10 4" stroke="var(--velo-terracotta)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {!collapsed && (
        <div className="mt-4">
          {group.expenses.map(expense => (
            <ExpenseCardRow
              key={expense.id}
              expense={expense}
              copy={copy}
              locale={locale}
              isEditing={editingId === expense.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
            />
          ))}
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

function AddExpenseForm({ onAdd, copy, onClose }: {
  onAdd: (e: ExpenseRow) => void
  copy: BudgetCopy
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!title.trim()) { setError(copy.titleRequired); return }
    setSaving(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); setError(copy.sessionExpired); return }
    const { data, error: dbErr } = await supabase
      .from('expenses')
      .insert({ user_id: session.user.id, title: title.trim(), amount: parseAmount(amount), category: category || null, confirmed: false })
      .select('id, title, amount, category, confirmed')
      .single()
    setSaving(false)
    if (dbErr || !data) { setError(copy.saveError); return }
    onAdd(data as ExpenseRow)
    setTitle(''); setAmount(''); setCategory('')
    onClose()
  }

  const inputCls = 'w-full rounded-[0.75rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-3 py-2.5 text-sm text-[var(--velo-ink)] outline-none focus:border-[var(--velo-terracotta)]'

  return (
    <CouplePanel className="mb-6 p-5">
      <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>{copy.addItem}</div>
      <div className="flex flex-col gap-3">
        <input className={inputCls} placeholder={copy.titleLabel} value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        <div className="flex gap-3">
          <input className={inputCls} placeholder={copy.amountLabel} value={amount} onChange={e => setAmount(e.target.value)} type="text" inputMode="decimal" />
          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{copy.categoryPlaceholder}</option>
            {copy.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {error && <div className="text-xs text-[var(--velo-danger)]">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-[var(--velo-border)] px-4 py-2 text-xs text-[var(--velo-muted)] hover:border-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>{copy.cancel}</button>
          <button onClick={submit} disabled={saving} className="rounded-full bg-[var(--velo-terracotta)] px-4 py-2 text-xs text-white disabled:opacity-60" style={{ fontFamily: VELO_MONO_FONT }}>{saving ? '...' : copy.save}</button>
        </div>
      </div>
    </CouplePanel>
  )
}

export default function BudgetPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const copy = getBudgetCopy(locale)
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [budgetTotal, setBudgetTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [budgetMissing, setBudgetMissing] = useState(false)
  const [budgetLoadError, setBudgetLoadError] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setFetchError(true); setLoading(false); return }
      const uid = session.user.id
      setUserId(uid)
      const [expensesRes, coupleRes] = await Promise.all([
        supabase.from('expenses').select('id, title, amount, category, confirmed').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('couples').select('budget, nationality, country_of_origin').eq('user_id', uid).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (expensesRes.error) { setFetchError(true); setLoading(false); return }
      const fallbackLocale = getPreferredSiteLocale()
      if (coupleRes.error) {
        setBudgetLoadError(true)
      } else if (!coupleRes.data) {
        setBudgetMissing(true)
      } else {
        const nextLocale = hasExplicitLocaleCookie() ? fallbackLocale : getCoupleLocale(coupleRes.data, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
        setBudgetTotal(coupleRes.data.budget ?? null)
        if (coupleRes.data.budget == null) setBudgetMissing(true)
      }
      setExpenses((expensesRes.data ?? []) as ExpenseRow[])
      setLoading(false)
    }
    load()
  }, [])

  const toggleConfirmed = async (id: string) => {
    if (!userId) return
    const expense = expenses.find(e => e.id === id)
    if (!expense) return
    const newVal = !expense.confirmed
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, confirmed: newVal } : e))
    setActionError('')
    const { error } = await supabase.from('expenses').update({ confirmed: newVal }).eq('id', id).eq('user_id', userId)
    if (error) {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, confirmed: !newVal } : e))
      setActionError(copy.toggleError)
    }
  }

  const saveEdit = async (id: string, data: { title: string; amount: string; category: string }) => {
    if (!userId) return
    const update = { title: data.title.trim(), amount: parseAmount(data.amount), category: data.category || null }
    const snapshot = expenses
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...update } : e))
    setEditingId(null)
    setActionError('')
    const { error } = await supabase.from('expenses').update(update).eq('id', id).eq('user_id', userId)
    if (error) { setExpenses(snapshot); setActionError(copy.saveError) }
  }

  const deleteExpense = async (id: string) => {
    if (!userId) return
    if (!window.confirm(copy.deleteConfirm)) return
    if (editingId === id) setEditingId(null)
    const snapshot = expenses
    setExpenses(prev => prev.filter(e => e.id !== id))
    setActionError('')
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
    if (error) { setExpenses(snapshot); setActionError(copy.deleteError) }
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

  const estimated = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const confirmedTotal = expenses.filter(e => e.confirmed).reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const available = typeof budgetTotal === 'number' ? budgetTotal - estimated : null
  const pct = typeof budgetTotal === 'number' && budgetTotal > 0 ? Math.min(100, Math.round((estimated / budgetTotal) * 100)) : 0
  const filteredExpenses = filterStatus === 'all' ? expenses : expenses.filter(e => expenseStatus(e) === filterStatus)
  const categories = filteredExpenses.reduce<Record<string, BudgetCategoryGroup>>((acc, expense) => {
    const key = expense.category ? stripEmoji(expense.category) : copy.uncategorized
    if (!acc[key]) acc[key] = { category: key, expenses: [], total: 0, confirmedTotal: 0 }
    acc[key].expenses.push(expense)
    acc[key].total += expense.amount ?? 0
    if (expense.confirmed) acc[key].confirmedTotal += expense.amount ?? 0
    return acc
  }, {})
  const categoryGroups = Object.values(categories).sort((a, b) => b.total - a.total)
  const confirmedCount = expenses.filter(e => e.confirmed).length
  const toConfirmCount = expenses.length - confirmedCount

  return (
    <div>
      <CouplePageIntro
        eyebrow={copy.pageLabel}
        title={copy.pageTitle}
        subtitle={copy.pageSub}
        action={
          !showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-[var(--velo-terracotta)] px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-white"
              style={{ fontFamily: VELO_MONO_FONT }}
            >
              + {copy.addItem}
            </button>
          ) : undefined
        }
      />

      {actionError && (
        <div className="mb-4 rounded-[1rem] border border-[rgba(196,117,106,0.28)] bg-[rgba(196,117,106,0.09)] px-5 py-3 text-sm text-[var(--velo-danger)]">
          {actionError}
        </div>
      )}

      {budgetLoadError && <div className="mb-5"><CoupleNotice title={copy.budgetLoadErrorTitle} tone="warning">{copy.budgetLoadErrorDesc}</CoupleNotice></div>}
      {budgetMissing && <div className="mb-5"><CoupleNotice title={copy.noBudgetSet} tone="warning">{copy.noBudgetSetDesc}</CoupleNotice></div>}

      {showAddForm && (
        <AddExpenseForm
          onAdd={expense => setExpenses(prev => [expense, ...prev])}
          copy={copy}
          onClose={() => setShowAddForm(false)}
        />
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
        </>
      )}

      {expenses.length === 0 ? (
        !showAddForm ? <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} /> : null
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <CoupleChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>{copy.all} <span>{expenses.length}</span></CoupleChip>
            <CoupleChip accent="var(--velo-success)" active={filterStatus === 'confirmed'} onClick={() => setFilterStatus('confirmed')}>{copy.confirmed} <span>{confirmedCount}</span></CoupleChip>
            <CoupleChip accent="var(--velo-muted)" active={filterStatus === 'to_confirm'} onClick={() => setFilterStatus('to_confirm')}>{copy.toConfirm} <span>{toConfirmCount}</span></CoupleChip>
          </div>
          {categoryGroups.map(group => (
            <CategoryGroup
              key={group.category}
              group={group}
              locale={locale}
              copy={copy}
              editingId={editingId}
              onToggle={toggleConfirmed}
              onEdit={id => setEditingId(id)}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              onDelete={deleteExpense}
            />
          ))}
          <div className="mt-4 text-[11px] text-[var(--velo-muted-soft)]">{copy.disclaimer}</div>
        </>
      )}
    </div>
  )
}
