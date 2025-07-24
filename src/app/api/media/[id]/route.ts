// File: src/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

// GET /api/media/[id] - Get single media
export async function GET(
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

    const media = await prisma.media.findUnique({
      where: { id: params.id }
    })

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: media
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// PUT /api/media/[id] - Update media metadata
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
    const { altText, caption } = body

    const media = await prisma.media.update({
      where: { id: params.id },
      data: {
        altText,
        caption
      }
    })

    return NextResponse.json({
      success: true,
      data: media,
      message: 'Media updated successfully'
    })

  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete media
export async function DELETE(
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

    const media = await prisma.media.findUnique({
      where: { id: params.id }
    })

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', media.url)
      await unlink(filepath)
    } catch (fileError) {
      console.warn('File not found on filesystem:', media.url)
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}