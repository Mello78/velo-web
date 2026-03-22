import Link from 'next/link'
import { cookies } from 'next/headers'
import { supabase } from '../../../lib/supabase'
import { getT } from '../../../lib/translations'
import SimpleNav from '../../../components/SimpleNav'
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main col */}
          <div className="md:col-span-2 space-y-10">
            {/* Portfolio */}
            {(vendor.photo1_url || vendor.photo2_url || vendor.photo3_url) && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-5">{tr.vendorDetail.portfolio}</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[vendor.photo1_url, vendor.photo2_url, vendor.photo3_url].filter(Boolean).map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img src={url} alt={`${vendor.name} ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* About */}
            {vendor.description && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.about}</h2>
                <p className="text-muted leading-relaxed text-base">{vendor.description}</p>
              </section>
            )}

            {/* Specialties */}
            {vendor.specialties?.length > 0 && (
              <section>
                <h2 className="text-xs text-gold tracking-[0.3em] uppercase mb-4">{tr.vendorDetail.specialties}</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.specialties.map((s: string, i: number) => (
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
