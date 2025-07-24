// File: src/lib/db/index.ts
import { prisma } from '@/lib/prisma'

export async function createSlug(title: string, table: 'article' | 'project') {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await (table === 'article' 
      ? prisma.article.findUnique({ where: { slug } })
      : prisma.project.findUnique({ where: { slug } })
    )

    if (!existing) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export async function incrementViewCount(articleId: string) {
  return await prisma.article.update({
    where: { id: articleId },
    data: {
      viewCount: {
        increment: 1
      }
    }
  })
}