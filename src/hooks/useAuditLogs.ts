import { useQuery } from '@tanstack/react-query'
import { auditApi, type AuditLogFilters } from '@/api/audit.api'

export const useAuditLogs = (filters: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.getLogs(filters),
    placeholderData: (previousData) => previousData,
    refetchInterval: 30000, // Polling every 30s as requested
  })
}

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditApi.getStats(),
    refetchInterval: 30000,
  })
}

export const useHighSeverityLogs = (limit?: number) => {
  return useQuery({
    queryKey: ['audit-high-severity', limit],
    queryFn: () => auditApi.getHighSeverity(limit),
    refetchInterval: 30000,
  })
}

export const useFailedLogs = (limit?: number) => {
  return useQuery({
    queryKey: ['audit-failed', limit],
    queryFn: () => auditApi.getFailed(limit),
    refetchInterval: 30000,
  })
}

export const useUserAuditLogs = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['audit-user', userId, limit],
    queryFn: () => auditApi.getUserLogs(userId, limit),
    enabled: !!userId,
    refetchInterval: 30000,
  })
}
