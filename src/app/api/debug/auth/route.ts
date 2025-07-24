// File: src/app/api/debug/auth/route.ts
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
      console.log('❌ User not found for email:', email)
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: { email, userExists: false }
      }, { status: 404 })
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    })

    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔑 Password comparison result:', isValidPassword)

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
        },
        debug: {
          providedEmail: email,
          providedPasswordLength: password.length,
          storedPasswordLength: user.password.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Auth test error:', error)
    let errorMessage = 'Unknown error';
    let errorStack = undefined;
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    }
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    )
  }
}