// File: src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      const userRole = token.role as string
      if (!['ADMIN', 'EDITOR', 'SEO'].includes(userRole)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow all public routes
        if (!req.nextUrl.pathname.startsWith('/admin')) {
          return true
        }
        // Require token for admin routes
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}