// File: src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Admin routes protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token
      
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Check if user has admin access
      if (!['ADMIN', 'EDITOR', 'SEO'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // API routes protection
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Skip auth routes
      if (req.nextUrl.pathname.startsWith('/api/auth/')) {
        return NextResponse.next()
      }

      const token = req.nextauth.token
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/articles/:path*',
    '/api/projects/:path*',
    '/api/youtube/:path*',
    '/api/company/:path*',
    '/api/seo/:path*',
    '/api/users/:path*',
    '/api/media/:path*'
  ]
}