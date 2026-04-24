'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LangToggle from './LangToggle'

type NavBarProps = {
  locale?: string
  couplesLabel: string
  vendorLabel: string
  forVendorLabel: string
  primaryCtaLabel: string
}

export default function NavBar({
  locale,
  couplesLabel,
  vendorLabel,
  forVendorLabel,
  primaryCtaLabel,
}: NavBarProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1380px] rounded-[2rem] border border-[#e2d0bb] bg-[rgba(251,244,229,0.78)] shadow-[0_18px_40px_rgba(49,35,24,0.12)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] items-center justify-between px-5 sm:px-7">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/brand/logo-light-full.svg" alt="VELO" className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/couple" className="text-[#2c2219] hover:text-[#8a3e1e] text-[12px] transition-colors tracking-[0.18em] uppercase">{couplesLabel}</Link>
            <Link href="/fornitori" className="text-[#6d5b4a] hover:text-[#8a3e1e] text-[12px] transition-colors tracking-[0.18em] uppercase">{vendorLabel}</Link>
            <Link href="/vendor" className="text-[#6d5b4a] hover:text-[#8a3e1e] text-[12px] transition-colors tracking-[0.18em] uppercase">{forVendorLabel}</Link>
            <div className="h-6 w-px bg-[#decdb7]" />
            <LangToggle locale={locale} />
            <Link href="/couple" className="bg-[#b85a2e] text-[#fbf4e5] text-[11px] font-semibold px-5 py-3 rounded-full hover:bg-[#a54d25] transition-colors tracking-[0.18em] uppercase whitespace-nowrap">
              {primaryCtaLabel}
            </Link>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <LangToggle locale={locale} />
            <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dcccc0] text-[#6d5b4a] hover:text-[#8a3e1e] p-1 transition-colors">
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="mx-auto mt-3 max-w-[1380px] rounded-[1.85rem] border border-[#e2d0bb] bg-[rgba(251,244,229,0.94)] px-5 py-5 shadow-[0_18px_42px_rgba(49,35,24,0.14)] backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/couple" onClick={() => setOpen(false)} className="text-[#2c2219] hover:text-[#8a3e1e] text-sm py-1 tracking-[0.12em] uppercase">{couplesLabel}</Link>
            <Link href="/fornitori" onClick={() => setOpen(false)} className="text-[#6d5b4a] hover:text-[#8a3e1e] text-sm py-1 tracking-[0.12em] uppercase">{vendorLabel}</Link>
            <Link href="/vendor" onClick={() => setOpen(false)} className="text-[#6d5b4a] hover:text-[#8a3e1e] text-sm py-1 tracking-[0.12em] uppercase">{forVendorLabel}</Link>
            <Link href="/couple" onClick={() => setOpen(false)} className="bg-[#b85a2e] text-[#fbf4e5] text-xs font-semibold px-4 py-3 rounded-full text-center tracking-[0.18em] uppercase hover:bg-[#a54d25] transition-colors">
              {primaryCtaLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
