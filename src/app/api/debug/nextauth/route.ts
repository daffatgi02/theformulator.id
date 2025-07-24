// File: src/app/api/debug/nextauth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        providers: authOptions.providers.map(p => ({ 
          id: p.id, 
          name: p.name, 
          type: p.type 
        })),
        sessionStrategy: authOptions.session?.strategy,
        pages: authOptions.pages,
        callbacks: {
          hasJWT: !!authOptions.callbacks?.jwt,
          hasSession: !!authOptions.callbacks?.session
        }
      }
    })
  } catch (error) {
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}