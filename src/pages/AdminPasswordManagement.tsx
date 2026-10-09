import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

interface User {
  id: number
  username: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  role: string
  is_suspended: boolean
}

export default function AdminPasswordManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/admin/users')
        setUsers(Array.isArray(response.data) ? response.data : [])
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return users
    return users.filter((user) => [user.username, user.first_name, user.last_name, user.email, user.phone_number]
      .some((value) => value?.toLowerCase().includes(search)))
  }, [searchTerm, users])

  const selectedUser = users.find((user) => String(user.id) === selectedUserId)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUserId) {
      toast.error('Select a user first')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      await api.post(`/admin/users/${selectedUserId}/password`, { new_password: newPassword })
      toast.success(`Password updated for ${selectedUser?.username || 'user'}`)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '760px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Password Management</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Set a new login password for a user who has forgotten their password.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label htmlFor="user-search" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>Find user</label>
          <input id="user-search" type="search" placeholder="Search username, name, email, or phone" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }} />
        </div>

        <div>
          <label htmlFor="password-user" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>User account</label>
          <select id="password-user" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} disabled={loading} required style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}>
            <option value="">{loading ? 'Loading users...' : 'Select a user'}</option>
            {filteredUsers.map((user) => <option key={user.id} value={user.id}>{user.username} — {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'No name'}{user.is_suspended ? ' [SUSPENDED]' : ''}</option>)}
          </select>
          {searchTerm && filteredUsers.length === 0 && <p style={{ margin: '7px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>No users match this search.</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label htmlFor="new-password" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>New password</label>
            <input id="new-password" type="password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" required style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }} />
          </div>
          <div>
            <label htmlFor="confirm-password" style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)' }}>Confirm new password</label>
            <input id="confirm-password" type="password" minLength={8} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat the new password" required style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', padding: '12px 14px', color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.5 }}>
          Updating the password will sign the selected user out of other devices. Share the new password with the user through a secure channel.
        </div>

        <button type="submit" disabled={saving || loading} style={{ alignSelf: 'flex-start', padding: '11px 18px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'white', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Updating password...' : 'Set New Password'}</button>
      </form>
    </div>
  )
}
