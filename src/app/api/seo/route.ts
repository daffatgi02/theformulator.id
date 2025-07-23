// File: src/app/api/seo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/seo
export async function GET() {
  try {
    const seoSettings = await prisma.seoSetting.findUnique({
      where: { id: 'global_seo' }
    })

    if (!seoSettings) {
      return NextResponse.json(
        { success: false, error: 'SEO settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: seoSettings
    })
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

// PUT /api/seo
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SEO'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const seoSettings = await prisma.seoSetting.upsert({
      where: { id: 'global_seo' },
      update: body,
      create: {
        id: 'global_seo',
        ...body
      }
    })

    return NextResponse.json({
      success: true,
      data: seoSettings,
      message: 'SEO settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}