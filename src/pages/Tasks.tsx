import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface UserData {
  first_name: string
}

interface DashboardSummary {
  active_tasks: number
  completed_tasks: number
  pending_videos: number
  recent_activity: RecentActivity[]
}

interface AvailableTask {
  id: number
  title: string
  description?: string
  video_url: string
  reward_amount: number
  status: string
}

interface RecentActivity {
  id: number
  description: string
  amount: string
  status: string
}

export default function Tasks() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([])
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    Promise.all([
      api.get('/auth/me'),
      api.get('/tasks/available'),
      api.get('/dashboard/summary')
    ]).then(([userRes, tasksRes, summaryRes]) => {
      setUser(userRes.data)
      setAvailableTasks(tasksRes.data || [])
      setSummary(summaryRes.data)
    }).catch(err => {
      console.error('Failed to fetch data:', err)
      setAvailableTasks([])
    })
      .finally(() => setLoading(false))

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1280

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'John'

  const activeTasks = summary?.active_tasks ?? 0
  const completedTasks = summary?.completed_tasks ?? 0
  const pendingVideos = summary?.pending_videos ?? 0

  const taskPerformanceData = [
    { day: 'Mon', completed: 0, total: 100 },
    { day: 'Tue', completed: 0, total: 100 },
    { day: 'Wed', completed: 0, total: 100 },
    { day: 'Thu', completed: 0, total: 100 },
    { day: 'Fri', completed: 0, total: 100 },
    { day: 'Sat', completed: 0, total: 100 },
    { day: 'Sun', completed: 0, total: 100 },
  ]

  const chartHeight = 150
  const chartWidth = isMobile ? windowWidth - 80 : (isTablet ? windowWidth - 360 : 800)
  const maxChartValue = Math.max(...taskPerformanceData.map(d => d.total))

  const recentActivity = summary?.recent_activity ?? []

  const handleStartTask = (taskId: number) => {
    navigate(`/tasks/${taskId}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      <div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          My Tasks <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {firstName}! Here's your task overview.</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)') ,
        gap: '16px',
      }}>
        {[
          { label: 'Active Tasks:', value: activeTasks, bg: 'rgba(89, 50, 234, 0.1)', iconColor: '#5932EA', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          { label: 'Completed Tasks:', value: completedTasks, bg: 'rgba(0, 172, 79, 0.1)', iconColor: '#00AC4F', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13L11 18L8 15"/></svg> },
          { label: 'Pending Videos:', value: pendingVideos, bg: 'rgba(245, 158, 11, 0.1)', iconColor: '#F59E0B', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-main)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--text-heading)' }}>{stat.value}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stat.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{stat.icon}</svg>
            </div>
          </div>
        ))}
      </div>

      {/* Task Performance Overview */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Task Performance Overview</h2>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>This Week</div>
        </div>
        <div style={{ position: 'relative', height: chartHeight + 40 }}>
          <svg width="100%" height={chartHeight + 40}>
            <text x="25" y="20" fontSize="11" fill="var(--text-muted)">$600</text>
            <text x="25" y={chartHeight / 2 + 5} fontSize="11" fill="var(--text-muted)">$400</text>
            <text x="25" y={chartHeight - 5} fontSize="11" fill="var(--text-muted)">$0</text>
            {taskPerformanceData.map((d, i) => {
              const x = 50 + (i / (taskPerformanceData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
              const barHeight = (d.completed / maxChartValue) * (chartHeight - 40)
              const totalBarHeight = (d.total / maxChartValue) * (chartHeight - 40)
              const yCompleted = chartHeight - barHeight + 20
              const yTotal = chartHeight - totalBarHeight + 20
              return (
                <g key={i}>
                  <rect x={x - 10} y={yTotal} width="20" height={totalBarHeight} fill="var(--border-main)" rx="4" ry="4" />
                  <rect x={x - 10} y={yCompleted} width="20" height={barHeight} fill="var(--accent-primary)" rx="4" ry="4" />
                </g>
              )
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', marginTop: '10px' }}>
            {taskPerformanceData.map((d) => <span key={d.day} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.day}</span>)}
          </div>
        </div>
      </div>

      {/* Available Tasks */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 20px' }}>Available Tasks ({availableTasks.length})</h2>
        {availableTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No tasks available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableTasks.map((task) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: task.status === 'completed' ? 'rgba(0, 172, 79, 0.1)' : 'rgba(89, 50, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.status === 'completed' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-heading)' }}>{task.title}</span>
                    {task.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{task.description}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#00AC4F' }}>${task.reward_amount.toFixed(2)}</span>
                  {task.status === 'completed' ? (
                    <div style={{ backgroundColor: 'rgba(0, 172, 79, 0.1)', color: '#00AC4F', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      DONE ✓
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartTask(task.id)}
                      style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                      START TASK
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 20px' }}>Recent Activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentActivity.map((activity) => (
            <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 172, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{activity.description}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#00AC4F' }}>{activity.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
