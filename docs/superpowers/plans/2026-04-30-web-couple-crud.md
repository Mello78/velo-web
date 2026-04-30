# Web Couple CRUD Expansion Implementation Plan

**⚠️ STORICO / SUPERSEDED**

Questo documento descrive uno stato precedente alla chiusura di WEB COUPLE EXPANSION — Practical Actions v1.
Lo stato canonico corrente è in `VELO_CURRENT_STATE.md`.
Budget e Guests non sono più read-only: budget ha CRUD web; guests supporta update RSVP/notes/dietary da web.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add write operations to the read-only Budget and Guests pages in the web couple area.

**Architecture:** Modify both pages in-place — no new files needed. Each page already owns its data fetch loop; we extend that loop with optimistic write handlers passed as props to card components. All Supabase calls use relative imports, `session.user.id` as the write key, and optimistic-update-with-rollback pattern already used elsewhere in the project.

**Tech Stack:** Next.js 14 App Router, React 19, Supabase JS v2, Tailwind CSS, couple-ui.tsx component primitives.

---

## Audit Summary

| Page | Current state | Gap |
|------|--------------|-----|
| `app/couple/budget/page.tsx` | Read-only list of expenses grouped by category | Add expense, edit expense, delete expense, toggle confirmed |
| `app/couple/guests/page.tsx` | Read-only list of guests grouped by RSVP | Update RSVP status per guest, inline edit notes + dietary |
| `app/couple/profile/page.tsx` | Already has editable date/budget/ceremony fields | No changes needed |

---

## File Structure

**Modified only:**
- `app/couple/budget/page.tsx` — adds `AddExpenseForm`, inline edit/delete on `ExpenseCardRow`, `toggleConfirmed` handler
- `app/couple/guests/page.tsx` — adds `RsvpSelector` inline on `GuestRowCard`, inline edit for notes and dietary

---

## Task 1: Budget — Add expense + toggle confirmed + edit + delete

**Files:**
- Modify: `app/couple/budget/page.tsx`

### Key helpers to add inside the file

```tsx
// Amount input → number | null
function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) || parsed <= 0 ? null : parsed
}

// Budget categories (web add form)
const BUDGET_CATEGORIES = [
  'Venue', 'Photography', 'Catering', 'Flowers', 'Music',
  'Attire', 'Beauty', 'Transport', 'Accommodation', 'Honeymoon', 'Other',
]
const BUDGET_CATEGORIES_IT = [
  'Location', 'Fotografia', 'Catering', 'Fiori', 'Musica',
  'Abiti', 'Beauty', 'Trasporti', 'Alloggio', 'Luna di miele', 'Altro',
]
```

### Copy keys to add in `getBudgetCopy`

```ts
addItem: isIT ? 'Aggiungi voce' : 'Add item',
titleLabel: isIT ? 'Descrizione' : 'Description',
titleRequired: isIT ? 'La descrizione è obbligatoria' : 'Description is required',
amountLabel: isIT ? 'Importo (€)' : 'Amount (€)',
categoryLabel: isIT ? 'Categoria' : 'Category',
categoryPlaceholder: isIT ? 'Seleziona categoria' : 'Select category',
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
emptyAction: isIT ? 'Aggiungi la prima voce' : 'Add your first item',
```

### AddExpenseForm component

```tsx
function AddExpenseForm({ onAdd, copy, locale, onClose }: {
  onAdd: (e: ExpenseRow) => void
  copy: BudgetCopy
  locale: string
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isIT = locale === 'it'
  const cats = isIT ? BUDGET_CATEGORIES_IT : BUDGET_CATEGORIES

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
    setTitle(''); setAmount(''); setCategory(''); onClose()
  }

  const inputCls = 'w-full rounded-[0.75rem] border border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] px-3 py-2.5 text-sm text-[var(--velo-ink)] outline-none focus:border-[var(--velo-terracotta)]'

  return (
    <CouplePanel className="mb-6 p-5">
      <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
        {copy.addItem}
      </div>
      <div className="flex flex-col gap-3">
        <input className={inputCls} placeholder={copy.titleLabel} value={title} onChange={e => setTitle(e.target.value)} />
        <div className="flex gap-3">
          <input className={inputCls} placeholder={copy.amountLabel} value={amount} onChange={e => setAmount(e.target.value)} type="text" inputMode="decimal" />
          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{copy.categoryPlaceholder}</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
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
```

### ExpenseCardRow extended with handlers

