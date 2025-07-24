// File: src/app/api/debug/db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('👥 User count:', userCount)
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@theformulator.id' }
    })
    console.log('👤 Admin user found:', !!adminUser)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        userCount,
        adminExists: !!adminUser,
        adminUser: adminUser ? {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          hasPassword: !!adminUser.password
        } : null
      }
    })
  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}