import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
  earnings_history: { day: string, value: number }[]
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
  performance_bonus_balance: number
  current_plan_id?: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/auth/me')
    ]).then(([summaryRes, userRes]) => {
      setData(summaryRes.data)
      setUser(userRes.data)
      
      if (!userRes.data.is_trained) {
        navigate('/training', { replace: true })
      }
    }).catch(console.error)
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
  const isDesktop = windowWidth >= 1280

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'User'

  const depositBalance = user?.deposit_wallet_balance ?? 0
  const withdrawalBalance = user?.withdrawal_wallet_balance ?? 0
  const bonusBalance = user?.performance_bonus_balance ?? 0
  const totalBalance = depositBalance + withdrawalBalance + bonusBalance

  const earningsData = data?.earnings_history && data.earnings_history.length > 0 
    ? data.earnings_history 
    : [
        { day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 }, { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 },
      ]

  const maxValue = Math.max(...earningsData.map(d => d.value), 10)
  const chartHeight = 200
  const chartWidth = isMobile ? windowWidth - 80 : (isTablet ? windowWidth - 360 : windowWidth - 460)
  
  const lastPointX = 50 + ((earningsData.length - 1) / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
  const lastPointY = chartHeight - (earningsData[earningsData.length - 1].value / maxValue) * (chartHeight - 40) + 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      <div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dashboard <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {firstName}! Here's your overview.</p>
      </div>

      {/* Wallet Balances Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
        gap: '16px',
      }}>
        {/* Deposit Wallet */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-main)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Deposit Wallet</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--text-heading)' }}>${depositBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#5932EA', marginTop: '4px' }}>Available to use</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(89, 50, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
        </div>

        {/* Withdrawal Wallet */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-main)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Withdrawal Wallet</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--text-heading)' }}>${withdrawalBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#00AC4F', marginTop: '4px' }}>Earned from tasks</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 172, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
        </div>

        {/* Performance Bonus */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-main)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Performance Bonus</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--text-heading)' }}>${bonusBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#0EA5E9', marginTop: '4px' }}>Upgrade refunds</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>

        {/* Total Balance */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-main)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Balance</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'var(--text-heading)' }}>${totalBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '4px' }}>Combined wallets</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: '24px' }}>
        {/* Earnings Chart */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Earnings Overview</h2>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>This Week</div>
          </div>
          <div style={{ position: 'relative', height: chartHeight + 40 }}>
            <svg width="100%" height={chartHeight + 40}>
              <text x="25" y="20" fontSize="11" fill="var(--text-muted)">$600</text>
              <text x="25" y={chartHeight / 2 + 5} fontSize="11" fill="var(--text-muted)">$400</text>
              <text x="25" y={chartHeight - 5} fontSize="11" fill="var(--text-muted)">$0</text>
              <line x1="50" y1="15" x2="100%" y2="15" stroke="var(--border-main)" strokeWidth="1" />
              <line x1="50" y1={chartHeight / 2 + 20} x2="100%" y2={chartHeight / 2 + 20} stroke="var(--border-main)" strokeWidth="1" />
              <polyline
                points={earningsData.map((d, i) => {
                  const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                  const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                  return `${x},${y}`
                }).join(' ') + ` ${lastPointX + 20},${lastPointY - 10}`}
                fill="none" stroke="var(--accent-primary)" strokeWidth="3"
              />
              {earningsData.map((d, i) => {
                const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                return <circle key={i} cx={x} cy={y} r="6" fill="var(--bg-card)" stroke="var(--accent-primary)" strokeWidth="3" />
              })}
              {/* Live Indicator Dot */}
              <circle cx={lastPointX} cy={lastPointY} r="8" fill="var(--accent-primary)" fillOpacity="0.2">
                <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" from="0.2" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={lastPointX} cy={lastPointY} r="4" fill="var(--accent-primary)" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', marginTop: '10px' }}>
              {earningsData.map((d) => <span key={d.day} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.day}</span>)}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 24px' }}>Wallet Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Deposit Wallet', value: `$${depositBalance.toFixed(2)}`, color: '#5932EA', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
              { label: 'Withdrawal Wallet', value: `$${withdrawalBalance.toFixed(2)}`, color: '#00AC4F', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></> },
              { label: 'Total Balance', value: `$${totalBalance.toFixed(2)}`, color: '#F59E0B', icon: <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {data && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 20px' }}>Training Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Footage Watched</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>0 min</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Approved Roles</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>
                {user?.current_plan_id && user.current_plan_id > 1 ? 'Employee' : 'Intern'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Certifications</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
