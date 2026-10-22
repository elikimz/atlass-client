import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearSession, getAccessToken, refreshSession } from './session'

const PRODUCTION_API_URL = 'https://atlasapi-bgh0h6g3a4b6hvfp.southafricanorth-01.azurewebsites.net'
const API_BASE_URL = import.meta.env.PROD
  ? PRODUCTION_API_URL
  : import.meta.env.VITE_API_URL?.trim() || PRODUCTION_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

function isPublicAuthRequest(url?: string): boolean {
  return Boolean(url && ['/auth/login', '/auth/register/final', '/auth/refresh', '/auth/logout'].some((path) => url.includes(path)))
}

function redirectToLogin(): void {
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !isPublicAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (status === 401 && originalRequest && !originalRequest._retry && !isPublicAuthRequest(originalRequest.url)) {
      originalRequest._retry = true
      const tokens = await refreshSession()
      if (tokens) {
        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
        return api(originalRequest)
      }
    }

    if (status === 401) {
      clearSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default api
