import { useState, useEffect } from 'react'
import api from '../services/api'

interface Plan {
  id: number
  name: string
  price: number
  daily_tasks_limit: number
  validity_days: number
  description: string
  is_active: boolean
  is_upgrade_only: boolean
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    daily_tasks_limit: 5,
    validity_days: 30,
    description: '',
    is_active: true,
    is_upgrade_only: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

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
      setFormData({
        name: '',
        price: 0,
        daily_tasks_limit: 5,
        validity_days: 30,
        description: '',
        is_active: true,
        is_upgrade_only: false,
      })
      setEditingId(null)
      setShowForm(false)
      fetchPlans()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save plan')
    }
  }

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      price: plan.price,
      daily_tasks_limit: plan.daily_tasks_limit,
      validity_days: plan.validity_days,
      description: plan.description || '',
      is_active: plan.is_active,
      is_upgrade_only: plan.is_upgrade_only,
    })
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
    setFormData({
      name: '',
      price: 0,
      daily_tasks_limit: 5,
      validity_days: 30,
      description: '',
      is_active: true,
      is_upgrade_only: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}>
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Manage Plans</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Create, edit, and delete subscription plans</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#5932EA',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Plan'}
        </button>
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

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            {editingId ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Daily Tasks Limit
                </label>
                <input
                  type="number"
                  value={formData.daily_tasks_limit}
                  onChange={(e) => setFormData({ ...formData, daily_tasks_limit: parseInt(e.target.value) })}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Validity (Days)
                </label>
                <input
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="is_active" style={{ fontSize: '14px', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_upgrade_only"
                  checked={formData.is_upgrade_only}
                  onChange={(e) => setFormData({ ...formData, is_upgrade_only: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="is_upgrade_only" style={{ fontSize: '14px', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                  Upgrade Only
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#5932EA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {editingId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{plan.name}</h3>
              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: plan.is_active ? '#DCFCE7' : '#FEE2E2',
                  color: plan.is_active ? '#166534' : '#DC2626',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              {plan.description || 'No description'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#6B7280', padding: '12px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
              <div>💰 ${(plan.price || 0).toFixed(2)}</div>
              <div>📋 {plan.daily_tasks_limit || 0} tasks/day</div>
              <div>📅 {plan.validity_days || 0} days</div>
              <div>{plan.is_upgrade_only ? '🔒 Upgrade Only' : '✅ Available'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEdit(plan)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#F0F4FF',
                  color: '#5932EA',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No plans found. Create your first plan to get started.</p>
        </div>
      )}
    </div>
  )
}
