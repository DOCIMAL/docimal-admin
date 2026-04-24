/**
 * Shared API wrapper types used across all domain APIs.
 */

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage?: boolean
    hasPreviousPage?: boolean
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
