// File: src/hooks/use-auth.ts
'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

export function useAuth() {
  const { data: session, status } = useSession()

  const isAuthenticated = !!session?.user
  const isLoading = status === 'loading'
  const user = session?.user

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    
    const userRole = (user as any).role as UserRole
    
    if (Array.isArray(role)) {
      return role.includes(userRole)
    }
    
    return userRole === role
  }

  const isAdmin = () => hasRole('ADMIN')
  const isEditor = () => hasRole(['ADMIN', 'EDITOR'])
  const isSEO = () => hasRole(['ADMIN', 'SEO'])

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    isAdmin,
    isEditor,
    isSEO
  }
}