```tsx
function ExpenseCardRow({
  expense, copy, locale, editingId, editDraft, setEditDraft,
  onToggle, onEdit, onSaveEdit, onCancelEdit, onDelete, saving
}: { ... })
```

### Handlers in BudgetPage

```tsx
const [showAddForm, setShowAddForm] = useState(false)
const [editingId, setEditingId] = useState<string | null>(null)
const [editDraft, setEditDraft] = useState<{ title: string; amount: string; category: string } | null>(null)
const [actionError, setActionError] = useState('')

const toggleConfirmed = async (id: string) => { ... }  // optimistic + rollback
const startEdit = (expense: ExpenseRow) => { setEditingId(expense.id); setEditDraft({...}) }
const saveEdit = async () => { ... }   // UPDATE + optimistic
const deleteExpense = async (id: string) => { ... }   // window.confirm + DELETE
const addExpense = (e: ExpenseRow) => setExpenses(prev => [e, ...prev])
```

- [ ] **Step 1:** Implement the full updated `app/couple/budget/page.tsx` with all CRUD handlers.
- [ ] **Step 2:** Run `npm run lint` in `velo-web-temp`.
- [ ] **Step 3:** Fix any lint errors.
- [ ] **Step 4:** Commit.

---

## Task 2: Guests — RSVP update + inline notes/dietary edit

**Files:**
- Modify: `app/couple/guests/page.tsx`

### Copy keys to add in `getGuestsCopy`

```ts
updateError: isIT ? 'Aggiornamento fallito. Riprova.' : 'Update failed. Try again.',
notesPlaceholder: isIT ? 'Aggiungi una nota...' : 'Add a note...',
dietaryPlaceholder: isIT ? 'Esigenze alimentari...' : 'Dietary requirements...',
```

### RsvpSelector component

```tsx
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
    <div className="flex gap-1">
      {RSVP_ORDER.map(status => {
        const cfg = RSVP_CONFIG[status]
        const active = status === current
        return (
          <button key={status} onClick={() => update(status)} disabled={busy}
            style={{ fontSize: 10, letterSpacing: 0.8, padding: '4px 10px', borderRadius: 999,
              color: active ? cfg.color : 'var(--velo-muted-soft)',
              background: active ? cfg.bg : 'transparent',
              border: `1px solid ${active ? cfg.border : 'var(--velo-border)'}`,
              fontFamily: VELO_MONO_FONT, textTransform: 'uppercase', opacity: busy ? 0.5 : 1 }}>
            {copy.statusLabel(status)}
          </button>
        )
      })}
    </div>
  )
}
```

### Inline text editor for notes / dietary

```tsx
function InlineEdit({ value, onSave, placeholder }: {
  value: string | null
  onSave: (v: string | null) => Promise<void>
  placeholder: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const save = async () => {
    setEditing(false)
    const next = draft.trim() || null
    if (next === (value?.trim() || null)) return
    await onSave(next)
  }
  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} className="cursor-pointer rounded-[0.75rem] border border-dashed border-[var(--velo-border)] px-3 py-2 text-sm text-[var(--velo-muted)] hover:border-[var(--velo-terracotta)]">
        {value?.trim() || <span style={{ opacity: 0.45 }}>{placeholder}</span>}
      </div>
    )
  }
  return (
    <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
      className="w-full rounded-[0.75rem] border border-[var(--velo-terracotta)] bg-[rgba(255,250,244,0.72)] px-3 py-2 text-sm text-[var(--velo-ink)] outline-none resize-none"
      rows={2} />
  )
}
```

### GuestRowCard extended

```tsx
function GuestRowCard({ guest, copy, onUpdateRsvp, onUpdateNotes, onUpdateDietary }: { ... })
```

- [ ] **Step 1:** Implement the full updated `app/couple/guests/page.tsx`.
- [ ] **Step 2:** Run `npm run lint`.
- [ ] **Step 3:** Fix any lint errors.
- [ ] **Step 4:** Commit.

---

## Task 3: Build validation

- [ ] Run `npm run build` in `velo-web-temp`.
- [ ] Document errors: distinguish pre-existing from regression.
- [ ] Fix any regression errors.

---

## Constraints

- Supabase: always `import { supabase } from '../../../lib/supabase'` (relative).
- All writes: `session.user.id` from `supabase.auth.getSession()`.
- Optimistic updates with rollback.
- No `window.confirm` replacement — it's sufficient for MVP delete.
- No email or invite flows.
- No new files unless needed.
