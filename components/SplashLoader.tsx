'use client'
import { useEffect, useState } from 'react'

export default function SplashLoader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('velo_splash_seen')
    if (seen) { setVisible(false); return }
    const t1 = setTimeout(() => setFading(true), 1800)
    const t2 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('velo_splash_seen', '1')
    }, 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#0F0E0C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.65s ease',
      opacity: fading ? 0 : 1,
      pointerEvents: fading ? 'none' : 'all',
    }}>
      <div style={{ animation: 'veloIn 0.9s ease forwards', opacity: 0 }}>
        <img src="/logo_velo.png" alt="VELO" style={{ width: 280, height: 'auto' }} />
      </div>
      <style>{`
        @keyframes veloIn {
          from { opacity:0; transform:scale(0.86); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  )
}
