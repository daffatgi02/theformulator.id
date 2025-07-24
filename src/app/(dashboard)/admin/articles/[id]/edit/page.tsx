// File: src/app/(dashboard)/admin/articles/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArticleForm } from '@/components/admin/forms/ArticleForm'
import { Loader2 } from 'lucide-react'

export default function EditArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle()
  }, [params.id])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`)
      const result = await response.json()
      
      if (result.success) {
        setArticle(result.data)
      }
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Article not found</p>
      </div>
    )
  }

  return (
    <ArticleForm 
      articleId={params.id as string} 
      initialData={article} 
    />
  )
}