import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { formatCash } from '../services/money'

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

const withdrawalScheduleKeys = new Set([
  'withdrawal_schedule_enabled',
  'withdrawal_allowed_days',
  'withdrawal_start_time',
  'withdrawal_end_time',
  'withdrawal_timezone',
])

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

  const configValue = (key: string) => configs.find((config) => config.key === key)?.value ?? ''
  const supportGroupUrl = configValue('whatsapp_link')
  const safeSupportGroupUrl = supportGroupUrl.startsWith('https://') ? supportGroupUrl : ''

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const statCards = [
    { label: 'Total members', value: stats.total_users, code: '01' },
    { label: 'Payments awaiting review', value: stats.pending_payments, code: '02' },
    { label: 'Payouts recorded', value: formatCash(stats.total_payouts, 0), code: '03' },
    { label: 'Deposits recorded', value: formatCash(stats.total_deposits, 0), code: '04' },
  ]

  return (
      <div className="admin-dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-dashboard-heading">
        <span className="admin-dashboard-kicker">SYSTEM REGISTER / LIVE SNAPSHOT</span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 8px' }}>Operations at a glance.</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Server-reported totals and controlled configuration, in one place.</p>
      </div>

      <div className="admin-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {statCards.map((card) => (
          <article key={card.code} className="admin-stat-card">
            <span className="admin-stat-code">RECORD / {card.code}</span>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-panels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '14px' }}>
        {/* App Configuration Section */}
        <section className="admin-config-panel" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="admin-panel-mark" aria-hidden="true">01</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>App Configuration</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {configs.filter((config) => !withdrawalScheduleKeys.has(config.key)).map((config) => (
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
            <div style={{ marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--border-main)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px' }}>Withdrawal schedule</h3>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Control when users may submit withdrawal requests. The default is enabled every day from 00:00 to 23:59 UTC, which preserves current behavior.
              </p>
              {[
                { key: 'withdrawal_schedule_enabled', label: 'Schedule enabled', type: 'select' },
                { key: 'withdrawal_allowed_days', label: 'Allowed days', type: 'text', placeholder: 'mon,tue,wed,thu,fri,sat,sun' },
                { key: 'withdrawal_start_time', label: 'Opening time', type: 'time' },
                { key: 'withdrawal_end_time', label: 'Closing time', type: 'time' },
                { key: 'withdrawal_timezone', label: 'Timezone', type: 'text', placeholder: 'Africa/Nairobi' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>{field.label}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {field.type === 'select' ? (
                      <select value={configValue(field.key)} onChange={(e) => handleConfigChange(field.key, e.target.value)} style={{ flex: 1, padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                        <option value="true">Open schedule enforcement</option>
                        <option value="false">Allow withdrawals at all times</option>
                      </select>
                    ) : (
                      <input type={field.type} placeholder={field.placeholder} value={configValue(field.key)} onChange={(e) => handleConfigChange(field.key, e.target.value)} style={{ flex: 1, padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
                    )}
                    <button onClick={() => handleUpdateConfig(field.key, configValue(field.key))} disabled={savingConfig === field.key} style={{ padding: '0 16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: savingConfig === field.key ? 0.7 : 1 }}>
                      {savingConfig === field.key ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="admin-quick-panel" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="admin-panel-mark admin-panel-mark--persimmon" aria-hidden="true">02</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Video Tasks', code: '03', path: '/admin/tasks' },
              { label: 'Training', code: '04', path: '/admin/training' },
              { label: 'Member base', code: '01', path: '/admin/users' },
              { label: 'Payments', code: '02', path: '/admin/payments' },
              { label: 'Plans', code: '05', path: '/admin/plans' },
            ].map((action) => (
              <a key={action.code} href={action.path} className="admin-quick-link">
                <span className="admin-quick-code">{action.code}</span>
                <span>{action.label}</span>
              </a>
            ))}
            {safeSupportGroupUrl && <a href={safeSupportGroupUrl} target="_blank" rel="noreferrer" className="admin-quick-link"><span className="admin-quick-code">09</span><span>Configured support group</span></a>}
          </div>
        </section>
      </div>
    </div>
  )
}
