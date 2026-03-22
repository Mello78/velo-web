'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LangToggle from './LangToggle'

type NavBarProps = {
  locale?: string
  vendorLabel: string
  forVendorLabel: string
  downloadLabel: string
}

export default function NavBar({ locale, vendorLabel, forVendorLabel, downloadLabel }: NavBarProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/favicon.png" alt="" className="h-7 w-auto" />
          <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
        </Link>
        <div className="hidden md:flex items-center gap-5">
          <Link href="/fornitori" className="text-muted hover:text-cream text-sm transition-colors tracking-wide">{vendorLabel}</Link>
          <Link href="/vendor" className="text-muted hover:text-cream text-sm transition-colors tracking-wide">{forVendorLabel}</Link>
          <LangToggle locale={locale} />
          <a href="#download" className="bg-gold text-bg text-xs font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity tracking-wider whitespace-nowrap">
            {downloadLabel}
          </a>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <LangToggle locale={locale} />
          <button onClick={() => setOpen(!open)} className="text-muted hover:text-cream p-1">
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-4 flex flex-col gap-4">
          <Link href="/fornitori" onClick={() => setOpen(false)} className="text-muted hover:text-cream text-sm py-1">{vendorLabel}</Link>
          <Link href="/vendor" onClick={() => setOpen(false)} className="text-muted hover:text-cream text-sm py-1">{forVendorLabel}</Link>
          <a href="#download" onClick={() => setOpen(false)} className="bg-gold text-bg text-xs font-semibold px-4 py-3 rounded-full text-center tracking-wider">
            {downloadLabel}
          </a>
        </div>
      )}
    </nav>
  )
}
