// File: src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  
  const [formData, setFormData] = useState({
    email: 'admin@theformulator.id', // Pre-fill for testing
    password: 'AdminFormulator2025!' // Pre-fill for testing
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Form submitted')
    
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🔑 Attempting signIn with NextAuth...')
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl
      })

      console.log('📊 SignIn result:', result)

      if (result?.error) {
        console.error('❌ SignIn error:', result.error)
        setError(`Login gagal: ${result.error}`)
      } else if (result?.ok) {
        console.log('✅ Login successful!')
        router.push(callbackUrl)
        router.refresh()
      } else {
        console.error('❌ Unexpected result:', result)
        setError('Terjadi kesalahan yang tidak diketahui')
      }
    } catch (err) {
      console.error('💥 Login exception:', err)
      if (err instanceof Error) {
        setError(`Exception: ${err.message}`)
      } else {
        setError('Exception: An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Test database function
  const testDatabase = async () => {
    try {
      console.log('🧪 Testing database...')
      const response = await fetch('/api/debug/db')
      const result = await response.json()
      console.log('🗄️ Database test result:', result)
      alert(`Database test: ${result.success ? 'SUCCESS' : 'FAILED'}\nCheck console for details`)
    } catch (error) {
      console.error('Database test failed:', error)
      alert('Database test failed - check console')
    }
  }

  // Test auth function
  const testAuth = async () => {
    try {
      console.log('🧪 Testing auth...')
      const response = await fetch('/api/debug/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@theformulator.id',
          password: 'AdminFormulator2025!'
        })
      })
      const result = await response.json()
      console.log('🔐 Auth test result:', result)
      alert(`Auth test: ${result.success ? 'SUCCESS' : 'FAILED'}\nCheck console for details`)
    } catch (error) {
      console.error('Auth test failed:', error)
      alert('Auth test failed - check console')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">TF</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Masuk ke dashboard The Formulator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
          
          {/* Debug Buttons */}
          <div className="mt-6 space-y-2">
            <Button onClick={testDatabase} variant="outline" size="sm" className="w-full">
              🗄️ Test Database
            </Button>
            <Button onClick={testAuth} variant="outline" size="sm" className="w-full">
              🔐 Test Auth Logic
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}