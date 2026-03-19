'use client'
import Link from 'next/link'
import LangToggle from '@/components/LangToggle'

type SimpleNavProps = {
  locale?: string
  backHref?: string
  backLabel?: string
  rightLabel?: string
  rightHref?: string
}

export default function SimpleNav({ locale, backHref, backLabel, rightLabel, rightHref }: SimpleNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {backHref && backLabel ? (
          <Link href={backHref} className="text-muted hover:text-cream text-sm transition-colors shrink-0">
            {backLabel}
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
          </Link>
        )}
        {backHref && (
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light hidden sm:block">VELO</span>
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
