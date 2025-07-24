// File: src/lib/seo/index.ts
import { SeoMetadata } from '@/types/seo'

export function generateSEOMetadata(data: {
  title?: string
  description?: string
  canonical?: string
  image?: string
  type?: string
}): SeoMetadata {
  return {
    title: data.title,
    description: data.description,
    canonical: data.canonical,
    robots: 'index,follow',
    openGraph: {
      title: data.title,
      description: data.description,
      image: data.image,
      type: data.type || 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      image: data.image
    }
  }
}

export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '')
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.substring(0, maxLength).trim() + '...'
}

export function generateSitemap(articles: any[], projects: any[], baseUrl: string): string {
  const urls = [
    { loc: baseUrl, priority: '1.0' },
    { loc: `${baseUrl}/about`, priority: '0.8' },
    { loc: `${baseUrl}/5w1h`, priority: '0.8' },
    { loc: `${baseUrl}/articles`, priority: '0.9' },
    { loc: `${baseUrl}/projects`, priority: '0.9' },
    { loc: `${baseUrl}/videos`, priority: '0.7' },
    ...articles.map(article => ({
      loc: `${baseUrl}/articles/${article.slug}`,
      lastmod: article.updatedAt.toISOString(),
      priority: '0.7'
    })),
    ...projects.map(project => ({
      loc: `${baseUrl}/projects/${project.slug}`,
      lastmod: project.updatedAt.toISOString(),
      priority: '0.6'
    }))
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${'lastmod' in url && url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`
}