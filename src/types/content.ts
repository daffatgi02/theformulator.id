// File: src/types/content.ts
import { ContentStatus, UserRole } from '@prisma/client'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  featuredImage?: string | null
  status: ContentStatus
  publishedAt?: Date | null
  viewCount: number
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  robotsMeta?: string | null
  authorId: string
  author: {
    name?: string | null
    email: string
  }
  categoryId?: string | null
  category?: {
    name: string
    slug: string
    color?: string | null
  } | null
  tags: {
    tag: {
      name: string
      slug: string
    }
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string | null
  featuredImage?: string | null
  gallery?: string | null
  status: ContentStatus
  publishedAt?: Date | null
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  authorId: string
  author: {
    name?: string | null
    email: string
  }
  categoryId?: string | null
  category?: {
    name: string
    slug: string
    color?: string | null
  } | null
  createdAt: Date
  updatedAt: Date
}

export interface YouTubeContent {
  id: string
  title: string
  videoId: string
  url: string
  thumbnail?: string | null
  description?: string | null
  tags?: string | null
  status: ContentStatus
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}