import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { supabase } from '../../../lib/supabase'
import { getT } from '../../../lib/translations'
import SimpleNav from '../../../components/SimpleNav'
import PhotoLightbox from '../../../components/PhotoLightbox'
import PublicFooter from '../../../components/PublicFooter'

async function getVendor(id: string) {
  const { data } = await supabase.from('public_vendors').select('*').eq('id', id).single()
  return data
}

function getDetailCopy(locale: string) {
  return locale === 'en'
    ? {
        heroEyebrow: 'Curated wedding profile',
        trustLabelVerified: 'Partner VELO',
        trustLabelDirect: 'Direct contact',
        trustTitleVerified: 'Curated by the VELO team',
        trustTitleDirect: 'Visible on VELO, handled directly',
        verifiedDesc: 'Verified VAT number. Active on VELO chat. Profile reviewed by the VELO team.',
        directContactDesc: 'This vendor is visible on VELO, but is not yet active in VELO chat. Reach them directly through their own channels.',
        factsTitle: 'Profile notes',
        factsIntro: 'A quick read on fit, coverage, and practical details.',
        contactJumpVerified: 'View contacts',
        contactJumpDirect: 'View direct contacts',
        galleryTitle: 'Portfolio',
        storyTitle: 'About this vendor',
        servicesTitle: 'Specialties and fit',
        awardsTitle: 'Recognition',
        coverageTitle: 'Area covered',
        coverageBase: 'Based in',
        coverageExtra: 'Also works across',
        languagesTitle: 'Languages',
        pricingTitle: 'Pricing note',
        capacityTitle: 'Guest capacity',
        experienceTitle: 'Experience',
        planningBadge: 'Plan with clarity',
        planningTitle: 'Open your VELO couple area for the next real step',
        planningDesc: 'Use the web couple area to review your wedding context, manage your budget, and update guest RSVPs. Vendor messaging and saved-vendor actions still happen in the VELO app.',
        planningBtn: 'Open couple area',
        howTitle: 'How VELO works',
        howSteps: [
          'Partner VELO profiles are reviewed by the VELO team before going live.',
          'On web you can review this profile and keep it in context with your wedding plan.',
          'Budget items and guest RSVPs are also manageable in the web couple area.',
        ],
        howDisclaimer: 'Verified profiles go through the VELO review process. Non-verified profiles are shown as direct contacts.',
        openLink: 'Open',
      }
    : {
        heroEyebrow: 'Profilo wedding curato',
        trustLabelVerified: 'Partner VELO',
        trustLabelDirect: 'Contatto diretto',
        trustTitleVerified: 'Curato dal team VELO',
        trustTitleDirect: 'Visibile su VELO, gestito in diretto',
        verifiedDesc: 'P.IVA verificata. Attivo nella chat VELO. Profilo verificato dal team VELO.',
        directContactDesc: 'Questo fornitore è visibile su VELO, ma non è ancora attivo nella chat VELO. Contattalo direttamente tramite i suoi canali.',
        factsTitle: 'Note profilo',
        factsIntro: 'Una lettura rapida di compatibilità, copertura e dettagli pratici.',
        contactJumpVerified: 'Vedi contatti',
        contactJumpDirect: 'Vedi contatti diretti',
        galleryTitle: 'Portfolio',
        storyTitle: 'Il loro racconto',
        servicesTitle: 'Specialità e fit',
        awardsTitle: 'Riconoscimenti',
        coverageTitle: 'Zona coperta',
        coverageBase: 'Base in',
        coverageExtra: 'Lavora anche in',
        languagesTitle: 'Lingue',
        pricingTitle: 'Nota prezzi',
        capacityTitle: 'Capienza ospiti',
        experienceTitle: 'Esperienza',
        planningBadge: 'Planning con chiarezza',
        planningTitle: "Apri l'area coppia VELO per il prossimo passo reale",
        planningDesc: "Usa l'area coppia web per rivedere il contesto del matrimonio, gestire il budget e aggiornare gli RSVP degli ospiti. Messaggi ai fornitori e gestione dei fornitori salvati restano nell'app VELO.",
        planningBtn: 'Apri area coppia',
        howTitle: 'Come funziona VELO',
        howSteps: [
          'I profili Partner VELO vengono controllati dal team VELO prima di andare live.',
          'Sul web puoi rivedere questo profilo e tenerlo nel contesto del tuo matrimonio.',
          "Le voci di budget e gli RSVP degli ospiti si gestiscono anche nell'area coppia web.",
        ],
        howDisclaimer: 'I profili verificati seguono il processo di revisione VELO. Quelli non verificati sono mostrati come contatto diretto.',
        openLink: 'Apri',
      }
}

