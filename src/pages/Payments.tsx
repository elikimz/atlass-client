import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// Removed unused PaymentOverview interface to fix build error

interface UserData {
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
  performance_bonus_balance: number
  /**
   * pending_refund: Upgrade refund amount still pending (legacy lock records).
   * In the current flow, upgrade refunds are released immediately.
   */
  pending_refund?: number
}

interface ReferralSummary {
  earnings: number
  users_referred: number
  task_rebate: number
}



interface DashboardSummary {
  today_earnings: number
  this_week_earnings: number
  this_month_earnings: number
  total_earnings: number
  task_earnings: number
  referral_commission: number
  task_rebate_commission: number
  bonus_refunded: number
  pending_refund: number
  recent_activity: {
    id: number
    description: string
    amount: string
    status: string
  }[]
}

const infoCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '12px',
  border: '1px solid var(--border-main)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  boxShadow: 'var(--card-shadow)',
}

export default function Payments() {
  const navigate = useNavigate()
  // Removed unused overview state to fix build error
  const [user, setUser] = useState<UserData | null>(null)
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null)

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/referrals/summary'),
      api.get('/dashboard/summary'),
    ])
      .then(([userRes, referralsRes, dashboardRes]) => {
        setUser(userRes.data)
        setReferrals(referralsRes.data)
        setDashboard(dashboardRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Use dashboard earnings data directly
  const todayEarnings = dashboard?.today_earnings || 0
  const weekEarnings = dashboard?.this_week_earnings || 0
  const monthEarnings = dashboard?.this_month_earnings || 0

  // Total Earnings Rule: cumulative profit-generating activities ONLY.
  // = Task Earnings + Invite Commissions + Task Rebates + Released Upgrade Refunds
  // Deposit recharges (total_paid) are NEVER included here.
  const totalEarnings = dashboard?.total_earnings || 0
  const pendingRefund = dashboard?.pending_refund || 0

  const actionButtons = [
    { label: 'Recharge', subtext: 'Add Funds', icon: '⚡', route: '/payments/recharge' },
    { label: 'Payout', subtext: 'Send Payment', icon: '💸', route: '/payments/payout' },
    { label: 'Withdrawal Accounts', subtext: 'Manage Accounts', icon: '🏦', route: '/withdrawal-accounts' },
  ]

  const walletCards = [
    {
      id: 'deposit',
      title: 'Deposit Wallet',
      subtitle: 'Recharged funds only',
      amount: user?.deposit_wallet_balance || 0,
      icon: '💼',
      color: '#5932EA'
    },
    {
      id: 'withdrawal',
      title: 'Withdrawal Wallet',
      subtitle: 'Cashable earnings',
      amount: user?.withdrawal_wallet_balance || 0,
      icon: '💳',
      color: '#00B4D8'
    },
    {
      id: 'earnings',
      title: 'Total Earnings',
      subtitle: 'Excl. recharges',
      amount: totalEarnings,
      icon: '💰',
      color: '#22c55e'
    },
    ...(pendingRefund > 0 ? [{
      id: 'locked',
      title: 'Pending Refund',
      subtitle: '🔒 Pending release',
      amount: pendingRefund,
      icon: '🔒',
      color: '#f59e0b'
    }] : []),
    {
      id: 'referral',
      title: 'Invite Commissions',
      subtitle: 'First-purchase only',
      amount: referrals?.earnings || 0,
      icon: '👥',
      color: '#f59e0b'
    },
    {
      id: 'rebate',
      title: 'Task Rebates',
      subtitle: 'Downline activity',
      amount: referrals?.task_rebate || 0,
      icon: '🎬',
      color: '#10b981'
    },
  ]

  const earningPeriods = [
    { label: "Today's Earnings", amount: todayEarnings },
    { label: "This Week's Earnings", amount: weekEarnings },
    { label: "This Month's Earnings", amount: monthEarnings },
  ]



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Payments</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {actionButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => navigate(btn.route)}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              borderRadius: '12px',
              padding: '20px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <span style={{ fontSize: '28px' }}>{btn.icon}</span>
            <span style={{ color: 'var(--text-heading)', fontSize: '15px', fontWeight: 700 }}>{btn.label}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{btn.subtext}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {walletCards.map((w) => (
          <div key={w.id} style={infoCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${w.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{w.icon}</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{w.title}</h3>
                {'subtitle' in w && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{(w as any).subtitle}</p>}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>USD {w.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Current Balance</p>
            </div>
          </div>
        ))}

        <div style={infoCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📅</div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Earning Periods</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {earningPeriods.map((p, i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-main)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{p.label}:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>USD {p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
