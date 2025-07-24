// File: src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get content counts
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalProjects,
      publishedProjects,
      totalVideos,
      totalUsers,
      totalViews
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.youTubeContent.count(),
      prisma.user.count(),
      prisma.article.aggregate({
        _sum: { viewCount: true }
      })
    ])

    // Get recent articles
    const recentArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        viewCount: true,
        author: {
          select: { name: true }
        }
      }
    })

    // Get popular articles
    const popularArticles = await prisma.article.findMany({
      take: 5,
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        viewCount: true,
        slug: true
      }
    })

    // Get content by status
    const contentByStatus = await prisma.article.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    // Get articles by category
    const articlesByCategory = await prisma.category.findMany({
      select: {
        name: true,
        color: true,
        _count: {
          select: { articles: true }
        }
      },
      orderBy: {
        articles: { _count: 'desc' }
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalProjects,
          publishedProjects,
          totalVideos,
          totalUsers,
          totalViews: totalViews._sum.viewCount || 0
        },
        recentArticles,
        popularArticles,
        contentByStatus,
        articlesByCategory
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}