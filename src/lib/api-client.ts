import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const USER_API_BASE =
  import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3001/api/v1'
const AUDIT_API_BASE =
  import.meta.env.VITE_AUDIT_SERVICE_URL || 'http://localhost:3010/api/v1'

export const apiClient = axios.create({
  baseURL: USER_API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export const auditClient = axios.create({
  baseURL: AUDIT_API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach admin token to every request
const requestInterceptor = (config: any) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}

apiClient.interceptors.request.use(requestInterceptor)
auditClient.interceptors.request.use(requestInterceptor)

// Response interceptor: auto-refresh on 401
const responseInterceptorSuccess = (response: any) => response
const responseInterceptorError = async (error: any) => {
  const originalRequest = error.config
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true
    try {
      const { refreshToken } = useAuthStore.getState().auth
      const { data } = await axios.post(`${USER_API_BASE}/auth/admin/refresh`, {
        refreshToken,
      })
      const { auth } = useAuthStore.getState()
      auth.setAccessToken(data.tokens.accessToken)
      auth.setRefreshToken(data.tokens.refreshToken)
      originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`

      // Retry with the correct client
      if (originalRequest.baseURL === AUDIT_API_BASE) {
        return auditClient(originalRequest)
      }
      return apiClient(originalRequest)
    } catch {
      useAuthStore.getState().auth.reset()
      window.location.href = '/sign-in'
      return Promise.reject(error)
    }
  }
  return Promise.reject(error)
}

apiClient.interceptors.response.use(
  responseInterceptorSuccess,
  responseInterceptorError
)
auditClient.interceptors.response.use(
  responseInterceptorSuccess,
  responseInterceptorError
)
