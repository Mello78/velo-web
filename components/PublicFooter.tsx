'use client'
import Link from 'next/link'

type PublicFooterProps = {
  locale?: string
}

export default function PublicFooter({ locale = 'it' }: PublicFooterProps) {
  const isEN = locale === 'en'

  return (
    <footer className="bg-[#2c2219] px-6 py-14 text-[#f3eadb] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
      <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-4">
          <img src="/brand/logo-light-mark.svg" alt="VELO" className="h-8 w-auto opacity-85" />
          <div>
            <span className="text-2xl font-light tracking-[0.35em] text-[#f3eadb]" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>VELO</span>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#b89a5b]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              from yes to forever
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
          <Link href="/couple" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]">
            {isEN ? 'Couple Area' : 'Area Coppie'}
          </Link>
          <Link href="/fornitori" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]">
            {isEN ? 'Professionals' : 'Professionisti'}
          </Link>
          <Link href="/vendor" className="text-[12px] tracking-[0.09em] text-[#b0a090] transition-colors hover:text-[#f3eadb]">
            {isEN ? 'Vendor Area' : 'Area Fornitori'}
          </Link>
        </div>

        <p className="text-[11px] tracking-[0.05em] text-[#7a6e64]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 VELO · velowedding.it - A wedding, in Italian.
        </p>
      </div>
    </footer>
  )
}
