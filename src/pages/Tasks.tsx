import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type Task = { id: number; title: string; description?: string; video_url?: string; reward_amount: number; status: string }
type Summary = { active_tasks?: number; completed_tasks?: number; pending_videos?: number }
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function Tasks() {
  const available = useQuery({ queryKey: queryKeys.tasks.available, queryFn: async () => (await api.get<Task[]>('/tasks/available')).data, staleTime: 30000 })
  const summary = useQuery({ queryKey: queryKeys.dashboard.summary, queryFn: async () => (await api.get<Summary>('/dashboard/summary')).data, staleTime: 30000 })
  if (available.isLoading || summary.isLoading) return <section className="member-page-state" role="status"><span className="member-loading-indicator" />Checking your task eligibility…</section>
  if (available.isError || summary.isError) return <section className="member-page-state member-page-state--error" role="alert"><h2>Task status could not be loaded.</h2><p>We have not assumed an empty queue or changed any task record.</p><button className="member-button member-button--primary" onClick={() => { void available.refetch(); void summary.refetch() }}>Try again</button></section>
  const tasks = available.data ?? []
  return <div className="member-tasks"><header className="member-page-heading"><div><span className="member-eyebrow">01 / WORK QUEUE</span><h2>Your next verified step.</h2><p>Review the task criteria before you begin. Eligibility and completion are confirmed by the task service.</p></div></header><section className="task-status-strip" aria-label="Task state summary"><div><span>Available now</span><strong>{tasks.length}</strong></div><div><span>Completed</span><strong>{summary.data?.completed_tasks ?? '—'}</strong></div><div><span>In progress</span><strong>{summary.data?.active_tasks ?? '—'}</strong></div></section><div className="task-queue-list">{tasks.length === 0 ? <section className="member-empty-state"><strong>No task is available right now.</strong><span>This is the current service response. Try again later or check your plan eligibility.</span><Link className="member-inline-route" to="/plans">Review plan status →</Link></section> : tasks.map((task, index) => <article className="task-queue-row" key={task.id}><span className="task-queue-index">{String(index + 1).padStart(2, '0')}</span><div className="task-queue-copy"><span className="member-eyebrow">TASK {task.id} · {task.status || 'Status not supplied'}</span><h3>{task.title}</h3><p>{task.description || 'No task description was supplied.'}</p><small>Reward if accepted: {money(task.reward_amount)}</small></div><Link className="member-button member-button--primary" to={`/tasks/${task.id}`}>Review task →</Link></article>)}</div><p className="task-criteria-note">Task completion records and rewards come from the server. Browser playback does not prove that a person watched a video.</p></div>
}
