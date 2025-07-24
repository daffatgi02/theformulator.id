// File: src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/search - Global search across content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          articles: [],
          projects: [],
          videos: [],
          total: 0
        }
      })
    }

    const results: any = {
      articles: [],
      projects: [],
      videos: [],
      total: 0
    }

    // Search articles
    if (type === 'all' || type === 'articles') {
      results.articles = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { excerpt: { contains: query } }
          ]
        },
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, color: true } }
        },
        take: limit,
        orderBy: { updatedAt: 'desc' }
      })
    }

    // Search projects
    if (type === 'all' || type === 'projects') {
      results.projects = await prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { shortDescription: { contains: query } }
          ]
        },
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, color: true } }
        },
        take: limit,
        orderBy: { updatedAt: 'desc' }
      })
    }

    // Search YouTube content
    if (type === 'all' || type === 'videos') {
      results.videos = await prisma.youTubeContent.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: limit,
        orderBy: { updatedAt: 'desc' }
      })
    }

    results.total = results.articles.length + results.projects.length + results.videos.length

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}