import { useState, useEffect } from 'react'
import api from '../services/api'

interface Plan {
  id: number
  name: string
  price: number
  daily_earnings: number
  total_return: number
  profit: number
  daily_tasks_limit: number
  validity_days: number
  description: string
  is_active: boolean
  is_upgrade_only: boolean
  membership_level?: number | null
  membership_commission_rate?: number | null
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const emptyForm = { name: '', price: 0, daily_earnings: 0, total_return: 0, profit: 0, daily_tasks_limit: 5, validity_days: 30, description: '', is_active: true, is_upgrade_only: false, membership_level: null as number | null, membership_commission_rate: null as number | null }
  const [formData, setFormData] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/plans')
      setPlans(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/admin/plans/${editingId}`, formData)
        setSuccess('Plan updated successfully')
      } else {
        await api.post('/admin/plans', formData)
        setSuccess('Plan created successfully')
      }
      setFormData(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save plan')
    }
  }

  const handleEdit = (plan: Plan) => {
    setFormData({ name: plan.name, price: plan.price, daily_earnings: plan.daily_earnings || 0, total_return: plan.total_return || 0, profit: plan.profit || 0, daily_tasks_limit: plan.daily_tasks_limit, validity_days: plan.validity_days, description: plan.description || '', is_active: plan.is_active, is_upgrade_only: plan.is_upgrade_only, membership_level: plan.membership_level ?? null, membership_commission_rate: plan.membership_commission_rate ?? null })
    setEditingId(plan.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/admin/plans/${id}`)
        setSuccess('Plan deleted successfully')
        fetchPlans()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete plan')
      }
    }
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}><div className="loading-bar-fill"></div></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Manage Plans</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Create, edit, and delete subscription plans</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{showForm ? 'Cancel' : '+ Add Plan'}</button>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(255, 120, 140, 0.36)', borderRadius: '8px', padding: '12px 16px', color: '#FF8196', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(101, 217, 161, 0.34)', borderRadius: '8px', padding: '12px 16px', color: '#72E0AA', fontSize: '14px' }}>{success}</div>}

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>{editingId ? 'Edit Plan' : 'Create New Plan'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Plan Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Price ($)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} step="0.01" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Daily Earnings ($)</label><input type="number" value={formData.daily_earnings} onChange={(e) => setFormData({ ...formData, daily_earnings: parseFloat(e.target.value) })} step="0.01" min="0" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Total Returns ($)</label><input type="number" value={formData.total_return} onChange={(e) => setFormData({ ...formData, total_return: parseFloat(e.target.value) })} step="0.01" min="0" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Profit ($)</label><input type="number" value={formData.profit} onChange={(e) => setFormData({ ...formData, profit: parseFloat(e.target.value) })} step="0.01" min="0" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Daily Tasks Limit</label><input type="number" value={formData.daily_tasks_limit} onChange={(e) => setFormData({ ...formData, daily_tasks_limit: parseInt(e.target.value) })} min="1" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Validity (Days)</label><input type="number" value={formData.validity_days} onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })} min="1" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Membership Level</label><input type="number" value={formData.membership_level ?? ''} onChange={(e) => setFormData({ ...formData, membership_level: e.target.value === '' ? null : parseInt(e.target.value) })} min="0" placeholder="Optional; defaults from name" style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Membership Commission Rate</label><input type="number" value={formData.membership_commission_rate ?? ''} onChange={(e) => setFormData({ ...formData, membership_commission_rate: e.target.value === '' ? null : parseFloat(e.target.value) })} min="0" max="1" step="0.001" placeholder="Optional decimal; capped by tier" style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }} /></div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ cursor: 'pointer' }} /><label htmlFor="is_active" style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Active</label></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" id="is_upgrade_only" checked={formData.is_upgrade_only} onChange={(e) => setFormData({ ...formData, is_upgrade_only: e.target.checked })} style={{ cursor: 'pointer' }} /><label htmlFor="is_upgrade_only" style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Upgrade Only</label></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}><button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{editingId ? 'Update Plan' : 'Create Plan'}</button><button type="button" onClick={handleCancel} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button></div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}><h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{plan.name}</h3><span style={{ padding: '4px 8px', backgroundColor: plan.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: plan.is_active ? '#166534' : '#DC2626', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{plan.is_active ? 'Active' : 'Inactive'}</span></div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{plan.description || 'No description'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0', borderTop: '1px solid var(--border-main)', borderBottom: '1px solid var(--border-main)' }}><div>💰 ${(plan.price || 0).toFixed(2)}</div><div>📋 {plan.daily_tasks_limit || 0} tasks/day</div><div>📈 Return: ${(plan.total_return || 0).toFixed(2)}</div><div>💵 Profit: ${(plan.profit || 0).toFixed(2)}</div><div>📅 {plan.validity_days || 0} days</div><div>🏷️ Level: {plan.membership_level ?? 'auto'}</div><div>📊 Rate: {plan.membership_commission_rate == null ? 'tier fallback' : `${(plan.membership_commission_rate * 100).toFixed(2)}%`}</div><div>{plan.is_upgrade_only ? '🔒 Upgrade Only' : '✅ Available'}</div></div>
            <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleEdit(plan)} style={{ flex: 1, padding: '8px 12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Edit</button><button onClick={() => handleDelete(plan.id)} style={{ flex: 1, padding: '8px 12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#FF8196', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
