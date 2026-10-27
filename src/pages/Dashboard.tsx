import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  bonus_refunded: number
  pending_refund: number
}
interface UserData {
  first_name: string | null
  last_name: string | null
  username: string
  email: string
  deposit_wallet_balance: number
  withdrawal_wallet_balance: number
}
interface AppConfig { key: string; value: string }
interface ReferralSummary { total_invites: number; active_invites: number; earnings: number }

const money = (amount: number | null | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(amount) ? Number(amount) : 0)

function WhatsAppJoinGate() {
  const [groupOpened, setGroupOpened] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const configQuery = useQuery({
    queryKey: ['app-config'],
    queryFn: async () => (await api.get<AppConfig[]>('/settings/config')).data,
    staleTime: 5 * 60 * 1000,
  })
  const groupLink = (configQuery.data ?? []).find((item) => item.key === 'whatsapp_link')?.value?.trim() || ''
  const hasGroupLink = groupLink !== '' && groupLink !== '#'
  if (configQuery.isLoading || !isOpen) return null
  return (
    <div className="community-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="community-gate-title">
      <div className="community-gate-dialog">
        <span className="community-gate-index">MEMBER ORIENTATION · 01</span>
        <div className="community-gate-mark" aria-hidden="true">K</div>
        <h2 id="community-gate-title">Start connected.</h2>
        <p>Get announcements, support and important updates from the official Kinetiq community before opening your workspace.</p>
        {hasGroupLink ? (
          <a className="community-gate-primary" href={groupLink} target="_blank" rel="noopener noreferrer" onClick={() => setGroupOpened(true)}>Open community <span aria-hidden="true">↗</span></a>
        ) : <p className="community-gate-unavailable">The community link is not configured yet.</p>}
        <button className="community-gate-continue" type="button" disabled={hasGroupLink && !groupOpened} onClick={() => setIsOpen(false)}>Continue to workspace</button>
        {hasGroupLink && !groupOpened && <button className="community-gate-already" type="button" onClick={() => setIsOpen(false)}>I already joined</button>}
      </div>
    </div>
  )
}

function EarningsChart({ rows }: { rows: { day: string; value: number }[] }) {
  if (!rows.length) return <div className="dashboard-chart-empty">Your earnings activity will appear here when it starts.</div>
  const maxValue = Math.max(...rows.map((row) => row.value), 1)
  const points = rows.map((row, index) => {
    const x = rows.length === 1 ? 360 : 48 + (index / (rows.length - 1)) * 640
    const y = 174 - (Math.max(0, row.value) / maxValue) * 126
    return { ...row, x, y }
  })
  return (
    <div className="dashboard-chart-wrap">
      <svg className="dashboard-chart" viewBox="0 0 740 210" role="img" aria-label="Earnings history from your account">
        <defs><linearGradient id="member-earnings-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00A7B5" stopOpacity=".23" /><stop offset="100%" stopColor="#00A7B5" stopOpacity="0" /></linearGradient></defs>
        {[40, 84, 128, 172].map((y) => <line key={y} x1="40" y1={y} x2="700" y2={y} className="dashboard-chart-grid" />)}
        <polygon points={`40,172 ${points.map((point) => `${point.x},${point.y}`).join(' ')} 700,172`} fill="url(#member-earnings-fill)" />
        <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} className="dashboard-chart-line" />
        {points.map((point) => <circle key={`${point.day}-${point.x}`} cx={point.x} cy={point.y} r="4.5" className="dashboard-chart-point"><title>{point.day}: {money(point.value)}</title></circle>)}
      </svg>
      <div className="dashboard-chart-labels">{points.map((point) => <span key={`${point.day}-label`}>{point.day}</span>)}</div>
    </div>
  )
}

