'use client'
import { useEffect, useState } from 'react'
import { getCoupleLocale, getPreferredSiteLocale, hasExplicitLocaleCookie, persistCoupleLocale } from '../../../lib/couple-locale'
import { supabase } from '../../../lib/supabase'
import type { Locale } from '../../../lib/translations'
import {
  CoupleEmptyState,
  CoupleLoadingBlock,
  CoupleNotice,
  CouplePageIntro,
  CouplePanel,
  VELO_DISPLAY_FONT,
  VELO_MONO_FONT,
} from '../../../components/couple-ui'

interface Task {
  id: string
  title: string
  title_it: string | null
  title_en: string | null
  body_it: string | null
  body_en: string | null
  due_date: string | null
  completed: boolean
  urgent: boolean
  phase: string
  task_key: string | null
  source: string | null
  vendor_name: string | null
  category: string | null
  system_generated: boolean
  priority: number
  draft: boolean
}

type PhaseKey = 'urgent' | 'soon' | 'done'

const LEGACY_PHASE_MAP: Record<string, PhaseKey> = {
  urgent: 'urgent', Urgent: 'urgent', Urgente: 'urgent',
  soon: 'soon', 'Coming up': 'soon', Prossimamente: 'soon',
  done: 'done', Completed: 'done', Completato: 'done',
}

const PHASE_ORDER: PhaseKey[] = ['urgent', 'soon', 'done']

function normalizePhase(p: string): PhaseKey {
  if (LEGACY_PHASE_MAP[p]) return LEGACY_PHASE_MAP[p]
  const stripped = p.replace(/^[^A-Za-zÀ-ſ]+/, '')
  return LEGACY_PHASE_MAP[stripped] || 'soon'
}

function nextPhaseForToggle(task: Task): string {
  if (!task.completed) return 'done'
  return task.urgent ? 'urgent' : 'soon'
}

function isUserTask(task: Task): boolean {
  return task.source === 'user' && task.system_generated !== true
}

function getChecklistCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: 'PLANNING',
    pageTitle: isIT ? 'La vostra roadmap' : 'Your roadmap',
    pageSub: isIT
      ? 'Un ordine piu calmo per capire cosa richiede attenzione adesso, cosa viene dopo e cosa e gia chiuso.'
      : 'A calmer order for seeing what needs attention now, what comes next, and what is already complete.',
    progress: isIT ? 'Completamento' : 'Overall completion',
    tasksSuffix: isIT ? 'task' : 'tasks',
    interactionHint: isIT
      ? 'Segna i task come completati, aggiungine di nuovi o modificali direttamente da web.'
      : 'Mark tasks complete, add new ones, and edit them directly here on web.',
    synced: isIT ? 'sincronizzato' : 'synced',
    updating: isIT ? 'aggiornamento...' : 'updating...',
    emptyTitle: isIT ? 'Nessun task ancora' : 'No tasks yet',
    emptyDesc: isIT
      ? 'Aggiungete il primo task usando il pulsante qui sopra oppure dall\'app VELO.'
      : 'Add your first task using the button above or from the VELO app.',
    errorTitle: isIT ? 'Impossibile caricare la checklist' : 'Unable to load checklist',
    errorDesc: isIT
      ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.'
      : 'This may be a temporary connection issue. Try refreshing the page.',
    writeErrorTitle: isIT ? 'Impossibile aggiornare il task' : 'Unable to update task',
    writeErrorDesc: isIT
      ? 'Lo stato non e stato salvato. Riprova.'
      : 'The task status was not saved. Please try again.',
    addTask: isIT ? '+ Aggiungi task' : '+ Add task',
    newTaskLabel: isIT ? 'Nuovo task' : 'New task',
    addTaskPlaceholder: isIT ? 'Titolo del task...' : 'Task title...',
    addTaskDue: isIT ? 'Data limite (opzionale)' : 'Due date (optional)',
    addTaskPhase: isIT ? 'Stato' : 'Status',
    addTaskSave: isIT ? 'Aggiungi' : 'Add',
    editTaskSave: isIT ? 'Salva' : 'Save',
    addTaskSaving: isIT ? 'Salvataggio...' : 'Saving...',
    addTaskCancel: isIT ? 'Annulla' : 'Cancel',
    deleteTask: isIT ? 'Elimina' : 'Delete',
    deleteConfirm: isIT ? 'Eliminare questo task?' : 'Delete this task?',
    saveError: isIT ? 'Errore nel salvataggio. Riprova.' : 'Error saving. Please try again.',
    phaseLabel: (phase: PhaseKey) => {
      const map: Record<PhaseKey, [string, string]> = {
        urgent: ['Urgente', 'Urgent'],
        soon: ['Prossimamente', 'Coming up'],
        done: ['Completato', 'Completed'],
      }
      return isIT ? map[phase][0] : map[phase][1]
    },
    sourceLabel: (source: string) => {
      const map: Record<string, [string, string]> = {
        vendor: ['Fornitore', 'Vendor'],
        vendor_custom: ['Fornitore', 'Vendor'],
        setup: ['Profilo', 'Profile'],
        documents: ['Documenti', 'Documents'],
        countdown: ['Countdown', 'Countdown'],
        budget: ['Budget', 'Budget'],
        guests: ['Ospiti', 'Guests'],
      }
      return isIT ? (map[source]?.[0] ?? source) : (map[source]?.[1] ?? source)
    },
  }
}

