// File: src/app/(dashboard)/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  FolderOpen,
  Youtube,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react'

interface DashboardStats {
  overview: {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    totalProjects: number
    publishedProjects: number
    totalVideos: number
    totalUsers: number
    totalViews: number
  }
  recentArticles: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    viewCount: number
    author: { name: string }
  }>
  popularArticles: Array<{
    id: string
    title: string
    viewCount: number
    slug: string
  }>
  contentByStatus: Array<{
    status: string
    _count: { status: number }
  }>
  articlesByCategory: Array<{
    name: string
    color: string
    _count: { articles: number }
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return <div>Error loading dashboard data</div>
  }

  const statsCards = [
    {
      title: 'Total Artikel',
      value: stats.overview.totalArticles,
      description: `${stats.overview.publishedArticles} published, ${stats.overview.draftArticles} draft`,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Total Project',
      value: stats.overview.totalProjects,
      description: `${stats.overview.publishedProjects} published`,
      icon: FolderOpen,
      color: 'text-green-600'
    },
    {
      title: 'YouTube Videos',
      value: stats.overview.totalVideos,
      description: 'Total video content',
      icon: Youtube,
      color: 'text-red-600'
    },
    {
      title: 'Total Views',
      value: stats.overview.totalViews,
      description: 'Article views',
      icon: Eye,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview content management The Formulator</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Artikel Terbaru
            </CardTitle>
            <CardDescription>
              5 artikel terbaru yang dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      oleh {article.author.name} • {new Date(article.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Artikel Terpopuler
            </CardTitle>
            <CardDescription>
              Artikel dengan views tertinggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-4">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Artikel per Kategori</CardTitle>
          <CardDescription>
            Distribusi artikel berdasarkan kategori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {stats.articlesByCategory.map((category) => (
              <div key={category.name} className="text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category._count.articles}
                </div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-gray-500">
                  {category._count.articles} artikel
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}