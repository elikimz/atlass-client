import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface TaskData {
  id: number
  title: string
  description?: string
  video_url: string
  reward_amount: number
}

export default function TaskPlayer() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const [videoWatched, setVideoWatched] = useState(false)
  const [isYouTube, setIsYouTube] = useState(false)

  useEffect(() => {
    api.get('/tasks/all')
      .then(res => {
        const tasks = res.data
        const foundTask = tasks.find((t: TaskData) => t.id === parseInt(taskId || '0'))
        if (foundTask) {
          setTask(foundTask)
          const isYT = foundTask.video_url.includes('youtube.com') || foundTask.video_url.includes('youtu.be')
          setIsYouTube(isYT)
          
          // If it's a YouTube video, open it immediately and mark as watched
          if (isYT) {
            window.open(foundTask.video_url, '_blank')
            setVideoWatched(true)
          }
        } else {
          setError('Task not found')
        }
      })
      .catch(err => {
        console.error('Failed to fetch task:', err)
        setError('Failed to load task')
      })
      .finally(() => setLoading(false))
  }, [taskId])

  const handleVideoEnded = () => {
    setVideoWatched(true)
  }

  const handleWatchOnYouTube = () => {
    if (task) {
      window.open(task.video_url, '_blank')
      setVideoWatched(true) // Mark as watched when they click the link
    }
  }

  const handleCompleteTask = async () => {
    if (!task || !videoWatched) {
      setError('Please watch the entire video first')
      return
    }

    setCompleting(true)
    setError('')

    try {
      await api.post('/tasks/complete', {
        video_task_id: task.id,
      })

      setCompleted(true)
      
      setTimeout(() => {
        navigate('/tasks')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete task')
      console.error(err)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading task...</p>
        </div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#DC2626', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => navigate('/tasks')}
            style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    )
  }

  if (!task) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '24px' }}>
      
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate('/tasks')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '16px', padding: 0 }}
        >
          ← Back to Tasks
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>{task.title}</h1>
        {task.description && <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{task.description}</p>}
      </div>

      {/* Video Player */}
      <div style={{ backgroundColor: 'black', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-main)' }}>
        {isYouTube ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#FF0000" style={{ marginBottom: '16px' }}>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>This video is on YouTube</h3>
            <button 
              onClick={handleWatchOnYouTube}
              style={{ backgroundColor: '#FF0000', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
            >
              Watch on YouTube
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>
        ) : (
          <video
            src={task.video_url}
            controls
            onEnded={handleVideoEnded}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Task Info and Completion */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Reward Amount</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#00AC4F', margin: 0 }}>${task.reward_amount.toFixed(2)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: videoWatched ? '#00AC4F' : '#F59E0B', margin: '0 0 4px' }}>
              {videoWatched ? '✓ Video Watched' : '⏱ Watch the video to continue'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {completed && (
          <div style={{ backgroundColor: 'rgba(21, 128, 61, 0.1)', border: '1px solid rgba(21, 128, 61, 0.2)', color: '#15803D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            ✓ Task completed successfully! Reward added to your withdrawal wallet. Redirecting...
          </div>
        )}

        <button
          onClick={handleCompleteTask}
          disabled={!videoWatched || completing || completed}
          style={{
            width: '100%',
            backgroundColor: videoWatched && !completed ? 'var(--accent-primary)' : 'var(--border-main)',
            color: videoWatched && !completed ? 'white' : 'var(--text-muted)',
            padding: '14px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: videoWatched && !completed ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
        >
          {completing ? 'Completing...' : completed ? 'Task Completed ✓' : 'Complete Task & Earn Reward'}
        </button>
      </div>

      {/* Task Details */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 16px' }}>Task Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Task ID</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{task.id}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Reward</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#00AC4F', margin: 0 }}>${task.reward_amount.toFixed(2)}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>Status</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: videoWatched ? '#00AC4F' : '#F59E0B', margin: 0 }}>
              {completed ? 'Completed ✓' : (videoWatched ? 'Ready to Submit' : 'In Progress')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
