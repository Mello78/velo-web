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
  const stripped = p.replace(/^[^A-Za-z\u00C0-\u017F]+/, '')
  return LEGACY_PHASE_MAP[stripped] || 'soon'
}

function nextPhaseForToggle(task: Task): string {
  if (!task.completed) return 'done'
  return task.urgent ? 'urgent' : 'soon'
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
      ? "Puoi segnare i task come completati anche da web. Usa l'app VELO per creare o modificare i task."
      : 'You can mark tasks complete on web too. Use the VELO app to create or edit tasks.',
    synced: isIT ? 'sincronizzato' : 'synced',
    updating: isIT ? 'aggiornamento...' : 'updating...',
    emptyTitle: isIT ? 'Nessun task ancora' : 'No tasks yet',
    emptyDesc: isIT
      ? "Apri l'app VELO per aggiungere il primo task: la checklist apparira qui."
      : 'Open the VELO app to add your first task and the checklist will appear here.',
    errorTitle: isIT ? 'Impossibile caricare la checklist' : 'Unable to load checklist',
    errorDesc: isIT
      ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.'
      : 'This may be a temporary connection issue. Try refreshing the page.',
    writeErrorTitle: isIT ? 'Impossibile aggiornare il task' : 'Unable to update task',
    writeErrorDesc: isIT
      ? 'Lo stato non e stato salvato. Riprova.'
      : 'The task status was not saved. Please try again.',
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

function TaskRow({
  task,
  locale,
  pending,
  onToggle,
}: {
  task: Task
  locale: string
  pending: boolean
  onToggle: (task: Task) => void
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
    </div>
  )
}

function PhaseGroup({
  phase,
  tasks,
  locale,
  pendingIds,
  onToggle,
}: {
  phase: PhaseKey
  tasks: Task[]
  locale: string
  pendingIds: Set<string>
  onToggle: (task: Task) => void
}) {
  const cfg = phaseConfig(phase, locale)
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
            <TaskRow key={task.id} task={task} locale={locale} pending={pendingIds.has(task.id)} onToggle={onToggle} />
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

      // Fetch couple first
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

    if (error) {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)))
      setWriteError(true)
      markSyncedNow()
    }

    setPendingIds(prev => prev.filter(id => id !== task.id))
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

      <CoupleNotice title={locale === 'en' ? 'Checklist updates on web' : 'Checklist aggiornabile dal web'} className="mb-6">
        {copy.interactionHint}
        {lastSync && <span className="text-[var(--velo-muted-soft)]"> · {copy.synced} {lastSync}</span>}
      </CoupleNotice>

      {writeError && (
        <div className="mb-4">
          <CoupleNotice title={copy.writeErrorTitle} tone="danger">{copy.writeErrorDesc}</CoupleNotice>
        </div>
      )}

      {grouped.length === 0 && <CoupleEmptyState title={copy.emptyTitle} body={copy.emptyDesc} />}

      {grouped.map(({ phase, tasks: phaseTasks }) => (
        <PhaseGroup key={phase} phase={phase} tasks={phaseTasks} locale={locale} pendingIds={pendingSet} onToggle={handleToggle} />
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
