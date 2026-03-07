import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach admin token to every request
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { refreshToken } = useAuthStore.getState().auth
        const { data } = await axios.post(`${API_BASE}/auth/admin/refresh`, {
          refreshToken,
        })
        const { auth } = useAuthStore.getState()
        auth.setAccessToken(data.tokens.accessToken)
        auth.setRefreshToken(data.tokens.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().auth.reset()
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)
