import type { Locale } from './translations'

interface CoupleLanguageContext {
  nationality?: string | null
  country_of_origin?: string | null
}

export function getPreferredSiteLocale(): Locale {
  if (typeof document === 'undefined') return 'en'

  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
  if (match?.[1] === 'it') return 'it'
  if (match?.[1] === 'en') return 'en'

  return navigator.language.startsWith('en') ? 'en' : 'it'
}

export function getCoupleLocale(
  context: CoupleLanguageContext | null | undefined,
  fallbackLocale: Locale,
): Locale {
  const nationality = context?.nationality?.toLowerCase().trim() ?? null
  const countryCode = context?.country_of_origin?.toUpperCase().trim() ?? null

  if (nationality === 'foreign') return 'en'
  if (nationality === 'italian') return 'it'
  if (countryCode && countryCode !== 'IT') return 'en'
  if (countryCode === 'IT') return 'it'

  return fallbackLocale
}

export function persistCoupleLocale(locale: Locale) {
  if (typeof document === 'undefined') return
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
}
