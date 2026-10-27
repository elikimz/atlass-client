import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { PWAInstallCard } from '../components/PWAInstall'

type User = {
  first_name?: string | null
  last_name?: string | null
  email?: string
  deposit_wallet_balance?: number
  withdrawal_wallet_balance?: number
  current_plan_id?: number | null
  current_plan_name?: string | null
  plan_expiry?: string | null
}

type EarningsPoint = { day: string; value: number }
type RecentActivity = { id: number; description: string; amount: string; status: string }
type Summary = {
  today_earnings?: number
  this_week_earnings?: number
  this_month_earnings?: number
  total_earnings?: number
  task_earnings?: number
  referral_commission?: number
  task_rebate_commission?: number
  bonus_refunded?: number
  pending_refund?: number
  active_tasks?: number
  completed_tasks?: number
  pending_videos?: number
  total_tasks_completed?: number
  certifications_earned?: number
  earnings_history?: EarningsPoint[]
  recent_activity?: RecentActivity[]
}

type Referrals = { total_invites?: number; active_invites?: number; earnings?: number }

const money = (value?: number) => Number.isFinite(value)
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)
  : '—'

const shortMoney = (value: number) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)}`

function EarningsChart({ points }: { points: EarningsPoint[] }) {
  const safePoints = points.filter((point) => point && typeof point.day === 'string' && Number.isFinite(point.value) && point.value >= 0)
  if (!safePoints.length) {
    return <div className="dashboard-chart-empty" role="status">No seven-day task-earnings series was returned for this account.</div>
  }

  const width = 640
  const height = 230
  const left = 58
  const right = 18
  const top = 18
  const bottom = 38
  const plotWidth = width - left - right
  const plotHeight = height - top - bottom
  const highest = Math.max(...safePoints.map((point) => point.value), 0)
  const scaleTop = highest || 1
  const coords = safePoints.map((point, index) => ({
    ...point,
    x: safePoints.length === 1 ? left + plotWidth / 2 : left + (index * plotWidth) / (safePoints.length - 1),
    y: top + plotHeight - (point.value / scaleTop) * plotHeight,
  }))
  const linePath = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
  const last = coords[coords.length - 1]
  const first = coords[0]
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(top + plotHeight).toFixed(2)} L ${first.x.toFixed(2)} ${(top + plotHeight).toFixed(2)} Z`
  const ticks = [highest, highest / 2, 0].map((value, index) => ({ value, y: top + (index * plotHeight) / 2 }))
  const description = safePoints.map((point) => `${point.day}: ${money(point.value)}`).join('; ')

  return <div className="dashboard-earnings-chart">
    <div className="dashboard-chart-legend"><span aria-hidden="true" /><span>Completed-task earnings</span><small>Last 7 days · server history</small></div>
    <svg className="dashboard-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="dashboard-chart-title dashboard-chart-desc">
      <title id="dashboard-chart-title">Task earnings over the last seven days</title>
      <desc id="dashboard-chart-desc">Daily completed-task earnings returned by the dashboard API: {description}.</desc>
      <defs><linearGradient id="dashboard-earnings-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity=".16" /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity=".01" /></linearGradient></defs>
      {ticks.map((tick, index) => <g key={`tick-${index}`}>
        <line x1={left} x2={width - right} y1={tick.y} y2={tick.y} className="dashboard-chart-grid" />
        <text x={left - 9} y={tick.y + 4} textAnchor="end" className="dashboard-chart-axis-label">{shortMoney(tick.value)}</text>
      </g>)}
      <path d={areaPath} fill="url(#dashboard-earnings-fill)" />
      {coords.length > 1 && <path d={linePath} className="dashboard-chart-line" />}
      {coords.map((point, index) => <g key={`${point.day}-${index}`}>
        <circle cx={point.x} cy={point.y} r="4.5" className="dashboard-chart-point"><title>{point.day}: {money(point.value)}</title></circle>
        <text x={point.x} y={height - 11} textAnchor="middle" className="dashboard-chart-axis-label">{point.day}</text>
      </g>)}
    </svg>
  </div>
}

