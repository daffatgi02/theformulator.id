// File: src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateResponse {
  id: string
  message: string
}

export interface UpdateResponse {
  message: string
}

export interface DeleteResponse {
  message: string
}