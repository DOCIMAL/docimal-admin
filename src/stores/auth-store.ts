import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN_KEY = 'docimal_admin_token'
const REFRESH_TOKEN_KEY = 'docimal_admin_refresh'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName?: string
  avatar?: string
  role: 'super_admin'
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (token: string) => void
    refreshToken: string
    setRefreshToken: (token: string) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const storedAccessToken = getCookie(ACCESS_TOKEN_KEY)
  const storedRefreshToken = getCookie(REFRESH_TOKEN_KEY)
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: storedAccessToken ? JSON.parse(storedAccessToken) : '',
      setAccessToken: (token) =>
        set((state) => {
          setCookie(ACCESS_TOKEN_KEY, JSON.stringify(token))
          return { ...state, auth: { ...state.auth, accessToken: token } }
        }),
      refreshToken: storedRefreshToken ? JSON.parse(storedRefreshToken) : '',
      setRefreshToken: (token) =>
        set((state) => {
          setCookie(REFRESH_TOKEN_KEY, JSON.stringify(token))
          return { ...state, auth: { ...state.auth, refreshToken: token } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN_KEY)
          removeCookie(REFRESH_TOKEN_KEY)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
            },
          }
        }),
    },
  }
})
