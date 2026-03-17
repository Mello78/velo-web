/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
  },
}
module.exports = nextConfig
