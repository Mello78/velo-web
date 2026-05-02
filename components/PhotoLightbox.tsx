'use client'
import { useMemo, useState } from 'react'

type Props = {
  photos: string[]
  vendorName: string
  locale?: string
}

export default function PhotoLightbox({ photos, vendorName, locale = 'it' }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const safePhotos = useMemo(() => photos?.filter(Boolean) || [], [photos])
  const gallery = useMemo(() => safePhotos.slice(0, 3), [safePhotos])

  const activePhoto = activeIndex == null || !safePhotos.length ? null : safePhotos[activeIndex]
  const activePosition = activeIndex == null ? 0 : activeIndex + 1

  const openAt = (index: number) => setActiveIndex(index)
  const close = () => setActiveIndex(null)

  if (!safePhotos.length) return null

  return (
    <>
      <div className="grid gap-3 md:grid-cols-12 md:grid-rows-2">
        {gallery.map((url, index) => {
          const primary = index === 0
          return (
            <button
              key={url}
              type="button"
              onClick={() => openAt(index)}
              className={[
                'group relative overflow-hidden rounded-[1.5rem] border border-white/40 bg-[#e8d8c4] text-left shadow-[0_18px_40px_rgba(22,17,12,0.12)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#b85a2e]',
                primary ? 'aspect-[4/5] md:col-span-7 md:row-span-2 md:aspect-auto' : 'aspect-[4/3] md:col-span-5',
              ].join(' ')}
            >
              <img
                src={url}
                alt={`${vendorName} ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.05)_0%,rgba(27,21,17,0.48)_100%)] transition-colors group-hover:bg-[linear-gradient(180deg,rgba(27,21,17,0.12)_0%,rgba(27,21,17,0.62)_100%)]" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#f8efe2]/72">
                    {primary
                      ? (locale === 'en' ? 'Cover' : 'Copertina')
                      : (locale === 'en' ? 'Portfolio' : 'Portfolio')}
                  </p>
                  <p className="mt-2 text-sm text-[#fbf4e8]">{vendorName}</p>
                </div>
                  <span className="rounded-full border border-white/18 bg-black/18 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#fbf4e8] backdrop-blur-sm">
                    {locale === 'en' ? 'Open' : 'Apri'}
                  </span>
              </div>
            </button>
          )
        })}
      </div>

      {safePhotos.length > gallery.length && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => openAt(gallery.length)}
            className="rounded-full border border-[rgba(44,34,25,0.14)] bg-white/55 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#2c2219] transition-colors hover:border-[rgba(184,90,46,0.28)] hover:text-[#9f4a23]"
          >
            {locale === 'en' ? 'View more' : 'Vedi tutto'}
          </button>
        </div>
      )}

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'en' ? `Photo ${activePosition} of ${safePhotos.length} for ${vendorName}` : `Foto ${activePosition} di ${safePhotos.length} per ${vendorName}`}
          className="fixed inset-0 z-50 bg-[rgba(18,14,11,0.92)] px-4 py-6 backdrop-blur-sm"
          onClick={close}
          onKeyDown={e => e.key === 'Escape' && close()}
          tabIndex={-1}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#e6c784]">
                  {locale === 'en' ? 'Portfolio' : 'Portfolio'}
                </p>
                <p className="mt-2 text-sm text-[#fbf4e8]">
                  {vendorName} - {activePosition} / {safePhotos.length}
                </p>
              </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-[#fbf4e8]/30 bg-[#fbf4e8] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#1f1812] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-colors hover:bg-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#e6c784]"
                  aria-label={locale === 'en' ? 'Close lightbox' : 'Chiudi lightbox'}
                >
                  {locale === 'en' ? 'Close' : 'Chiudi'}
                </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[1.8rem] border border-white/12 bg-[rgba(0,0,0,0.28)]">
              {safePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setActiveIndex(current => (current == null ? 0 : (current - 1 + safePhotos.length) % safePhotos.length))
                    }}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#fbf4e8]/30 bg-[#fbf4e8]/92 px-4 py-3 text-sm font-medium text-[#1f1812] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-colors hover:bg-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#e6c784]"
                    aria-label={locale === 'en' ? 'Previous photo' : 'Foto precedente'}
                  >
                    {locale === 'en' ? 'Prev' : 'Prec'}
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setActiveIndex(current => (current == null ? 0 : (current + 1) % safePhotos.length))
                    }}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#fbf4e8]/30 bg-[#fbf4e8]/92 px-4 py-3 text-sm font-medium text-[#1f1812] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-colors hover:bg-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#e6c784]"
                    aria-label={locale === 'en' ? 'Next photo' : 'Foto successiva'}
                  >
                    {locale === 'en' ? 'Next' : 'Succ'}
                  </button>
                </>
              )}

              <img
                src={activePhoto}
                alt={vendorName}
                className="h-full w-full object-contain"
                onClick={e => e.stopPropagation()}
              />
            </div>

            {safePhotos.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {safePhotos.map((photo, index) => (
                  <button
                    key={photo}
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setActiveIndex(index)
                    }}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${photo === activePhoto ? 'bg-[#e6c784]' : 'bg-white/28 hover:bg-white/48'}`}
                    aria-label={locale === 'en' ? `Photo ${index + 1}` : `Foto ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
