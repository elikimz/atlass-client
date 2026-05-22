import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1200)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1200)
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

  const stats = [
    {
      label: 'Total Customers',
      value: '5,423',
      trend: '16% this month',
      trendUp: true,
      icon: (
        <div style={{ width: isMobile ? '60px' : '84px', height: isMobile ? '60px' : '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={isMobile ? "30" : "42"} height={isMobile ? "30" : "42"} viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
      )
    },
    {
      label: 'Members',
      value: '1,893',
      trend: '1% this month',
      trendUp: false,
      icon: (
        <div style={{ width: isMobile ? '60px' : '84px', height: isMobile ? '60px' : '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={isMobile ? "30" : "42"} height={isMobile ? "30" : "42"} viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
          </svg>
        </div>
      )
    },
    {
      label: 'Active Now',
      value: '189',
      icon: (
        <div style={{ width: isMobile ? '60px' : '84px', height: isMobile ? '60px' : '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={isMobile ? "30" : "42"} height={isMobile ? "30" : "42"} viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
      ),
      avatars: true
    }
  ]

  const customers = [
    { name: 'Jane Cooper', company: 'Microsoft', phone: '(225) 555-0118', email: 'jane@microsoft.com', country: 'United States', status: 'Active' },
    { name: 'Floyd Miles', company: 'Yahoo', phone: '(205) 555-0100', email: 'floyd@yahoo.com', country: 'Kiribati', status: 'Inactive' },
    { name: 'Ronald Richards', company: 'Adobe', phone: '(302) 555-0107', email: 'ronald@adobe.com', country: 'Israel', status: 'Inactive' },
    { name: 'Marvin McKinney', company: 'Tesla', phone: '(252) 555-0126', email: 'marvin@tesla.com', country: 'Iran', status: 'Active' },
    { name: 'Jerome Bell', company: 'Google', phone: '(603) 555-0123', email: 'jerome@google.com', country: 'Reunion', status: 'Active' },
    { name: 'Kathryn Murphy', company: 'Microsoft', phone: '(406) 555-0120', email: 'kathryn@microsoft.com', country: 'Curaçao', status: 'Active' },
    { name: 'Jacob Jones', company: 'Yahoo', phone: '(209) 555-0104', email: 'jacob@yahoo.com', country: 'Brazil', status: 'Active' },
    { name: 'Kristin Watson', company: 'Facebook', phone: '(212) 555-0110', email: 'kristin@facebook.com', country: 'Åland Islands', status: 'Active' },
  ]

  const journeySteps = [
    {
      num: 1,
      title: 'Complete Training',
      badge: { label: 'Next Step', color: '#5932EA', bg: '#F2EFFF' },
      desc: 'Learn how to label videos accurately.',
      cta: { label: 'Start Training', onClick: () => navigate('/training') },
    },
    {
      num: 2,
      title: 'Set Up Payment',
      desc: 'Add your payment details.',
    },
    {
      num: 3,
      title: 'Do Labeling Tasks',
      desc: 'Complete tasks to earn money.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '40px' }}>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'), 
        gap: '20px',
        backgroundColor: 'white', borderRadius: '30px', padding: isMobile ? '20px' : '30px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)'
      }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            padding: isMobile ? '10px 0' : '0 30px',
            borderRight: (!isMobile && !isTablet && i < stats.length - 1) ? '1px solid #F0F0F0' : 'none',
            borderBottom: (isMobile && i < stats.length - 1) ? '1px solid #F0F0F0' : 'none',
          }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: '14px', color: '#ACACAC', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 600, color: '#333333' }}>{stat.value}</div>
              {stat.trend && (
                <div style={{ fontSize: '12px', color: stat.trendUp ? '#00AC4F' : '#D0004B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: stat.trendUp ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                  <span style={{ fontWeight: 600 }}>{stat.trend.split(' ')[0]}</span>
                  <span style={{ color: '#292D32' }}>{stat.trend.split(' ').slice(1).join(' ')}</span>
                </div>
              )}
              {stat.avatars && (
                <div style={{ display: 'flex', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} style={{
                      width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                      backgroundColor: '#E0E0E0', marginLeft: n > 1 ? '-8px' : '0'
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Journey Quick View */}
      <div style={{
        backgroundColor: 'white', borderRadius: '30px', padding: isMobile ? '20px' : '30px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: 'black', margin: '0 0 4px' }}>Your Journey</h2>
          <p style={{ fontSize: '14px', color: '#16C098', margin: 0 }}>Progress to earning</p>
        </div>
        <div style={{ 
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
          gap: isMobile ? '16px' : '20px', width: isMobile ? '100%' : 'auto' 
        }}>
          {journeySteps.map((step) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: step.num === 1 ? '#5932EA' : '#F0F0F0',
                color: step.num === 1 ? 'white' : '#9197B3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 600, flexShrink: 0
              }}>{step.num}</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{step.title}</div>
              {step.cta && (
                <button onClick={step.cta.onClick} style={{
                  backgroundColor: '#5932EA', color: 'white', border: 'none',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
                  marginLeft: 'auto'
                }}>Start</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real Stats Grid */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'), 
        gap: '20px'
      }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.3)' }}>
          <div style={{ fontSize: '12px', color: '#ACACAC', marginBottom: '8px', textTransform: 'uppercase' }}>Footage Labeled</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#333333' }}>{data?.footage_labeled_min ?? '0'} min</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.3)' }}>
          <div style={{ fontSize: '12px', color: '#ACACAC', marginBottom: '8px', textTransform: 'uppercase' }}>Approved Roles</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#333333' }}>{data?.approved_roles ?? 'None'}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.3)' }}>
          <div style={{ fontSize: '12px', color: '#ACACAC', marginBottom: '8px', textTransform: 'uppercase' }}>Certifications</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#333333' }}>{data?.certifications_earned ?? '0'}</div>
        </div>
      </div>

      {/* Customers Table Card */}
      <div style={{
        backgroundColor: 'white', borderRadius: '30px', padding: isMobile ? '20px' : '30px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          justifyContent: 'space-between', gap: '20px', marginBottom: '40px' 
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 600, color: 'black', margin: '0 0 7px' }}>All Customers</h2>
            <p style={{ fontSize: '14px', color: '#16C098', margin: 0 }}>Active Members</p>
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '15px', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
              <input
                type="text"
                placeholder="Search"
                style={{
                  width: isMobile ? '100%' : '154px', padding: '7px 10px 7px 35px',
                  backgroundColor: '#F9FBFF', border: 'none', borderRadius: '10px',
                  fontSize: '12px', color: '#B5B7C0', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#F9FBFF', padding: '7px 15px', borderRadius: '10px',
              fontSize: '12px', color: '#7E7E7E', cursor: 'pointer', width: isMobile ? '100%' : 'auto',
              justifyContent: 'center', boxSizing: 'border-box'
            }}>
              <span>Short by : <span style={{ color: '#3D3C42', fontWeight: 600 }}>Newest</span></span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #EEEEEE', textAlign: 'left' }}>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0' }}>Customer Name</th>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0' }}>Company</th>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0' }}>Phone Number</th>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0' }}>Email</th>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0' }}>Country</th>
                <th style={{ padding: '0 0 14px', fontSize: '14px', fontWeight: 500, color: '#B5B7C0', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, i) => (
                <tr key={i} style={{ borderBottom: i < customers.length - 1 ? '1px solid #EEEEEE' : 'none' }}>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{customer.name}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{customer.company}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{customer.phone}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{customer.email}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: 500, color: '#292D32' }}>{customer.country}</td>
                  <td style={{ padding: '20px 0', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
                      backgroundColor: customer.status === 'Active' ? '#D3FFE7' : '#FFC5C5',
                      color: customer.status === 'Active' ? '#008767' : '#DF0404',
                      border: `1px solid ${customer.status === 'Active' ? '#00B087' : '#DF0404'}`,
                      display: 'inline-block', width: '80px'
                    }}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', 
          alignItems: 'center', justifyContent: 'space-between', 
          gap: '20px', marginTop: '30px' 
        }}>
          <p style={{ fontSize: '14px', color: '#B5B7C0', textAlign: isMobile ? 'center' : 'left' }}>
            Showing data 1 to 8 of  256K entries
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #EEEEEE', backgroundColor: '#F5F5F5', color: '#404B52', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {[1, 2, 3, 4].map((n) => (
              <button key={n} style={{
                width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #EEEEEE',
                backgroundColor: n === 1 ? '#5932EA' : '#F5F5F5',
                color: n === 1 ? 'white' : '#404B52',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}>{n}</button>
            ))}
            <span style={{ color: '#404B52' }}>...</span>
            <button style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #EEEEEE', backgroundColor: '#F5F5F5', color: '#404B52', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>40</button>
            <button style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #EEEEEE', backgroundColor: '#F5F5F5', color: '#404B52', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
