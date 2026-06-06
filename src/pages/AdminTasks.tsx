import { useState, useEffect } from 'react'
import api from '../services/api'

import toast from 'react-hot-toast'

interface Plan {
  id: number
  name: string
}

interface VideoTask {
  id: number
  plan_id: number | null
  title: string
  description: string
  video_url: string
  reward_amount: number
  created_at: string
  plan?: Plan
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState<VideoTask[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', video_url: '', reward_amount: 0, plan_id: '' as string | number })
  const [error, setError] = useState('')

  useEffect(() => { 
    fetchTasks()
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans')
      setPlans(response.data)
    } catch (err) {
      console.error('Failed to fetch plans', err)
    }
  }

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
    const toastId = toast.loading(editingId ? 'Updating task...' : 'Creating task...')
    try {
      const data = { ...formData, plan_id: formData.plan_id === '' ? null : Number(formData.plan_id) }
      if (editingId) {
        await api.put(`/admin/video-tasks/${editingId}`, data)
        toast.success('Task updated successfully', { id: toastId })
      } else {
        await api.post('/admin/video-tasks', data)
        toast.success('Task created successfully', { id: toastId })
      }
      setFormData({ title: '', description: '', video_url: '', reward_amount: 0, plan_id: '' })
      setEditingId(null)
      setShowForm(false)
      fetchTasks()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save task', { id: toastId })
    }
  }

  const handleEdit = (task: VideoTask) => {
    setFormData({ 
      title: task.title, 
      description: task.description || '', 
      video_url: task.video_url, 
      reward_amount: task.reward_amount,
      plan_id: task.plan_id || ''
    })
    setEditingId(task.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task? This will also remove it from all users who have it assigned.')) {
      const toastId = toast.loading('Deleting task...')
      try {
        await api.delete(`/admin/video-tasks/${id}`)
        toast.success('Task deleted successfully', { id: toastId })
        fetchTasks()
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to delete task', { id: toastId })
      }
    }
  }

  const handleCancel = () => {
    setFormData({ title: '', description: '', video_url: '', reward_amount: 0, plan_id: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}><div className="loading-bar-fill"></div></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Manage Video Tasks</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Create, edit, and delete video tasks</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{showForm ? 'Cancel' : '+ Add Task'}</button>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px' }}>{error}</div>}

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>{editingId ? 'Edit Task' : 'Create New Task'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Video URL</label><input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Assign to Plan</label><select value={formData.plan_id} onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}><option value="">Select a Plan (Optional)</option>{plans.map(plan => (<option key={plan.id} value={plan.id}>{plan.name}</option>))}</select></div>
            <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>Reward Amount</label><input type="number" value={formData.reward_amount} onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) })} step="0.01" required style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            <div style={{ display: 'flex', gap: '12px' }}><button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>{editingId ? 'Update Task' : 'Create Task'}</button><button type="button" onClick={handleCancel} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button></div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{task.title}</h3>
              {task.plan && (
                <span style={{ padding: '2px 8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4F46E5', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  {task.plan.name}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{task.description || 'No description'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-main)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>Reward: ${(task.reward_amount || 0).toFixed(2)}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(task)} style={{ padding: '6px 12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Edit</button>
                <button onClick={() => handleDelete(task.id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {tasks.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border-main)' }}><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No tasks found. Create your first task to get started.</p></div>
      )}
    </div>
  )
}
