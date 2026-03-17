import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function getVendor(id: string) {
  const { data } = await supabase.from('public_vendors').select('*').eq('id', id).single()
  return data
}

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const v = await getVendor(params.id)
  if (!v) notFound()

  const photos = [v.photo1_url, v.photo2_url, v.photo3_url].filter(Boolean)

  const socials = [
    { icon: '📷', label: 'Instagram', value: v.instagram, href: v.instagram ? `https://instagram.com/${v.instagram.replace('@','')}` : null },
    { icon: '📘', label: 'Facebook', value: v.facebook, href: v.facebook ? `https://facebook.com/${v.facebook.replace('@','')}` : null },
    { icon: '🎵', label: 'TikTok', value: v.tiktok, href: v.tiktok ? `https://tiktok.com/@${v.tiktok.replace('@','')}` : null },
    { icon: '🌐', label: 'Sito web', value: v.website, href: v.website ? `https://${v.website.replace('https://','').replace('http://','')}` : null },
    { icon: '💬', label: 'WhatsApp', value: v.whatsapp, href: v.whatsapp ? `https://wa.me/${v.whatsapp.replace(/\D/g,'')}` : null },
  ].filter(s => s.value)

  return (
    <main className="min-h-screen bg-bg text-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-7 w-auto" />
            <span className="text-gold text-xl tracking-[0.3em] font-light">VELO</span>
          </Link>
          <Link href="/fornitori" className="text-muted hover:text-cream text-sm transition-colors">← Tutti i fornitori</Link>
        </div>
      </nav>

      <div className="pt-20 max-w-4xl mx-auto px-6 pb-20">
        {/* Hero copertina */}
        <div className="relative rounded-2xl overflow-hidden mb-0">
          {photos.length > 0 ? (
            <img src={photos[0]} alt={v.name} className="w-full h-72 md:h-96 object-cover" />
          ) : (
            <div className="w-full h-72 bg-dark flex items-center justify-center">
              <span className="text-8xl opacity-20">{v.cover_emoji || '📸'}</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
        </div>

        {/* Logo + info principale */}
        <div className="flex flex-col items-center -mt-10 relative z-10 mb-8">
          {v.logo_url && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-bg bg-dark mb-4 shadow-lg">
              <img src={v.logo_url} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-3xl font-light">{v.name}</h1>
              {v.verified && <span className="text-green text-sm border border-green/30 bg-green/10 px-2 py-0.5 rounded-full">✓ Verificato</span>}
            </div>
            <p className="text-muted text-sm">{v.category} · {v.location}, {v.region}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-gold">★ {v.rating}</span>
              <span className="text-muted text-sm">({v.review_count} recensioni)</span>
              {v.price_from && <span className="text-gold text-sm ml-2">da €{v.price_from}{v.price_to ? ` — €${v.price_to}` : ''}</span>}
            </div>
          </div>
        </div>

        {/* Galleria foto */}
        {photos.length > 1 && (
          <section className="bg-dark border border-border rounded-2xl p-6 mb-4">
            <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-xl">
                  <img src={p} alt={`foto ${i+1}`} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Descrizione */}
        {v.description && (
          <section className="bg-dark border border-border rounded-2xl p-6 mb-4">
            <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Chi siamo</h2>
            <p className="text-cream/90 leading-relaxed">{v.description}</p>
          </section>
        )}

        {/* Specialità */}
        {v.specialties?.length > 0 && (
          <section className="bg-dark border border-border rounded-2xl p-6 mb-4">
            <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Specialità</h2>
            <div className="flex flex-wrap gap-2">
              {v.specialties.map((s: string, i: number) => (
                <span key={i} className="bg-gold/10 border border-gold/20 text-gold text-sm px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="bg-dark border border-border rounded-2xl p-6 mb-4">
          <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Informazioni</h2>
          <div className="space-y-0">
            {[
              { label: 'Zona', value: `${v.location}, ${v.region}` },
              v.years_experience > 0 && { label: 'Esperienza', value: `${v.years_experience} anni` },
              v.languages?.length > 0 && { label: 'Lingue', value: v.languages.join(', ') },
              (v.price_from || v.price_to) && { label: 'Prezzi', value: `${v.price_from ? `da €${v.price_from}` : ''}${v.price_from && v.price_to ? ' — ' : ''}${v.price_to ? `€${v.price_to}` : ''}` },
            ].filter(Boolean).map((row: any, i: number) => (
              <div key={i} className="flex justify-between py-3 border-b border-border last:border-0">
                <span className="text-muted text-sm">{row.label}</span>
                <span className="text-cream text-sm text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Premi */}
        {v.awards?.length > 0 && (
          <section className="bg-dark border border-border rounded-2xl p-6 mb-4">
            <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Riconoscimenti</h2>
            {v.awards.map((a: string, i: number) => (
              <p key={i} className="text-gold text-sm py-1">• {a}</p>
            ))}
          </section>
        )}

        {/* Contatti e social */}
        {socials.length > 0 && (
          <section className="bg-dark border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-muted text-xs uppercase tracking-widest mb-4">Contatti & Social</h2>
            <div className="space-y-0">
              {socials.map((s, i) => (
                <a key={i} href={s.href!} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0 hover:text-gold transition-colors group">
                  <span className="text-xl">{s.icon}</span>
                  <span className="flex-1 text-blue-400 text-sm group-hover:text-gold">{s.value}</span>
                  <span className="text-muted text-sm">→</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* WhatsApp CTA */}
        {v.whatsapp && (
          <a href={`https://wa.me/${v.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-4 rounded-2xl hover:opacity-90 transition-opacity mb-4">
            💬 Contatta su WhatsApp
          </a>
        )}

        {/* Torna alla lista */}
        <div className="text-center mt-8">
          <Link href="/fornitori" className="text-muted hover:text-gold text-sm transition-colors">
            ← Torna a tutti i fornitori
          </Link>
        </div>
      </div>
    </main>
  )
}
