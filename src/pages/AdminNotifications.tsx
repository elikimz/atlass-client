import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface Notification {
  id: number
  user_id: number | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export default function AdminNotifications() {
  const location = useLocation()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Notification list state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifPage, setNotifPage] = useState(1)
  const [notifTotal, setNotifTotal] = useState(0)
  const [notifLimit] = useState(50)
  const [notifFilter, setNotifFilter] = useState<'all' | 'global' | 'targeted'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [notifPage, notifFilter])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      const fetchedUsers = response.data || []
      setUsers(fetchedUsers)

      const params = new URLSearchParams(location.search)
      const userIdParam = params.get('userId')
      if (userIdParam) {
        const userId = parseInt(userIdParam)
        if (fetchedUsers.some((u: User) => u.id === userId)) {
          setSelectedUserId(userId)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      // Fetch all notifications the admin can manage
      const res = await api.get(`/notifications?page=${notifPage}&limit=${notifLimit}`)
      const data = res.data
      let items: Notification[] = data
      if (Array.isArray(data)) {
        items = data
      } else if (data && Array.isArray(data.items)) {
        items = data.items
      }
      // Apply filter on client side
      if (notifFilter === 'global') {
        items = items.filter(n => n.user_id === null)
      } else if (notifFilter === 'targeted') {
        items = items.filter(n => n.user_id !== null)
      }
      setNotifications(items)
      // Try to read total from header or data
      const total = Number(res.headers?.['x-total-count']) || (data?.total ?? items.length)
      setNotifTotal(total)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setNotifLoading(false)
    }
  }, [notifPage, notifFilter, notifLimit])

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (selectedUserId === -1) {
      toast.error('Please select a specific user from the list')
      return
    }

    try {
      setLoading(true)
      await api.post('/admin/notifications/send', {
        user_id: selectedUserId === -1 ? null : selectedUserId,
        title,
        message,
        type
      })
      toast.success('Notification sent successfully!')
      setTitle('')
      setMessage('')
      setSelectedUserId(null)
      setType('info')
      fetchNotifications()
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = async (notifId: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return
    try {
      await api.delete(`/notifications/${notifId}`)
      toast.success('Notification deleted')
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const handleClearAllTargeted = async () => {
    if (!window.confirm('Delete all personal notifications? Global notifications will be kept.')) return
    try {
      await api.delete('/notifications/clear-all')
      toast.success('All personal notifications cleared')
      fetchNotifications()
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTypeIcon = (t: string) => {
    switch (t) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Send Notification Section */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>
          Send Notifications
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Send notifications to users or broadcast globally</p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recipient Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Send To
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: selectedUserId === null ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)',
                  backgroundColor: selectedUserId === null ? 'rgba(93, 50, 234, 0.1)' : 'transparent',
                  color: selectedUserId === null ? 'var(--accent-primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                All Users (Global)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserId(-1)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: selectedUserId !== null && selectedUserId !== -1 ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)',
                  backgroundColor: selectedUserId !== null && selectedUserId !== -1 ? 'rgba(93, 50, 234, 0.1)' : 'transparent',
                  color: selectedUserId !== null && selectedUserId !== -1 ? 'var(--accent-primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Specific User
              </button>
            </div>

            {(selectedUserId === -1 || (selectedUserId !== null && selectedUserId !== -1)) && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-main)',
                        backgroundColor: 'var(--bg-main)',
                        color: 'var(--text-main)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setSelectedUserId(parseInt(val));
                        setSearchTerm('');
                      }
                    }}
                    value={selectedUserId !== null && selectedUserId !== -1 ? selectedUserId : ""}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-main)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      maxWidth: '200px'
                    }}
                  >
                    <option value="" disabled>Or select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                {searchTerm.trim() !== '' && (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-main)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                  }}>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setSearchTerm('')
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-main)',
                            backgroundColor: selectedUserId === user.id ? 'rgba(93, 50, 234, 0.1)' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                            {user.first_name} {user.last_name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedUserId !== null && selectedUserId !== -1 && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#166534',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  <b>Target User:</b> {users.find(u => u.id === selectedUserId)?.first_name} {users.find(u => u.id === selectedUserId)?.last_name} ({users.find(u => u.id === selectedUserId)?.email})
                </span>
                <button 
                  type="button"
                  onClick={() => setSelectedUserId(-1)}
                  style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 700 }}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Notification Type */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
              <option value="warning">⚠️ Warning</option>
              <option value="error">❌ Error</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? 'var(--text-muted)' : 'var(--accent-primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>

      {/* ─── Notification List Section ─────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              All Notifications
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Total: {notifTotal} notifications
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={notifFilter}
              onChange={(e) => { setNotifFilter(e.target.value as any); setNotifPage(1); }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All</option>
              <option value="global">Global Only</option>
              <option value="targeted">Targeted Only</option>
            </select>
            <button
              onClick={handleClearAllTargeted}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Personal
            </button>
            <button
              onClick={() => fetchNotifications()}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {notifLoading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
            No notifications found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-main)',
                  backgroundColor: notif.is_read ? 'var(--bg-main)' : 'rgba(93, 50, 234, 0.04)',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{formatTypeIcon(notif.type)}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>{notif.title}</span>
                    {notif.user_id === null ? (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '6px' }}>Global</span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', padding: '2px 8px', borderRadius: '6px' }}>Targeted</span>
                    )}
                    {notif.is_read ? (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Read</span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}>Unread</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 6px', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    {formatDate(notif.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNotification(notif.id)}
                  title="Delete notification"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fecaca')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notifTotal > notifLimit && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={() => setNotifPage(p => Math.max(1, p - 1))}
              disabled={notifPage <= 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '13px',
                cursor: notifPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: notifPage <= 1 ? 0.5 : 1
              }}
            >
              ← Prev
            </button>
            <span style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Page {notifPage} of {Math.ceil(notifTotal / notifLimit)}
            </span>
            <button
              onClick={() => setNotifPage(p => p + 1)}
              disabled={notifPage * notifLimit >= notifTotal}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '13px',
                cursor: notifPage * notifLimit >= notifTotal ? 'not-allowed' : 'pointer',
                opacity: notifPage * notifLimit >= notifTotal ? 0.5 : 1
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
