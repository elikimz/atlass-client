import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: string
  is_admin: boolean
  is_suspended: boolean
  is_trained: boolean
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
  performance_bonus_balance: number
  created_at: string
}

import { useNavigate } from 'react-router-dom'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<User & { password?: string }>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to fetch users') } finally { setLoading(false) }
  }

  const handleEdit = (user: User) => { if (!user) return; setEditingId(user.id); setEditData({ ...user }) }
  const handleSave = async () => {
    if (!editingId) return
    try {
      await api.put(`/admin/users/${editingId}`, editData)
      setSuccess('User updated successfully'); setEditingId(null); fetchUsers()
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update user') }
  }

  const handleDelete = async (id: number) => {
    if (!id) return
    if (window.confirm('Are you sure you want to delete this user? This will permanently remove all their data, including payments and referrals.')) {
      const toastId = toast.loading('Deleting user...')
      try { 
        await api.delete(`/admin/users/${id}`)
        toast.success('User deleted successfully', { id: toastId })
        fetchUsers() 
      } catch (err: any) { 
        toast.error(err.response?.data?.detail || 'Failed to delete user', { id: toastId })
      }
    }
  }

  const handleBulkDelete = async (deleteAll = false) => {
    const ids = Array.from(selectedIds)
    if (!deleteAll && ids.length === 0) return
    const confirmation = deleteAll
      ? 'Delete every non-admin user account? This permanently removes their data and cannot be undone.'
      : `Delete ${ids.length} selected user${ids.length === 1 ? '' : 's'}? This permanently removes their data and cannot be undone.`
    if (!window.confirm(confirmation)) return

    const toastId = toast.loading(deleteAll ? 'Deleting all users...' : `Deleting ${ids.length} users...`)
    setBulkDeleting(true)
    try {
      const response = await api.post('/admin/users/bulk-delete', { user_ids: ids, delete_all: deleteAll })
      toast.success(response.data?.message || 'Users deleted successfully', { id: toastId })
      setSelectedIds(new Set())
      await fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete users', { id: toastId })
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSuspension = async (user: User) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_suspended: !user.is_suspended })
      setSuccess(`User ${user.is_suspended ? 'unsuspended' : 'suspended'} successfully`); fetchUsers()
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update status') }
  }

  const handleCancel = () => { setEditingId(null); setEditData({}) }
  const filteredUsers = (users || []).filter((user) => {
    if (!user) return false
    const search = (searchTerm || '').toLowerCase()
    return (user.username || '').toLowerCase().includes(search) || (user.first_name || '').toLowerCase().includes(search) || (user.last_name || '').toLowerCase().includes(search) || (user.email || '').toLowerCase().includes(search)
  })
  const selectableUsers = filteredUsers.filter((user) => !user.is_admin && user.role !== 'admin')
  const allVisibleSelected = selectableUsers.length > 0 && selectableUsers.every((user) => selectedIds.has(user.id))
  const toggleSelected = (id: number) => setSelectedIds((previous) => {
    const next = new Set(previous)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })
  const toggleSelectVisible = () => setSelectedIds((previous) => {
    const next = new Set(previous)
    if (allVisibleSelected) selectableUsers.forEach((user) => next.delete(user.id))
    else selectableUsers.forEach((user) => next.add(user.id))
    return next
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div><h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Manage Users</h1><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>View and manage user accounts, roles, and status</p></div>
      {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px' }}>{success}</div>}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
        <button onClick={() => handleBulkDelete(false)} disabled={bulkDeleting || selectedIds.size === 0} style={{ padding: '10px 14px', border: 'none', borderRadius: '8px', backgroundColor: selectedIds.size ? '#DC2626' : 'var(--text-muted)', color: 'white', fontSize: '13px', fontWeight: 700, cursor: selectedIds.size && !bulkDeleting ? 'pointer' : 'not-allowed' }}>Delete selected ({selectedIds.size})</button>
        <button onClick={() => handleBulkDelete(true)} disabled={bulkDeleting || users.filter((user) => !user.is_admin && user.role !== 'admin').length === 0} style={{ padding: '10px 14px', border: '1px solid #DC2626', borderRadius: '8px', backgroundColor: 'transparent', color: '#DC2626', fontSize: '13px', fontWeight: 700, cursor: bulkDeleting ? 'not-allowed' : 'pointer' }}>Delete all non-admin users</button>
      </div>
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-main)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', width: '44px' }}><input type="checkbox" aria-label="Select visible users" checked={allVisibleSelected} onChange={toggleSelectVisible} /></th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Balances</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-main)', backgroundColor: user.is_suspended ? 'rgba(225, 29, 72, 0.05)' : 'transparent' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{!user.is_admin && user.role !== 'admin' && <input type="checkbox" aria-label={`Select ${user.username}`} checked={selectedIds.has(user.id)} onChange={() => toggleSelected(user.id)} />}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)' }}>{user.username} {user.is_suspended && <span style={{ marginLeft: '8px', color: '#E11D48', fontSize: '11px', fontWeight: 700 }}>[SUSPENDED]</span>}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)' }}>{user.first_name} {user.last_name}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>{user.phone_number}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  {editingId === user.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select value={editData.role || 'user'} onChange={(e) => setEditData({ ...editData, role: e.target.value })} style={{ padding: '6px 8px', fontSize: '13px', border: '1px solid var(--border-main)', borderRadius: '6px', outline: 'none', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}><option value="user">User</option><option value="admin">Admin</option></select>
                      <input type="password" placeholder="New Password" value={editData.password || ''} onChange={(e) => setEditData({ ...editData, password: e.target.value })} style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid var(--border-main)', borderRadius: '6px', width: '120px' }} />
                    </div>
                  ) : (
                    <span style={{ padding: '4px 8px', backgroundColor: user.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: user.role === 'admin' ? '#92400E' : '#1E40AF', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{user.role}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}><div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ padding: '2px 6px', backgroundColor: user.is_trained ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-main)', color: user.is_trained ? '#166534' : 'var(--text-muted)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, width: 'fit-content' }}>{user.is_trained ? 'Trained' : 'Not Trained'}</span><span style={{ padding: '2px 6px', backgroundColor: user.is_suspended ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: user.is_suspended ? '#991B1B' : '#166534', borderRadius: '4px', fontSize: '11px', fontWeight: 600, width: 'fit-content' }}>{user.is_suspended ? 'Suspended' : 'Active'}</span></div></td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {editingId === user.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Dep:</span>
                        <input type="number" value={editData.deposit_wallet_balance || 0} onChange={(e) => setEditData({ ...editData, deposit_wallet_balance: parseFloat(e.target.value) })} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-main)', borderRadius: '4px', width: '60px' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Wth:</span>
                        <input type="number" value={editData.withdrawal_wallet_balance || 0} onChange={(e) => setEditData({ ...editData, withdrawal_wallet_balance: parseFloat(e.target.value) })} style={{ padding: '4px', fontSize: '11px', border: '1px solid var(--border-main)', borderRadius: '4px', width: '60px' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>Deposit: ${(user.deposit_wallet_balance || 0).toFixed(2)}</div>
                      <div>Withdrawal: ${(user.withdrawal_wallet_balance || 0).toFixed(2)}</div>
                    </>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{editingId === user.id ? (<div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}><button onClick={handleSave} style={{ padding: '6px 12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Save</button><button onClick={handleCancel} style={{ padding: '6px 12px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Cancel</button></div>) : (<div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}><button onClick={() => toggleSuspension(user)} style={{ padding: '6px 12px', backgroundColor: user.is_suspended ? 'rgba(34, 197, 94, 0.1)' : 'rgba(225, 29, 72, 0.1)', color: user.is_suspended ? '#166534' : '#E11D48', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>{user.is_suspended ? 'Unsuspend' : 'Suspend'}</button><button onClick={() => handleEdit(user)} style={{ padding: '6px 12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Edit</button><button onClick={() => navigate(`/admin/notifications?userId=${user.id}`)} style={{ padding: '6px 12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#1E40AF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Notify</button><button onClick={() => handleDelete(user.id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Delete</button></div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
