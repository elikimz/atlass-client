import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardStats {
  totalUsers: number
  totalTasks: number
  totalTraining: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalTasks: 0, totalTraining: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch various stats from backend
      const [usersRes, tasksRes, certsRes] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/video-tasks').catch(() => ({ data: [] })),
        api.get('/admin/certifications').catch(() => ({ data: [] })),
      ])

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalTasks: tasksRes.data?.length || 0,
        totalTraining: certsRes.data?.length || 0,
        totalRevenue: 0, // To be fetched from payments endpoint
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3B82F6' },
    { label: 'Video Tasks', value: stats.totalTasks, icon: '🎬', color: '#10B981' },
    { label: 'Training Courses', value: stats.totalTraining, icon: '📚', color: '#F59E0B' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰', color: '#8B5CF6' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: '0 0 8px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Welcome to the AdPulse Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `1px solid #E5E7EB`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px' }}>{card.icon}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                📈
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 8px' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <a href="/admin/tasks" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#F0F9FF',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#1E40AF',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0F2FE' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F0F9FF' }}
          >
            <span style={{ fontSize: '20px' }}>🎬</span>
            <span>Manage Video Tasks</span>
          </a>

          <a href="/admin/training" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#FFFBEB',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#92400E',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF3C7' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFBEB' }}
          >
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>Manage Training</span>
          </a>

          <a href="/admin/users" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#F0FDF4',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#166534',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DCFCE7' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F0FDF4' }}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <span>View Users</span>
          </a>

          <a href="/admin/payments" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#F5F3FF',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#6B21A8',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE9FE' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF' }}
          >
            <span style={{ fontSize: '20px' }}>💳</span>
            <span>View Payments</span>
          </a>

          <a href="/admin/plans" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#FEF2F2',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#991B1B',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
          >
            <span style={{ fontSize: '20px' }}>💎</span>
            <span>Manage Plans</span>
          </a>
        </div>
      </div>
    </div>
  )
}
