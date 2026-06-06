import { useState, useEffect } from 'react'
import api from '../services/api'

interface VideoTask {
  id: number
  title: string
  description: string
  video_url: string
  reward_amount: number
  created_at: string
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState<VideoTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    reward_amount: 0,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/video-tasks')
      setTasks(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/admin/video-tasks/${editingId}`, formData)
        setSuccess('Task updated successfully')
      } else {
        await api.post('/admin/video-tasks', formData)
        setSuccess('Task created successfully')
      }
      setFormData({ title: '', description: '', video_url: '', reward_amount: 0 })
      setEditingId(null)
      setShowForm(false)
      fetchTasks()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save task')
    }
  }

  const handleEdit = (task: VideoTask) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      video_url: task.video_url,
      reward_amount: task.reward_amount,
    })
    setEditingId(task.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/admin/video-tasks/${id}`)
        setSuccess('Task deleted successfully')
        fetchTasks()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete task')
      }
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', description: '', video_url: '', reward_amount: 0 })
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
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Manage Video Tasks</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Create, edit, and delete video tasks</p>
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
          {showForm ? 'Cancel' : '+ Add Task'}
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
            {editingId ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Video URL
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
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
                Reward Amount
              </label>
              <input
                type="number"
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) })}
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
                {editingId ? 'Update Task' : 'Create Task'}
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

      {/* Tasks List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{task.title}</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              {task.description || 'No description'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#5932EA' }}>
                Reward: ${(task.reward_amount || 0).toFixed(2)}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(task)}
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
                  onClick={() => handleDelete(task.id)}
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
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No tasks found. Create your first task to get started.</p>
        </div>
      )}
    </div>
  )
}
