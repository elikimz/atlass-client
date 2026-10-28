import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
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
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [memberAttestation, setMemberAttestation] = useState(false)
  const [completeError, setCompleteError] = useState('')
  const [accepted, setAccepted] = useState(false)
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
      setSecondsLeft(Math.max(0, Math.ceil(session.required_session_seconds - elapsed)))
      setSessionReady(true)
      setSessionError('')
    },
    onError: (error) => setSessionError(detailFrom(error, 'The task session could not be started. Check your connection and try again.')),
  })
  const taskIdForSession = task?.id
  const startTaskSession = startSession.mutate

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
    mutationFn: async () => api.post<{ message: string; reward_amount: number }>('/tasks/complete', { video_task_id: id }),
    onMutate: () => setCompleteError(''),
    onSuccess: async () => {
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

  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(task.video_url || '')
  const canSubmit = sessionReady && secondsLeft === 0 && memberAttestation && !completeTask.isPending && !accepted

  return (
    <main className="task-session-page">
      <nav className="task-session-breadcrumb"><Link to="/tasks">← Work queue</Link><span>FIELD NOTE / TASK {String(task.id).padStart(3, '0')}</span></nav>
      <header className="task-session-heading"><span className="member-eyebrow">WORK / REVIEW BEFORE SUBMISSION</span><h1>{task.title}</h1><p>{task.description || 'The task service supplied no additional written criteria.'}</p></header>

      <div className="task-session-layout">
        <section className="task-session-main" aria-label="Task media and criteria">
          <div className="task-media-frame">
            {task.video_url ? isYouTube ? (
              <div className="task-media-external"><span className="task-media-stamp">EXTERNAL MEDIA</span><h2>Open the task reference</h2><p>We cannot verify playback or viewing on another site.</p><a href={task.video_url} target="_blank" rel="noreferrer" className="member-button member-button--primary">Open media in a new tab ↗</a></div>
            ) : (
              <video controls src={task.video_url} aria-label={`${task.title} media`} />
            ) : <div className="task-media-external"><span className="task-media-stamp">NO MEDIA LINK</span><h2>Review the written criteria</h2><p>No media URL was supplied by the task service.</p></div>}
          </div>
          <section className="task-criteria-panel"><span className="member-eyebrow">SUBMISSION BASIS</span><h2>What the service will record</h2><p>Submitting asks the account service to accept this task. The service checks your plan, task eligibility, daily limit, duplicate state and session elapsed time before posting any reward.</p><p className="task-candid-note">An elapsed session is not proof that a person watched the media. Only submit after you have reviewed the available task materials.</p></section>
        </section>

        <aside className="task-session-rail" aria-label="Task session status">
          <span className="member-eyebrow">SESSION / SERVER TIMED</span>
          <div className={`task-session-clock${sessionReady && secondsLeft === 0 ? ' is-ready' : ''}`} role="status">{!sessionReady ? '—:—' : `00:${String(secondsLeft).padStart(2, '0')}`}</div>
          <p>{startSession.isPending ? 'Recording your session start…' : !sessionReady ? 'Waiting for the task service' : secondsLeft > 0 ? 'Minimum elapsed session in progress' : 'Minimum elapsed time reached'}</p>
          {sessionError && <div className="member-notice member-notice--error" role="alert">{sessionError}<button type="button" className="task-session-retry" onClick={() => task && startSession.mutate(task.id)} disabled={startSession.isPending}>Retry session start</button></div>}
          <div className="task-session-reward"><small>CATALOG REWARD</small><strong>${Number(task.reward_amount).toFixed(2)}</strong><span>Credited only if accepted by the server.</span></div>
          <label className="task-attestation"><input type="checkbox" checked={memberAttestation} onChange={(event) => setMemberAttestation(event.target.checked)} disabled={!sessionReady || accepted} /><span>I have reviewed the task criteria and available media.</span></label>
          {completeError && <p className="member-notice member-notice--error" role="alert">{completeError}</p>}
          {accepted ? <div className="member-notice member-notice--success" role="status">Task accepted by the service. Wallet and activity records are refreshing.</div> : <button className="member-button member-button--primary task-submit-button" type="button" disabled={!canSubmit} onClick={() => completeTask.mutate()}>{completeTask.isPending ? 'Submitting…' : secondsLeft > 0 ? `Wait ${secondsLeft}s` : 'Submit for server acceptance'}</button>}
          <span className="task-session-disclaimer">No reward is shown as paid until confirmed by your account record.</span>
        </aside>
      </div>
    </main>
  )
}
