'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

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

function normalizePhase(p: string): PhaseKey {
  if (LEGACY_PHASE_MAP[p]) return LEGACY_PHASE_MAP[p]
  const stripped = p.replace(/^[^A-Za-zÀ-ÿ]+/, '')
  return LEGACY_PHASE_MAP[stripped] || 'soon'
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

function getChecklistCopy(locale: string) {
  const isIT = locale === 'it'
  return {
    pageLabel: isIT ? 'PLANNING' : 'PLANNING',
    pageTitle: isIT ? 'La vostra roadmap' : 'Your roadmap',
    progress: isIT ? 'Completamento' : 'Overall completion',
    tasksSuffix: isIT ? 'task' : 'tasks',
    readOnly: isIT ? 'Vista in sola lettura — usa l’app VELO per aggiungere o completare task' : 'Read-only view — use the VELO app to add or complete tasks',
    synced: isIT ? 'sincronizzato' : 'synced',
    emptyTitle: isIT ? 'Nessun task ancora' : 'No tasks yet',
    emptyDesc: isIT ? 'Apri l’app VELO per aggiungere il primo task — la checklist apparirà qui.' : 'Open the VELO app to add your first task — your checklist will appear here.',
    errorTitle: isIT ? 'Impossibile caricare la checklist' : 'Unable to load checklist',
    errorDesc: isIT ? 'Potrebbe essere un problema temporaneo. Prova ad aggiornare la pagina.' : 'This may be a temporary connection issue. Try refreshing the page.',
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
    day: 'numeric', month: 'long',
  })
}

function phaseConfig(phase: PhaseKey, locale: string) {
  const copy = getChecklistCopy(locale)
  const colors: Record<PhaseKey, { color: string; accent: string }> = {
    urgent: { color: '#C4756A', accent: 'rgba(196,117,106,0.08)' },
    soon: { color: '#C9A84C', accent: 'rgba(201,168,76,0.06)' },
    done: { color: '#7A9E7E', accent: 'rgba(122,158,126,0.06)' },
  }
  return { label: copy.phaseLabel(phase), ...colors[phase] }
}

function sourceBadge(source: string, locale: string) {
  const copy = getChecklistCopy(locale)
  const colorMap: Record<string, string> = {
    vendor: '#4A7AB8',
    vendor_custom: '#4A7AB8',
    setup: '#8A7E6A',
    documents: '#7A9E7E',
    countdown: '#C4756A',
    budget: '#C9A84C',
    guests: '#8A7E6A',
  }
  return {
    label: copy.sourceLabel(source),
    color: colorMap[source] ?? '#8A7E6A',
  }
}

