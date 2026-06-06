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

interface Notification {
  message: string
  type: 'success' | 'error'
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
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showConfirm, setShowConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchCertifications()
  }, [])

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
  }

  const fetchCertifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/certifications')
      setCertifications(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to fetch certifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/admin/certifications/${editingId}`, formData)
        showNotify('Certification updated successfully')
      } else {
        await api.post('/admin/certifications', formData)
        showNotify('Certification created successfully')
      }
      setFormData({ name: '', description: '', estimated_time: '', video_url: '', steps_count: 0, is_active: true })
      setEditingId(null)
      setShowForm(false)
      fetchCertifications()
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to save certification', 'error')
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/certifications/${id}`)
      showNotify('Certification deleted successfully')
      setShowConfirm(null)
      fetchCertifications()
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to delete certification. It may be in use by users.', 'error')
      setShowConfirm(null)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Custom Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          padding: '16px 24px',
          borderRadius: '12px',
          backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          {notification.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delete Certification?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              This action cannot be undone. It may fail if users are currently enrolled.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirm(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setShowConfirm(cert.id)}
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

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
