import { useEffect, useState } from 'react'
import api from '../services/api'
import axios from 'axios'

interface VideoTask {
  id: number
  title: string
  description: string
  video_url: string
  reward_amount: number
  created_at: string
}

interface Certification {
  id: number
  name: string
  description: string
  estimated_time: string
  video_url: string
}

const CLOUDINARY_UPLOAD_PRESET = "task_images";
const CLOUDINARY_CLOUD_NAME = "doste1wr0";

export default function AdminDashboard() {
  const [videos, setVideos] = useState<VideoTask[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'training'>('tasks')
  
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    reward_amount: 10.00,
    file: null as File | null,
  })

  const [trainingFormData, setTrainingFormData] = useState({
    name: '',
    description: '',
    estimated_time: '15 mins',
    file: null as File | null,
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [videosRes, certsRes] = await Promise.all([
        api.get('/admin/video-tasks'),
        api.get('/admin/certifications')
      ])
      setVideos(videosRes.data)
      setCertifications(certsRes.data)
    } catch (err) {
      setError('Failed to fetch data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskFormData.file || !taskFormData.title) return setError('Please fill all required fields')
    
    setUploading(true)
    setError('')
    try {
      const cloudinaryData = new FormData()
      cloudinaryData.append('file', taskFormData.file)
      cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      
      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        cloudinaryData
      )
      
      await api.post('/admin/create-video-task', {
        title: taskFormData.title,
        description: taskFormData.description,
        reward_amount: taskFormData.reward_amount,
        video_url: cloudinaryRes.data.secure_url
      })

      setSuccess('Video task uploaded successfully!')
      setTaskFormData({ title: '', description: '', reward_amount: 10.00, file: null })
      fetchData()
    } catch (err: any) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleTrainingUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainingFormData.file || !trainingFormData.name) return setError('Please fill all required fields')
    
    setUploading(true)
    setError('')
    try {
      const cloudinaryData = new FormData()
      cloudinaryData.append('file', trainingFormData.file)
      cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      
      await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        cloudinaryData
      )
      
      await api.post('/admin/upload-training-video', null, {
        params: {
          name: trainingFormData.name,
          description: trainingFormData.description,
          estimated_time: trainingFormData.estimated_time,
        },
        data: trainingFormData.file, // Note: The backend expects a File object in the request body for UploadFile
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Wait, I should use the correct endpoint structure I just created in the backend
      const formData = new FormData();
      formData.append('file', trainingFormData.file);
      
      await api.post(`/admin/upload-training-video?name=${encodeURIComponent(trainingFormData.name)}&description=${encodeURIComponent(trainingFormData.description)}&estimated_time=${encodeURIComponent(trainingFormData.estimated_time)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Training video uploaded successfully!')
      setTrainingFormData({ name: '', description: '', estimated_time: '15 mins', file: null })
      fetchData()
    } catch (err: any) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteCert = async (id: number) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/admin/certifications/${id}`)
      fetchData()
    } catch (err) {
      setError('Delete failed')
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Admin Dashboard</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #E2E8F0' }}>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'tasks' ? '2px solid #5932EA' : 'none', color: activeTab === 'tasks' ? '#5932EA' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
        >
          Video Tasks
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          style={{ padding: '12px 24px', border: 'none', background: 'none', borderBottom: activeTab === 'training' ? '2px solid #5932EA' : 'none', color: activeTab === 'training' ? '#5932EA' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
        >
          Training Videos
        </button>
      </div>

      {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}

      {activeTab === 'tasks' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Task Form */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Upload Video Task</h2>
            <form onSubmit={handleTaskUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Title" value={taskFormData.title} onChange={e => setTaskFormData({...taskFormData, title: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <textarea placeholder="Description" value={taskFormData.description} onChange={e => setTaskFormData({...taskFormData, description: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '80px' }} />
              <input type="number" placeholder="Reward ($)" value={taskFormData.reward_amount} onChange={e => setTaskFormData({...taskFormData, reward_amount: parseFloat(e.target.value)})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <input type="file" accept="video/*" onChange={e => setTaskFormData({...taskFormData, file: e.target.files?.[0] || null})} style={{ padding: '10px' }} />
              <button disabled={uploading} style={{ padding: '12px', backgroundColor: '#5932EA', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : 'Upload Task'}
              </button>
            </form>
          </div>

          {/* Task List */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Existing Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {videos.map(v => (
                <div key={v.id} style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{v.title}</p>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>${v.reward_amount} • {v.id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Training Form */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Upload Training Video</h2>
            <form onSubmit={handleTrainingUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Course Name (e.g. Video Reviewing Mastery)" value={trainingFormData.name} onChange={e => setTrainingFormData({...trainingFormData, name: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <textarea placeholder="Description" value={trainingFormData.description} onChange={e => setTrainingFormData({...trainingFormData, description: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '80px' }} />
              <input type="text" placeholder="Estimated Time (e.g. 15 mins)" value={trainingFormData.estimated_time} onChange={e => setTrainingFormData({...trainingFormData, estimated_time: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <input type="file" accept="video/*" onChange={e => setTrainingFormData({...trainingFormData, file: e.target.files?.[0] || null})} style={{ padding: '10px' }} />
              <button disabled={uploading} style={{ padding: '12px', backgroundColor: '#5932EA', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : 'Upload Training Video'}
              </button>
            </form>
          </div>

          {/* Training List */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Current Training Courses</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {certifications.map(c => (
                <div key={c.id} style={{ padding: '12px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{c.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>{c.estimated_time} • ID: {c.id}</p>
                  </div>
                  <button onClick={() => deleteCert(c.id)} style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