function ErrorBanner({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      background: 'rgba(196,117,106,0.06)',
      border: '1px solid rgba(196,117,106,0.2)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 13, color: '#C4756A', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function ProgressBar({ done, total, copy }: { done: number; total: number; copy: ReturnType<typeof getChecklistCopy> }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#8A7E6A', textTransform: 'uppercase' }}>
          {copy.progress}
        </div>
        <div style={{ fontSize: 13, color: '#F5EDD6' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, fontWeight: 300 }}>{done}</span>
          <span style={{ color: '#5A5040', fontSize: 13 }}> / {total} {copy.tasksSuffix}</span>
        </div>
      </div>
      <div style={{ height: 3, background: '#1E1D1A', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct === 100 ? '#7A9E7E' : '#C9A84C',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#5A5040', marginTop: 6, textAlign: 'right' }}>{pct}%</div>
    </div>
  )
}

function TaskRow({ task, locale }: { task: Task; locale: string }) {
  const title = taskTitle(task, locale)
  const body = taskBody(task, locale)
  const badge = task.source && task.source !== 'user' ? sourceBadge(task.source, locale) : null
  const isVendor = task.source === 'vendor' || task.source === 'vendor_custom'
  const isDone = task.completed

  return (
    <div style={{
      display: 'flex',
      gap: 14,
      padding: '14px 18px',
      borderBottom: '1px solid #1A1915',
      opacity: isDone ? 0.55 : 1,
      background: isVendor ? 'rgba(74,122,184,0.04)' : 'transparent',
      transition: 'opacity 0.15s',
    }}>
      <div style={{
        flexShrink: 0, marginTop: 2,
        width: 18, height: 18, borderRadius: 4,
        border: `1.5px solid ${isDone ? '#7A9E7E' : '#3A3830'}`,
        background: isDone ? 'rgba(122,158,126,0.2)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#7A9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {badge && (
          <div style={{ marginBottom: 5 }}>
            <span style={{
              fontSize: 10, letterSpacing: 1, textTransform: 'uppercase',
              color: badge.color, background: `${badge.color}18`,
              borderRadius: 4, padding: '2px 7px',
            }}>
              {badge.label}
              {task.vendor_name ? ` · ${task.vendor_name}` : ''}
            </span>
          </div>
        )}
        <div style={{
          fontSize: 14, color: isDone ? '#5A5040' : '#F5EDD6',
          textDecoration: isDone ? 'line-through' : 'none',
          lineHeight: 1.5,
        }}>
          {title}
        </div>
        {body && !isDone && (
          <div style={{ fontSize: 12, color: '#8A7E6A', marginTop: 4, lineHeight: 1.6 }}>{body}</div>
        )}
        {task.due_date && (
          <div style={{
            fontSize: 11, marginTop: 5,
            color: task.urgent && !isDone ? '#C4756A' : '#5A5040',
          }}>
            {formatDate(task.due_date, locale)}
          </div>
        )}
      </div>
    </div>
  )
}

function PhaseGroup({ phase, tasks, locale }: { phase: PhaseKey; tasks: Task[]; locale: string }) {
  const cfg = phaseConfig(phase, locale)
  const [collapsed, setCollapsed] = useState(phase === 'done')

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px', background: cfg.accent,
          border: `1px solid ${cfg.color}20`,
          borderBottom: collapsed ? undefined : 'none',
          borderRadius: collapsed ? 10 : '10px 10px 0 0',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', fontWeight: 600 }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 12, color: '#5A5040' }}>{tasks.length}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M2 4L6 8L10 4" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {!collapsed && (
        <div style={{
          background: '#1A1915',
          border: `1px solid ${cfg.color}20`,
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }}>
          {tasks.map((task, i) => (
            <div key={task.id} style={{ borderTop: i === 0 ? 'none' : undefined }}>
              <TaskRow task={task} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PHASE_ORDER: PhaseKey[] = ['urgent', 'soon', 'done']

export default function ChecklistPage() {
  const locale = useLocale()
  const copy = getChecklistCopy(locale)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setFetchError(true); setLoading(false); return }

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
      setLastSync(new Date().toLocaleTimeString(locale === 'en' ? 'en-GB' : 'it-IT', { hour: '2-digit', minute: '2-digit' }))
      setLoading(false)
    }
    load()
  }, [locale])

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
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
            {copy.pageLabel}
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>
            {copy.pageTitle}
          </h1>
        </div>
        <ErrorBanner title={copy.errorTitle} desc={copy.errorDesc} />
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

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 8 }}>
          {copy.pageLabel}
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>
          {copy.pageTitle}
        </h1>
      </div>

      {total > 0 && <ProgressBar done={done} total={total} copy={copy} />}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 24, padding: '10px 14px',
        background: 'rgba(138,126,106,0.06)', border: '1px solid #2A2820',
        borderRadius: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A7E6A" strokeWidth="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ fontSize: 12, color: '#8A7E6A' }}>
          {copy.readOnly}
          {lastSync && <span style={{ color: '#3A3830' }}> · {copy.synced} {lastSync}</span>}
        </span>
      </div>

      {grouped.length === 0 && (
        <div style={{
          background: '#1A1915', border: '1px solid #2A2820',
          borderRadius: 14, padding: '48px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#5A5040', marginBottom: 10 }}>{copy.emptyTitle}</div>
          <div style={{ fontSize: 12, color: '#3A3830', lineHeight: 1.7 }}>
            {copy.emptyDesc}
          </div>
        </div>
      )}

      {grouped.map(({ phase, tasks: phaseTasks }) => (
        <PhaseGroup key={phase} phase={phase} tasks={phaseTasks} locale={locale} />
      ))}

      {grouped.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }} className="task-stats">
          {PHASE_ORDER.filter(p => grouped.some(g => g.phase === p)).map(phase => {
            const cfg = phaseConfig(phase, locale)
            const count = grouped.find(g => g.phase === phase)?.tasks.length ?? 0
            return (
              <div key={phase} style={{
                flex: 1, minWidth: 100,
                background: '#1A1915', border: `1px solid ${cfg.color}20`,
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase', marginBottom: 6 }}>{cfg.label}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 300, color: '#F5EDD6' }}>{count}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
