// File: src/hooks/use-seo.ts
'use client'

import { useState, useEffect } from 'react'
import { SeoSettings } from '@/types/seo'
import { ApiResponse } from '@/types/api'

export function useSEO() {
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSEOSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seo')
      const result: ApiResponse<SeoSettings> = await response.json()

      if (result.success && result.data) {
        setSeoSettings(result.data)
      } else {
        setError(result.error || 'Failed to fetch SEO settings')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const updateSEOSettings = async (data: Partial<SeoSettings>) => {
    try {
      const response = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<SeoSettings> = await response.json()
      
      if (result.success) {
        setSeoSettings(result.data!)
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchSEOSettings()
  }, [])

  return {
    seoSettings,
    loading,
    error,
    fetchSEOSettings,
    updateSEOSettings
  }
}