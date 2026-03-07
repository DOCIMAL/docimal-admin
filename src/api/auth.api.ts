import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminLoginBody {
  email: string
  password: string
}

export interface AdminTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AdminLoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName?: string
    avatar?: string
    role: 'super_admin'
  }
  tokens: AdminTokens
}

export interface AdminProfileResponse {
  id: string
  email: string
  firstName: string
  lastName?: string
  avatar?: string
  role: 'super_admin'
  lastLoginAt?: string
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const authApi = {
  login: (body: AdminLoginBody) =>
    apiClient
      .post<AdminLoginResponse>('/auth/admin/login', body)
      .then((r) => r.data),

  getProfile: () =>
    apiClient.get<AdminProfileResponse>('/auth/admin/me').then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAdminProfile(enabled = true) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
