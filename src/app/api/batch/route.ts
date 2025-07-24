// File: src/app/api/batch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/batch - Perform batch operations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'EDITOR'].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, entity, ids, data } = body

    let result: any = {}

    switch (action) {
      case 'DELETE':
        if (entity === 'articles') {
          // Get articles before deletion for audit
          const articlesToDelete = await prisma.article.findMany({
            where: { id: { in: ids } }
          })

          await prisma.article.deleteMany({
            where: { id: { in: ids } }
          })

          // Create audit logs
          for (const article of articlesToDelete) {
            await prisma.auditLog.create({
              data: {
                userId: (session.user as any).id,
                action: 'DELETE',
                entity: 'Article',
                entityId: article.id,
                oldData: JSON.stringify(article)
              }
            })
          }

          result = { deleted: ids.length, message: `${ids.length} articles deleted` }
        }
        break

      case 'UPDATE_STATUS':
        if (entity === 'articles') {
          await prisma.article.updateMany({
            where: { id: { in: ids } },
            data: { 
              status: data.status,
              publishedAt: data.status === 'PUBLISHED' ? new Date() : null
            }
          })

          result = { updated: ids.length, message: `${ids.length} articles updated` }
        }
        break

      case 'ASSIGN_CATEGORY':
        if (entity === 'articles') {
          await prisma.article.updateMany({
            where: { id: { in: ids } },
            data: { categoryId: data.categoryId }
          })

          result = { updated: ids.length, message: `${ids.length} articles assigned to category` }
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid batch action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error performing batch operation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform batch operation' },
      { status: 500 }
    )
  }
}