// File: src/app/api/dashboard/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/analytics - Get detailed analytics
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
    const period = searchParams.get('period') || '30' // days

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get content creation trends
    const contentTrends = await prisma.article.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: { status: true }
    })

    // Get most viewed articles
    const topArticles = await prisma.article.findMany({
      take: 10,
      where: { 
        status: 'PUBLISHED',
        publishedAt: {
          gte: startDate
        }
      },
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        publishedAt: true,
        category: {
          select: { name: true, color: true }
        }
      }
    })

    // Get content by category
    const categoryStats = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
                publishedAt: {
                  gte: startDate
                }
              }
            },
            projects: {
              where: {
                status: 'PUBLISHED',
                publishedAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        articles: { _count: 'desc' }
      }
    })

    // Get user activity
    const userActivity = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            articles: {
              where: {
                createdAt: {
                  gte: startDate
                }
              }
            },
            projects: {
              where: {
                createdAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        articles: { _count: 'desc' }
      }
    })

    // Get recent audit activity
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        period: periodDays,
        contentTrends,
        topArticles,
        categoryStats,
        userActivity,
        recentActivity
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}