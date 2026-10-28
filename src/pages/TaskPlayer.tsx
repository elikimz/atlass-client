import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { formatCash } from '../services/money'
import './TaskPlayer.css'

type TaskData = {
  id: number
  title: string
  description?: string
  video_url: string
  reward_amount: number
}

type Session = {
  task_id: number
  started_at: string
  server_time: string
  required_session_seconds: number
  message: string
}

function detailFrom(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const data = (error as { response?: { data?: { detail?: unknown } } }).response?.data
  return typeof data?.detail === 'string' ? data.detail : fallback
}

export default function TaskPlayer() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [requiredSeconds, setRequiredSeconds] = useState(10)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [completeError, setCompleteError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [confirmedReward, setConfirmedReward] = useState<number | null>(null)
  const startedFor = useRef<number | null>(null)
  const id = Number(taskId || 0)

  const taskQuery = useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => (await api.get<TaskData[]>('/tasks/all')).data,
    staleTime: 30_000,
  })
  const task = taskQuery.data?.find((item) => item.id === id) ?? null

  const startSession = useMutation({
    mutationFn: async (taskIdValue: number) => (await api.post<Session>(`/tasks/${taskIdValue}/start`)).data,
    onSuccess: (session) => {
      const startMs = Date.parse(session.started_at)
      const serverMs = Date.parse(session.server_time)
      const elapsed = Number.isFinite(startMs) && Number.isFinite(serverMs) ? Math.max(0, (serverMs - startMs) / 1000) : 0
      setRequiredSeconds(session.required_session_seconds)
      setSecondsLeft(Math.max(0, Math.ceil(session.required_session_seconds - elapsed)))
      setSessionReady(true)
      setSessionError('')
    },
    onError: (error) => setSessionError(detailFrom(error, 'The task session could not be started. Check your connection and try again.')),
  })
  const taskIdForSession = task?.id
  const startTaskSession = startSession.mutate

  const youtubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      const videoId = parsed.hostname.includes('youtu.be')
        ? parsed.pathname.slice(1).split('/')[0]
        : parsed.searchParams.get('v') || parsed.pathname.match(/\/embed\/([^/]+)/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (taskIdForSession !== undefined && startedFor.current !== taskIdForSession) {
      startedFor.current = taskIdForSession
      startTaskSession(taskIdForSession)
    }
  }, [taskIdForSession, startTaskSession])

  useEffect(() => {
    if (!sessionReady || secondsLeft <= 0) return
    const timeout = window.setTimeout(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timeout)
  }, [sessionReady, secondsLeft])

  const completeTask = useMutation({
    mutationFn: async () => (await api.post<{ message: string; reward_amount: number; already_completed?: boolean }>('/tasks/complete', { video_task_id: id })).data,
    onMutate: () => setCompleteError(''),
    onSuccess: async (result) => {
      setConfirmedReward(result.reward_amount)
      setAccepted(true)
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
    onError: (error) => setCompleteError(detailFrom(error, 'The server did not accept this submission. Your reward has not been confirmed.')),
  })

  useEffect(() => {
    if (!accepted) return
    const timeout = window.setTimeout(() => navigate('/tasks'), 2200)
    return () => window.clearTimeout(timeout)
  }, [accepted, navigate])

  if (taskQuery.isLoading) return <section className="member-page-state" role="status"><span className="member-loading-indicator" />Loading task details…</section>
  if (taskQuery.isError) return <section className="member-page-state member-page-state--error" role="alert"><h2>Task details are unavailable.</h2><p>No completion or reward was submitted.</p><button className="member-button member-button--primary" onClick={() => void taskQuery.refetch()}>Retry</button><Link className="member-inline-route" to="/tasks">Back to queue</Link></section>
  if (!task) return <section className="member-page-state" role="status"><h2>Task not found in your current queue.</h2><p>The task may no longer be eligible for your account.</p><Link className="member-button member-button--primary" to="/tasks">Return to task queue</Link></section>

  const youtubeUrl = task.video_url ? youtubeEmbedUrl(task.video_url) : null
  const canSubmit = sessionReady && secondsLeft === 0 && !completeTask.isPending && !accepted
  const progressPercent = sessionReady ? Math.min(100, Math.max(0, ((requiredSeconds - secondsLeft) / requiredSeconds) * 100)) : 0
  const autoSubmit = () => {
    if (canSubmit) completeTask.mutate()
  }

  return (
    <main className="task-session-page">
      <nav className="task-session-breadcrumb"><Link to="/tasks">← Work queue</Link><span>FIELD NOTE / TASK {String(task.id).padStart(3, '0')}</span></nav>
      <header className="task-session-heading"><span className="member-eyebrow">WORK / REVIEW BEFORE SUBMISSION</span><h1>{task.title}</h1><p>{task.description || 'The task service supplied no additional written criteria.'}</p></header>

      <div className="task-session-layout">
        <section className="task-session-main" aria-label="Task media and criteria">
          <div className="task-media-frame">
            {youtubeUrl ? (
              <iframe src={youtubeUrl} title={`${task.title} video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : task.video_url ? (
              <video controls playsInline src={task.video_url} aria-label={`${task.title} video`} onEnded={autoSubmit} />
            ) : <div className="task-media-external"><span className="task-media-stamp">NO VIDEO</span><h2>Video unavailable</h2><p>This task has no playable video. Please return to the task queue.</p></div>}
          </div>
          <section className="task-criteria-panel"><span className="member-eyebrow">WATCH IN THIS PAGE</span><h2>Watch the video, then submit</h2><p>Keep the video open here. After 10 seconds, the submit button unlocks. Uploaded videos submit automatically when playback ends; embedded videos can be submitted with the button.</p></section>
        </section>

        <aside className="task-session-rail" aria-label="Task session status">
          <span className="member-eyebrow">SESSION / SERVER TIMED</span>
          <div className={`task-session-clock${sessionReady && secondsLeft === 0 ? ' is-ready' : ''}`} role="status">{!sessionReady ? '—:—' : `00:${String(secondsLeft).padStart(2, '0')}`}</div>
          <div className="task-session-progress" aria-label={`Task progress ${Math.round(progressPercent)} percent`}><span style={{ width: `${progressPercent}%` }} /></div>
          <div className="task-session-progress-label"><span>{sessionReady && secondsLeft === 0 ? 'Ready to submit' : 'Server-timed progress'}</span><strong>{Math.round(progressPercent)}%</strong></div>
          <p>{startSession.isPending ? 'Recording your session start…' : !sessionReady ? 'Waiting for the task service' : secondsLeft > 0 ? 'Minimum elapsed session in progress' : 'Minimum elapsed time reached'}</p>
          {sessionError && <div className="member-notice member-notice--error" role="alert">{sessionError}<button type="button" className="task-session-retry" onClick={() => task && startSession.mutate(task.id)} disabled={startSession.isPending}>Retry session start</button></div>}
          <div className="task-session-reward"><small>CATALOG REWARD</small><strong>{formatCash(task.reward_amount)}</strong><span>Credited only if accepted by the server.</span></div>
          {completeError && <p className="member-notice member-notice--error" role="alert">{completeError}</p>}
          {accepted ? <div className="member-notice member-notice--success" role="status">Task verified. {confirmedReward === null ? 'Your reward is being recorded.' : `${formatCash(confirmedReward)} has been added to your earnings.`}</div> : <button className="member-button member-button--primary task-submit-button" type="button" disabled={!canSubmit} onClick={() => completeTask.mutate()}>{completeTask.isPending ? 'Submitting…' : secondsLeft > 0 ? `Watch ${secondsLeft}s more` : 'Submit task'}</button>}
          <span className="task-session-disclaimer">No reward is shown as paid until confirmed by your account record.</span>
        </aside>
      </div>
    </main>
  )
}
