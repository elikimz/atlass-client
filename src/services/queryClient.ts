import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

/**
 * Shared server-state client. Query defaults deliberately prioritize a stable UI
 * while still revalidating stale data after focus or reconnection.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          if (status && status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: 0,
    },
  },
})

/** A single registry prevents query-key drift between pages and mutations. */
export const queryKeys = {
  auth: {
    currentUser: ['auth', 'current-user'] as const,
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
  tasks: {
    available: ['tasks', 'available'] as const,
    all: ['tasks', 'all'] as const,
  },
  plans: {
    all: ['plans', 'all'] as const,
  },
  referrals: {
    summary: ['referrals', 'summary'] as const,
    active: ['referrals', 'active'] as const,
    codes: ['referrals', 'codes'] as const,
  },
  notifications: {
    list: (page = 1, limit = 50) => ['notifications', 'list', page, limit] as const,
  },
  payments: {
    overview: ['payments', 'overview'] as const,
    historyBase: ['payments', 'history'] as const,
    history: (page = 1, limit = 20) => ['payments', 'history', page, limit] as const,
  },
  profile: ['settings', 'profile'] as const,
  appConfig: ['settings', 'config'] as const,
}
