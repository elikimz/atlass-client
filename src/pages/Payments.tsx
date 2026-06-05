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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
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

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  const todayEarnings = history
    .filter(h => h.status === 'paid' && (h.period.includes(todayStr) || !isNaN(Date.parse(h.period)) && new Date(h.period) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())))
    .reduce((sum, h) => sum + h.amount, 0)

  const weekEarnings = history
    .filter(h => h.status === 'paid' && !isNaN(Date.parse(h.period)) && new Date(h.period) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, h) => sum + h.amount, 0)

  const monthEarnings = history
    .filter(h => h.status === 'paid' && h.period.includes(todayStr))
    .reduce((sum, h) => sum + h.amount, 0)

  const totalEarnings = (overview?.total_paid || 0) + (user?.withdrawal_wallet_balance || 0)

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Payments</h1>
      </div>

      {/* Top Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {actionButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => navigate(btn.route)}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: '28px' }}>{btn.icon}</span>
            <span style={{ color: '#111827', fontSize: '15px', fontWeight: 700 }}>{btn.label}</span>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{btn.subtext}</span>
          </button>
        ))}
      </div>

      {/* Main 6 Cards Grid (2 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* First 5 Wallet Cards */}
        {walletCards.map((w) => (
          <div
            key={w.id}
            onClick={() => navigate(w.route)}
            onMouseEnter={() => setHoveredCard(w.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={hoveredCard === w.id ? cardHover : card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                backgroundColor: `${w.color}15`, display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '18px' 
              }}>
                {w.icon}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>{w.title}</h3>
            </div>
            
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                USD {w.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Current Balance</p>
            </div>

            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              {w.source}
            </div>
          </div>
        ))}

        {/* 6th Card: Earning Periods */}
        <div
          onClick={() => navigate('/payments/periods')}
          onMouseEnter={() => setHoveredCard('periods')}
          onMouseLeave={() => setHoveredCard(null)}
          style={hoveredCard === 'periods' ? cardHover : card}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '8px', 
              backgroundColor: '#a78bfa15', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '18px' 
            }}>
              📅
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Earning Periods</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {earningPeriods.map((p, i) => (
              <div key={i} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{p.label}:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>USD {p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            Source: Live Server Timestamp
          </div>
        </div>
      </div>
    </div>
  )
}
