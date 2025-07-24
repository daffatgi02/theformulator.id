// File: src/lib/upload/index.ts
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public/uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Ukuran file terlalu besar. Maksimal 5MB'
    }
  }

  return { valid: true }
}

export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  return `${timestamp}.${extension}`
}