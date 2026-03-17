import Link from 'next/link'
import { cookies } from 'next/headers'
import { getT } from '@/lib/translations'
import LangToggle from '@/components/LangToggle'

const regions = ['Toscana', 'Amalfi Coast', 'Lago di Como', 'Langhe & Piemonte', 'Roma & Lazio', 'Puglia', 'Venezia & Veneto', 'Umbria']

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}
function AndroidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C4.98 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M17.82 15.64a2.18 2.18 0 012.18 2.18C20 19 19.02 20 17.82 20c-1.2 0-2.18-1-2.18-2.18a2.18 2.18 0 012.18-2.18M17.82 8.18C18.42 8.18 19 8.64 19 9.27v6.92c0 .63-.58 1.09-1.18 1.09-.6 0-1.18-.46-1.18-1.09V9.27c0-.63.58-1.09 1.18-1.09M6.18 8.18c.6 0 1.18.46 1.18 1.09v6.92c0 .63-.58 1.09-1.18 1.09C5.58 17.28 5 16.82 5 16.19V9.27c0-.63.58-1.09 1.18-1.09M12 1l2.27 4H9.73L12 1M12 3.27L11 5h2l-1-1.73M7 6v10h10V6H7m2-1h6c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1z"/>
    </svg>
  )
}

const featureIcons = [
  <svg key="planning" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#C9A84C" strokeWidth="1.5"/><line x1="8" y1="8" x2="16" y2="8" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="16" x2="12" y2="16" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="clock" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="12" cy="12" r="9" stroke="#C9A84C" strokeWidth="1.5"/><path d="M12 7v5l3 2" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="guests" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><circle cx="9" cy="7" r="3" stroke="#C9A84C" strokeWidth="1.5"/><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/><circle cx="17" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5"/><path d="M21 20c0-2.21-1.79-4-4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="budget" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><rect x="2" y="6" width="20" height="14" rx="2" stroke="#C9A84C" strokeWidth="1.5"/><path d="M2 10h20" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="7" cy="15" r="1.5" fill="#C9A84C"/><circle cx="12" cy="15" r="1.5" fill="#C9A84C"/></svg>,
  <svg key="pin" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="12" cy="9" r="2.5" stroke="#C9A84C" strokeWidth="1.5"/></svg>,
  <svg key="doc" viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#C9A84C" strokeWidth="1.5"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/></svg>,
]

export default function Home() {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const tr = getT(locale)

  return (
    <main className="min-h-screen bg-bg text-cream">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-8 w-auto" />
            <span className="text-gold text-2xl tracking-[0.3em] font-light">VELO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/fornitori" className="text-muted hover:text-cream text-sm transition-colors tracking-wide">{tr.nav.vendors}</Link>
            <Link href="/vendor" className="text-muted hover:text-cream text-sm transition-colors tracking-wide">{tr.nav.forVendors}</Link>
            <LangToggle locale={locale} />
            <a href="#download" className="bg-gold text-bg text-xs font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity tracking-wider">
              {tr.nav.download}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[640px] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-[520px]">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-6">{tr.hero.label}</p>
            <h1 className="text-6xl md:text-7xl font-light leading-[1.05] mb-6">
              {tr.hero.title1} <span className="text-gold">sì</span><br />{tr.hero.title2}
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">{tr.hero.desc}</p>
            <div className="flex flex-wrap gap-3" id="download">
              <a href="#" className="flex items-center gap-3 bg-cream text-bg font-semibold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity">
                <AppleIcon /><span className="text-sm tracking-wide">{tr.hero.appStore}</span>
              </a>
              <a href="#" className="flex items-center gap-3 border border-border text-cream px-6 py-3.5 rounded-full hover:border-gold transition-colors">
                <AndroidIcon /><span className="text-sm tracking-wide">{tr.hero.googlePlay}</span>
              </a>
            </div>
            <p className="text-muted/60 text-xs mt-5 tracking-wide">{tr.hero.free}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold text-xs tracking-[0.35em] uppercase text-center mb-4">{tr.features.label}</p>
          <h2 className="text-4xl font-light text-center mb-16">{tr.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tr.features.items.map((f, i) => (
              <div key={i} className="bg-dark border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors group">
                <div className="mb-5 opacity-80 group-hover:opacity-100 transition-opacity">{featureIcons[i]}</div>
                <h3 className="text-cream font-medium mb-2 tracking-wide">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-4">{tr.regions.label}</p>
          <h2 className="text-4xl font-light mb-4">{tr.regions.title}</h2>
          <p className="text-muted mb-12">{tr.regions.desc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {regions.map((r, i) => (
              <Link key={i} href={`/fornitori?region=${encodeURIComponent(r)}`}
                className="border border-border rounded-full px-5 py-2 text-sm text-muted hover:border-gold hover:text-gold transition-colors">{r}</Link>
            ))}
          </div>
          <Link href="/fornitori" className="inline-block mt-10 text-gold text-sm hover:opacity-70 transition-opacity tracking-wide">{tr.regions.cta}</Link>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="py-24 px-6 border-t border-border bg-dark">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-gold/10 border border-gold/25 rounded-full px-5 py-2 text-xs text-gold tracking-widest uppercase mb-8">{tr.vendorCta.badge}</div>
          <h2 className="text-4xl font-light mb-6">{tr.vendorCta.title}</h2>
          <p className="text-muted text-lg mb-3 leading-relaxed">{tr.vendorCta.desc}</p>
          <p className="text-gold text-sm mb-10 tracking-wide">{tr.vendorCta.pricing}</p>
          <Link href="/vendor" className="inline-flex items-center gap-2 bg-gold text-bg font-semibold px-8 py-4 rounded-full text-sm hover:opacity-90 transition-opacity tracking-wide">{tr.vendorCta.btn}</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-8 w-auto" />
            <div>
              <span className="text-gold text-xl tracking-[0.35em] font-light">VELO</span>
              <p className="text-muted text-xs tracking-widest uppercase">from yes to forever</p>
            </div>
          </div>
          <div className="flex gap-8">
            <Link href="/fornitori" className="text-muted text-sm hover:text-cream transition-colors">{tr.footer.vendors}</Link>
            <Link href="/vendor" className="text-muted text-sm hover:text-cream transition-colors">{tr.footer.vendorArea}</Link>
            <Link href="/admin" className="text-muted text-sm hover:text-cream transition-colors">{tr.footer.admin}</Link>
          </div>
          <p className="text-muted text-xs">{tr.footer.copy}</p>
        </div>
      </footer>
    </main>
  )
}
