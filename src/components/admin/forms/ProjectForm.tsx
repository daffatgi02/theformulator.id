// File: src/components/admin/forms/ProjectForm.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Eye, 
  Upload, 
  X,
  Plus,
  ImageIcon
} from 'lucide-react'

interface ProjectFormProps {
  projectId?: string
  initialData?: any
}

export function ProjectForm({ projectId, initialData }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])
  const [gallery, setGallery] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    featuredImage: '',
    status: 'DRAFT',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: ''
  })

  useEffect(() => {
    fetchCategories()
    
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        shortDescription: initialData.shortDescription || '',
        featuredImage: initialData.featuredImage || '',
        status: initialData.status || 'DRAFT',
        categoryId: initialData.categoryId || '',
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        canonicalUrl: initialData.canonicalUrl || ''
      })

      if (initialData.gallery) {
        try {
          const galleryData = JSON.parse(initialData.gallery)
          setGallery(Array.isArray(galleryData) ? galleryData : [])
        } catch (e) {
          setGallery([])
        }
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate meta title if not manually set
    if (field === 'title' && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: value ? `${value} - The Formulator Project` : ''
      }))
    }

    // Auto-generate meta description from short description
    if (field === 'shortDescription' && !formData.metaDescription) {
      setFormData(prev => ({
        ...prev,
        metaDescription: value.substring(0, 160)
      }))
    }
  }

  const handleAddImage = () => {
    if (newImageUrl.trim() && !gallery.includes(newImageUrl.trim())) {
      setGallery(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (status: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const submitData = {
        ...formData,
        status,
        gallery: gallery.length > 0 ? gallery : null
      }

      const url = projectId ? `/api/projects/${projectId}` : '/api/projects'
      const method = projectId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(projectId ? 'Project berhasil diperbarui' : 'Project berhasil dibuat')
        if (!projectId) {
          router.push('/admin/projects')
        }
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {projectId ? 'Edit Project' : 'Project Baru'}
          </h1>
          <p className="text-gray-600">
            {projectId ? 'Perbarui project portfolio' : 'Tambahkan project baru ke portfolio'}
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
              <CardTitle>Informasi Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Nama Project *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan nama project..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Ringkasan singkat project..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi Detail *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deskripsi lengkap project (Support HTML)..."
                  className="mt-1 min-h-[300px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mendukung HTML basic: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add New Image */}
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL gambar..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button onClick={handleAddImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Gallery Grid */}
                {gallery.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {gallery.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Belum ada gambar di gallery</p>
                  </div>
                )}
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
                      placeholder="https://theformulator.id/projects/..."
                      className="mt-1"
                    />
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
        </div>
      </div>
    </div>
  )
}