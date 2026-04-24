import { auditClient } from '@/lib/api-client'

export interface AuditLog {
  _id: string
  tenantId?: string
  userId: string
  action: string
  actionCategory?: string
  resource: string
  resourceType?: string
  resourceId?: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  source?: string
  ipAddress?: string
  userAgent?: string
  metadata?: {
    description?: string
    details?: string
    changes?: {
      before: Record<string, unknown>
      after: Record<string, unknown>
    }
    [key: string]: unknown
  }
  createdAt: string
}

export interface AuditStats {
  totalLogs: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  bySource: Record<string, number>
  recentActivityCount: number
}

export interface PaginatedAuditLogs {
  data: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  tenantId?: string
  userId?: string
  action?: string
  status?: string
  severity?: string
  resourceType?: string
  search?: string
  startDate?: string
  endDate?: string
}

export const auditApi = {
  getLogs: (filters: AuditLogFilters) =>
    auditClient
      .get<PaginatedAuditLogs>('/admin/audit-logs', { params: filters })
      .then((res) => res.data),

  getStats: () =>
    auditClient
      .get<AuditStats>('/admin/audit-logs/stats')
      .then((res) => res.data),

  getHighSeverity: (limit?: number) =>
    auditClient
      .get<AuditLog[]>('/admin/audit-logs/high-severity', {
        params: { limit },
      })
      .then((res) => res.data),

  getFailed: (limit?: number) =>
    auditClient
      .get<AuditLog[]>('/admin/audit-logs/failed', {
        params: { limit },
      })
      .then((res) => res.data),

  getUserLogs: (userId: string, limit?: number) =>
    auditClient
      .get<AuditLog[]>(`/admin/audit-logs/user/${userId}`, {
        params: { limit },
      })
      .then((res) => res.data),

  exportLogs: (filters: AuditLogFilters) =>
    auditClient
      .post('/admin/audit-logs/export', {}, { params: filters })
      .then((res) => res.data),
}
