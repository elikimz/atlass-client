import { useEffect, useState } from 'react'
import api from '../services/api'

interface PaymentOverview {
  total_paid: number
  previous_unpaid: number
  current_pending: number
}

interface PaymentHistory {
  period: string
  amount: number
  status: string
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '24px',
}

export default function Payments() {
  const [overview, setOverview] = useState<PaymentOverview | null>(null)
  const [history, setHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/payments/overview'),
      api.get('/payments/history'),
    ])
      .then(([overviewRes, historyRes]) => {
        setOverview(overviewRes.data)
        setHistory(historyRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const stats = [
    { label: 'Total Paid', value: `$${overview?.total_paid.toFixed(2) || '0.00'}`, icon: '💵', color: '#22c55e' },
    { label: 'Previous Unpaid', value: `$${overview?.previous_unpaid.toFixed(2) || '0.00'}`, icon: '⏳', color: '#f59e0b' },
    { label: 'Pending', value: `$${overview?.current_pending.toFixed(2) || '0.00'}`, icon: '📅', color: '#f59e0b' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'paid') return { label: 'Paid', color: '#16a34a', bg: '#dcfce7' }
    if (status === 'pending') return { label: 'Pending', color: '#b45309', bg: '#fef3c7' }
    return { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Payments</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Manage your payment method and view your earnings.</p>
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

      {/* Payment Method */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>💳</span>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Payment Method</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', margin: 0 }}>How you'll receive your earnings</p>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '12px', margin: '0 0 12px' }}>
            You can choose between crypto (USDC/USDT) or Wise bank transfer.
          </p>
          <button style={{
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer',
          }}>
            Set Up Payment Method
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Payment History</h2>
        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((payment, i) => {
              const badge = statusBadge(payment.status)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{payment.period}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Status: {payment.status}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                      ${payment.amount.toFixed(2)}
                    </p>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: badge.color, backgroundColor: badge.bg, padding: '2px 8px', borderRadius: '20px' }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>No payment history yet</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Complete tasks to start earning</p>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Requirements for Payment</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Complete training certification',
            'Maintain quality score above 85%',
            'Complete at least 10 tasks',
            'Verify payment method',
          ].map((req, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: '14px', color: '#374151' }}>{req}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
