// File: src/hooks/use-content.ts
'use client'

import { useState, useEffect } from 'react'
import { Article, Project, YouTubeContent } from '@/types/content'
import { ApiResponse, PaginatedResponse } from '@/types/api'

export function useArticles(params?: {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
  search?: string
}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.status) query.append('status', params.status)
      if (params?.categoryId) query.append('categoryId', params.categoryId)
      if (params?.search) query.append('search', params.search)

      const response = await fetch(`/api/articles?${query}`)
      const result: PaginatedResponse<Article> = await response.json()

      if (result.success && result.data) {
        setArticles(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch articles')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [params?.page, params?.limit, params?.status, params?.categoryId, params?.search])

  const createArticle = async (data: Partial<Article>) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<Article> = await response.json()
      
      if (result.success) {
        await fetchArticles() // Refresh list
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    }
  }

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    createArticle
  }
}

export function useProjects(params?: {
  page?: number
  limit?: number
  status?: string
  categoryId?: string
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.status) query.append('status', params.status)
      if (params?.categoryId) query.append('categoryId', params.categoryId)

      const response = await fetch(`/api/projects?${query}`)
      const result: PaginatedResponse<Project> = await response.json()

      if (result.success && result.data) {
        setProjects(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [params?.page, params?.limit, params?.status, params?.categoryId])

  const createProject = async (data: Partial<Project>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<Project> = await response.json()
      
      if (result.success) {
        await fetchProjects() // Refresh list
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject
  }
}