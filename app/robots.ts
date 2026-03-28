import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/fornitori', '/fornitori/'],
        disallow: ['/admin/', '/vendor/'],
      },
    ],
    sitemap: 'https://velowedding.it/sitemap.xml',
    host: 'https://velowedding.it',
  }
}
