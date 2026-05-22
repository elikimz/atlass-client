import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    
    api.get('/dashboard/summary')
      .then((r) => setData(r.data))
      .catch(console.error)
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

  const firstName = localStorage.getItem('user_first_name') || 'John'

  const availableBalance = 124.50
  const totalEarned = 1245.30
  const videosWatched = 186
  const totalRewards = 125.80

  const earningsData = [
    { day: 'Mon', value: 100 },
    { day: 'Tue', value: 220 },
    { day: 'Wed', value: 150 },
    { day: 'Thu', value: 300 },
    { day: 'Fri', value: 450 },
    { day: 'Sat', value: 350 },
    { day: 'Sun', value: 600 },
  ]

  const maxValue = Math.max(...earningsData.map(d => d.value))
  const chartHeight = 200
  const chartWidth = isMobile ? windowWidth - 70 : windowWidth - 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'black', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dashboard
          <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>Welcome back, {firstName}! Here's your overview.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
        gap: '16px',
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Available Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'black' }}>${availableBalance}</div>
          </div>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            backgroundColor: '#F2EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Total Earned</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'black' }}>${totalEarned}</div>
          </div>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Videos Watched</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'black' }}>{videosWatched}</div>
          </div>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            backgroundColor: '#D4E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Total Rewards</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'black' }}>${totalRewards}</div>
          </div>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            backgroundColor: '#FFE8D1', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
            </svg>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: '16px', padding: '20px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: 0 }}>Earnings Overview</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', backgroundColor: '#F9FBFF', borderRadius: '8px',
            fontSize: '12px', color: '#757575', cursor: 'pointer'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            This Week
          </div>
        </div>

        <div style={{ position: 'relative', height: chartHeight + 40, marginBottom: '20px' }}>
          <svg width="100%" height={chartHeight + 40} style={{ position: 'absolute', top: 0, left: 0 }}>
            <text x="30" y="20" fontSize="12" fill="#B5B7C0">$600</text>
            <text x="30" y={chartHeight / 2 + 5} fontSize="12" fill="#B5B7C0">$400</text>
            <text x="30" y={chartHeight - 5} fontSize="12" fill="#B5B7C0">$0</text>
            <line x1="50" y1="15" x2="100%" y2="15" stroke="#F0F0F0" strokeWidth="1" />
            <line x1="50" y1={chartHeight / 2 + 20} x2="100%" y2={chartHeight / 2 + 20} stroke="#F0F0F0" strokeWidth="1" />
            <polyline
              points={earningsData.map((d, i) => {
                const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="#5932EA"
              strokeWidth="2"
            />
            {earningsData.map((d, i) => {
              const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
              const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
              return (
                <circle key={i} cx={x} cy={y} r="5" fill="white" stroke="#5932EA" strokeWidth="2" />
              )
            })}
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', paddingRight: '20px' }}>
            {earningsData.map((d) => (
              <span key={d.day} style={{ fontSize: '12px', color: '#B5B7C0' }}>{d.day}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white', borderRadius: '16px', padding: '20px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 20px' }}>Quick Summary</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Available Balance', value: `$${availableBalance}`, icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            ) },
            { label: 'Total Earned', value: `$${totalEarned}`, icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            ) },
            { label: 'Videos Watched', value: videosWatched, icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            ) },
            { label: 'Total Rewards', value: `$${totalRewards}`, icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
              </svg>
            ) },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < 3 ? '16px' : '0', borderBottom: i < 3 ? '1px solid #F0F0F0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F9FBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '14px', color: '#292D32', fontWeight: 500 }}>{item.label}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'black' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {data && (
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'black', margin: '0 0 16px' }}>Your Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#757575' }}>Footage Labeled</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'black' }}>{data.footage_labeled_min} min</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#757575' }}>Approved Roles</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'black' }}>{data.approved_roles || 'None'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#757575' }}>Certifications</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'black' }}>{data.certifications_earned}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
