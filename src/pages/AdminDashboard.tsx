import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardStats {
  total_users: number
  pending_payments: number
  total_payouts: number
  total_deposits: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ 
    total_users: 0, 
    pending_payments: 0, 
    total_payouts: 0, 
    total_deposits: 0 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
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
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: '👥', color: '#3B82F6' },
    { label: 'Pending Payments', value: stats.pending_payments, icon: '⏳', color: '#F59E0B' },
    { label: 'Total Payouts', value: `$${stats.total_payouts.toLocaleString()}`, icon: '💸', color: '#EF4444' },
    { label: 'Total Deposits', value: `$${stats.total_deposits.toLocaleString()}`, icon: '💰', color: '#10B981' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Welcome to the AdPulseAI Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            border: `1px solid var(--border-main)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px' }}>{card.icon}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                📈
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <a href="/admin/tasks" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#3B82F6',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)' }}
          >
            <span style={{ fontSize: '20px' }}>🎬</span>
            <span>Manage Video Tasks</span>
          </a>

          <a href="/admin/training" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#F59E0B',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)' }}
          >
            <span style={{ fontSize: '20px' }}>📚</span>
            <span>Manage Training</span>
          </a>

          <a href="/admin/users" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#22C55E',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)' }}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <span>View Users</span>
          </a>

          <a href="/admin/payments" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#8B5CF6',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)' }}
          >
            <span style={{ fontSize: '20px' }}>💳</span>
            <span>View Payments</span>
          </a>

          <a href="/admin/plans" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#EF4444',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)' }}
          >
            <span style={{ fontSize: '20px' }}>💎</span>
            <span>Manage Plans</span>
          </a>
        </div>
      </div>
    </div>
  )
}
