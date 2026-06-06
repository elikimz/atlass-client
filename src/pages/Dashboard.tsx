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

    // Fetch dashboard summary and user info (which now includes wallet balances) in parallel
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/auth/me')
    ]).then(([summaryRes, userRes]) => {
      setData(summaryRes.data)
      setUser(userRes.data)
      
      // Redirect to training if user is not trained
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
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1280
  const isDesktop = windowWidth >= 1280

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'User'

  // Real wallet balances from API
  const depositBalance = user?.deposit_wallet_balance ?? 0
  const withdrawalBalance = user?.withdrawal_wallet_balance ?? 0
  const bonusBalance = user?.performance_bonus_balance ?? 0
  const totalBalance = depositBalance + withdrawalBalance + bonusBalance

  // Use real earnings data from API or fallback to empty if none
  const earningsData = data?.earnings_history && data.earnings_history.length > 0 
    ? data.earnings_history 
    : [
        { day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 }, { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 },
      ]

  const maxValue = Math.max(...earningsData.map(d => d.value), 10) // Ensure at least 10 for scale
  const chartHeight = 200
  const chartWidth = isMobile ? windowWidth - 80 : (isTablet ? windowWidth - 360 : windowWidth - 460)
  
  // Calculate the position of the last point for the live indicator
  const lastPointX = 50 + ((earningsData.length - 1) / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
  const lastPointY = chartHeight - (earningsData[earningsData.length - 1].value / maxValue) * (chartHeight - 40) + 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      <div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 700, color: 'black', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dashboard <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>Welcome back, {firstName}! Here's your overview.</p>
      </div>

      {/* Wallet Balances Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
        gap: '16px',
      }}>
        {/* Deposit Wallet */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #F2EFFF' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Deposit Wallet</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'black' }}>${depositBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#5932EA', marginTop: '4px' }}>Available to use</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F2EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
        </div>

        {/* Withdrawal Wallet */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D3FFE7' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Withdrawal Wallet</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'black' }}>${withdrawalBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#00AC4F', marginTop: '4px' }}>Earned from tasks</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
        </div>

        {/* Performance Bonus */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E0F2FE' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Performance Bonus</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'black' }}>${bonusBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#0EA5E9', marginTop: '4px' }}>Upgrade refunds</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>

        {/* Total Balance */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #FFE8D1' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Total Balance</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'black' }}>${totalBalance.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#F59E0B', marginTop: '4px' }}>Combined wallets</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFE8D1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: '24px' }}>
        {/* Earnings Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: 0 }}>Earnings Overview</h2>
            <div style={{ padding: '8px 12px', backgroundColor: '#F9FBFF', borderRadius: '8px', fontSize: '12px', color: '#757575', cursor: 'pointer' }}>This Week</div>
          </div>
          <div style={{ position: 'relative', height: chartHeight + 40 }}>
            <svg width="100%" height={chartHeight + 40}>
              <text x="25" y="20" fontSize="11" fill="#B5B7C0">$600</text>
              <text x="25" y={chartHeight / 2 + 5} fontSize="11" fill="#B5B7C0">$400</text>
              <text x="25" y={chartHeight - 5} fontSize="11" fill="#B5B7C0">$0</text>
              <line x1="50" y1="15" x2="100%" y2="15" stroke="#F8F9FB" strokeWidth="1" />
              <line x1="50" y1={chartHeight / 2 + 20} x2="100%" y2={chartHeight / 2 + 20} stroke="#F8F9FB" strokeWidth="1" />
              <polyline
                points={earningsData.map((d, i) => {
                  const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                  const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                  return `${x},${y}`
                }).join(' ') + ` ${lastPointX + 20},${lastPointY - 10}`}
                fill="none" stroke="#5932EA" strokeWidth="3"
              />
              {earningsData.map((d, i) => {
                const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                return <circle key={i} cx={x} cy={y} r="6" fill="white" stroke="#5932EA" strokeWidth="3" />
              })}
              {/* Live Indicator Dot */}
              <circle cx={lastPointX} cy={lastPointY} r="8" fill="#5932EA" fillOpacity="0.2">
                <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" from="0.2" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={lastPointX} cy={lastPointY} r="4" fill="#5932EA" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', marginTop: '10px' }}>
              {earningsData.map((d) => <span key={d.day} style={{ fontSize: '11px', color: '#B5B7C0' }}>{d.day}</span>)}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 24px' }}>Wallet Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Deposit Wallet', value: `$${depositBalance.toFixed(2)}`, color: '#5932EA', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
              { label: 'Withdrawal Wallet', value: `$${withdrawalBalance.toFixed(2)}`, color: '#00AC4F', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></> },
              { label: 'Total Balance', value: `$${totalBalance.toFixed(2)}`, color: '#F59E0B', icon: <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#F9FBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <span style={{ fontSize: '14px', color: '#292D32', fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'black' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {data && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 20px' }}>Training Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Footage Watched</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>0 min</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Approved Roles</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>
                {user?.current_plan_id && user.current_plan_id > 1 ? 'Employee' : 'Intern'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Certifications</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
