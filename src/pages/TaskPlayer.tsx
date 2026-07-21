import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

interface TaskData {
  id: number
  title: string
  description?: string
  video_url: string
  reward_amount: number
  status?: string
}

interface DashboardSummary {
  active_tasks: number
  completed_tasks: number
  pending_videos: number
}

export default function TaskPlayer() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const [videoWatched, setVideoWatched] = useState(false)
  const taskIdNumber = Number(taskId || 0)
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => (await api.get<TaskData[]>('/tasks/all')).data,
    staleTime: 2 * 60 * 1000,
  })
  const task = tasksQuery.data?.find((candidate) => candidate.id === taskIdNumber) ?? null
  const isYouTube = Boolean(task?.video_url.includes('youtube.com') || task?.video_url.includes('youtu.be'))

  const completionMutation = useMutation({
    mutationFn: async (videoTaskId: number) => api.post('/tasks/complete', { video_task_id: videoTaskId }),
    onMutate: async (videoTaskId) => {
      setError('')
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.tasks.available }),
        queryClient.cancelQueries({ queryKey: queryKeys.dashboard.summary }),
      ])
      const previousAvailable = queryClient.getQueryData<TaskData[]>(queryKeys.tasks.available)
      const previousDashboard = queryClient.getQueryData<DashboardSummary>(queryKeys.dashboard.summary)

      queryClient.setQueryData<TaskData[]>(queryKeys.tasks.available, (old) =>
        old?.filter((candidate) => candidate.id !== videoTaskId),
      )
      queryClient.setQueryData<DashboardSummary>(queryKeys.dashboard.summary, (old) =>
        old
          ? {
              ...old,
              active_tasks: Math.max(0, old.active_tasks - 1),
              completed_tasks: old.completed_tasks + 1,
              pending_videos: Math.max(0, old.pending_videos - 1),
            }
          : old,
      )
      return { previousAvailable, previousDashboard }
    },
    onError: (requestError, _videoTaskId, context) => {
      if (context?.previousAvailable) {
        queryClient.setQueryData(queryKeys.tasks.available, context.previousAvailable)
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(queryKeys.dashboard.summary, context.previousDashboard)
      }
      const message = (requestError as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(message || 'Failed to complete task')
    },
    onSuccess: () => {
      setCompleted(true)
      window.setTimeout(() => navigate('/tasks'), 2000)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.available }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.codes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }),
      ])
    },
  })

  const handleVideoEnded = () => {
    setVideoWatched(true)
  }

  const handleWatchOnYouTube = () => {
    if (task) {
      window.open(task.video_url, '_blank')
      setVideoWatched(true)
    }
  }

  const handleCompleteTask = () => {
    if (!task || !videoWatched) {
      setError('Please watch the entire video first')
      return
    }
    completionMutation.mutate(task.id)
  }

  const loading = tasksQuery.isLoading
  const completing = completionMutation.isPending
  const loadError = tasksQuery.isError ? 'Failed to load task' : (!loading && !task ? 'Task not found' : '')

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

  if ((error || loadError) && !task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#DC2626', marginBottom: '16px' }}>{error || loadError}</p>
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
