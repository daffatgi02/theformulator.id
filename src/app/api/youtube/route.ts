// File: src/app/api/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContentStatus } from '@prisma/client'

// GET /api/youtube
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as ContentStatus | null

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status

    const [videos, total] = await Promise.all([
      prisma.youTubeContent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.youTubeContent.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching YouTube content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch YouTube content' },
      { status: 500 }
    )
  }
}

// POST /api/youtube
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, url, description, tags, status } = body

    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Generate thumbnail URL
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    const video = await prisma.youTubeContent.create({
      data: {
        title,
        videoId,
        url,
        thumbnail,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        status: status || ContentStatus.PUBLISHED,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: video,
      message: 'YouTube content created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating YouTube content:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create YouTube content' },
      { status: 500 }
    )
  }
}