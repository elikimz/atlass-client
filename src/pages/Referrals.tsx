import { useEffect, useState } from 'react'
import api from '../services/api'

interface ReferralData {
  earnings: number
  users_referred: number
  trained: number
  codes: Array<{ code: string; signups: number; trained: number; earned: number }>
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '24px',
}

export default function Referrals() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    api.get('/referrals/overview')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const stats = [
    { label: 'Earnings', value: `$${data?.earnings.toFixed(2) || '0.00'}`, icon: '💵', color: '#22c55e' },
    { label: 'Users Referred', value: data?.users_referred || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Passed Training', value: data?.trained || 0, icon: '✓', color: '#8b5cf6' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Referrals</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Earn money by referring friends to Adpulse AI</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 700, color: stat.color, margin: '0 0 4px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Total {stat.label.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Referral codes */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Your Referral Codes</h2>
        {data?.codes && data.codes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.codes.map((code) => (
              <div key={code.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px', fontFamily: 'monospace' }}>
                    {code.code}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {code.signups} signups • {code.trained} trained • ${code.earned.toFixed(2)} earned
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(code.code)}
                  style={{
                    padding: '6px 12px', fontSize: '12px', fontWeight: 600,
                    backgroundColor: copied === code.code ? '#dcfce7' : '#f0f4ff',
                    color: copied === code.code ? '#16a34a' : '#6366f1',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {copied === code.code ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No referral codes yet. Generate one to get started.</p>
        )}
        <button style={{
          marginTop: '12px', width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600,
          backgroundColor: 'white', color: '#6366f1', border: '2px dashed #6366f1', borderRadius: '8px', cursor: 'pointer',
        }}>
          + Add Another Code
        </button>
      </div>

      {/* How it works */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>How It Works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { num: '1', title: 'Share Your Code', desc: 'Send your referral code to friends and colleagues.' },
            { num: '2', title: 'They Sign Up', desc: 'Your friends use your code to create an account.' },
            { num: '3', title: 'They Complete Training', desc: 'Once they finish training, you earn a bonus.' },
            { num: '4', title: 'Get Paid', desc: 'Earn $X for each friend who completes training.' },
          ].map((step) => (
            <div key={step.num} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
