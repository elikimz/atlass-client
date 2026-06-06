import { useState, useEffect } from 'react'
import api from '../services/api'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  is_admin: boolean
  is_trained: boolean
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
  performance_bonus_balance: number
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<User>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditData({ ...user })
  }

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${editingId}`, editData)
      setSuccess('User updated successfully')
      setEditingId(null)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`)
        setSuccess('User deleted successfully')
        fetchUsers()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete user')
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}>
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Manage Users</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>View and manage user accounts and roles</p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px' }}>
          {success}
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Balances</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                  {user.first_name} {user.last_name}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{user.email}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  {editingId === user.id ? (
                    <select
                      value={editData.role || 'user'}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      style={{
                        padding: '6px 8px',
                        fontSize: '13px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        outline: 'none',
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        padding: '4px 8px',
                        backgroundColor: user.role === 'admin' ? '#FEF3C7' : '#DBEAFE',
                        color: user.role === 'admin' ? '#92400E' : '#1E40AF',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor: user.is_trained ? '#DCFCE7' : '#FEE2E2',
                      color: user.is_trained ? '#166534' : '#DC2626',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {user.is_trained ? 'Trained' : 'Not Trained'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>
                  <div>Deposit: ${user.deposit_wallet_balance.toFixed(2)}</div>
                  <div>Withdrawal: ${user.withdrawal_wallet_balance.toFixed(2)}</div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {editingId === user.id ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={handleSave}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#F0F4FF',
                          color: '#5932EA',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </p>
        </div>
      )}
    </div>
  )
}
