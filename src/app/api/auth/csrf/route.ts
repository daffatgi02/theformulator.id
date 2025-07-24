// File: src/app/api/auth/csrf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const csrfToken = randomBytes(32).toString('hex')
    
    return NextResponse.json({
      csrfToken
    })
  } catch (error) {
    console.error('CSRF error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}