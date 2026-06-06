import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardStats {
  total_users: number
  pending_payments: number
  total_payouts: number
  total_deposits: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total_users: 0, pending_payments: 0, total_payouts: 0, total_deposits: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) { console.error('Failed to fetch stats:', err) } finally { setLoading(false) }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div><h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>Dashboard</h1><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Welcome to the AdPulseAI Admin Portal</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)', border: `1px solid var(--border-main)` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}><div style={{ fontSize: '32px' }}>{card.icon}</div><div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📈</div></div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px' }}>{card.label}</p><p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Manage Video Tasks', icon: '🎬', color: '#3B82F6', path: '/admin/tasks' },
            { label: 'Manage Training', icon: '📚', color: '#F59E0B', path: '/admin/training' },
            { label: 'View Users', icon: '👥', color: '#22C55E', path: '/admin/users' },
            { label: 'View Payments', icon: '💳', color: '#8B5CF6', path: '/admin/payments' },
            { label: 'Manage Plans', icon: '💎', color: '#EF4444', path: '/admin/plans' }
          ].map((action, i) => (
            <a key={i} href={action.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: `${action.color}15`, borderRadius: '10px', textDecoration: 'none', color: action.color, fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}><span style={{ fontSize: '20px' }}>{action.icon}</span><span>{action.label}</span></a>
          ))}
        </div>
      </div>
    </div>
  )
}
