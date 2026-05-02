'use client'
import Link from 'next/link'
import LangToggle from './LangToggle'

type SimpleNavProps = {
  locale?: string
  backHref?: string
  backLabel?: string
  rightLabel?: string
  rightHref?: string
}

export default function SimpleNav({ locale, backHref, backLabel, rightLabel, rightHref }: SimpleNavProps) {
  const isPublicLight = Boolean(backHref)

  if (isPublicLight) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-[1.75rem] border border-[#e2d0bb] bg-[rgba(251,244,229,0.86)] px-4 shadow-[0_16px_40px_rgba(49,35,24,0.10)] backdrop-blur-xl sm:px-6">
          <Link href={backHref!} className="shrink-0 rounded-full border border-[#dcc8b0] bg-[#fffaf4]/60 px-3 py-1.5 text-xs tracking-[0.1em] text-[#5d4e40] transition-colors hover:border-[#b85a2e]/45 hover:text-[#8a3e1e] sm:text-sm">
            {backLabel}
          </Link>
          <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center">
            <img src="/brand/logo-dark-full.svg" alt="VELO" className="h-7 w-auto" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <LangToggle locale={locale} variant="light" />
            {rightLabel && rightHref && (
              <Link href={rightHref} className="hidden text-sm tracking-[0.08em] text-[#5d4e40] transition-colors hover:text-[#8a3e1e] sm:block">
                {rightLabel}
              </Link>
            )}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {backHref && backLabel ? (
          <Link href={backHref} className="text-muted hover:text-cream text-sm transition-colors shrink-0">
            {backLabel}
          </Link>
        ) : (
          <Link href="/" className="flex items-center shrink-0">
            <img src="/brand/logo-dark-full.svg" alt="VELO" className="h-7 w-auto" />
          </Link>
        )}
        {backHref && (
          <Link href="/" className="flex items-center absolute left-1/2 -translate-x-1/2">
            <img src="/brand/logo-dark-full.svg" alt="VELO" className="h-7 w-auto" />
          </Link>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <LangToggle locale={locale} />
          {rightLabel && rightHref && (
            <Link href={rightHref} className="text-muted hover:text-cream text-sm transition-colors hidden sm:block">
              {rightLabel}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
