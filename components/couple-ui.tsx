import { ReactNode } from 'react'

export const VELO_DISPLAY_FONT = 'DM Serif Display, Georgia, serif'
export const VELO_ITALIC_FONT = 'Fraunces, Georgia, serif'
export const VELO_MONO_FONT = "'JetBrains Mono', monospace"

type IntroProps = {
  eyebrow: string
  title: string
  subtitle?: string
  meta?: ReactNode
  action?: ReactNode
}

export function CouplePageIntro({ eyebrow, title, subtitle, meta, action }: IntroProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[42rem]">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px w-10 bg-[var(--velo-border-strong)]" />
          <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--velo-terracotta)]" style={{ fontFamily: VELO_MONO_FONT }}>
            {eyebrow}
          </p>
        </div>
        <h1
          className="text-[2.35rem] font-light leading-[0.98] text-[var(--velo-ink)] sm:text-[2.8rem] lg:text-[3.2rem]"
          style={{ fontFamily: VELO_DISPLAY_FONT }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-[38rem] text-sm leading-7 text-[var(--velo-muted)] sm:text-[1rem]">{subtitle}</p>}
      </div>
      {(meta || action) && (
        <div className="flex max-w-[24rem] flex-col gap-3 lg:items-end lg:text-right">
          {meta}
          {action}
        </div>
      )}
    </div>
  )
}

export function CouplePanel({
  children,
  tone = 'paper',
  className = '',
}: {
  children: ReactNode
  tone?: 'paper' | 'soft' | 'dark'
  className?: string
}) {
  const tones = {
    paper: 'border-[var(--velo-border)] bg-[var(--velo-card)] text-[var(--velo-ink)] shadow-[0_20px_56px_rgba(45,31,22,0.08)]',
    soft: 'border-[#e6d8c7] bg-[var(--velo-paper-2)] text-[var(--velo-ink)] shadow-[0_14px_40px_rgba(45,31,22,0.06)]',
    dark: 'border-[#3a2b20] bg-[var(--velo-espresso)] text-[var(--velo-paper-2)] shadow-[0_20px_56px_rgba(31,24,18,0.16)]',
  }

  return <div className={`rounded-[1.6rem] border p-5 sm:p-6 ${tones[tone]} ${className}`}>{children}</div>
}

export function CoupleNotice({
  title,
  children,
  tone = 'neutral',
  className = '',
}: {
  title: string
  children: ReactNode
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
  className?: string
}) {
  const tones = {
    neutral: 'border-[var(--velo-border)] bg-[rgba(255,250,244,0.72)] text-[var(--velo-muted)]',
    warning: 'border-[rgba(184,90,46,0.26)] bg-[rgba(184,90,46,0.08)] text-[var(--velo-muted)]',
    danger: 'border-[rgba(196,117,106,0.28)] bg-[rgba(196,117,106,0.09)] text-[var(--velo-muted)]',
    success: 'border-[rgba(122,158,126,0.28)] bg-[rgba(122,158,126,0.09)] text-[var(--velo-muted)]',
  }
  const titleColor = {
    neutral: 'var(--velo-ink)',
    warning: 'var(--velo-terracotta)',
    danger: 'var(--velo-danger)',
    success: 'var(--velo-success)',
  }

  return (
    <div className={`rounded-[1.25rem] border px-5 py-4 ${tones[tone]} ${className}`}>
      <div className="mb-2 text-[11px] uppercase tracking-[0.24em]" style={{ color: titleColor[tone], fontFamily: VELO_MONO_FONT }}>
        {title}
      </div>
      <div className="text-sm leading-7">{children}</div>
    </div>
  )
}

export function CoupleMetricCard({
  label,
  value,
  accent = 'var(--velo-terracotta)',
  sub,
}: {
  label: string
  value: ReactNode
  accent?: string
  sub?: ReactNode
}) {
  return (
    <div className="min-w-[140px] flex-1 rounded-[1.25rem] border border-[var(--velo-border)] bg-[var(--velo-card)] p-4 shadow-[0_12px_30px_rgba(45,31,22,0.05)]">
      <div className="mb-3 text-[10px] uppercase tracking-[0.24em]" style={{ color: accent, fontFamily: VELO_MONO_FONT }}>
        {label}
      </div>
      <div className="text-[2rem] font-light leading-none text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
        {value}
      </div>
      {sub && <div className="mt-2 text-[11px] leading-5 text-[var(--velo-muted-soft)]">{sub}</div>}
    </div>
  )
}

export function CoupleChip({
  children,
  accent = 'var(--velo-muted)',
  active = false,
  onClick,
}: {
  children: ReactNode
  accent?: string
  active?: boolean
  onClick?: () => void
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors'
  const style = active
    ? { color: accent, borderColor: `${accent}66`, background: `${accent}18`, fontFamily: VELO_MONO_FONT }
    : { color: 'var(--velo-muted)', borderColor: 'var(--velo-border)', background: 'rgba(255,250,244,0.58)', fontFamily: VELO_MONO_FONT as string }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base} style={style}>
        {children}
      </button>
    )
  }

  return (
    <span className={base} style={style}>
      {children}
    </span>
  )
}

export function CoupleEmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <CouplePanel className="px-8 py-12 text-center">
      <p className="text-lg text-[var(--velo-ink)]" style={{ fontFamily: VELO_DISPLAY_FONT }}>
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-[32rem] text-sm leading-7 text-[var(--velo-muted)]">{body}</p>
    </CouplePanel>
  )
}

export function CoupleLoadingBlock() {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--velo-terracotta)] border-t-transparent" />
    </div>
  )
}
