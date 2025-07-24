// File: src/lib/validation/index.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' }
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      valid: false, 
      message: 'Password harus mengandung huruf besar, huruf kecil, dan angka' 
    }
  }
  
  return { valid: true }
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export interface ArticleValidation {
  title: string
  content: string
  excerpt?: string
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED'
  categoryId?: string
  metaTitle?: string
  metaDescription?: string
}

export function validateArticle(data: Partial<ArticleValidation>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Judul artikel minimal 3 karakter')
  }

  if (!data.content || data.content.trim().length < 50) {
    errors.push('Konten artikel minimal 50 karakter')
  }

  if (data.excerpt && data.excerpt.length > 300) {
    errors.push('Excerpt maksimal 300 karakter')
  }

  if (data.metaDescription && data.metaDescription.length > 160) {
    errors.push('Meta description maksimal 160 karakter')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}