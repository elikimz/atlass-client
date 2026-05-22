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

const CLOUDINARY_UPLOAD_PRESET = "task_images";
const CLOUDINARY_CLOUD_NAME = "doste1wr0";

export default function AdminDashboard() {
  const [videos, setVideos] = useState<VideoTask[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward_amount: 10.00,
    file: null as File | null,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await api.get('/admin/video-tasks')
      setVideos(response.data)
    } catch (err) {
      setError('Failed to fetch videos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reward_amount' ? parseFloat(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0],
      }))
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.file) {
      setError('Please select a video file')
      return
    }

    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }

    setUploading(true)

    try {
      // 1. Upload to Cloudinary
      const cloudinaryData = new FormData()
      cloudinaryData.append('file', formData.file)
      cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      
      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        cloudinaryData
      )
      
      const videoUrl = cloudinaryRes.data.secure_url
      
      // 2. Save to Backend
      await api.post('/admin/create-video-task', {
        title: formData.title,
        description: formData.description,
        reward_amount: formData.reward_amount,
        video_url: videoUrl
      })

      setSuccess(`Video "${formData.title}" uploaded successfully!`)
      setFormData({
        title: '',
        description: '',
        reward_amount: 10.00,
        file: null,
      })
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Refresh videos list
      await fetchVideos()
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload video')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'black', margin: '0 0 8px' }}>Admin Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>Manage and upload video tasks for users</p>
      </div>

      {/* Upload Form */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'black', margin: '0 0 24px' }}>Upload New Video Task</h2>
        
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', color: '#15803D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Video Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Watch & Rate: Quantum Computing"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the task..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Reward Amount ($) *</label>
            <input
              type="number"
              name="reward_amount"
              value={formData.reward_amount}
              onChange={handleInputChange}
              placeholder="10.00"
              step="0.01"
              min="0"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Video File *</label>
            <input
              id="file-input"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '10px 12px', border: '2px dashed #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' }}
              required
            />
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Supported formats: MP4, WebM, Ogg, etc.</p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              backgroundColor: uploading ? '#D1D5DB' : '#5932EA',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background-color 0.2s',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Video Task'}
          </button>
        </form>
      </div>

      {/* Videos List */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'black', margin: '0 0 24px' }}>Uploaded Video Tasks ({videos.length})</h2>

        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#F0F4FF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>No videos uploaded yet</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Upload your first video task above to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {videos.map((video) => (
              <div key={video.id} style={{ backgroundColor: '#F9FBFF', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F2EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'black', margin: '0 0 4px' }}>{video.title}</h3>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>ID: {video.id}</p>
                  </div>
                </div>

                {video.description && (
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px', lineHeight: '1.4' }}>{video.description}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Reward</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#00AC4F', margin: 0 }}>${video.reward_amount.toFixed(2)}</p>
                  </div>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#5932EA',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Video
                  </a>
                </div>

                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '8px 0 0', textAlign: 'right' }}>
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
