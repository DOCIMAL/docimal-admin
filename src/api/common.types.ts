/**
 * Shared API wrapper types used across all domain APIs.
 */

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface MessageResponse {
  success: boolean
  message: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListParams extends PaginationParams, SortParams {
  search?: string
}