type ChecklistCopy = ReturnType<typeof getChecklistCopy>

function taskTitle(task: Task, locale: string): string {
  // User-created tasks always use the base title — no localized variants
  if (task.source === 'user') return task.title
  if (locale === 'en' && task.title_en) return task.title_en
  if (task.title_it) return task.title_it
  return task.title
}

function taskBody(task: Task, locale: string): string | null {
  if (locale === 'en' && task.body_en) return task.body_en
  if (task.body_it) return task.body_it
  return null
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-GB' : 'it-IT', {
    day: 'numeric',
    month: 'long',
  })
}

function phaseConfig(phase: PhaseKey, locale: string) {
  const copy = getChecklistCopy(locale)
  const colors: Record<PhaseKey, { color: string; bg: string }> = {
    urgent: { color: 'var(--velo-danger)', bg: 'rgba(196,117,106,0.08)' },
    soon: { color: 'var(--velo-terracotta)', bg: 'rgba(184,90,46,0.08)' },
    done: { color: 'var(--velo-success)', bg: 'rgba(122,158,126,0.08)' },
  }
  return { label: copy.phaseLabel(phase), ...colors[phase] }
}

function sourceBadge(source: string, locale: string) {
  const copy = getChecklistCopy(locale)
  const colorMap: Record<string, string> = {
    vendor: 'var(--velo-info)',
    vendor_custom: 'var(--velo-info)',
    setup: 'var(--velo-muted)',
    documents: 'var(--velo-success)',
    countdown: 'var(--velo-danger)',
    budget: 'var(--velo-terracotta)',
    guests: 'var(--velo-muted)',
  }
  return {
    label: copy.sourceLabel(source),
    color: colorMap[source] ?? 'var(--velo-muted)',
  }
}

function ProgressBar({ done, total, copy }: { done: number; total: number; copy: ChecklistCopy }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
          {copy.progress}
        </div>
        <div className="text-sm text-[var(--velo-ink)]">
          <span style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 28, fontWeight: 300 }}>{done}</span>
          <span className="text-[var(--velo-muted-soft)]"> / {total} {copy.tasksSuffix}</span>
        </div>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-[rgba(140,104,74,0.16)]">
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct === 100 ? 'var(--velo-success)' : 'var(--velo-terracotta)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <div className="mt-2 text-right text-[11px] text-[var(--velo-muted-soft)]">{pct}%</div>
    </div>
  )
}

const FORM_INPUT = [
  'w-full rounded-xl border px-3 py-2.5 text-sm',
  'bg-[var(--velo-paper-2)] text-[var(--velo-ink)]',
  'border-[var(--velo-border)] focus:border-[var(--velo-terracotta)]',
  'outline-none transition-colors',
].join(' ')

