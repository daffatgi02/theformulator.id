// File: src/components/admin/forms/ArticleForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  FileText,
  Search as SearchIcon
} from 'lucide-react'

interface ArticleFormProps {
  articleId?: string
  initialData?: any
}

export function ArticleForm({ articleId, initialData }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'DRAFT',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    robotsMeta: 'index,follow'
  })

  useEffect(() => {
    fetchCategories()
    fetchTags()
    
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        featuredImage: initialData.featuredImage || '',
        status: initialData.status || 'DRAFT',
        categoryId: initialData.categoryId || '',
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        canonicalUrl: initialData.canonicalUrl || '',
        robotsMeta: initialData.robotsMeta || 'index,follow'
      })

      if (initialData.tags) {
        setSelectedTags(initialData.tags.map((tag: any) => tag.tag.id))
      }
    }
  }, [initialData])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const result = await response.json()
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate meta title if not manually set
    if (field === 'title' && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: value ? `${value} - The Formulator` : ''
      }))
    }

    // Auto-generate meta description from excerpt
    if (field === 'excerpt' && !formData.metaDescription) {
      setFormData(prev => ({
        ...prev,
        metaDescription: value.substring(0, 160)
      }))
    }
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCreateTag = async () => {
    if (!newTag.trim()) return

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() })
      })

      const result = await response.json()
      if (result.success) {
        setTags(prev => [...prev, result.data])
        setSelectedTags(prev => [...prev, result.data.id])
        setNewTag('')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleSubmit = async (status: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const submitData = {
        ...formData,
        status,
        tagIds: selectedTags
      }

      const url = articleId ? `/api/articles/${articleId}` : '/api/articles'
      const method = articleId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(articleId ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat')
        if (!articleId) {
          router.push('/admin/articles')
        }
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan artikel')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedTagNames = () => {
    return tags
      .filter((tag: any) => selectedTags.includes(tag.id))
      .map((tag: any) => tag.name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {articleId ? 'Edit Artikel' : 'Artikel Baru'}
          </h1>
          <p className="text-gray-600">
            {articleId ? 'Perbarui konten artikel' : 'Buat artikel herbal baru'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            variant="secondary"
          >
            <Save className="mr-2 h-4 w-4" />
            Simpan Draft
          </Button>
          <Button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <AlertDescription className="text-emerald-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Konten Artikel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Artikel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan judul artikel..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Ringkasan singkat artikel (opsional)..."
                  className="mt-1"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.excerpt.length}/300 karakter
                </p>
              </div>

              <div>
                <Label htmlFor="content">Konten *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Tulis konten artikel di sini... (Support HTML)"
                  className="mt-1 min-h-[400px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mendukung HTML basic: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="Judul untuk mesin pencari..."
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.metaTitle.length}/60 karakter (optimal)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      placeholder="Deskripsi untuk mesin pencari..."
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 karakter (optimal)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div>
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input
                      id="canonicalUrl"
                      value={formData.canonicalUrl}
                      onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                      placeholder="https://theformulator.id/articles/..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="robotsMeta">Robots Meta</Label>
                    <Select value={formData.robotsMeta} onValueChange={(value) => handleInputChange('robotsMeta', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                        <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                        <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoryId">Kategori</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="featuredImage">URL Gambar</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Gambar
                </Button>

                {formData.featuredImage && (
                  <div className="mt-4">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Selected Tags */}
                {getSelectedTagNames().length > 0 && (
                  <div className="space-y-2">
                    <Label>Tags Terpilih:</Label>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedTagNames().map((tagName) => (
                        <Badge key={tagName} variant="secondary" className="text-xs">
                          {tagName}
                          <button
                            onClick={() => {
                              const tag = tags.find((t: any) => t.name === tagName)
                              if (tag) handleTagSelect((tag as any).id)
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div>
                  <Label>Tags Tersedia:</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-1">
                    {tags.map((tag: any) => (
                      <div
                        key={tag.id}
                        className={`flex items-center justify-between p-1 rounded cursor-pointer hover:bg-gray-100 ${
                          selectedTags.includes(tag.id) ? 'bg-emerald-50 text-emerald-700' : ''
                        }`}
                        onClick={() => handleTagSelect(tag.id)}
                      >
                        <span className="text-sm">{tag.name}</span>
                        {selectedTags.includes(tag.id) && (
                          <span className="text-emerald-600">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create New Tag */}
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tag baru..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                  <Button size="sm" onClick={handleCreateTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}