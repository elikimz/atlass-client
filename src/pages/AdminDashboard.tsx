import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface DashboardStats {
  total_users: number
  pending_payments: number
  total_payouts: number
  total_deposits: number
}

interface AppConfig {
  key: string
  value: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total_users: 0, pending_payments: 0, total_payouts: 0, total_deposits: 0 })
  const [configs, setConfigs] = useState<AppConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState<string | null>(null)

  useEffect(() => { 
    const fetchData = async () => {
      try {
        const [statsRes, configRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/settings/config')
        ])
        setStats(statsRes.data)
        setConfigs(Array.isArray(configRes.data) ? configRes.data : [])
      } catch (err) { 
        console.error('Failed to fetch admin data:', err) 
      } finally { 
        setLoading(false) 
      }
    }
    fetchData()
  }, [])

  const handleUpdateConfig = async (key: string, value: string) => {
    try {
      setSavingConfig(key)
      await api.put('/admin/config', { key, value })
      toast.success(`${key.replace(/_/g, ' ')} updated successfully!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update configuration')
    } finally {
      setSavingConfig(null)
    }
  }

  const handleConfigChange = (key: string, newValue: string) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: newValue } : c))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 8px' }}>Admin Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Monitor system performance and manage global configurations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: `1px solid var(--border-main)` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px' }}>{card.icon}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: card.color }}>📈</div>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* App Configuration Section */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚙️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>App Configuration</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {configs.map((config) => (
              <div key={config.key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {config.key.replace(/_/g, ' ')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={config.value} 
                    onChange={(e) => handleConfigChange(config.key, e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
                  />
                  <button 
                    onClick={() => handleUpdateConfig(config.key, config.value)}
                    disabled={savingConfig === config.key}
                    style={{ padding: '0 16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: savingConfig === config.key ? 0.7 : 1 }}
                  >
                    {savingConfig === config.key ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Video Tasks', icon: '🎬', color: '#3B82F6', path: '/admin/tasks' },
              { label: 'Training', icon: '📚', color: '#F59E0B', path: '/admin/training' },
              { label: 'User Base', icon: '👥', color: '#22C55E', path: '/admin/users' },
              { label: 'Payments', icon: '💳', color: '#8B5CF6', path: '/admin/payments' },
              { label: 'Plans', icon: '💎', color: '#EF4444', path: '/admin/plans' }
            ].map((action, i) => (
              <a key={i} href={action.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', textDecoration: 'none', color: 'var(--text-heading)', border: '1px solid var(--border-main)', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
