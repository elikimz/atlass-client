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

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
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

  const steps = [
    {
      num: 1,
      title: 'Complete Training',
      badge: { label: 'Next Step', color: '#5932EA', bg: '#F2EFFF' },
      desc: 'Learn how to label videos accurately. Takes about 15 minutes.',
      cta: { label: 'Start Training', onClick: () => navigate('/training') },
      icon: (
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Set Up Payment',
      desc: 'Learn how payments work and add your payment details.',
      icon: (
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Do Labeling Tasks',
      desc: 'Browse and complete available labeling tasks to earn money.',
      icon: (
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
      ),
    },
  ]

  const stats = [
    {
      label: 'Footage Labeled',
      value: data?.footage_labeled_min ?? '0',
      desc: 'Total footage processed',
      icon: (
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
      )
    },
    {
      label: 'Approved Roles',
      value: data?.approved_roles ?? 'None',
      desc: 'Current active roles',
      icon: (
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
        </div>
      )
    },
    {
      label: 'Certifications',
      value: data?.certifications_earned ?? '0',
      desc: 'Badges earned',
      icon: (
        <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: '#D3FFE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      )
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0',
        backgroundColor: 'white', borderRadius: '30px', padding: '30px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)'
      }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            padding: '0 30px',
            borderRight: i < stats.length - 1 ? '1px solid #F0F0F0' : 'none'
          }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: '14px', color: '#ACACAC', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#333333' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#757575' }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Journey Card (Restored functionality in new design) */}
      <div style={{
        backgroundColor: 'white', borderRadius: '30px', padding: '40px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'black', margin: '0 0 7px' }}>Your Journey</h2>
          <p style={{ fontSize: '14px', color: '#16C098', margin: 0 }}>Follow these steps to start earning</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              display: 'flex', gap: '20px', alignItems: 'flex-start',
              paddingBottom: i < steps.length - 1 ? '24px' : '0',
              borderBottom: i < steps.length - 1 ? '1px solid #EEEEEE' : 'none'
            }}>
              <div style={{ flexShrink: 0 }}>{step.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#292D32', margin: 0 }}>{step.title}</h3>
                  {step.badge && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: step.badge.color, backgroundColor: step.badge.bg, padding: '4px 12px', borderRadius: '20px' }}>
                      {step.badge.label}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#757575', margin: '0 0 16px', lineHeight: 1.5 }}>{step.desc}</p>
                {step.cta && (
                  <button
                    onClick={step.cta.onClick}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 24px', backgroundColor: '#5932EA', color: 'white',
                      fontSize: '14px', fontWeight: 600, border: 'none', borderRadius: '10px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {step.cta.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
