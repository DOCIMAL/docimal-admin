import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const NOTIFICATION_SERVICE_URL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3009/api/v1'

const notifClient = axios.create({ baseURL: NOTIFICATION_SERVICE_URL })

export const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000'

// Attach admin auth token and system tenant ID
notifClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    config.headers['X-Tenant-Id'] = SYSTEM_TENANT_ID
  }
  return config
})

export interface Notification {
  id: string
  type: 'invitation' | 'document_processed' | 'workflow_completed' | 'mention' | 'system'
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  readAt?: string
  actionUrl?: string
  createdAt: string
}

export interface NotificationQuery {
  page?: number
  limit?: number
  read?: boolean
  type?: string
}

export interface PaginatedNotifications {
  data: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface NotificationPreference {
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  typePreferences: Record<string, { email: boolean; push: boolean; inApp: boolean }>
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone?: string
}

export type BroadcastAudienceType = 'all_tenants' | 'selected_tenants'
export type BroadcastStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface CreateBroadcastNotificationPayload {
  title: string
  message: string
  audienceType: BroadcastAudienceType
  tenantIds?: string[]
}

export interface BroadcastNotificationSummary {
  id: string
  title: string
  audienceType: BroadcastAudienceType
  recipientCount: number
  status: BroadcastStatus
  createdAt: string
}

export interface BroadcastNotificationDetail extends BroadcastNotificationSummary {
  message: string
  tenantIds?: string[]
  senderUserId: string
  completedAt?: string | null
  failureReason?: string | null
}

export interface BroadcastHistoryQuery {
  page?: number
  limit?: number
  audienceType?: BroadcastAudienceType
}

export interface PaginatedBroadcasts {
  data: BroadcastNotificationSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export const notificationsApi = {
  getNotifications: (params?: NotificationQuery) =>
    notifClient.get<PaginatedNotifications>('/notifications', { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    notifClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAsUnread: (id: string) =>
    notifClient.patch<Notification>(`/notifications/${id}/unread`).then((r) => r.data),

  markAllAsRead: () =>
    notifClient.patch<{ updated: number }>('/notifications/read-all').then((r) => r.data),

  getUnreadCount: () =>
    notifClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  deleteNotification: (id: string) =>
    notifClient.delete(`/notifications/${id}`),

  getPreferences: () =>
    notifClient.get<NotificationPreference>('/notifications/preferences').then((r) => r.data),

  updatePreferences: (data: Partial<NotificationPreference>) =>
    notifClient.patch<NotificationPreference>('/notifications/preferences', data).then((r) => r.data),

  createBroadcast: (payload: CreateBroadcastNotificationPayload) =>
    notifClient.post<BroadcastNotificationDetail>('/notifications/admin/broadcasts', payload).then((r) => r.data),

  listBroadcasts: (params?: BroadcastHistoryQuery) =>
    notifClient
      .get<PaginatedBroadcasts>('/notifications/admin/broadcasts', { params })
      .then((r) => r.data),

  getBroadcastById: (id: string) =>
    notifClient.get<BroadcastNotificationDetail>(`/notifications/admin/broadcasts/${id}`).then((r) => r.data),
}
