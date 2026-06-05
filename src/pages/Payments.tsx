import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface PaymentOverview {
  total_paid: number
  previous_unpaid: number
  current_pending: number
}

interface UserData {
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
  performance_bonus_balance: number
}

interface ReferralSummary {
  earnings: number
  users_referred: number
  task_rebate: number
}

interface PaymentHistory {
  period: string
  amount: number
  status: string
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  padding: '20px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}

const cardHover: React.CSSProperties = {
  ...card,
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
  transform: 'translateY(-2px)',
}

export default function Payments() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<PaymentOverview | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null)
  const [history, setHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/payments/overview'),
      api.get('/auth/me'),
      api.get('/referrals/summary'),
      api.get('/payments/history'),
    ])
      .then(([overviewRes, userRes, referralsRes, historyRes]) => {
        setOverview(overviewRes.data)
        setUser(userRes.data)
        setReferrals(referralsRes.data)
        setHistory(historyRes.data)
      })
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

  // Calculate today, week, and month earnings from history
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayEarnings = history
    .filter(h => {
      const hDate = new Date(h.period)
      return hDate >= today && h.status === 'paid'
    })
    .reduce((sum, h) => sum + h.amount, 0)

  const weekEarnings = history
    .filter(h => {
      const hDate = new Date(h.period)
      return hDate >= weekAgo && h.status === 'paid'
    })
    .reduce((sum, h) => sum + h.amount, 0)

  const monthEarnings = history
    .filter(h => {
      const hDate = new Date(h.period)
      return hDate >= monthAgo && h.status === 'paid'
    })
    .reduce((sum, h) => sum + h.amount, 0)

  // Calculate total earnings: tasks + referrals + rebates
  const totalEarnings = (overview?.total_paid || 0) + (referrals?.earnings || 0) + (referrals?.task_rebate || 0)

  const actionButtons = [
    { label: 'Recharge', subtext: 'Add Funds', icon: '⚡', route: '/payments/recharge' },
    { label: 'Payout', subtext: 'Send Payment', icon: '💸', route: '/payments/payout' },
    { label: 'Withdrawal Accounts', subtext: 'Manage Accounts', icon: '🏦', route: '/payments/withdrawal' },
  ]

  const walletCards = [
    {
      id: 'deposit',
      title: 'Deposit Wallet',
      amount: user?.deposit_wallet_balance || 0,
      icon: '💼',
      color: '#5932EA',
      source: 'Source: External Top-up or Via Direct Deposit',
      route: '/payments/deposit',
    },
    {
      id: 'withdrawal',
      title: 'Withdrawal Wallet',
      amount: user?.withdrawal_wallet_balance || 0,
      icon: '💳',
      color: '#00B4D8',
      source: 'Source: Available Balance or Cleared Funds',
      route: '/payments/withdrawal',
    },
    {
      id: 'earnings',
      title: 'Total Earnings',
      amount: totalEarnings,
      icon: '💰',
      color: '#22c55e',
      source: 'Formula: [Tasks + Referrals + Rebates]',
      route: '/payments/earnings',
    },
    {
      id: 'referral',
      title: 'Referral Commission',
      amount: referrals?.earnings || 0,
      icon: '👥',
      color: '#f59e0b',
      source: 'Source: Team Network Purchases',
      route: '/payments/referral',
    },
    {
      id: 'rebate',
      title: 'Task Rebate',
      amount: referrals?.task_rebate || 0,
      icon: '🎬',
      color: '#10b981',
      source: 'Source: Completed Video Tasks By Team',
      route: '/payments/rebate',
    },
  ]

  const earningPeriods = [
    { label: "Today's Earnings", amount: todayEarnings },
    { label: "This Week's Earnings", amount: weekEarnings },
    { label: "This Month's Earnings", amount: monthEarnings },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Payments</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Manage your payment method and view your earnings.</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {actionButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => navigate(btn.route)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              fontSize: '13px',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: '24px' }}>{btn.icon}</span>
            <span style={{ color: '#111827' }}>{btn.label}</span>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{btn.subtext}</span>
          </button>
        ))}
      </div>

      {/* Wallet & Earnings Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Wallet Cards */}
        {walletCards.slice(0, 4).map((walletCard) => (
          <div
            key={walletCard.id}
            onClick={() => navigate(walletCard.route)}
            onMouseEnter={() => setHoveredCard(walletCard.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={hoveredCard === walletCard.id ? cardHover : card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${walletCard.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {walletCard.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{walletCard.title}</h3>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: walletCard.color, margin: '8px 0' }}>
              USD {walletCard.amount.toFixed(2)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0' }}>Current Balance</p>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              {walletCard.source}
            </div>
          </div>
        ))}

        {/* Earning Periods Card */}
        <div
          onClick={() => navigate('/payments/periods')}
          onMouseEnter={() => setHoveredCard('periods')}
          onMouseLeave={() => setHoveredCard(null)}
          style={hoveredCard === 'periods' ? cardHover : card}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#a78bfa20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              📅
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Earning Periods</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {earningPeriods.map((period, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{period.label}:</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>USD {period.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
            Source: Live Server Timestamp
          </div>
        </div>
      </div>

      {/* Total Earnings Card - Full Width */}
      <div
        onClick={() => navigate('/payments/earnings')}
        onMouseEnter={() => setHoveredCard('total-earnings')}
        onMouseLeave={() => setHoveredCard(null)}
        style={hoveredCard === 'total-earnings' ? cardHover : card}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#22c55e20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            💰
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Total Earnings</h3>
        </div>
        <p style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e', margin: '8px 0' }}>
          USD {totalEarnings.toFixed(2)}
        </p>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0' }}>Combined sum of all money ever made on the platform</p>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
          Formula: [Tasks + Referrals + Rebates]
        </div>
      </div>

      {/* Payment History */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Payment History</h2>
        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.slice(0, 5).map((payment, i) => {
              const statusBadge = payment.status === 'paid' 
                ? { label: 'Paid', color: '#16a34a', bg: '#dcfce7' }
                : payment.status === 'pending'
                ? { label: 'Pending', color: '#b45309', bg: '#fef3c7' }
                : { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' }
              
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
                    <span style={{ fontSize: '11px', fontWeight: 600, color: statusBadge.color, backgroundColor: statusBadge.bg, padding: '2px 8px', borderRadius: '20px' }}>
                      {statusBadge.label}
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
    </div>
  )
}
