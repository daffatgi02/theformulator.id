// File: src/app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentStatus } from '@prisma/client'

// GET /api/articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true, slug: true, color: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: article
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      tagIds,
      metaTitle,
      metaDescription,
      canonicalUrl,
      robotsMeta
    } = body

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: params.id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug
    if (title !== existingArticle.title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug exists
      const slugExists = await prisma.article.findFirst({
        where: {
          slug: newSlug,
          id: { not: params.id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        )
      }

      slug = newSlug
    }

    // Update article
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        publishedAt: status === ContentStatus.PUBLISHED && !existingArticle.publishedAt 
          ? new Date() 
          : existingArticle.publishedAt,
        metaTitle,
        metaDescription,
        canonicalUrl,
        robotsMeta,
        categoryId,
        tags: {
          deleteMany: {},
          create: tagIds ? tagIds.map((tagId: string) => ({
            tagId
          })) : []
        }
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        category: {
          select: { name: true, slug: true, color: true }
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true }
            }
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE',
        entity: 'Article',
        entityId: params.id,
        oldData: JSON.stringify(existingArticle),
        newData: JSON.stringify(article)
      }
    })

    return NextResponse.json({
      success: true,
      data: article,
      message: 'Article updated successfully'
    })

  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    await prisma.article.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DELETE',
        entity: 'Article',
        entityId: params.id,
        oldData: JSON.stringify(article)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}