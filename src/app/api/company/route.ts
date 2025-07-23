// File: src/app/api/company/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/company
export async function GET() {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: { id: 'company_profile' }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company
    })
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company profile' },
      { status: 500 }
    )
  }
}

// PUT /api/company
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const company = await prisma.companyProfile.upsert({
      where: { id: 'company_profile' },
      update: {
        ...body,
        socialMedia: body.socialMedia ? JSON.stringify(body.socialMedia) : null
      },
      create: {
        id: 'company_profile',
        ...body,
        socialMedia: body.socialMedia ? JSON.stringify(body.socialMedia) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Company profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update company profile' },
      { status: 500 }
    )
  }
}