import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

export default function AdminNotifications() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await api.post('/admin/notifications/send', {
        user_id: selectedUserId || null, // null means global notification
        title,
        message,
        type
      })
      toast.success('Notification sent successfully!')
      setTitle('')
      setMessage('')
      setSelectedUserId(null)
      setType('info')
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
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

            {selectedUserId !== null && selectedUserId !== -1 && (
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
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
                    marginBottom: '8px'
                  }}
                />
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-main)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)'
                }}>
                  {filteredUsers.map(user => (
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
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(93, 50, 234, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUserId !== user.id) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUserId && selectedUserId !== -1 && (
              <div style={{
                marginTop: '12px',
                padding: '10px 12px',
                backgroundColor: 'rgba(93, 50, 234, 0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-heading)'
              }}>
                Selected: {users.find(u => u.id === selectedUserId)?.first_name} {users.find(u => u.id === selectedUserId)?.last_name}
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
    </div>
  )
}
