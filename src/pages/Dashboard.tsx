import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '24px',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const firstName = localStorage.getItem('user_first_name') || 'there'

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
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const steps = [
    {
      num: 1,
      title: 'Complete Training',
      badge: { label: 'Next Step', color: '#6366f1', bg: '#ede9fe' },
      desc: 'Learn how to label videos accurately. Takes about 15 minutes.',
      cta: { label: 'Start Training', onClick: () => navigate('/training') },
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
    },
    {
      num: 2,
      title: 'Set Up Payment',
      badge: null,
      desc: 'Learn how payments work and add your payment details.',
      cta: null,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      num: 3,
      title: 'Do Labeling Tasks',
      badge: null,
      desc: 'Browse and complete available labeling tasks to earn money.',
      cta: null,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Welcome, {firstName}!
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Here's what you need to do to start earning.
        </p>
      </div>

      {/* Journey */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Your Journey</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              display: 'flex', gap: '16px', paddingBottom: i < steps.length - 1 ? '20px' : '0',
              borderBottom: i < steps.length - 1 ? '1px solid #f3f4f6' : 'none',
              marginBottom: i < steps.length - 1 ? '20px' : '0',
            }}>
              {/* Number */}
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: step.num === 1 ? '#6366f1' : '#f3f4f6',
                  color: step.num === 1 ? 'white' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700,
                }}>
                  {step.num}
                </div>
              </div>
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>{step.title}</h3>
                  {step.badge && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: step.badge.color, backgroundColor: step.badge.bg, padding: '2px 10px', borderRadius: '20px' }}>
                      {step.badge.label}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{step.desc}</p>
                {step.cta && (
                  <button
                    onClick={step.cta.onClick}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 16px', backgroundColor: '#6366f1', color: 'white',
                      fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '7px', cursor: 'pointer',
                    }}
                  >
                    {step.cta.label}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Icon */}
              <div style={{ flexShrink: 0, paddingTop: '4px' }}>{step.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Footage Labeled</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            {data?.footage_labeled_min ?? '--'}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total footage processed</p>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Approved Roles</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            {data?.approved_roles ?? 'None yet'}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Certifications earned</p>
        </div>
      </div>
    </div>
  )
}
