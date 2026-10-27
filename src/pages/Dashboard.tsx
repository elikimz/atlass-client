import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { PWAInstallCard } from '../components/PWAInstall'
import ReferralNetwork from '../components/ReferralNetwork'

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

const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

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
    <div className="whatsapp-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="whatsapp-join-title">
      <div className="whatsapp-gate-modal">
        <div className="whatsapp-gate-icon" aria-hidden="true"><span>◎</span></div>
        <h2 id="whatsapp-join-title">Find your <span>people.</span></h2>
        <p className="whatsapp-gate-description">Join the official Kinetiq community for announcements, support, and important updates before continuing to your workspace.</p>
        {hasGroupLink ? (
          <a className="whatsapp-gate-join" href={groupLink} target="_blank" rel="noopener noreferrer" onClick={() => setGroupOpened(true)}>Open the Kinetiq community ↗</a>
        ) : <p className="whatsapp-gate-unavailable">The community link is not configured yet.</p>}
        <button className="whatsapp-gate-continue" type="button" disabled={hasGroupLink && !groupOpened} onClick={() => setIsOpen(false)}>Continue to workspace</button>
        {hasGroupLink && !groupOpened && <button className="whatsapp-gate-already" type="button" onClick={() => setIsOpen(false)}>I already joined</button>}
      </div>
    </div>
  )
}

function EarningsChart({ rows }: { rows: { day: string; value: number }[] }) {
  if (!rows.length) return <div className="orbit-chart-empty">Your earnings activity will appear here when it starts.</div>
  const maxValue = Math.max(...rows.map((row) => row.value), 1)
  const points = rows.map((row, index) => {
    const x = rows.length === 1 ? 335 : 48 + (index / (rows.length - 1)) * 560
    const y = 184 - (Math.max(0, row.value) / maxValue) * 140
    return { ...row, x, y }
  })
  return (
    <div className="orbit-chart-wrap">
      <svg className="orbit-chart" viewBox="0 0 640 220" role="img" aria-label="Earnings history from your account">
        <defs><linearGradient id="earnings-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a99cff" stopOpacity=".42" /><stop offset="100%" stopColor="#a99cff" stopOpacity="0" /></linearGradient></defs>
        {[42, 96, 150, 204].map((y) => <line key={y} x1="42" y1={y} x2="606" y2={y} className="orbit-chart-grid" />)}
        <polygon points={`42,204 ${points.map((point) => `${point.x},${point.y}`).join(' ')} 606,204`} fill="url(#earnings-fill)" />
        <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} className="orbit-chart-line" />
        {points.map((point) => <circle key={`${point.day}-${point.x}`} cx={point.x} cy={point.y} r="4.5" className="orbit-chart-point"><title>{point.day}: {money(point.value)}</title></circle>)}
      </svg>
      <div className="orbit-chart-labels">{points.map((point) => <span key={`${point.day}-label`}>{point.day}</span>)}</div>
    </div>
  )
}

