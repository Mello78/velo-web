import Link from 'next/link'
import { cookies } from 'next/headers'
import { supabase } from '../../../lib/supabase'
import { getT } from '../../../lib/translations'
import SimpleNav from '../../../components/SimpleNav'
import PhotoLightbox from '../../../components/PhotoLightbox'
import { notFound } from 'next/navigation'

async function getVendor(id: string) {
  const { data } = await supabase.from('public_vendors').select('*').eq('id', id).single()
  return data
}

export default async function VendorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const tr = getT(locale)
  const vendor = await getVendor(params.id)
  if (!vendor) notFound()

  const socialLinks = [
    vendor.instagram && { icon: '📸', label: 'Instagram', url: `https://instagram.com/${vendor.instagram.replace('@','')}`, handle: vendor.instagram },
    vendor.facebook && { icon: '👤', label: 'Facebook', url: vendor.facebook.startsWith('http') ? vendor.facebook : `https://facebook.com/${vendor.facebook}`, handle: vendor.facebook },
    vendor.tiktok && { icon: '🎵', label: 'TikTok', url: `https://tiktok.com/@${vendor.tiktok.replace('@','')}`, handle: vendor.tiktok },
    vendor.website && { icon: '🌐', label: 'Website', url: vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`, handle: vendor.website },
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-bg text-cream">
      <SimpleNav
        locale={locale}
        backHref="/fornitori"
        backLabel={tr.vendorDetail.back}
      />

      {/* Hero */}
      <div className="relative h-[420px] mt-16 overflow-hidden">
        {vendor.photo1_url ? (
          <img src={vendor.photo1_url} alt={vendor.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-dark flex items-center justify-center">
            <span className="text-8xl opacity-20">{vendor.cover_emoji || '📸'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        {vendor.logo_url && (
          <div className="absolute bottom-8 left-8 w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-dark shadow-xl">
            <img src={vendor.logo_url} alt="logo" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pt-2">
          <div className={vendor.logo_url ? 'md:ml-28' : ''}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-4xl font-light">{vendor.name}</h1>
              {vendor.verified && (
                <span className="text-green text-sm bg-green/10 border border-green/20 px-3 py-1 rounded-full">{tr.vendorDetail.verified}</span>
              )}
            </div>
            <p className="text-muted mb-3">{vendor.category} · {vendor.location}, {vendor.region}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gold text-lg">★</span>
                <span className="text-cream font-medium">{vendor.rating}</span>
                <span className="text-muted text-sm">({vendor.review_count} {tr.vendorDetail.reviews})</span>
              </div>
              {vendor.price_from && (
                <span className="text-gold text-sm border border-gold/30 rounded-full px-4 py-1">
                  {tr.vendorDetail.priceFrom} €{vendor.price_from}
                  {vendor.price_to ? ` – €${vendor.price_to}` : ''}
                </span>
              )}
            </div>
          </div>
          {vendor.whatsapp && (
            <a href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity shrink-0 text-sm">
              {tr.vendorDetail.whatsapp}
            </a>
          )}
        </div>

        {/* CTA Download App */}
        <div className="my-10 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/25 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-3xl shrink-0">💍</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-1">Ti interessa questo fornitore?</p>
            <h3 className="text-cream text-lg font-light mb-1">
              Scarica VELO e inizia a pianificare il tuo matrimonio
            </h3>
            <p className="text-muted text-sm">Planning, fornitori, ospiti e budget — tutto in un posto. Gratis.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2 bg-cream text-bg text-xs font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
            <a href="#" className="flex items-center gap-2 border border-gold/40 text-gold text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-gold/10 transition-colors whitespace-nowrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20C4.98 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M17.82 15.64a2.18 2.18 0 012.18 2.18C20 19 19.02 20 17.82 20c-1.2 0-2.18-1-2.18-2.18a2.18 2.18 0 012.18-2.18M17.82 8.18C18.42 8.18 19 8.64 19 9.27v6.92c0 .63-.58 1.09-1.18 1.09-.6 0-1.18-.46-1.18-1.09V9.27c0-.63.58-1.09 1.18-1.09M6.18 8.18c.6 0 1.18.46 1.18 1.09v6.92c0 .63-.58 1.09-1.18 1.09C5.58 17.28 5 16.82 5 16.19V9.27c0-.63.58-1.09 1.18-1.09M12 1l2.27 4H9.73L12 1M12 3.27L11 5h2l-1-1.73M7 6v10h10V6H7m2-1h6c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1z"/></svg>
              Google Play
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main col */}
          <div className="md:col-span-2 space-y-10">
            {/* Portfolio */}
            {(vendor.photo1_url || vendor.photo2_url || vendor.photo3_url) && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-5">{tr.vendorDetail.portfolio}</h2>
                <PhotoLightbox
                  photos={[vendor.photo1_url, vendor.photo2_url, vendor.photo3_url].filter(Boolean)}
                  vendorName={vendor.name}
                />
              </section>
            )}

            {/* About */}
            {(locale === 'en' ? vendor.description_en : vendor.description) && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.about}</h2>
                <p className="text-muted leading-relaxed text-base">
                  {locale === 'en' && vendor.description_en ? vendor.description_en : vendor.description}
                </p>
              </section>
            )}

            {/* Specialties */}
            {((locale === 'en' ? vendor.specialties_en : vendor.specialties) || vendor.specialties)?.length > 0 && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.specialties}</h2>
                <div className="flex flex-wrap gap-2">
                  {(locale === 'en' && vendor.specialties_en?.length ? vendor.specialties_en : vendor.specialties).map((s: string, i: number) => (
                    <span key={i} className="border border-border rounded-full px-4 py-1.5 text-sm text-muted">{s}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Awards */}
            {vendor.awards?.length > 0 && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.awards}</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.awards.map((a: string, i: number) => (
                    <span key={i} className="bg-gold/10 border border-gold/25 text-gold rounded-full px-4 py-1.5 text-sm">🏆 {a}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Side col */}
          <div className="space-y-6">
            {/* Info box */}
            <div className="bg-dark border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-xs text-gold tracking-[0.3em] uppercase">{tr.vendorDetail.info}</h3>
              {vendor.years_experience && (
                <div><p className="text-muted text-xs mb-1">{tr.vendorDetail.experience}</p>
                  <p className="text-cream text-sm">{vendor.years_experience} {tr.vendorDetail.years}</p></div>
              )}
              {vendor.languages?.length > 0 && (
                <div><p className="text-muted text-xs mb-1">{tr.vendorDetail.languages}</p>
                  <p className="text-cream text-sm">{vendor.languages.join(', ')}</p></div>
              )}
              <div><p className="text-muted text-xs mb-1">{tr.vendorDetail.area}</p>
                <p className="text-cream text-sm">{vendor.location}, {vendor.region}</p></div>
              {vendor.max_guests && (
                <div><p className="text-muted text-xs mb-1">👥 Capienza massima</p>
                  <p className="text-cream text-sm">{vendor.max_guests} ospiti</p></div>
              )}
              {vendor.work_regions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {vendor.work_regions.map((r: string, i: number) => (
                    <span key={i} className="bg-[rgba(74,122,184,0.1)] border border-[rgba(74,122,184,0.3)] text-[#4A7AB8] text-xs rounded-full px-3 py-1">+{r}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Social */}
            {socialLinks.length > 0 && (
              <div className="bg-dark border border-border rounded-2xl p-6 space-y-3">
                <h3 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.contacts}</h3>
                {socialLinks.map((s: any, i: number) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted hover:text-cream transition-colors text-sm">
                    <span>{s.icon}</span><span className="truncate">{s.handle}</span>
                  </a>
                ))}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 text-muted hover:text-cream transition-colors text-sm">
                    <span>📞</span><span>{vendor.phone}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/fornitori" className="text-gold text-sm hover:opacity-70 transition-opacity">{tr.vendorDetail.backToList}</Link>
        </div>
      </div>
    </main>
  )
}
