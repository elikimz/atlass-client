import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

interface Notification {
  id: number
  user_id: number | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const queryClient = useQueryClient()
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const previousUnreadCount = useRef(0)
  const isAdmin = localStorage.getItem('user_is_admin') === 'true'
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => (await api.get<Notification[]>('/notifications')).data ?? [],
    staleTime: 30 * 1000,
    // Keep the request rate low while the menu is closed; opening it resumes
    // periodic refreshes and focus/reconnect refreshes remain enabled globally.
    refetchInterval: showDropdown ? 30 * 1000 : false,
  })
  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      setHasNewNotification(true)
      window.setTimeout(() => setHasNewNotification(false), 600)
    }
    previousUnreadCount.current = unreadCount
  }, [unreadCount])

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: number[]) => api.post('/notifications/mark-read', { notification_ids: notificationIds }),
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list())
      const ids = new Set(notificationIds)
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.list(), (old) =>
        old?.map((notification) => ids.has(notification.id) ? { ...notification, is_read: true } : notification),
      )
      return { previous }
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.notifications.list(), context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: number) => api.delete(`/notifications/${notificationId}`),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list())
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.list(), (old) =>
        old?.filter((notification) => notification.id !== notificationId),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.notifications.list(), context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
  })

  const clearAllMutation = useMutation({
    mutationFn: async () => api.delete('/notifications/clear-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() })
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list())
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.list(), [])
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.notifications.list(), context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() }),
  })

  const handleMarkAsRead = (notificationIds: number[]) => markAsReadMutation.mutate(notificationIds)

  const handleDeleteNotification = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    deleteMutation.mutate(id)
  }

  const handleClearAll = () => clearAllMutation.mutate()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#22C55E'
      case 'warning': return '#F59E0B'
      case 'error': return '#EF4444'
      default: return 'var(--accent-primary)'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes bubble {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>

      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: hasNewNotification ? 'bubble 0.6s ease-in-out' : 'none'
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: '#EF4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: hasNewNotification ? 'pulse-ring 0.6s ease-out' : 'none'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border-main)',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
              Notifications
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
                    handleMarkAsRead(unreadIds)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Mark all read
                </button>
              )}
              {notifications.some(n => n.user_id !== null) && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) {
                      handleMarkAsRead([notif.id])
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-main)',
                    cursor: 'pointer',
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(93, 50, 234, 0.05)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!notif.is_read) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(93, 50, 234, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!notif.is_read) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(93, 50, 234, 0.05)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    {/* Type Indicator */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getTypeColor(notif.type),
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-heading)',
                        marginBottom: '4px'
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        lineHeight: '1.4',
                        wordBreak: 'break-word'
                      }}>
                        {notif.message}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '4px'
                      }}>
                        {formatDate(notif.created_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {/* Unread Indicator */}
                      {!notif.is_read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          flexShrink: 0
                        }} />
                      )}
                      
                      {/* Delete Button - visible for user's own notifications OR if user is admin */}
                      {(notif.user_id !== null || isAdmin) && (
                        <button
                          onClick={(e) => handleDeleteNotification(notif.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '6px',
                            color: '#EF4444',
                            opacity: 0.7,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }}
                          title="Delete notification"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