export default function Dashboard() {
  const dashboardQuery = useQuery({ queryKey: queryKeys.dashboard.summary, queryFn: async () => (await api.get<DashboardData>('/dashboard/summary')).data, staleTime: 30_000 })
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<UserData>('/auth/me')).data, staleTime: 5 * 60_000 })
  const data = dashboardQuery.data
  const user = userQuery.data

  if (dashboardQuery.isLoading || userQuery.isLoading) {
    return <div className="orbit-state"><span className="orbit-loader" /><p>Gathering your workspace…</p></div>
  }
  if (dashboardQuery.isError || userQuery.isError || !data || !user) {
    return <div className="orbit-state orbit-state--error"><div className="orbit-state-icon">!</div><h1>We lost the signal.</h1><p>Your information could not be loaded. Your account and balances have not been changed.</p><button type="button" className="orbit-retry" onClick={() => { void dashboardQuery.refetch(); void userQuery.refetch() }}>Try again</button></div>
  }

  const emailName = user.email?.split('@')[0]?.split(/[._+-]/).filter(Boolean)[0] || ''
  const fallbackName = emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'there'
  const firstName = user.first_name?.trim() || fallbackName
  const history = data.earnings_history ?? []
  const walletCards = [
    { label: 'Earning balance', value: money(user.withdrawal_wallet_balance ?? 0), note: 'Available earnings', icon: '↗', theme: 'mint' },
    { label: 'Wallet balance', value: money(user.deposit_wallet_balance ?? 0), note: 'Recharge funds only', icon: '◈', theme: 'lilac' },
    { label: 'In progress', value: money(data.pending_refund ?? 0), note: 'Pending refund release', icon: '◷', theme: 'peach' },
    { label: 'Total earned', value: money(data.total_earnings ?? 0), note: 'Excludes recharges', icon: '✳', theme: 'lemon' },
  ]
  const quickLinks = [
    { title: 'Find a task', copy: 'See what is ready for you.', to: '/tasks', symbol: '↗', tone: 'violet' },
    { title: 'Build a skill', copy: 'Pick up where your training left off.', to: '/training', symbol: '✳', tone: 'mint' },
    { title: 'Explore plans', copy: 'Compare the available membership plans.', to: '/plans', symbol: '◈', tone: 'lemon' },
    { title: 'Invite someone', copy: 'Share your referral link.', to: '/referrals', symbol: '＋', tone: 'peach' },
  ]

  return (
    <>
      <WhatsAppJoinGate />
      <div className="orbit-dashboard">
        <header className="orbit-welcome">
          <div><span className="orbit-overline"><i /> YOUR SPACE, IN MOTION</span><h1>Good to see you,<br /><em>{firstName}.</em></h1><p>A clear view of what you’ve earned, learned, and can do next.</p></div>
          <div className="orbit-welcome-mark" aria-hidden="true"><span className="orbit-mark-ring orbit-mark-ring--a" /><span className="orbit-mark-ring orbit-mark-ring--b" /><span className="orbit-mark-center">✳</span><span className="orbit-mark-star">✳</span></div>
          <div className="orbit-welcome-stamp"><span>YOUR MOMENTUM</span><b>starts here <i>↗</i></b></div>
        </header>

        <PWAInstallCard />

        <section className="orbit-wallet-grid" aria-label="Account balances">
          {walletCards.map((card) => <article className={`orbit-wallet-card orbit-wallet-card--${card.theme}`} key={card.label}>
            <span className="orbit-wallet-symbol" aria-hidden="true">{card.icon}</span><span className="orbit-wallet-label">{card.label}</span><strong>{card.value}</strong><span className="orbit-wallet-note">{card.note}</span>
          </article>)}
        </section>

        <div className="orbit-work-grid">
          <section className="orbit-panel orbit-earnings-panel">
            <div className="orbit-panel-head"><div><span className="orbit-overline">YOUR ACTIVITY</span><h2>Earnings, over time.</h2></div><span className="orbit-live-label"><i /> LIVE ACCOUNT DATA</span></div>
            <div className="orbit-chart-summary"><strong>{money(data.total_earnings ?? 0)}</strong><span>all-time earnings</span></div>
            <EarningsChart rows={history} />
            <div className="orbit-period-strip"><div><span>Today</span><strong>{money(data.today_earnings ?? 0)}</strong></div><div><span>This week</span><strong>{money(data.this_week_earnings ?? 0)}</strong></div><div><span>This month</span><strong>{money(data.this_month_earnings ?? 0)}</strong></div></div>
          </section>

          <section className="orbit-next-panel">
            <div className="orbit-next-heading"><span className="orbit-overline">THE NEXT MOVE</span><h2>Choose your<br />next orbit.</h2><p>Small steps create real momentum.</p></div>
            <div className="orbit-quick-links">{quickLinks.map((item) => <Link key={item.to} to={item.to} className={`orbit-quick-link orbit-quick-link--${item.tone}`}><span className="orbit-quick-symbol" aria-hidden="true">{item.symbol}</span><span><strong>{item.title}</strong><small>{item.copy}</small></span><span className="orbit-quick-arrow" aria-hidden="true">↗</span></Link>)}</div>
          </section>
        </div>

        <section className="orbit-details-grid">
          <article className="orbit-panel orbit-breakdown-panel"><div className="orbit-panel-head"><div><span className="orbit-overline">WHERE IT COMES FROM</span><h2>Your earnings mix.</h2></div><span className="orbit-note-pill">Recharge excluded</span></div><div className="orbit-breakdown-list">
            {[{ label: 'Task earnings', value: data.task_earnings, color: 'violet' }, { label: 'Invite commissions', value: data.referral_commission, color: 'mint' }, { label: 'Task rebates', value: data.task_rebate_commission, color: 'lemon' }, { label: 'Released refunds', value: data.bonus_refunded, color: 'peach' }].map((item) => <div className="orbit-breakdown-row" key={item.label}><span className={`orbit-breakdown-dot orbit-breakdown-dot--${item.color}`} /><span>{item.label}</span><strong>{money(item.value ?? 0)}</strong></div>)}
          </div>{(data.pending_refund ?? 0) > 0 && <p className="orbit-pending-note">{money(data.pending_refund)} is pending release and is not included in total earnings.</p>}</article>
          <article className="orbit-panel orbit-learning-panel"><div><span className="orbit-overline">YOUR LEARNING PATH</span><h2>Every skill<br />moves you forward.</h2></div><div className="orbit-learning-stats"><div><strong>{data.footage_labeled_min ?? 0}</strong><span>seconds practiced</span></div><div><strong>{data.certifications_earned ?? 0}</strong><span>certifications earned</span></div></div><div className="orbit-approved-role"><span>Approved roles</span><strong>{data.approved_roles || 'Your next one is waiting'}</strong></div><Link className="orbit-learning-link" to="/training">Continue learning <span>↗</span></Link></article>
        </section>

        <div className="orbit-referrals"><ReferralNetwork /></div>
      </div>
    </>
  )
}
