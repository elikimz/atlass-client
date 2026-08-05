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
  const [formData, setFormData] = useState({ name: '', description: '', estimated_time: '', video_url: '', steps_count: 0, is_active: true })
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showConfirm, setShowConfirm] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const CLOUDINARY_UPLOAD_PRESET = "task_images"
  const CLOUDINARY_CLOUD_NAME = "doste1wr0"

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      showNotify('Please select a valid video file', 'error')
      return
    }

    // Validate file size (e.g., 100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      showNotify('Video file is too large (max 100MB)', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      )

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData(prev => ({ ...prev, video_url: data.secure_url }))
      showNotify('Video uploaded successfully')
    } catch (err: any) {
      showNotify('Failed to upload video: ' + err.message, 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  useEffect(() => { fetchCertifications() }, [])
  useEffect(() => { if (notification) { const timer = setTimeout(() => setNotification(null), 5000); return () => clearTimeout(timer) } }, [notification])

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => setNotification({ message, type })
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
    setFormData({ name: cert.name, description: cert.description || '', estimated_time: cert.estimated_time || '', video_url: cert.video_url || '', steps_count: cert.steps_count, is_active: cert.is_active })
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
          <div className="loading-bar-bg" style={{ width: '150px' }}><div className="loading-bar-fill"></div></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading certifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {notification && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px', backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>{notification.message}
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-heading)' }}>Delete Certification?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>This action cannot be undone. It may fail if users are currently enrolled.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(showConfirm)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Manage Training</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Create, edit, and delete training certifications</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{showForm ? 'Cancel' : '+ Add Certification'}</button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>{editingId ? 'Edit Certification' : 'Create New Certification'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Estimated Time</label><input type="text" value={formData.estimated_time} onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })} placeholder="e.g., 15 mins" style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Steps Count</label><input type="number" value={formData.steps_count} onChange={(e) => setFormData({ ...formData, steps_count: parseInt(e.target.value) })} min="0" style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Video Source</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="url" 
                  placeholder="Paste video URL here..." 
                  value={formData.video_url} 
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} 
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-main)' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-main)' }}></div>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    id="video-upload-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="video-upload-input"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      padding: '10px 12px', 
                      fontSize: '14px', 
                      border: '2px dashed var(--border-main)', 
                      borderRadius: '8px', 
                      cursor: uploading ? 'not-allowed' : 'pointer', 
                      backgroundColor: 'var(--bg-main)', 
                      color: 'var(--text-main)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {uploading ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid var(--text-muted)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                        <span>Uploading Video...</span>
                      </>
                    ) : (
                      <>
                        <span>📁</span>
                        <span>{formData.video_url ? 'Change Uploaded Video' : 'Upload Video from Device'}</span>
                      </>
                    )}
                  </label>
                  {formData.video_url && !uploading && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✅</span>
                      <span style={{ wordBreak: 'break-all' }}>Current video: {formData.video_url}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ cursor: 'pointer' }} /><label htmlFor="is_active" style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>Active</label></div>
            <div style={{ display: 'flex', gap: '12px' }}><button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{editingId ? 'Update Certification' : 'Create Certification'}</button><button type="button" onClick={handleCancel} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button></div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {certifications.map((cert) => (
          <div key={cert.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{cert.name}</h3><span style={{ padding: '4px 8px', backgroundColor: cert.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: cert.is_active ? '#166534' : '#DC2626', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{cert.is_active ? 'Active' : 'Inactive'}</span></div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{cert.description || 'No description'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}><div>⏱️ {cert.estimated_time || 'N/A'}</div><div>📚 {cert.steps_count} Steps</div></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-main)' }}><button onClick={() => handleEdit(cert)} style={{ flex: 1, padding: '6px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Edit</button><button onClick={() => setShowConfirm(cert.id)} style={{ flex: 1, padding: '6px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