type ContactLink = {
  label: string
  url: string
  handle: string
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean).map(value => String(value))))
}

function trimText(value: string | null | undefined, max: number) {
  if (!value) return null
  if (value.length <= max) return value
  return `${value.slice(0, max).trimEnd()}...`
}

function formatPriceRange(locale: string, tr: any, from?: string | null, to?: string | null) {
  if (!from) return null
  if (to) return `${tr.vendorDetail.priceFrom} EUR ${from} - EUR ${to}`
  return `${tr.vendorDetail.priceFrom} EUR ${from}`
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string | null
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#b85a2e]/85">{eyebrow}</p>
      <h2 className="mt-3 text-[1.7rem] font-light leading-tight text-bg sm:text-[2rem]">{title}</h2>
      {body && <p className="mt-3 max-w-2xl text-sm leading-7 text-bg/72 sm:text-[0.98rem]">{body}</p>}
    </div>
  )
}

function RailCard({
  eyebrow,
  title,
  body,
  children,
  className = '',
}: {
  eyebrow: string
  title: string
  body?: string | null
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[1.8rem] border border-[#e2d0bb]/80 bg-[#fbf4e5] p-5 backdrop-blur-sm sm:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.26em] text-[#b85a2e]/80">{eyebrow}</p>
      <h3 className="mt-3 text-[1.28rem] font-light leading-snug text-[#1f1812]">{title}</h3>
      {body && <p className="mt-3 text-sm leading-7 text-[#5d4e40]">{body}</p>}
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

function HeroPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#b85a2e]/20 bg-[#b85a2e]/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#8a3e1e] backdrop-blur-sm">
      {label}
    </span>
  )
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e2d0bb]/80 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7e6a]">{label}</span>
      <span className="max-w-[62%] text-right text-sm leading-6 text-[#1f1812]">{value}</span>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const vendor = await getVendor(params.id)
  if (!vendor) return {}
  const categoryClean = vendor.category.replace(/[^\w\s]/g, '').trim()
  const title = `${vendor.name} - ${categoryClean} a ${vendor.location}`
  const description = vendor.description
    ? vendor.description.slice(0, 155)
    : `${vendor.name}: ${categoryClean} per matrimoni a ${vendor.location}, ${vendor.region}. Scopri il profilo su VELO Wedding.`
  return {
    title,
    description,
    alternates: { canonical: `/fornitori/${params.id}` },
    openGraph: {
      title,
      description,
      url: `https://velowedding.it/fornitori/${params.id}`,
      images: vendor.photo1_url ? [{ url: vendor.photo1_url }] : [{ url: '/logo_velo.png' }],
    },
  }
}

