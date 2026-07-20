import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  access_token_expires_in: number
}

export interface SessionUser {
  id: number
  username: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  role?: string | null
  is_admin?: boolean
  is_trained?: boolean
}

const SESSION_KEYS = [
  'access_token',
  'refresh_token',
  'username',
  'user_first_name',
  'user_last_name',
  'user_email',
  'user_role',
  'user_is_admin',
  'user_is_trained',
]

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshInFlight: Promise<TokenPair | null> | null = null

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function hasSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken())
}

export function persistTokens(tokens: TokenPair): void {
  localStorage.setItem('access_token', tokens.access_token)
  localStorage.setItem('refresh_token', tokens.refresh_token)
}

export function persistUser(user: SessionUser): void {
  localStorage.setItem('username', user.username || '')
  localStorage.setItem('user_first_name', user.first_name || '')
  localStorage.setItem('user_last_name', user.last_name || '')
  localStorage.setItem('user_email', user.email || '')
  localStorage.setItem('user_role', user.role || 'user')
  localStorage.setItem('user_is_admin', user.role === 'admin' || user.is_admin ? 'true' : 'false')
  localStorage.setItem('user_is_trained', user.is_trained ? 'true' : 'false')
}

export function clearSession(): void {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key))
}

export async function refreshSession(): Promise<TokenPair | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (!refreshInFlight) {
    refreshInFlight = authClient
      .post<TokenPair>('/auth/refresh', { refresh_token: refreshToken })
      .then((response) => {
        persistTokens(response.data)
        return response.data
      })
      .catch(() => {
        clearSession()
        return null
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

export async function endSession(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await authClient.post('/auth/logout', { refresh_token: refreshToken })
    }
  } catch {
    // A local logout must still succeed when the network is unavailable or the
    // token has already expired/revoked.
  } finally {
    clearSession()
  }
}
