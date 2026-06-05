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

interface DashboardSummary {
  recent_activity: {
    id: number
    description: string
    amount: string
    status: string
  }[]
}

const infoCard: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}

export default function Payments() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<PaymentOverview | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null)
  const [history, setHistory] = useState<PaymentHistory[]>([])
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/payments/overview'),
      api.get('/auth/me'),
      api.get('/referrals/summary'),
      api.get('/payments/history'),
      api.get('/dashboard/summary'),
    ])
      .then(([overviewRes, userRes, referralsRes, historyRes, dashboardRes]) => {
        setOverview(overviewRes.data)
        setUser(userRes.data)
        setReferrals(referralsRes.data)
        setHistory(historyRes.data)
        setDashboard(dashboardRes.data)
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
  
  // Earning periods logic:
  // 1. Check payment history (for settled payouts)
  // 2. Check dashboard recent activity (for recent task rewards)
  const recentTaskEarnings = dashboard?.recent_activity && Array.isArray(dashboard.recent_activity)
    ? dashboard.recent_activity
      .filter(act => act.status === 'Completed' || act.status === 'Paid')
      .map(act => parseFloat(act.amount.replace(/[^0-9.]/g, '')))
      .reduce((sum, amt) => sum + (isNaN(amt) ? 0 : amt), 0)
    : 0

  const safeHistory = Array.isArray(history) ? history : []

  const todayEarnings = safeHistory
    .filter(h => h.status === 'paid' && (h.period.includes(todayStr) || !isNaN(Date.parse(h.period)) && new Date(h.period) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())))
    .reduce((sum, h) => sum + h.amount, 0) + (recentTaskEarnings > 0 ? recentTaskEarnings : 0)

  const weekEarnings = safeHistory
    .filter(h => h.status === 'paid' && !isNaN(Date.parse(h.period)) && new Date(h.period) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, h) => sum + h.amount, 0) + (recentTaskEarnings > 0 ? recentTaskEarnings : 0)

  const monthEarnings = safeHistory
    .filter(h => h.status === 'paid' && h.period.includes(todayStr))
    .reduce((sum, h) => sum + h.amount, 0) + (recentTaskEarnings > 0 ? recentTaskEarnings : 0)

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
    },
    {
      id: 'withdrawal',
      title: 'Withdrawal Wallet',
      amount: user?.withdrawal_wallet_balance || 0,
      icon: '💳',
      color: '#00B4D8',
    },
    {
      id: 'earnings',
      title: 'Total Earnings',
      amount: totalEarnings,
      icon: '💰',
      color: '#22c55e',
    },
    {
      id: 'referral',
      title: 'Referral Commission',
      amount: referrals?.earnings || 0,
      icon: '👥',
      color: '#f59e0b',
    },
    {
      id: 'rebate',
      title: 'Task Rebate',
      amount: referrals?.task_rebate || 0,
      icon: '🎬',
      color: '#10b981',
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

      {/* Top Action Buttons (ONLY CLICKABLE ITEMS) */}
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

      {/* Main 6 Cards Grid (2 columns) - NON-CLICKABLE INFORMATION DISPLAY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* Wallet Cards */}
        {walletCards.map((w) => (
          <div key={w.id} style={infoCard}>
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


          </div>
        ))}

        {/* Earning Periods Card */}
        <div style={infoCard}>
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


        </div>
      </div>

      {/* Payment History Section */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Recent Transactions</h2>
        
        {history && history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.slice(0, 5).map((payment) => {
              const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
                pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
                paid: { bg: '#ecfdf5', text: '#065f46', icon: '✓' },
                rejected: { bg: '#fef2f2', text: '#991b1b', icon: '✕' },
                cancelled: { bg: '#f3f4f6', text: '#374151', icon: '−' },
              }
              const typeColors: { [key: string]: { bg: string; text: string; icon: string } } = {
                deposit: { bg: '#dbeafe', text: '#1e40af', icon: '📥' },
                payout: { bg: '#fce7f3', text: '#be185d', icon: '📤' },
              }
              const statusColor = statusColors[payment.status] || statusColors.pending
              const typeColor = typeColors[payment.type] || typeColors.deposit
              
              return (
                <div
                  key={payment.id}
                  style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  {/* Left: Type and Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      backgroundColor: typeColor.bg, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {typeColor.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {payment.type === 'deposit' ? 'Deposit' : 'Payout'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>
                        {payment.period}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Amount */}
                  <div style={{ textAlign: 'right', marginRight: '16px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      ${payment.amount.toFixed(2)}
                    </p>
                    {payment.payment_method && (
                      <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0' }}>
                        {payment.payment_method}
                      </p>
                    )}
                  </div>

                  {/* Right: Status */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    backgroundColor: statusColor.bg, color: statusColor.text,
                    padding: '6px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap'
                  }}>
                    <span>{statusColor.icon}</span>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              )
            })}
            {history.length > 5 && (
              <button
                onClick={() => navigate('/payments/history')}
                style={{
                  padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB',
                  backgroundColor: 'white', color: '#3B82F6', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'
                }}
              >
                View All Transactions →
              </button>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '32px',
            textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
