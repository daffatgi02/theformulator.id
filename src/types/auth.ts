// File: src/types/auth.ts
import { UserRole } from '@prisma/client'

export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
  emailVerified?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
}

declare module 'next-auth' {
  interface Session {
    user: AuthUser
  }
  
  interface User extends AuthUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}