import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type Course = { id: number; name: string; description?: string; estimated_time?: string; video_url?: string; status?: 'available' | 'in_progress' | 'completed'; is_active?: boolean }
type User = { is_trained?: boolean }

export default function Training() {
  const client = useQueryClient()
  const [courseView, setCourseView] = useState<Course | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
  const user = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<User>('/auth/me')).data, staleTime: 300000 })
  const courses = useQuery({ queryKey: ['training', 'certifications'], queryFn: async () => (await api.get<Course[]>('/training/certifications')).data, staleTime: 60000 })
  const activeCourses = (courses.data ?? []).filter((course) => course.is_active !== false)
  useEffect(() => { if (user.data?.is_trained) localStorage.setItem('user_is_trained', 'true') }, [user.data?.is_trained])

  const runAction = async (course: Course, action: 'start' | 'complete') => {
    setPending(course.id); setActionError('')
    try {
      await api.post(`/training/certifications/${course.id}/${action}`)
      await Promise.all([client.invalidateQueries({ queryKey: ['training', 'certifications'] }), client.invalidateQueries({ queryKey: queryKeys.auth.currentUser })])
      if (action === 'start') setCourseView(course)
      else setCourseView(null)
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
      setActionError(detail || `Could not ${action} this course. Check your connection and try again.`)
    } finally { setPending(null) }
  }

  if (user.isLoading || courses.isLoading) return <section className="member-page-state" role="status"><span className="member-loading-indicator" />Loading your learning record…</section>
  if (user.isError || courses.isError) return <section className="member-page-state member-page-state--error" role="alert"><h2>Learning data is unavailable.</h2><p>Your course progress was not changed.</p><button className="member-button member-button--primary" onClick={() => { void user.refetch(); void courses.refetch() }}>Try again</button></section>

  if (courseView) return <section className="learning-player"><Link to="/training">← Course list</Link><h2>{courseView.name}</h2><p>{courseView.description}</p>{courseView.video_url ? <video controls src={courseView.video_url} aria-label={`${courseView.name} course video`} /> : <p>No course video is currently configured.</p>}<p className="learning-note">Playback in this browser is not independently verified. Use the course completion action only when you have finished the materials.</p><button className="member-button member-button--primary" disabled={pending === courseView.id} onClick={() => void runAction(courseView, 'complete')}>{pending === courseView.id ? 'Saving…' : 'Mark course complete'}</button>{actionError && <p role="alert">{actionError}</p>}</section>

  return <div className="learning-hub"><header className="member-page-heading"><div><span className="member-eyebrow">02 / LEARNING RECORD</span><h2>Learn at your pace.</h2><p>Each course keeps its own status. Completion is recorded by the account service.</p></div></header>{actionError && <p role="alert" className="member-notice member-notice--error">{actionError}</p>}{activeCourses.length === 0 ? <section className="member-empty-state"><strong>No active courses are available.</strong><span>Check again later; no progress has been assumed.</span></section> : <div className="learning-course-list">{activeCourses.map((course) => <article className="learning-course" key={course.id}><span className="learning-course-index">{String(course.id).padStart(2, '0')}</span><div><h3>{course.name}</h3><p>{course.description || 'No description supplied.'}</p><small>{course.estimated_time || 'Duration not supplied'}</small></div><span className={`learning-status learning-status--${course.status || 'available'}`}>{course.status?.replace('_', ' ') || 'Status unavailable'}</span>{course.status === 'completed' ? <span className="learning-action">Recorded complete</span> : <button className="member-button member-button--primary" disabled={pending === course.id} onClick={() => void runAction(course, course.status === 'in_progress' ? 'complete' : 'start')}>{pending === course.id ? 'Saving…' : course.status === 'in_progress' ? 'Complete course' : 'Start course'}</button>}</article>)}</div>}{user.data?.is_trained && <p className="learning-note">Your legacy training record is marked complete. Individual course statuses above remain tied to their own records.</p>}</div>
}
