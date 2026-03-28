import type { MetadataRoute } from 'next'
import { supabase } from '../lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://velowedding.it'

  // Pagine statiche
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/fornitori`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Pagine dinamiche vendor
  const { data: vendors } = await supabase
    .from('public_vendors')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  const vendorRoutes: MetadataRoute.Sitemap = (vendors ?? []).map((v: any) => ({
    url: `${base}/fornitori/${v.id}`,
    lastModified: new Date(v.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...vendorRoutes]
}
