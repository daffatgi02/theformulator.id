// File: src/app/api/test-auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Testing auth with:', { email, password: '***' })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    console.log('🔑 Password valid:', isValidPassword)

    return NextResponse.json({
      success: true,
      data: {
        userExists: true,
        passwordValid: isValidPassword,
        userInfo: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Auth test error:', error)
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}