export default async function VendorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'it'
  const tr = getT(locale)
  const detailCopy = getDetailCopy(locale)
  const vendor = await getVendor(params.id)
  if (!vendor) notFound()

  const contactLinks = [
    vendor.instagram && {
      label: 'Instagram',
      url: `https://instagram.com/${vendor.instagram.replace('@', '')}`,
      handle: vendor.instagram,
    },
    vendor.facebook && {
      label: 'Facebook',
      url: vendor.facebook.startsWith('http') ? vendor.facebook : `https://facebook.com/${vendor.facebook.replace('@', '')}`,
      handle: vendor.facebook,
    },
    vendor.tiktok && {
      label: 'TikTok',
      url: `https://tiktok.com/@${vendor.tiktok.replace('@', '')}`,
      handle: vendor.tiktok,
    },
    vendor.website && {
      label: locale === 'en' ? 'Website' : 'Sito web',
      url: vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`,
      handle: vendor.website,
    },
    vendor.phone && {
      label: locale === 'en' ? 'Phone' : 'Telefono',
      url: `tel:${vendor.phone}`,
      handle: vendor.phone,
    },
    vendor.whatsapp && {
      label: 'WhatsApp',
      url: `https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, '')}`,
      handle: vendor.whatsapp,
    },
  ].filter(Boolean) as ContactLink[]

  const description = locale === 'en'
    ? (vendor.description_en || vendor.bio_en || vendor.description)
    : vendor.description

  const heroDescription = trimText(description, 220)
  const specialties = (locale === 'en' && vendor.specialties_en?.length)
    ? vendor.specialties_en
    : (vendor.specialties || [])
  const specialtiesCustom = (locale === 'en' && vendor.specialties_custom_en?.length)
    ? vendor.specialties_custom_en.filter(Boolean)
    : (vendor.specialties_custom?.filter(Boolean) || [])
  const allSpecialties = uniqueStrings([...specialties, ...specialtiesCustom])
  const awards = (locale === 'en' && vendor.awards_en?.length)
    ? vendor.awards_en
    : (vendor.awards || [])
  const allAwards = uniqueStrings(awards)
  const photos = [vendor.photo1_url, vendor.photo2_url, vendor.photo3_url].filter(Boolean)
  const coverageRegions = uniqueStrings([vendor.region, ...(vendor.work_regions || [])])
  const locationLabel = [vendor.location, vendor.region].filter(Boolean).join(', ')
  const priceLabel = formatPriceRange(locale, tr, vendor.price_from, vendor.price_to)
  const contactJumpLabel = vendor.verified ? detailCopy.contactJumpVerified : detailCopy.contactJumpDirect
  const trustEyebrow = vendor.verified ? detailCopy.trustLabelVerified : detailCopy.trustLabelDirect
  const trustTitle = vendor.verified ? detailCopy.trustTitleVerified : detailCopy.trustTitleDirect
  const trustBody = vendor.verified ? detailCopy.verifiedDesc : detailCopy.directContactDesc

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.name,
    description: vendor.description ?? undefined,
    image: vendor.photo1_url ?? undefined,
    url: `https://velowedding.it/fornitori/${vendor.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: vendor.location,
      addressCountry: 'IT',
    },
    ...(vendor.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: vendor.rating,
        reviewCount: vendor.review_count || 1,
        bestRating: 5,
      },
    } : {}),
    ...(vendor.instagram ? { sameAs: [`https://instagram.com/${vendor.instagram.replace('@', '')}`] } : {}),
  }

  return (
    <main className="min-h-screen bg-[#f3eadb] text-[#1f1812]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SimpleNav
        locale={locale}
        backHref="/fornitori"
        backLabel={tr.vendorDetail.back}
      />

      <section className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,166,97,0.18),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.25),transparent_24%)]" />

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_360px] lg:items-end">
            <section className="relative overflow-hidden rounded-[2rem] border border-[#e2d0bb] bg-[#fbf4e5] shadow-[0_30px_120px_rgba(49,35,24,0.12)]">
              <div className="relative min-h-[540px] sm:min-h-[620px]">
                {vendor.photo1_url ? (
                  <Image
                    src={vendor.photo1_url}
                    alt={vendor.name}
                    fill
                    priority
                    quality={88}
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full min-h-[540px] items-center justify-center bg-[linear-gradient(135deg,#f5eddc_0%,#e8d8c4_100%)] sm:min-h-[620px]">
                    <span className="text-[6rem] font-light tracking-[0.2em] text-[#1f1812]/18">
                      {vendor.cover_emoji || 'VELO'}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(49,35,24,0.04)_0%,rgba(49,35,24,0.12)_45%,rgba(49,35,24,0.28)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(201,166,97,0.22),transparent_22%)]" />

                {vendor.logo_url && (
                  <div className="absolute right-5 top-5 z-10 h-16 w-16 overflow-hidden rounded-[1.15rem] border border-[#e2d0bb]/16 bg-[#fbf4e5]/18 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20 sm:rounded-[1.4rem]">
                    <img src={vendor.logo_url} alt={`${vendor.name} logo`} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="relative z-10 flex min-h-[540px] flex-col justify-end p-5 sm:min-h-[620px] sm:p-8 lg:p-10">
                  <div className="max-w-3xl rounded-[2rem] border border-[#e2d0bb]/80 bg-[rgba(251,244,229,0.88)] p-5 shadow-[0_18px_60px_rgba(49,35,24,0.16)] backdrop-blur-md sm:p-7">
                    <div className="mb-4 flex flex-wrap gap-2.5">
                      <HeroPill label={detailCopy.heroEyebrow} />
                      <HeroPill label={trustEyebrow} />
                      {vendor.category && <HeroPill label={vendor.category} />}
                    </div>

                    <h1 className="max-w-3xl text-[2.45rem] font-light leading-[0.96] tracking-[-0.03em] text-[#1f1812] sm:text-[3.6rem] lg:text-[4.25rem]">
                      {vendor.name}
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-[#1f1812]/74 sm:text-[1.02rem]">
                      {locationLabel}
                      {coverageRegions.length > 1 ? ` - ${detailCopy.coverageExtra} ${coverageRegions.slice(1).join(', ')}` : ''}
                    </p>

                    {heroDescription && (
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1f1812]/78 sm:text-[1rem]">
                      {heroDescription}
                    </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {(vendor.review_count ?? 0) > 0 && vendor.rating && (
                        <HeroPill label={`${vendor.rating} / 5 - ${vendor.review_count} ${tr.vendorDetail.reviews}`} />
                      )}
                      {priceLabel && <HeroPill label={priceLabel} />}
                      {vendor.years_experience && <HeroPill label={`${vendor.years_experience} ${tr.vendorDetail.years}`} />}
                      {vendor.max_guests && <HeroPill label={`${vendor.max_guests} ${tr.vendorDetail.guests}`} />}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href="/couple"
                        className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-5 py-3 text-sm font-medium text-[#fbf4e5] transition-all hover:-translate-y-0.5 hover:bg-[#a54d25]"
                      >
                        {detailCopy.planningBtn}
                      </Link>
                      {contactLinks.length > 0 && (
                        <a
                          href="#contacts"
                          className="inline-flex items-center justify-center rounded-full border border-[#b85a2e]/22 bg-[#fffaf4]/70 px-5 py-3 text-sm text-[#5d4e40] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#b85a2e]/45 hover:text-[#8a3e1e]"
                        >
                          {contactJumpLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-4 lg:pb-3">
              <RailCard
                eyebrow={trustEyebrow}
                title={trustTitle}
                body={trustBody}
                className={vendor.verified ? 'border-[#b85a2e]/22 bg-[linear-gradient(180deg,rgba(251,244,229,0.96)_0%,rgba(239,225,205,0.92)_100%)]' : 'border-[#e2d0bb]/80 bg-[linear-gradient(180deg,rgba(251,244,232,0.96)_0%,rgba(239,225,205,0.9)_100%)]'}
              >
                <div className="flex flex-wrap gap-2">
                  {vendor.verified && <HeroPill label={detailCopy.trustLabelVerified} />}
                  {!vendor.verified && <HeroPill label={detailCopy.trustLabelDirect} />}
                  {vendor.languages?.length > 0 && <HeroPill label={`${detailCopy.languagesTitle}: ${vendor.languages.join(', ')}`} />}
                </div>
              </RailCard>

              <RailCard eyebrow={detailCopy.factsTitle} title={locationLabel} body={detailCopy.factsIntro}>
                <div>
                  <FactRow label={detailCopy.coverageTitle} value={coverageRegions.join(', ')} />
                  {priceLabel && <FactRow label={detailCopy.pricingTitle} value={priceLabel} />}
                  {vendor.years_experience && <FactRow label={detailCopy.experienceTitle} value={`${vendor.years_experience} ${tr.vendorDetail.years}`} />}
                  {vendor.max_guests && <FactRow label={detailCopy.capacityTitle} value={`${vendor.max_guests} ${tr.vendorDetail.guests}`} />}
                </div>
              </RailCard>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_360px] lg:items-start">
          <div className="space-y-8">
            {photos.length > 0 && (
              <section className="rounded-[2rem] border border-border/80 bg-[linear-gradient(180deg,#f8efe2_0%,#f3e6d5_100%)] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.16)] sm:p-5">
                <SectionIntro
                  eyebrow={detailCopy.galleryTitle}
                  title={vendor.name}
                  body={locale === 'en' ? 'A more visual read of the profile before you decide how to proceed.' : 'Una lettura più visiva del profilo prima di decidere come procedere.'}
                />
                <PhotoLightbox photos={photos} vendorName={vendor.name} locale={locale} />
              </section>
            )}

            <section className="rounded-[2rem] border border-border/75 bg-[linear-gradient(180deg,#fbf4e8_0%,#f4e6d5_100%)] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.14)] sm:p-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(250px,0.92fr)]">
                <div>
                  <SectionIntro
                    eyebrow={tr.vendorDetail.about}
                    title={detailCopy.storyTitle}
                    body={description || (locale === 'en' ? 'No public story is available yet for this vendor.' : 'Questo fornitore non ha ancora un racconto pubblico disponibile.')}
                  />
                </div>

                <div className="space-y-7">
                  {allSpecialties.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--velo-terracotta)]">{detailCopy.servicesTitle}</p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {allSpecialties.map((specialty, index) => (
                          <span
                            key={`${specialty}-${index}`}
                            className="rounded-full border border-[rgba(44,34,25,0.14)] bg-white/55 px-4 py-2 text-sm text-bg/78"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-[1.4rem] border border-[#e2d0bb]/12 bg-[#fbf4e5]/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#b85a2e]">{detailCopy.coverageTitle}</p>
                        <p className="mt-3 text-sm leading-7 text-[#1f1812]/76">
                          {detailCopy.coverageBase} {locationLabel}
                          {coverageRegions.length > 1 ? `. ${detailCopy.coverageExtra} ${coverageRegions.slice(1).join(', ')}.` : '.'}
                        </p>
                      </div>

                    {vendor.languages?.length > 0 && (
                      <div className="rounded-[1.4rem] border border-[#e2d0bb]/12 bg-[#fbf4e5]/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#b85a2e]">{detailCopy.languagesTitle}</p>
                        <p className="mt-3 text-sm leading-7 text-[#1f1812]/76">{vendor.languages.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {allAwards.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--velo-terracotta)]">{detailCopy.awardsTitle}</p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {allAwards.map((award, index) => (
                          <span
                            key={`${award}-${index}`}
                            className="rounded-full border border-[#b85a2e]/28 bg-[#b85a2e]/10 px-4 py-2 text-sm text-[#8a3e1e]"
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {contactLinks.length > 0 && (
              <RailCard
                eyebrow={vendor.verified ? detailCopy.trustLabelVerified : detailCopy.trustLabelDirect}
                title={vendor.verified ? tr.vendorDetail.contacts : detailCopy.contactJumpDirect}
                body={vendor.verified ? detailCopy.verifiedDesc : detailCopy.directContactDesc}
                className="border-[#b85a2e]/18"
              >
                <div id="contacts" className="space-y-2.5">
                  {contactLinks.map((contact, index) => (
                    <a
                      key={`${contact.label}-${index}`}
                      href={contact.url}
                      target={contact.url.startsWith('http') ? '_blank' : undefined}
                      rel={contact.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-[#e2d0bb]/70 bg-[#fffaf4]/62 px-4 py-3 text-sm transition-colors hover:border-[#b85a2e]/30 hover:bg-[#fffaf4]/85"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7e6a]">{contact.label}</p>
                        <p className="mt-1 truncate text-[#1f1812]">{contact.handle}</p>
                      </div>
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-[#b85a2e]/88">{detailCopy.openLink}</span>
                    </a>
                  ))}
                </div>
              </RailCard>
            )}

            <RailCard
              eyebrow={detailCopy.planningBadge}
              title={detailCopy.planningTitle}
              body={detailCopy.planningDesc}
              className="border-[#b85a2e]/25 bg-[linear-gradient(180deg,rgba(251,244,229,0.96)_0%,rgba(239,225,205,0.92)_100%)]"
            >
              <Link
                href="/couple"
                className="inline-flex items-center justify-center rounded-full bg-[#b85a2e] px-5 py-3 text-sm font-medium text-[#fbf4e5] transition-colors hover:bg-[#a54d25]"
              >
                {detailCopy.planningBtn}
              </Link>
            </RailCard>

              <RailCard eyebrow="VELO" title={detailCopy.howTitle} body={detailCopy.howDisclaimer} className="border-[#e2d0bb]/12 bg-[#fbf4e5]" >
              <div className="space-y-3">
                {detailCopy.howSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b85a2e]/20 bg-[#b85a2e]/10 text-[11px] text-[#8a3e1e]">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-[#5d4e40]">{step}</p>
                  </div>
                ))}
              </div>
            </RailCard>
          </aside>
        </div>

        <div className="mt-14 border-t border-[#e2d0bb]/70 pt-8">
          <Link href="/fornitori" className="text-sm text-[#b85a2e] transition-opacity hover:opacity-70">
            {tr.vendorDetail.backToList}
          </Link>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}
