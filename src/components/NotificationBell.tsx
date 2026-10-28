import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type Notice = { id: number; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' | string; is_read: boolean; created_at: string; user_id: number | null }
type NotificationSummary = { unread_count: number; total_count: number; latest: Notice | null }

const toneLabel: Record<string, string> = { info: 'Update', success: 'Success', warning: 'Attention', error: 'Action needed' }

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const listKey = queryKeys.notifications.list()
  const summaryQuery = useQuery({
    queryKey: queryKeys.notifications.summary,
    queryFn: async () => (await api.get<NotificationSummary>('/notifications/summary')).data,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
  const feedQuery = useQuery({
    queryKey: listKey,
    queryFn: async () => (await api.get<Notice[]>('/notifications', { params: { page: 1, limit: 20 } })).data ?? [],
    staleTime: 15_000,
    enabled: open,
  })
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: listKey }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.summary }),
    ])
  }
  const markRead = useMutation({ mutationFn: (ids: number[]) => api.post('/notifications/mark-read', { notification_ids: ids }), onSuccess: refresh })
  const markAllRead = useMutation({ mutationFn: () => api.post('/notifications/mark-all-read'), onSuccess: refresh })
  const dismiss = useMutation({ mutationFn: (id: number) => api.delete(`/notifications/${id}`), onSuccess: refresh })
  const clearAll = useMutation({ mutationFn: () => api.delete('/notifications/clear-all'), onSuccess: refresh })
  const unreadCount = summaryQuery.data?.unread_count ?? 0
  const notices = feedQuery.data ?? []
  const actionError = markRead.isError || markAllRead.isError || dismiss.isError || clearAll.isError

  return <div className="notice-wrap">
    <button className="notice-button" type="button" aria-expanded={open} aria-controls="notification-drawer" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => setOpen((value) => !value)}>
      <span aria-hidden="true">♢</span> Notifications
      {unreadCount > 0 && <span className="notice-count" aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && <section id="notification-drawer" className="notice-panel" aria-label="Notifications">
      <div className="notice-head"><div><span className="notice-kicker">ACCOUNT CENTER</span><strong>Notifications</strong><small>{summaryQuery.isLoading ? 'Checking for updates…' : unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}</small></div><button type="button" className="notice-close" onClick={() => setOpen(false)} aria-label="Close notifications">×</button></div>
      {actionError && <div className="notice-error" role="alert">Could not update notifications. <button type="button" onClick={() => { void refresh() }}>Refresh</button></div>}
      {feedQuery.isLoading ? <div className="notice-state" role="status"><span className="notice-spinner" />Loading your updates…</div> : feedQuery.isError ? <div className="notice-state notice-state--error" role="alert"><strong>Updates are unavailable</strong><span>We could not load your notifications.</span><button type="button" onClick={() => void feedQuery.refetch()}>Try again</button></div> : !notices.length ? <div className="notice-state"><span className="notice-empty-icon" aria-hidden="true">✓</span><strong>No new updates</strong><span>Important account activity will appear here.</span></div> : <>
        <div className="notice-actions">{unreadCount > 0 && <button type="button" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}>{markAllRead.isPending ? 'Updating…' : 'Mark all read'}</button>}<button type="button" disabled={clearAll.isPending} onClick={() => clearAll.mutate()}>{clearAll.isPending ? 'Clearing…' : 'Clear personal'}</button></div>
        <div className="notice-list">{notices.map((notice) => <article className={`notice-row${notice.is_read ? '' : ' is-unread'} notice-row--${notice.type}`} key={notice.id}><div className="notice-row-top"><span className="notice-type">{toneLabel[notice.type] || 'Update'}</span><time dateTime={notice.created_at}>{formatDate(notice.created_at)}</time></div><strong>{notice.title}</strong><p>{notice.message}</p><div className="notice-row-actions">{!notice.is_read && <button type="button" disabled={markRead.isPending} onClick={() => markRead.mutate([notice.id])}>Mark read</button>}<button type="button" disabled={dismiss.isPending} onClick={() => dismiss.mutate(notice.id)}>Dismiss</button></div></article>)}</div>
      </>}
      {!feedQuery.isError && notices.length > 0 && <p className="notice-footer">Showing your latest {notices.length} update{notices.length === 1 ? '' : 's'}.</p>}
    </section>}
  </div>
}
