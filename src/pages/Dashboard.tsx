import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

interface DashboardData {
  footage_labeled_min: number
  today_earnings: number
  this_week_earnings: number
  this_month_earnings: number
  approved_roles: string
  certifications_earned: number
  earnings_history: { day: string; value: number }[]
  total_earnings: number
  task_earnings: number
  referral_commission: number
  task_rebate_commission: number
  /**
   * bonus_refunded: Sum of RELEASED upgrade refunds (post 72-hour lock).
   * These are already cashable and counted in Total Earnings.
   */
  bonus_refunded: number
  /**
   * pending_refund: Sum of upgrade refunds still within the 3-day lock.
   * NOT counted in Total Earnings yet — displayed separately as "Locked".
   */
  pending_refund: number
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  /**
   * deposit_wallet_balance:
   *   = Total Funds Recharged − Funds Spent on Plan Purchases/Upgrades
   * This wallet NEVER includes earned income, commissions, or rebates.
   */
  deposit_wallet_balance: number
  /**
   * withdrawal_wallet_balance:
   *   Cashable earnings wallet. Receives task rewards, rebates, invite
   *   commissions, and released upgrade refunds. Never receives recharges.
   */
  withdrawal_wallet_balance: number
  /**
   * performance_bonus_balance: Legacy field kept for backward compatibility.
   */
  performance_bonus_balance: number
}

