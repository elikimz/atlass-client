import { useState, useEffect } from 'react'
import api from '../services/api'

interface Certification {
  id: number
  name: string
  description: string
  estimated_time: string
  video_url: string
  steps_count: number
  is_active: boolean
}

export default function AdminTraining() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimated_time: '',
    video_url: '',
    steps_count: 0,
    is_active: true,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/certifications')
      setCertifications(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch certifications')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/admin/certifications/${editingId}`, formData)
        setSuccess('Certification updated successfully')
      } else {
        await api.post('/admin/certifications', formData)
        setSuccess('Certification created successfully')
      }
      setFormData({ name: '', description: '', estimated_time: '', video_url: '', steps_count: 0, is_active: true })
      setEditingId(null)
      setShowForm(false)
      fetchCertifications()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save certification')
    }
  }

  const handleEdit = (cert: Certification) => {
    setFormData({
      name: cert.name,
      description: cert.description || '',
      estimated_time: cert.estimated_time || '',
      video_url: cert.video_url || '',
      steps_count: cert.steps_count,
      is_active: cert.is_active,
    })
    setEditingId(cert.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await api.delete(`/admin/certifications/${id}`)
        setSuccess('Certification deleted successfully')
        fetchCertifications()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete certification')
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', estimated_time: '', video_url: '', steps_count: 0, is_active: true })
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
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading certifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Manage Training</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Create, edit, and delete training certifications</p>
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
          {showForm ? 'Cancel' : '+ Add Certification'}
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
            {editingId ? 'Edit Certification' : 'Create New Certification'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Name
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Estimated Time
                </label>
                <input
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                  placeholder="e.g., 15 mins"
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
                  Steps Count
                </label>
                <input
                  type="number"
                  value={formData.steps_count}
                  onChange={(e) => setFormData({ ...formData, steps_count: parseInt(e.target.value) })}
                  min="0"
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
                Video URL
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
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
                {editingId ? 'Update Certification' : 'Create Certification'}
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

      {/* Certifications List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {certifications.map((cert) => (
          <div
            key={cert.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{cert.name}</h3>
              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: cert.is_active ? '#DCFCE7' : '#FEE2E2',
                  color: cert.is_active ? '#166534' : '#DC2626',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {cert.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              {cert.description || 'No description'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
              <div>⏱️ {cert.estimated_time || 'N/A'}</div>
              <div>📋 {cert.steps_count} steps</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={() => handleEdit(cert)}
                style={{
                  flex: 1,
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
                onClick={() => handleDelete(cert.id)}
                style={{
                  flex: 1,
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
          </div>
        ))}
      </div>

      {certifications.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No certifications found. Create your first certification to get started.</p>
        </div>
      )}
    </div>
  )
}
