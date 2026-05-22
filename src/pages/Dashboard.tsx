import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

interface UserData {
  first_name: string
  last_name: string
  email: string
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    
    // Fetch dashboard summary and user info in parallel
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/auth/me')
    ]).then(([summaryRes, userRes]) => {
      setData(summaryRes.data)
      setUser(userRes.data)
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

  const availableBalance = 124.50
  const totalEarned = 1245.30
  const videosWatched = 186
  const totalRewards = 125.80

  const earningsData = [
    { day: 'Mon', value: 100 }, { day: 'Tue', value: 220 }, { day: 'Wed', value: 150 },
    { day: 'Thu', value: 300 }, { day: 'Fri', value: 450 }, { day: 'Sat', value: 350 }, { day: 'Sun', value: 600 },
  ]

  const maxValue = Math.max(...earningsData.map(d => d.value))
  const chartHeight = 200
  const chartWidth = isMobile ? windowWidth - 80 : (isTablet ? windowWidth - 360 : windowWidth - 460)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      <div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 700, color: 'black', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dashboard <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>Welcome back, {firstName}! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
        gap: '16px',
      }}>
        {[
          { label: 'Available Balance', value: `$${availableBalance}`, bg: '#F2EFFF', iconColor: '#5932EA', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
          { label: 'Total Earned', value: `$${totalEarned}`, bg: '#D3FFE7', iconColor: '#00AC4F', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></> },
          { label: 'Videos Watched', value: videosWatched, bg: '#D4E8FF', iconColor: '#4A90E2', icon: <polygon points="5 3 19 12 5 21 5 3"/> },
          { label: 'Total Rewards', value: `$${totalRewards}`, bg: '#FFE8D1', iconColor: '#F59E0B', icon: <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/> },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: 'black' }}>{stat.value}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stat.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{stat.icon}</svg>
            </div>
          </div>
        ))}
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
                }).join(' ')}
                fill="none" stroke="#5932EA" strokeWidth="3"
              />
              {earningsData.map((d, i) => {
                const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                return <circle key={i} cx={x} cy={y} r="6" fill="white" stroke="#5932EA" strokeWidth="3" />
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', marginTop: '10px' }}>
              {earningsData.map((d) => <span key={d.day} style={{ fontSize: '11px', color: '#B5B7C0' }}>{d.day}</span>)}
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 24px' }}>Quick Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Available Balance', value: `$${availableBalance}`, color: '#5932EA', icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
              { label: 'Total Earned', value: `$${totalEarned}`, color: '#00AC4F', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></> },
              { label: 'Videos Watched', value: videosWatched, color: '#4A90E2', icon: <polygon points="5 3 19 12 5 21 5 3"/> },
              { label: 'Total Rewards', value: `$${totalRewards}`, color: '#F59E0B', icon: <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/> },
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
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Footage Labeled</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>{data.footage_labeled_min} min</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Approved Roles</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>{data.approved_roles || 'None'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>Certifications</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'black' }}>{data.certifications_earned}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
