'use client'
import { useState, useEffect } from 'react'
import { getT } from '../../../lib/translations'

function useLocale() {
  const [locale, setLocale] = useState('it')
  useEffect(() => {
    const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (m) setLocale(m[1])
    else if (navigator.language.startsWith('en')) setLocale('en')
  }, [])
  return locale
}

export default function GuestsPage() {
  const locale = useLocale()
  const d = getT(locale)
  const c = (d as any).couple

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#8A7E6A', textTransform: 'uppercase', marginBottom: 8 }}>{c.placeholder.comingSoon}</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, fontWeight: 300, color: '#F5EDD6', margin: 0 }}>{c.nav.guests}</h1>
      </div>
      <div style={{ background: '#1A1915', border: '1px solid #2A2820', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#5A5040', marginBottom: 12 }}>{c.placeholder.comingSoonDesc}</div>
        <div style={{ fontSize: 13, color: '#8A7E6A' }}>{c.placeholder.useApp}</div>
      </div>
    </div>
  )
}