export default function Dashboard() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => (await api.get<DashboardData>('/dashboard/summary')).data,
    staleTime: 30 * 1000,
  })
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<UserData>('/auth/me')).data,
    staleTime: 5 * 60 * 1000,
  })
  const data = dashboardQuery.data ?? null
  const user = userQuery.data ?? null

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (dashboardQuery.isLoading || userQuery.isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1280
  const isDesktop = windowWidth >= 1280

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'User'

  // ─── Wallet balances ────────────────────────────────────────────────────────
  // Deposit Wallet: strictly holds direct capital (recharged funds minus plan costs).
  // It NEVER includes earnings, commissions, or rebates.
  const depositBalance = user?.deposit_wallet_balance ?? 0

  // Withdrawal Wallet: cashable earnings (task rewards + rebates + commissions +
  // released upgrade refunds). Never includes recharge amounts.
  const withdrawalBalance = user?.withdrawal_wallet_balance ?? 0

  // Pending Refund: upgrade refund amount still pending (legacy lock records).
  // In the current flow, upgrade refunds are released immediately, so this
  // should be 0 for new upgrades. It is still displayed for backward
  // compatibility with legacy pending records.
  const pendingRefund = data?.pending_refund ?? 0

  // Total Earnings (main display): cumulative profit-generating activities only.
  // = Task Earnings + Rebates + Invite Commissions + Released Upgrade Refunds
  // Deposit recharges are NEVER included here.
  const totalEarnings = data?.total_earnings ?? 0

  // ─── Chart data: use live earnings history from API ─────────────────────────
  const earningsData = (data?.earnings_history && data.earnings_history.length > 0)
    ? data.earnings_history
    : [
        { day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 }, { day: 'Fri', value: 0 }, { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 },
      ]

  const maxValue = Math.max(...earningsData.map(d => d.value), 1)
  const chartHeight = 200
  const chartWidth = isMobile ? windowWidth - 80 : (isTablet ? windowWidth - 360 : windowWidth - 460)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      <div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dashboard <span style={{ fontSize: '24px' }}>✨</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {firstName}! Here's your overview.</p>
      </div>

      {/* ── Wallet Balances Section ─────────────────────────────────────────── */}
      {/* 4 cards: Deposit Wallet | Withdrawal Wallet | Locked Refund | Total Earnings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '16px',
      }}>

        {/* Deposit Wallet — strictly direct capital only */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--border-main)', gap: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Deposit Wallet</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>${depositBalance.toFixed(2)}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Recharged funds only</div>
          </div>
        </div>

        {/* Withdrawal Wallet — cashable earnings */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--border-main)', gap: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(0, 172, 79, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00AC4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Withdrawal Wallet</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>${withdrawalBalance.toFixed(2)}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Cashable earnings</div>
          </div>
        </div>

        {/* Locked Upgrade Refund — 3-day lock period */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: `1px solid ${pendingRefund > 0 ? '#F59E0B' : 'var(--border-main)'}`, gap: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Upgrade Refund</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: pendingRefund > 0 ? '#F59E0B' : 'var(--text-heading)' }}>${pendingRefund.toFixed(2)}</div>
            <div style={{ fontSize: '9px', color: pendingRefund > 0 ? '#F59E0B' : 'var(--text-muted)', marginTop: '2px', fontWeight: pendingRefund > 0 ? 600 : 400 }}>
              {pendingRefund > 0 ? '🔒 Pending release' : 'No pending refund'}
            </div>
          </div>
        </div>

        {/* Total Earnings — profit-generating activities only, excludes deposits */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '16px', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--border-main)', gap: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(89, 50, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Earnings</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-primary)' }}>${totalEarnings.toFixed(2)}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Excl. recharges</div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr', gap: '24px' }}>

        {/* Earnings Chart — live data from API */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Earnings Overview</h2>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>This Week</div>
          </div>
          <div style={{ position: 'relative', height: chartHeight + 40 }}>
            <svg width="100%" height={chartHeight + 40}>
              <text x="25" y="20" fontSize="11" fill="var(--text-muted)">${maxValue.toFixed(2)}</text>
              <text x="25" y={chartHeight / 2 + 5} fontSize="11" fill="var(--text-muted)">${(maxValue / 2).toFixed(2)}</text>
              <text x="25" y={chartHeight - 5} fontSize="11" fill="var(--text-muted)">$0</text>
              <line x1="50" y1="15" x2="100%" y2="15" stroke="var(--border-main)" strokeWidth="1" />
              <line x1="50" y1={chartHeight / 2 + 20} x2="100%" y2={chartHeight / 2 + 20} stroke="var(--border-main)" strokeWidth="1" />
              <polyline
                points={earningsData.map((d, i) => {
                  const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                  const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                  return `${x},${y}`
                }).join(' ')}
                fill="none" stroke="var(--accent-primary)" strokeWidth="3"
              />
              {earningsData.map((d, i) => {
                const x = 50 + (i / (earningsData.length - 1)) * (chartWidth > 0 ? chartWidth : 200)
                const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) + 20
                return <circle key={i} cx={x} cy={y} r="6" fill="var(--bg-card)" stroke="var(--accent-primary)" strokeWidth="3" />
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: '50px', marginTop: '10px' }}>
              {earningsData.map((d) => <span key={d.day} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.day}</span>)}
            </div>
          </div>
        </div>

        {/* Wallet Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 24px' }}>Wallet Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                label: 'Deposit Wallet',
                value: `$${depositBalance.toFixed(2)}`,
                subtext: 'Recharged funds only',
                color: 'var(--accent-primary)',
                icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>
              },
              {
                label: 'Withdrawal Wallet',
                value: `$${withdrawalBalance.toFixed(2)}`,
                subtext: 'Cashable earnings',
                color: '#00AC4F',
                icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></>
              },
              ...(pendingRefund > 0 ? [{
                label: 'Locked Refund',
                value: `$${pendingRefund.toFixed(2)}`,
                subtext: '🔒 Pending release',
                color: '#F59E0B',
                icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
              }] : []),
              {
                label: 'Total Earnings',
                value: `$${totalEarnings.toFixed(2)}`,
                subtext: 'Excl. recharges',
                color: 'var(--accent-primary)',
                icon: <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.subtext}</span>
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Total Earnings Breakdown ────────────────────────────────────────── */}
      {/* Rule: This card displays cumulative profit-generating activities ONLY.
               Recharge amounts are strictly excluded. */}
      {data && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Total Earnings Breakdown</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '4px 10px', borderRadius: '20px' }}>Excludes recharges</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>

            {/* Task Earnings */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Task Earnings</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)' }}>${data.task_earnings.toFixed(2)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Your completed tasks</div>
            </div>

            {/* Multi-Tier Invite Commissions */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Invite Commissions</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#F97316' }}>${data.referral_commission.toFixed(2)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>First-purchase only</div>
            </div>

            {/* Multi-Tier Task Rebates */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Task Rebates</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#22C55E' }}>${data.task_rebate_commission.toFixed(2)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Downline task activity</div>
            </div>

            {/* Released Upgrade Refunds */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Upgrade Refunds</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0EA5E9' }}>${data.bonus_refunded.toFixed(2)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Upgrade refunds (immediate release)</div>
            </div>
          </div>

          {/* Pending (locked) refund notice */}
          {data.pending_refund > 0 && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>
                  ${data.pending_refund.toFixed(2)} upgrade refund is pending
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  — will be released to your Withdrawal Wallet automatically.
                </span>
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Total Accumulated Earnings</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Task Earnings + Invite Commissions + Task Rebates + Released Refunds
              </div>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>${data.total_earnings.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* ── Periodic Summary ────────────────────────────────────────────────── */}
      {data && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 20px' }}>Periodic Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Today's Earnings</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>${data.today_earnings.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Week's Earnings</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>${data.this_week_earnings.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>This Month's Earnings</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>${data.this_month_earnings.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Training Progress ───────────────────────────────────────────────── */}
      {data && (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 20px' }}>Training Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Footage Watched</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>{data.footage_labeled_min} sec</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Approved Roles</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>{data.approved_roles || 'None'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Certifications</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-heading)' }}>{data.certifications_earned}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