function TaskForm({
  copy,
  locale,
  title,
  due,
  phase,
  saving,
  hasError,
  saveLabel,
  onTitleChange,
  onDueChange,
  onPhaseChange,
  onSave,
  onCancel,
}: {
  copy: ChecklistCopy
  locale: string
  title: string
  due: string
  phase: PhaseKey
  saving: boolean
  hasError: boolean
  saveLabel: string
  onTitleChange: (v: string) => void
  onDueChange: (v: string) => void
  onPhaseChange: (v: PhaseKey) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder={copy.addTaskPlaceholder}
        className={FORM_INPUT}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {copy.addTaskDue}
          </label>
          <input
            type="date"
            value={due}
            onChange={e => onDueChange(e.target.value)}
            className={FORM_INPUT}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-[var(--velo-muted-soft)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {copy.addTaskPhase}
          </label>
          <select
            value={phase}
            onChange={e => onPhaseChange(e.target.value as PhaseKey)}
            className={`${FORM_INPUT} cursor-pointer`}
          >
            <option value="urgent">{copy.phaseLabel('urgent')}</option>
            <option value="soon">{copy.phaseLabel('soon')}</option>
            <option value="done">{copy.phaseLabel('done')}</option>
          </select>
        </div>
      </div>
      {hasError && (
        <p className="text-[11px] text-[var(--velo-danger)]">{copy.saveError}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !title.trim()}
          className="rounded-xl bg-[var(--velo-terracotta)] px-4 py-2 text-xs text-white disabled:opacity-60 hover:opacity-90"
          style={{ fontFamily: VELO_MONO_FONT }}
        >
          {saving ? copy.addTaskSaving : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[var(--velo-border)] px-4 py-2 text-xs text-[var(--velo-muted)] hover:opacity-80"
          style={{ fontFamily: VELO_MONO_FONT }}
        >
          {copy.addTaskCancel}
        </button>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  locale,
  pending,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task
  locale: string
  pending: boolean
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  const title = taskTitle(task, locale)
  const body = taskBody(task, locale)
  const badge = task.source && task.source !== 'user' ? sourceBadge(task.source, locale) : null
  const isDone = task.completed
  const copy = getChecklistCopy(locale)

  return (
    <div
      style={{ opacity: isDone ? 0.58 : 1, transition: 'opacity 0.15s' }}
      className={`flex gap-4 border-b border-[var(--velo-border)] px-4 py-4 last:border-b-0 ${task.source === 'vendor' || task.source === 'vendor_custom' ? 'bg-[rgba(74,122,184,0.04)]' : 'bg-transparent'}`}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        disabled={pending}
        aria-pressed={isDone}
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `1.5px solid ${isDone ? 'var(--velo-success)' : 'var(--velo-border-strong)'}`,
          background: isDone ? 'rgba(122,158,126,0.18)' : 'rgba(255,250,244,0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: pending ? 'default' : 'pointer',
          padding: 0,
          opacity: pending ? 0.6 : 1,
        }}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#7A9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {badge && (
          <div className="mb-2">
            <span
              style={{
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: badge.color,
                background: `${badge.color}18`,
                borderRadius: 999,
                padding: '4px 10px',
                fontFamily: VELO_MONO_FONT,
              }}
            >
              {badge.label}
              {task.vendor_name ? ` · ${task.vendor_name}` : ''}
            </span>
          </div>
        )}
        <div style={{ fontSize: 14, color: isDone ? 'var(--velo-muted-soft)' : 'var(--velo-ink)', textDecoration: isDone ? 'line-through' : 'none', lineHeight: 1.55 }}>
          {title}
        </div>
        {body && !isDone && <div style={{ fontSize: 12, color: 'var(--velo-muted)', marginTop: 6, lineHeight: 1.7 }}>{body}</div>}
        {task.due_date && (
          <div style={{ fontSize: 11, marginTop: 6, color: task.urgent && !isDone ? 'var(--velo-danger)' : 'var(--velo-muted-soft)', fontFamily: VELO_MONO_FONT }}>
            {formatDate(task.due_date, locale)}
          </div>
        )}
        {pending && <div style={{ fontSize: 11, marginTop: 6, color: 'var(--velo-muted-soft)', fontFamily: VELO_MONO_FONT }}>{copy.updating}</div>}
      </div>

      {isUserTask(task) && (
        <div className="flex shrink-0 items-start gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title={copy.editTaskSave}
            style={{ padding: '4px 6px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--velo-muted-soft)', display: 'flex', alignItems: 'center' }}
            className="hover:text-[var(--velo-terracotta)] hover:bg-[rgba(184,90,46,0.08)] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9.5 1.5L11.5 3.5L4.5 10.5L1.5 11.5L2.5 8.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            title={copy.deleteTask}
            style={{ padding: '4px 6px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--velo-muted-soft)', display: 'flex', alignItems: 'center' }}
            className="hover:text-[var(--velo-danger)] hover:bg-[rgba(196,117,106,0.08)] transition-colors"
          >
            <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
              <path d="M1 3H11M4 3V2H8V3M2 3L3 11H9L10 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function PhaseGroup({
  phase,
  tasks,
  locale,
  pendingIds,
  onToggle,
  onEdit,
  onDelete,
  editingId,
  editTitle,
  editDue,
  editPhase,
  editSaving,
  editError,
  onEditTitleChange,
  onEditDueChange,
  onEditPhaseChange,
  onEditSave,
  onEditCancel,
}: {
  phase: PhaseKey
  tasks: Task[]
  locale: string
  pendingIds: Set<string>
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  editingId: string | null
  editTitle: string
  editDue: string
  editPhase: PhaseKey
  editSaving: boolean
  editError: boolean
  onEditTitleChange: (v: string) => void
  onEditDueChange: (v: string) => void
  onEditPhaseChange: (v: PhaseKey) => void
  onEditSave: (task: Task) => void
  onEditCancel: () => void
}) {
  const cfg = phaseConfig(phase, locale)
  const copy = getChecklistCopy(locale)
  const [collapsed, setCollapsed] = useState(phase === 'done')

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: cfg.bg,
          border: `1px solid ${cfg.color}22`,
          borderBottom: collapsed ? undefined : 'none',
          borderRadius: collapsed ? 16 : '16px 16px 0 0',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600, fontFamily: VELO_MONO_FONT }}>
            {cfg.label}
          </span>
          <span className="text-xs text-[var(--velo-muted-soft)]">{tasks.length}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {!collapsed && (
        <div className="overflow-hidden rounded-b-[1rem] border border-t-0 border-[var(--velo-border)] bg-[var(--velo-card)]">
          {tasks.map((task) => (
            editingId === task.id ? (
              <div key={task.id} className="border-b border-[var(--velo-border)] px-4 py-4 last:border-b-0">
                <TaskForm
                  copy={copy}
                  locale={locale}
                  title={editTitle}
                  due={editDue}
                  phase={editPhase}
                  saving={editSaving}
                  hasError={editError}
                  saveLabel={copy.editTaskSave}
                  onTitleChange={onEditTitleChange}
                  onDueChange={onEditDueChange}
                  onPhaseChange={onEditPhaseChange}
                  onSave={() => onEditSave(task)}
                  onCancel={onEditCancel}
                />
              </div>
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                locale={locale}
                pending={pendingIds.has(task.id)}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChecklistPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const copy = getChecklistCopy(locale)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [writeError, setWriteError] = useState(false)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Add task form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addDue, setAddDue] = useState('')
  const [addPhase, setAddPhase] = useState<PhaseKey>('soon')
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState(false)

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDue, setEditDue] = useState('')
  const [editPhase, setEditPhase] = useState<PhaseKey>('soon')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(false)

  const markSyncedNow = () => {
    setLastSync(
      new Date().toLocaleTimeString(locale === 'en' ? 'en-GB' : 'it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    )
  }

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setFetchError(true)
        setLoading(false)
        return
      }

      setUserId(session.user.id)

      const coupleLocaleRes = await supabase
        .from('couples')
        .select('nationality, country_of_origin')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()

      const fallbackLocale = getPreferredSiteLocale()
      const coupleLocaleData = coupleLocaleRes.data
      if (coupleLocaleData) {
        const nextLocale = hasExplicitLocaleCookie() ? fallbackLocale : getCoupleLocale(coupleLocaleData, fallbackLocale)
        persistCoupleLocale(nextLocale)
        setLocale(nextLocale)
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, title_it, title_en, body_it, body_en, due_date, completed, urgent, phase, task_key, source, vendor_name, category, system_generated, priority, draft')
        .eq('user_id', session.user.id)
        .eq('draft', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        setFetchError(true)
        setLoading(false)
        return
      }

      setTasks(data ?? [])
      markSyncedNow()
      setLoading(false)
    }

    load()
  }, [])

  const handleToggle = async (task: Task) => {
    if (pendingIds.includes(task.id)) return

    setWriteError(false)
    const nextTask: Task = {
      ...task,
      completed: !task.completed,
      phase: nextPhaseForToggle(task),
    }

    setPendingIds(prev => [...prev, task.id])
    setTasks(prev => prev.map(t => (t.id === task.id ? nextTask : t)))
    markSyncedNow()

    const { error } = await supabase
      .from('tasks')
      .update({ completed: nextTask.completed, phase: nextTask.phase })
      .eq('id', task.id)
      .eq('user_id', userId ?? '')

    if (error) {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)))
      setWriteError(true)
      markSyncedNow()
    }

    setPendingIds(prev => prev.filter(id => id !== task.id))
  }

  const handleAddTask = async () => {
    if (!addTitle.trim() || !userId) return
    setAddSaving(true)
    setAddError(false)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: addTitle.trim(),
        due_date: addDue || null,
        phase: addPhase,
        completed: false,
        urgent: addPhase === 'urgent',
        source: 'user',
        system_generated: false,
        draft: false,
      })
      .select('id, title, title_it, title_en, body_it, body_en, due_date, completed, urgent, phase, task_key, source, vendor_name, category, system_generated, priority, draft')
      .single()

    if (error || !data) {
      setAddError(true)
      setAddSaving(false)
      return
    }

    setTasks(prev => [...prev, data])
    setAddTitle('')
    setAddDue('')
    setAddPhase('soon')
    setShowAddForm(false)
    setAddSaving(false)
    markSyncedNow()
  }

  const handleStartEdit = (task: Task) => {
    if (!isUserTask(task)) return
    setEditingId(task.id)
    setEditTitle(taskTitle(task, locale))
    setEditDue(task.due_date ?? '')
    setEditPhase(normalizePhase(task.phase))
    setEditError(false)
  }

  const handleSaveEdit = async (task: Task) => {
    if (!isUserTask(task)) { setEditingId(null); return }
    const nextTitle = editTitle.trim()
    if (!nextTitle) return

    const patch: Record<string, unknown> = {}
    if (nextTitle !== task.title) patch.title = nextTitle
    if ((editDue || null) !== task.due_date) patch.due_date = editDue || null
    if (editPhase !== normalizePhase(task.phase)) {
      patch.phase = editPhase
      patch.urgent = editPhase === 'urgent'
    }

    if (Object.keys(patch).length === 0) {
      setEditingId(null)
      return
    }

    setEditSaving(true)
    setEditError(false)

    const { error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', task.id)
      .eq('user_id', userId ?? '')

    if (error) {
      setEditError(true)
      setEditSaving(false)
      return
    }

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...patch } : t))
    setEditingId(null)
    setEditSaving(false)
    markSyncedNow()
  }

  const handleDeleteTask = async (task: Task) => {
    if (!isUserTask(task)) return
    if (!window.confirm(copy.deleteConfirm)) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)
      .eq('user_id', userId ?? '')

    if (error) {
      setWriteError(true)
      return
    }

    setTasks(prev => prev.filter(t => t.id !== task.id))
    if (editingId === task.id) setEditingId(null)
    markSyncedNow()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditError(false)
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

  const sorted = [...tasks].sort((a, b) => {
    const order = { urgent: 0, soon: 1, done: 2 }
    const pA = order[normalizePhase(a.phase)] ?? 1
    const pB = order[normalizePhase(b.phase)] ?? 1
    if (pA !== pB) return pA - pB
    return (b.priority ?? 50) - (a.priority ?? 50)
  })

  const grouped = PHASE_ORDER
    .map(phase => ({
      phase,
      tasks: sorted.filter(t => normalizePhase(t.phase) === phase),
    }))
    .filter(g => g.tasks.length > 0)

  const total = tasks.length
  const done = tasks.filter(t => t.completed).length
  const pendingSet = new Set(pendingIds)

  return (
    <div>
      <CouplePageIntro eyebrow={copy.pageLabel} title={copy.pageTitle} subtitle={copy.pageSub} />

      {total > 0 && <ProgressBar done={done} total={total} copy={copy} />}

      <CoupleNotice title={locale === 'en' ? 'Checklist on web' : 'Checklist sul web'} className="mb-6">
        {copy.interactionHint}
        {lastSync && <span className="text-[var(--velo-muted-soft)]"> · {copy.synced} {lastSync}</span>}
      </CoupleNotice>

      {writeError && (
        <div className="mb-4">
          <CoupleNotice title={copy.writeErrorTitle} tone="danger">{copy.writeErrorDesc}</CoupleNotice>
        </div>
      )}

      {/* Add task button / form */}
      <div className="mb-6">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-xl border border-dashed border-[var(--velo-terracotta)] px-5 py-2.5 text-sm text-[var(--velo-terracotta)] hover:bg-[rgba(184,90,46,0.06)] transition-colors"
            style={{ fontFamily: VELO_MONO_FONT }}
          >
            {copy.addTask}
          </button>
        ) : (
          <CouplePanel>
            <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
              {copy.newTaskLabel}
            </div>
            <TaskForm
              copy={copy}
              locale={locale}
              title={addTitle}
              due={addDue}
              phase={addPhase}
              saving={addSaving}
              hasError={addError}
              saveLabel={copy.addTaskSave}
              onTitleChange={setAddTitle}
              onDueChange={setAddDue}
              onPhaseChange={setAddPhase}
              onSave={handleAddTask}
              onCancel={() => {
                setShowAddForm(false)
                setAddTitle('')
                setAddDue('')
                setAddPhase('soon')
                setAddError(false)
              }}
            />
          </CouplePanel>
        )}
      </div>

      {grouped.length === 0 && <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} />}

      {grouped.map(({ phase, tasks: phaseTasks }) => (
        <PhaseGroup
          key={phase}
          phase={phase}
          tasks={phaseTasks}
          locale={locale}
          pendingIds={pendingSet}
          onToggle={handleToggle}
          onEdit={handleStartEdit}
          onDelete={handleDeleteTask}
          editingId={editingId}
          editTitle={editTitle}
          editDue={editDue}
          editPhase={editPhase}
          editSaving={editSaving}
          editError={editError}
          onEditTitleChange={setEditTitle}
          onEditDueChange={setEditDue}
          onEditPhaseChange={setEditPhase}
          onEditSave={handleSaveEdit}
          onEditCancel={handleCancelEdit}
        />
      ))}

      {grouped.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {PHASE_ORDER.filter(p => grouped.some(g => g.phase === p)).map((phase) => {
            const cfg = phaseConfig(phase, locale)
            const count = grouped.find(g => g.phase === phase)?.tasks.length ?? 0
            return (
              <CouplePanel key={phase} className="min-w-[120px] flex-1 rounded-[1.25rem] p-4 shadow-none">
                <div style={{ fontSize: 10, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', marginBottom: 6, fontFamily: VELO_MONO_FONT }}>{cfg.label}</div>
                <div style={{ fontFamily: VELO_DISPLAY_FONT, fontSize: 32, fontWeight: 300, color: 'var(--velo-ink)' }}>{count}</div>
              </CouplePanel>
            )
          })}
        </div>
      )}
    </div>
  )
}
