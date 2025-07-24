// File: src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl

    // Skip middleware for test routes and public API routes
    if (
      pathname.startsWith('/api/test-') ||
      pathname.startsWith('/api/auth/') ||
      pathname === '/api/auth/providers' ||
      pathname === '/api/auth/session' ||
      pathname === '/api/auth/csrf'
    ) {
      return NextResponse.next()
    }

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      const token = req.nextauth.token
      
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Check if user has admin access
      if (!['ADMIN', 'EDITOR', 'SEO'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // API routes protection (except auth and test routes)
    if (pathname.startsWith('/api/') && 
        !pathname.startsWith('/api/auth/') && 
        !pathname.startsWith('/api/test-')) {
      
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
      authorized: ({ token, req }) => {
        // Allow access to test routes without authentication
        if (req.nextUrl.pathname.startsWith('/api/test-')) {
          return true
        }
        
        // For other protected routes, require token
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    // Include admin routes
    '/admin/:path*',
    // Include API routes but exclude auth and test routes
    '/api/((?!auth|test-).)*',
    // Specifically include protected API routes
    '/api/articles/:path*',
    '/api/projects/:path*',
    '/api/youtube/:path*',
    '/api/company/:path*',
    '/api/seo/:path*',
    '/api/users/:path*',
    '/api/media/:path*'
  ]
}