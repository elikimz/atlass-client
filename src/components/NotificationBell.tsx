import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type Notice = { id: number; title: string; message: string; type: string; is_read: boolean; created_at: string; user_id: number | null }
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const queryKey = queryKeys.notifications.list()
  const q = useQuery({ queryKey, queryFn: async () => (await api.get<Notice[]>('/notifications')).data ?? [], staleTime: 30000, enabled: open })
  const refresh = () => queryClient.invalidateQueries({ queryKey })
  const markRead = useMutation({ mutationFn: (ids: number[]) => api.post('/notifications/mark-read', { notification_ids: ids }), onSuccess: refresh })
  const dismiss = useMutation({ mutationFn: (id: number) => api.delete(`/notifications/${id}`), onSuccess: refresh })
  const unread = (q.data ?? []).filter((notice) => !notice.is_read)
  return <div className="notice-wrap"><button className="notice-button" type="button" aria-expanded={open} aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`} onClick={() => setOpen((value) => !value)}>Notifications{unread.length > 0 ? ` (${unread.length})` : ''}</button>{open && <section className="notice-panel" aria-label="Notifications"><div className="notice-head"><strong>Notices</strong><button type="button" onClick={() => setOpen(false)}>Close</button></div>{q.isLoading ? <p>Loading notices…</p> : q.isError ? <p role="alert">Notices unavailable. <button type="button" onClick={() => void q.refetch()}>Retry</button></p> : !q.data?.length ? <p>No notices returned.</p> : <>{unread.length > 0 && <button type="button" disabled={markRead.isPending} onClick={() => markRead.mutate(unread.map((notice) => notice.id))}>{markRead.isPending ? 'Marking…' : 'Mark all shown as read'}</button>}{(markRead.isError || dismiss.isError) && <p role="alert">Could not update this notice. <button type="button" onClick={() => void q.refetch()}>Refresh</button></p>}{q.data.map((notice) => <article className="notice-row" key={notice.id}><strong>{notice.title}</strong><p>{notice.message}</p><small>{new Date(notice.created_at).toLocaleString()} · {notice.is_read ? 'Read' : 'Unread'}</small><div><button type="button" disabled={notice.is_read || markRead.isPending} onClick={() => markRead.mutate([notice.id])}>{notice.is_read ? 'Read' : 'Mark read'}</button><button type="button" disabled={dismiss.isPending} onClick={() => dismiss.mutate(notice.id)}>Dismiss for me</button></div></article>)}</>}</section>}</div>
}
