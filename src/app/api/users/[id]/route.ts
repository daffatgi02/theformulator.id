// File: src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            projects: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, name, role, password } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: params.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      name,
      role
    }

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'UPDATE',
        entity: 'User',
        entityId: params.id,
        oldData: JSON.stringify(existingUser),
        newData: JSON.stringify(user)
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prevent deleting self
    if (params.id === (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has content
    const userContent = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            articles: true,
            projects: true
          }
        }
      }
    })

    if (userContent && (userContent._count.articles > 0 || userContent._count.projects > 0)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete user with existing content' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'DELETE',
        entity: 'User',
        entityId: params.id,
        oldData: JSON.stringify(user)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}