export default function Dashboard() {
  const [orientation, setOrientation] = useState(() => localStorage.getItem('kinetiq-orientation-dismissed') !== 'yes')
  const user = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<User>('/auth/me')).data, staleTime: 60_000 })
  const summary = useQuery({ queryKey: queryKeys.dashboard.summary, queryFn: async () => (await api.get<Summary>('/dashboard/summary')).data, staleTime: 30_000 })
  const referrals = useQuery({ queryKey: queryKeys.referrals.summary, queryFn: async () => (await api.get<Referrals>('/referrals/summary')).data, staleTime: 60_000 })
  const person = user.data
  const data = summary.data
  const firstName = person?.first_name?.trim() || 'Your'
  const history = Array.isArray(data?.earnings_history) ? data.earnings_history : []
  const recentActivity = Array.isArray(data?.recent_activity) ? data.recent_activity : []
  const retrySummary = () => { void summary.refetch() }

  return <div className="member-dashboard">
    <header className="member-dashboard-hero">
      <div className="member-dashboard-hero-copy">
        <span className="member-eyebrow"><i /> ACCOUNT OVERVIEW / VERIFIED DATA</span>
        <h2>{firstName}<br /><em>at a glance.</em></h2>
        <p>Your balances, completed work and earnings history — reported by Kinetiq.</p>
        <Link className="member-button member-button--primary" to="/tasks">Browse available tasks <span aria-hidden="true">→</span></Link>
      </div>
      <aside className="member-dashboard-week">
        <span>ACTIVE PLAN</span>
        <strong>{person?.current_plan_name || (person?.current_plan_id ? `Plan #${person.current_plan_id}` : 'No active plan')}</strong>
        <small>{person?.plan_expiry ? `Expires ${new Date(person.plan_expiry).toLocaleDateString()}` : 'Check current plan eligibility'}</small>
      </aside>
    </header>

    {orientation && <section className="dashboard-orientation">
      <div><strong>Welcome to your workspace</strong><p>Review your account, task activity and learning tools. Community links are optional and do not record membership.</p></div>
      <button className="member-button member-button--outline" type="button" onClick={() => { localStorage.setItem('kinetiq-orientation-dismissed', 'yes'); setOrientation(false) }}>Dismiss</button>
    </section>}

    <section className="member-balance-strip" aria-label="Wallet balances">
      <article className="member-balance-item member-balance-item--primary">
        <span className="member-balance-index">01</span>
        <div><small>WITHDRAWAL WALLET</small><strong>{user.isError || !person ? '—' : money(person.withdrawal_wallet_balance)}</strong><span>Cashable earnings · account source</span></div>
        <Link to="/payments/payout">Review payout <span aria-hidden="true">→</span></Link>
      </article>
      <article className="member-balance-item">
        <span className="member-balance-index">02</span>
        <div><small>DEPOSIT WALLET</small><strong>{user.isError || !person ? '—' : money(person.deposit_wallet_balance)}</strong><span>Recharge funds only · account source</span></div>
        <Link to="/payments/recharge">Add funds <span aria-hidden="true">→</span></Link>
      </article>
    </section>

    <section className="dashboard-overview-grid" aria-label="Earnings and account overview">
      <article className="member-panel dashboard-earnings-panel">
        <header className="dashboard-overview-heading"><div><span className="member-eyebrow">EARNINGS TREND / 01</span><h3>Your completed work</h3><p>Daily task rewards from the last seven days. Other earning categories are shown separately.</p></div><span className="dashboard-source-tag">API history</span></header>
        {summary.isLoading ? <div className="dashboard-chart-empty" role="status">Loading verified earnings history…</div> : summary.isError ? <div className="dashboard-chart-error" role="alert">Earnings history is unavailable. <button type="button" onClick={retrySummary}>Retry</button></div> : <EarningsChart points={history} />}
      </article>

      <aside className="member-panel dashboard-period-panel">
        <div className="dashboard-overview-heading"><div><span className="member-eyebrow">PERIOD TOTALS / 02</span><h3>Earning activity</h3></div></div>
        <div className="dashboard-period-grid">
          <div><span>Today</span><strong>{summary.isError ? '—' : money(data?.today_earnings)}</strong></div>
          <div><span>This week</span><strong>{summary.isError ? '—' : money(data?.this_week_earnings)}</strong></div>
          <div><span>This month</span><strong>{summary.isError ? '—' : money(data?.this_month_earnings)}</strong></div>
          <div><span>All-time earnings</span><strong>{summary.isError ? '—' : money(data?.total_earnings)}</strong></div>
        </div>
        <p className="dashboard-period-note">Period totals include eligible earning activity and exclude deposits/recharges.</p>
        <div className="dashboard-breakdown">
          <div><span>Task rewards</span><strong>{summary.isError ? '—' : money(data?.task_earnings)}</strong></div>
          <div><span>Referral commissions</span><strong>{summary.isError ? '—' : money(data?.referral_commission)}</strong></div>
          <div><span>Task rebates</span><strong>{summary.isError ? '—' : money(data?.task_rebate_commission)}</strong></div>
          <div><span>Released plan refunds</span><strong>{summary.isError ? '—' : money(data?.bonus_refunded)}</strong></div>
          <div className="is-pending"><span>Locked refunds · not yet earned</span><strong>{summary.isError ? '—' : money(data?.pending_refund)}</strong></div>
        </div>
      </aside>
    </section>

    <section className="dashboard-progress-grid" aria-label="Task progress and recent activity">
      <article className="member-panel dashboard-progress-panel">
        <div className="dashboard-overview-heading"><div><span className="member-eyebrow">WORKSPACE PROGRESS / 03</span><h3>Your progress</h3><p>Current counts returned by your account summary.</p></div></div>
        {summary.isError ? <div className="dashboard-chart-error" role="alert">Progress details are unavailable. <button type="button" onClick={retrySummary}>Retry</button></div> : <div className="dashboard-progress-metrics">
          <div><strong>{summary.isLoading ? '—' : data?.completed_tasks ?? 0}</strong><span>Completed tasks</span></div>
          <div><strong>{summary.isLoading ? '—' : data?.active_tasks ?? 0}</strong><span>Available tasks</span></div>
          <div><strong>{summary.isLoading ? '—' : data?.pending_videos ?? 0}</strong><span>Tasks in progress</span></div>
          <div><strong>{summary.isLoading ? '—' : data?.certifications_earned ?? 0}</strong><span>Certifications</span></div>
        </div>}
      </article>

      <article className="member-panel dashboard-recent-panel">
        <div className="dashboard-overview-heading"><div><span className="member-eyebrow">RECENT TASK ACTIVITY / 04</span><h3>Latest completed work</h3></div><Link to="/tasks">Open tasks →</Link></div>
        {summary.isLoading ? <div className="dashboard-chart-empty" role="status">Loading recent activity…</div> : summary.isError ? <div className="dashboard-chart-error" role="alert">Recent activity is unavailable. <button type="button" onClick={retrySummary}>Retry</button></div> : recentActivity.length ? <ul className="dashboard-activity-list">
          {recentActivity.map((item) => <li key={item.id}><span className="dashboard-activity-mark" aria-hidden="true">✓</span><span className="dashboard-activity-copy"><strong>{item.description}</strong><small>{item.status}</small></span><span className="dashboard-activity-amount">{item.amount}</span></li>)}
        </ul> : <p className="dashboard-no-activity">No completed task activity has been returned yet.</p>}
      </article>
    </section>

    <section className="member-panel dashboard-referral-panel">
      <div className="member-section-heading"><div><span className="member-eyebrow">REFERRAL ATTRIBUTION / 05</span><h3>Your network overview</h3><p>Referral totals are supplied by your account service.</p></div><Link to="/referrals">Open referral studio →</Link></div>
      {referrals.isLoading ? <p role="status">Loading referral overview…</p> : referrals.isError || !referrals.data ? <p role="alert">Referral overview unavailable. <button type="button" onClick={() => void referrals.refetch()}>Retry</button></p> : <div className="dashboard-referral-metrics"><div><span>Registered referrals</span><strong>{referrals.data.total_invites ?? '—'}</strong></div><div><span>Active referrals</span><strong>{referrals.data.active_invites ?? '—'}</strong></div><div><span>Commission recorded</span><strong>{money(referrals.data.earnings)}</strong></div></div>}
    </section>

    <PWAInstallCard />
  </div>
}
