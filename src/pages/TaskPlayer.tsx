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

  useEffect(() => {
    // Fetch task details from /tasks/all so we can load any task by ID
    // regardless of whether it has already been completed by the user
    api.get('/tasks/all')
      .then(res => {
        const tasks = res.data
        const foundTask = tasks.find((t: TaskData) => t.id === parseInt(taskId || '0'))
        if (foundTask) {
          setTask(foundTask)
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
      
      // Show success message for 2 seconds then navigate back
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading task...</p>
        </div>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#DC2626', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={() => navigate('/tasks')}
            style={{ backgroundColor: '#5932EA', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
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
          style={{ background: 'none', border: 'none', color: '#5932EA', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginBottom: '16px', padding: 0 }}
        >
          ← Back to Tasks
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'black', margin: '0 0 8px' }}>{task.title}</h1>
        {task.description && <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>{task.description}</p>}
      </div>

      {/* Video Player */}
      <div style={{ backgroundColor: 'black', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          src={task.video_url}
          controls
          onEnded={handleVideoEnded}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Task Info and Completion */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Reward Amount</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#00AC4F', margin: 0 }}>${task.reward_amount.toFixed(2)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: videoWatched ? '#00AC4F' : '#F59E0B', margin: '0 0 4px' }}>
              {videoWatched ? '✓ Video Watched' : '⏱ Watch the video to continue'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {completed && (
          <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', color: '#15803D', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            ✓ Task completed successfully! Reward added to your withdrawal wallet. Redirecting...
          </div>
        )}

        <button
          onClick={handleCompleteTask}
          disabled={!videoWatched || completing || completed}
          style={{
            width: '100%',
            backgroundColor: videoWatched && !completed ? '#5932EA' : '#D1D5DB',
            color: 'white',
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
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 16px' }}>Task Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Task ID</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'black', margin: 0 }}>{task.id}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Reward</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#00AC4F', margin: 0 }}>${task.reward_amount.toFixed(2)}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px' }}>Status</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: videoWatched ? '#00AC4F' : '#F59E0B', margin: 0 }}>
              {completed ? 'Completed ✓' : (videoWatched ? 'Ready to Submit' : 'In Progress')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
