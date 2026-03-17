'use client'
import { useEffect, useState } from 'react'

export default function LangToggle({ locale }: { locale?: string }) {
  const [current, setCurrent] = useState(locale || 'it')

  useEffect(() => {
    // Leggi la lingua salvata nel cookie
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) setCurrent(match[1])
    else if (!locale) {
      const browserLang = navigator.language.startsWith('en') ? 'en' : 'it'
      setCurrent(browserLang)
    }
  }, [])

  const toggle = () => {
    const next = current === 'it' ? 'en' : 'it'
    // Salva nel cookie (Next.js lo usa automaticamente per i18n)
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    setCurrent(next)
    // Reload della pagina per applicare la nuova lingua
    window.location.reload()
  }

  return (
    <button
      onClick={toggle}
      className="text-muted hover:text-cream text-sm transition-colors border border-border rounded-full px-3 py-1 hover:border-gold"
      title={current === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
    >
      {current === 'it' ? 'EN' : 'IT'}
    </button>
  )
}
