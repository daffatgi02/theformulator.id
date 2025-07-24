// File: src/app/api/youtube/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/youtube/[id] - Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.youTubeContent.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: video
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

// PUT /api/youtube/[id] - Update video
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
    const { title, url, description, tags, status } = body

    // Check if video exists
    const existingVideo = await prisma.youTubeContent.findUnique({
      where: { id: params.id }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    let videoId = existingVideo.videoId
    let thumbnail = existingVideo.thumbnail

    // If URL changed, extract new video ID
    if (url !== existingVideo.url) {
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const newVideoId = videoIdMatch ? videoIdMatch[1] : null

      if (!newVideoId) {
        return NextResponse.json(
          { success: false, error: 'Invalid YouTube URL' },
          { status: 400 }
        )
      }

      videoId = newVideoId
      thumbnail = `https://img.youtube.com/vi/${newVideoId}/maxresdefault.jpg`
    }

    const video = await prisma.youTubeContent.update({
      where: { id: params.id },
      data: {
        title,
        videoId,
        url,
        thumbnail,
        description,
        tags: tags ? JSON.stringify(tags) : null,
        status,
        publishedAt: status === 'PUBLISHED' && !existingVideo.publishedAt 
          ? new Date() 
          : existingVideo.publishedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    })

  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

// DELETE /api/youtube/[id] - Delete video
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

    const video = await prisma.youTubeContent.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      )
    }

    await prisma.youTubeContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}