'use client'
import { useState } from 'react'

type Props = {
  photos: string[]
  vendorName: string
}

export default function PhotoLightbox({ photos, vendorName }: Props) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setActive(url)}
            className="aspect-square rounded-xl overflow-hidden group relative focus:outline-none"
          >
            <img
              src={url}
              alt={`${vendorName} ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🔍</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl leading-none"
          >
            ✕
          </button>
          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); const idx = photos.indexOf(active); setActive(photos[(idx - 1 + photos.length) % photos.length]) }}
                className="absolute left-4 text-white/70 hover:text-white text-4xl px-4 py-2"
              >
                ‹
              </button>
              <button
                onClick={e => { e.stopPropagation(); const idx = photos.indexOf(active); setActive(photos[(idx + 1) % photos.length]) }}
                className="absolute right-4 text-white/70 hover:text-white text-4xl px-4 py-2"
              >
                ›
              </button>
            </>
          )}
          <img
            src={active}
            alt={vendorName}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {/* Dots */}
          {photos.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(p) }}
                  className={`w-2 h-2 rounded-full transition-colors ${p === active ? 'bg-gold' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