export default function Dashboard() {
  const dashboardQuery = useQuery({ queryKey: queryKeys.dashboard.summary, queryFn: async () => (await api.get<DashboardData>('/dashboard/summary')).data, staleTime: 30_000 })
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<UserData>('/auth/me')).data, staleTime: 5 * 60_000 })
  const referralQuery = useQuery({
    queryKey: queryKeys.referrals.summary,
    queryFn: async () => (await api.get<ReferralSummary>('/referrals/summary')).data,
    staleTime: 2 * 60_000,
  })
  const data = dashboardQuery.data
  const user = userQuery.data

  if (dashboardQuery.isLoading || userQuery.isLoading) {
    return <div className="member-page-state" role="status"><span className="member-loading-indicator" /><span>Preparing your workspace…</span></div>
  }
  if (dashboardQuery.isError || userQuery.isError || !data || !user) {
    return <section className="member-page-state member-page-state--error" role="alert"><span className="member-state-code">01 / CONNECTION</span><h2>Workspace data did not load.</h2><p>Your account and balances have not been changed. Try the request again.</p><button type="button" className="member-button member-button--primary" onClick={() => { void dashboardQuery.refetch(); void userQuery.refetch() }}>Reload overview</button></section>
  }

  const emailName = user.email?.split('@')[0]?.split(/[._+-]/).filter(Boolean)[0] || ''
  const fallbackName = emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'there'
  const firstName = user.first_name?.trim() || fallbackName
  const history = data.earnings_history ?? []
  const recentHistory = history.slice(-7)
  const recentMax = Math.max(...recentHistory.map((row) => row.value), 1)
  const earningsSources = [
    { label: 'Task earnings', value: data.task_earnings },
    { label: 'Referral commissions', value: data.referral_commission },
    { label: 'Task rebates', value: data.task_rebate_commission },
    { label: 'Released refunds', value: data.bonus_refunded },
  ]
  const nextSteps = [
    { number: '01', title: 'Find available work', detail: 'See tasks ready to start.', path: '/tasks', action: 'Browse tasks' },
    { number: '02', title: 'Build a skill', detail: 'Continue your learning path.', path: '/training', action: 'Open learning' },
    { number: '03', title: 'Review your plan', detail: 'Compare membership options.', path: '/plans', action: 'View plans' },
  ]

  return (
    <>
      <WhatsAppJoinGate />
      <div className="member-dashboard">
        <header className="member-dashboard-hero">
          <div className="member-dashboard-hero-copy">
            <span className="member-eyebrow"><i aria-hidden="true" /> MEMBER DESK <span className="member-eyebrow-separator">/</span> TODAY</span>
            <h2>Welcome back,<br /><em>{firstName}.</em></h2>
            <p>Your work, earnings and next steps—together in one place.</p>
            <Link className="member-button member-button--coral" to="/tasks">Open task queue <span aria-hidden="true">→</span></Link>
          </div>
          <div className="member-dashboard-week" aria-label={`Earnings this week ${money(data.this_week_earnings)}`}>
            <span>THIS WEEK</span><strong>{money(data.this_week_earnings)}</strong><small>earned so far</small>
            <div className="member-week-bars" aria-hidden="true">{recentHistory.map((row, index) => <i key={`${row.day}-${index}`} title={`${row.day}: ${money(row.value)}`} style={{ height: `${Math.max(8, (row.value / recentMax) * 100)}%` }} />)}</div>
          </div>
          <div className="member-hero-decor" aria-hidden="true"><span /><span /><span /></div>
        </header>

        <section className="member-balance-strip" aria-label="Account balances and totals">
          <article className="member-balance-item member-balance-item--primary"><span className="member-balance-index">01</span><div><small>AVAILABLE TO WITHDRAW</small><strong>{money(user.withdrawal_wallet_balance)}</strong><span>Earnings wallet</span></div><span className="member-balance-arrow" aria-hidden="true">↗</span></article>
          <article className="member-balance-item"><span className="member-balance-index">02</span><div><small>DEPOSIT WALLET</small><strong>{money(user.deposit_wallet_balance)}</strong><span>Recharge funds only</span></div><Link to="/payments" aria-label="Open wallet">→</Link></article>
          <article className="member-balance-item"><span className="member-balance-index">03</span><div><small>TOTAL EARNED</small><strong>{money(data.total_earnings)}</strong><span>Excludes deposits</span></div><span className="member-balance-arrow" aria-hidden="true">↗</span></article>
          <article className="member-balance-item member-balance-item--pending"><span className="member-balance-index">04</span><div><small>PENDING REFUND</small><strong>{money(data.pending_refund)}</strong><span>Not included in total earned</span></div><span className="member-balance-arrow" aria-hidden="true">◷</span></article>
        </section>

        <div className="member-dashboard-grid">
          <section className="member-panel member-earnings-panel">
            <div className="member-section-heading"><div><span className="member-eyebrow">PERFORMANCE / 01</span><h3>Earnings activity</h3><p>Recorded earnings from your account.</p></div><span className="member-live-tag"><i aria-hidden="true" /> LIVE DATA</span></div>
            <div className="member-earnings-total"><strong>{money(data.total_earnings)}</strong><span>total earned</span></div>
            <EarningsChart rows={history} />
            <div className="member-period-totals"><div><span>Today</span><strong>{money(data.today_earnings)}</strong></div><div><span>This week</span><strong>{money(data.this_week_earnings)}</strong></div><div><span>This month</span><strong>{money(data.this_month_earnings)}</strong></div></div>
            <div className="member-source-list">
              <div className="member-source-heading"><strong>Income sources</strong><span>USD</span></div>
              {earningsSources.map((source, index) => <div className="member-source-row" key={source.label}><span className="member-source-number">0{index + 1}</span><span>{source.label}</span><strong>{money(source.value)}</strong></div>)}
              {(data.pending_refund ?? 0) > 0 && <p className="member-pending-note">{money(data.pending_refund)} is awaiting release and is not included above.</p>}
            </div>
          </section>

          <aside className="member-panel member-next-steps">
            <div className="member-section-heading"><div><span className="member-eyebrow">A CLEAR NEXT STEP</span><h3>Move forward</h3><p>Choose where to put your time next.</p></div></div>
            <div className="member-next-list">{nextSteps.map((item) => <Link className="member-next-link" to={item.path} key={item.path}><span className="member-next-number">{item.number}</span><span className="member-next-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="member-next-action" aria-hidden="true">↗</span></Link>)}</div>
            <div className="member-next-foot"><span>Have someone in mind?</span><Link to="/referrals">Open your invite studio <span aria-hidden="true">→</span></Link></div>
          </aside>
        </div>

        <div className="member-dashboard-bottom">
          <section className="member-panel member-skill-panel">
            <div className="member-section-heading"><div><span className="member-eyebrow">LEARNING RECORD</span><h3>Skills in motion</h3></div><Link className="member-text-link" to="/training">Learning studio ↗</Link></div>
            <div className="member-skill-stats"><div><strong>{data.footage_labeled_min ?? 0}<small> min</small></strong><span>Practice time</span></div><div><strong>{data.certifications_earned ?? 0}</strong><span>Certifications</span></div></div>
            <div className="member-approved-role"><span>APPROVED ROLES</span><strong>{data.approved_roles || 'Your next role is waiting'}</strong></div>
          </section>

          <section className="member-panel member-referral-summary">
            <div className="member-section-heading"><div><span className="member-eyebrow">COMMUNITY / NETWORK</span><h3>Your referral circle</h3></div><span className="member-referral-seal" aria-hidden="true">↗</span></div>
            <div className="member-referral-stats"><div><span>Invited</span><strong>{referralQuery.data?.total_invites ?? '—'}</strong></div><div><span>Active</span><strong>{referralQuery.data?.active_invites ?? '—'}</strong></div><div><span>Earned</span><strong>{money(referralQuery.data?.earnings)}</strong></div></div>
            <Link className="member-button member-button--outline" to="/referrals">Open referral studio <span aria-hidden="true">→</span></Link>
          </section>
        </div>
      </div>
    </>
  )
}
