import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      const fetchedUsers = response.data || []
      setUsers(fetchedUsers)

      // Handle pre-selected user from query params
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
    </div>
  )
}
