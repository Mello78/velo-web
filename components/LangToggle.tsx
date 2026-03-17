'use client'
import { useRouter, usePathname } from 'next/navigation'

export default function LangToggle({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const toggle = () => {
    const next = locale === 'it' ? 'en' : 'it'
    // Next.js i18n routing — redirect to same path with different locale
    router.push(pathname, { locale: next } as any)
  }

  return (
    <button
      onClick={toggle}
      className="text-muted hover:text-cream text-sm transition-colors border border-border rounded-full px-3 py-1 hover:border-gold"
      title={locale === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
    >
      {locale === 'it' ? 'EN' : 'IT'}
    </button>
  )
}
