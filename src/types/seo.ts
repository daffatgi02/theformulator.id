// File: src/types/seo.ts
export interface SeoMetadata {
  title?: string
  description?: string
  canonical?: string
  robots?: string
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
}

export interface SeoSettings {
  id: string
  siteName: string
  siteDescription: string
  siteKeywords?: string | null
  defaultImage?: string | null
  favicon?: string | null
  googleAnalyticsId?: string | null
  googleSearchConsole?: string | null
  ogImage?: string | null
  twitterHandle?: string | null
  updatedAt: Date
}