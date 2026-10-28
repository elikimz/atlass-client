import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type User = { deposit_wallet_balance?: number; withdrawal_wallet_balance?: number }
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
}
type PaymentRecord = {
  id: number
  type: string
  amount: number
  status: string
  payment_method: string | null
  created_at: string | null
  period?: string | null
}

const money = (value?: number) => Number.isFinite(value)
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)
  : '—'

function statusLabel(payment: PaymentRecord) {
  const status = (payment.status || '').toLowerCase()
  if (status === 'pending') return 'Awaiting admin review'
  if (status === 'under_review') return 'Admin review in progress'
  if (status === 'paid') return payment.type === 'deposit' ? 'Approved · credited' : 'Paid'
  if (status === 'processing' || status === 'in_progress') return 'Processing'
  if (status === 'rejected') return 'Rejected'
  if (status === 'cancelled') return 'Cancelled'
  return payment.status ? `Service status: ${payment.status}` : 'Status unavailable'
}

function statusTone(status: string) {
  if (status === 'paid') return 'is-complete'
  if (status === 'rejected') return 'is-rejected'
  if (status === 'cancelled') return 'is-muted'
  if (['pending', 'under_review', 'processing', 'in_progress'].includes(status)) return 'is-review'
  return 'is-muted'
}

function recordDate(value: string | null) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : 'Date unavailable'
}

function BalanceCard({
  kind,
  title,
  value,
  loading,
  error,
  description,
  action,
  to,
  onRetry,
}: {
  kind: 'deposit' | 'withdrawal'
  title: string
  value?: number
  loading: boolean
  error: boolean
  description: string
  action: string
  to: string
  onRetry: () => void
}) {
  return (
    <article className={`wallet-balance-card wallet-balance-card--${kind}`}>
      <div className="wallet-balance-card-top"><span className="wallet-balance-symbol" aria-hidden="true">{kind === 'deposit' ? '＋' : '↗'}</span><span className="wallet-balance-classification">{kind === 'deposit' ? 'ACCOUNT 01' : 'ACCOUNT 02'}</span></div>
      <div className="wallet-balance-label"><span>{title}</span><small>{kind === 'deposit' ? 'PLAN & DEPOSIT BALANCE' : 'CASHABLE EARNINGS'}</small></div>
      <strong className="wallet-balance-value">{error ? '—' : loading ? 'Loading…' : money(value)}</strong>
      <p>{description}</p>
      {error && <button className="wallet-retry-link" type="button" onClick={onRetry}>Retry balance</button>}
      <Link className="wallet-balance-action" to={to}>{action}<span aria-hidden="true">→</span></Link>
    </article>
  )
}

export default function Payments() {
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    staleTime: 60_000,
  })
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async () => (await api.get<Summary>('/dashboard/summary')).data,
    staleTime: 60_000,
  })
  const historyQuery = useQuery({
    queryKey: queryKeys.payments.history(1, 50),
    queryFn: async () => (await api.get<PaymentRecord[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [],
    staleTime: 60_000,
  })

  const user = userQuery.data
  const summary = summaryQuery.data
  const payments = Array.isArray(historyQuery.data) ? historyQuery.data.slice(0, 5) : []
  const breakdown = [
    { label: 'Completed-task rewards', value: summary?.task_earnings, source: summaryQuery, pending: false },
    { label: 'Referral commissions', value: summary?.referral_commission, source: summaryQuery, pending: false },
    { label: 'Task rebates', value: summary?.task_rebate_commission, source: summaryQuery, pending: false },
    { label: 'Released plan refunds', value: summary?.bonus_refunded, source: summaryQuery, pending: false },
    { label: 'Locked refunds · not yet earned', value: summary?.pending_refund, source: summaryQuery, pending: true },
  ]
  const periods = [
    { label: 'Today', value: summary?.today_earnings },
    { label: 'This week', value: summary?.this_week_earnings },
    { label: 'This month', value: summary?.this_month_earnings },
  ]

  return (
    <div className="wallet-page">
      <header className="wallet-page-heading">
        <div><span className="member-eyebrow">PACECRAFT / MONEY DESK</span><h2>Your money, clearly split.</h2><p>Deposit funds and cashable earnings stay in separate account balances.</p></div>
        <Link className="wallet-heading-link" to="/payments/history">Payment activity <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="wallet-balance-grid" aria-label="Wallet balances">
        <BalanceCard
          kind="deposit"
          title="Deposit wallet"
          value={user?.deposit_wallet_balance}
          loading={userQuery.isLoading}
          error={userQuery.isError}
          description="Used for plan purchases. A new deposit is added only after administrator approval."
          action="Add funds"
          to="/payments/recharge"
          onRetry={() => void userQuery.refetch()}
        />
        <BalanceCard
          kind="withdrawal"
          title="Withdrawal wallet"
          value={user?.withdrawal_wallet_balance}
          loading={userQuery.isLoading}
          error={userQuery.isError}
          description="Cashable earnings. A payout request is not complete until the service marks it paid."
          action="Request payout"
          to="/payments/payout"
          onRetry={() => void userQuery.refetch()}
        />
      </section>

      <section className="wallet-action-section" aria-label="Wallet actions">
        <div className="wallet-section-title"><div><span className="member-eyebrow">QUICK ROUTES / 01</span><h3>What would you like to do?</h3></div></div>
        <div className="wallet-action-grid">
          <Link className="wallet-action-card" to="/payments/recharge"><span className="wallet-action-icon" aria-hidden="true">＋</span><span><strong>Add funds</strong><small>Start a deposit request</small></span><i aria-hidden="true">→</i></Link>
          <Link className="wallet-action-card" to="/payments/payout"><span className="wallet-action-icon" aria-hidden="true">↗</span><span><strong>Request payout</strong><small>Review eligibility and submit</small></span><i aria-hidden="true">→</i></Link>
          <Link className="wallet-action-card" to="/withdrawal-accounts"><span className="wallet-action-icon" aria-hidden="true">◇</span><span><strong>Payout accounts</strong><small>Manage withdrawal destinations</small></span><i aria-hidden="true">→</i></Link>
          <Link className="wallet-action-card" to="/payments/history"><span className="wallet-action-icon" aria-hidden="true">≡</span><span><strong>All activity</strong><small>Check recorded payment stages</small></span><i aria-hidden="true">→</i></Link>
        </div>
      </section>

      <section className="wallet-insights-grid" aria-label="Earnings and payment activity">
        <article className="wallet-insight-panel wallet-earnings-panel">
          <header className="wallet-panel-heading"><div><span className="member-eyebrow">EARNINGS RECORD / 02</span><h3>Progress by period</h3><p>Reported earnings exclude recharges and locked refunds.</p></div><span className="wallet-panel-mark" aria-hidden="true">02</span></header>
          {summaryQuery.isError ? <div className="wallet-query-error" role="alert">Earnings summary is unavailable. <button type="button" onClick={() => void summaryQuery.refetch()}>Retry</button></div> : <div className="wallet-period-strip">{periods.map((period) => <div key={period.label}><span>{period.label}</span><strong>{summaryQuery.isLoading ? '—' : money(period.value)}</strong></div>)}</div>}
          <div className="wallet-breakdown-heading"><span>Recorded sources</span><Link to="/dashboard">Dashboard details →</Link></div>
          {summaryQuery.isError ? <div className="wallet-query-error" role="alert">Earning categories are unavailable. <button type="button" onClick={() => void summaryQuery.refetch()}>Retry sources</button></div> : <dl className="wallet-breakdown-list">{breakdown.map((item) => <div className={item.pending ? 'is-pending' : ''} key={item.label}><dt>{item.label}</dt><dd>{item.source.isLoading ? '—' : money(item.value)}</dd></div>)}</dl>}
        </article>

        <article className="wallet-insight-panel wallet-activity-panel">
          <header className="wallet-panel-heading"><div><span className="member-eyebrow">SERVICE RECORDS / 03</span><h3>Recent payment activity</h3><p>Each stage is shown as recorded by the payment service.</p></div><Link to="/payments/history" aria-label="View all payment activity">All <span aria-hidden="true">↗</span></Link></header>
          {historyQuery.isLoading ? <p className="wallet-activity-empty" role="status">Loading payment records…</p> : historyQuery.isError ? <div className="wallet-query-error" role="alert">Payment activity is unavailable. <button type="button" onClick={() => void historyQuery.refetch()}>Retry</button></div> : payments.length ? <ul className="wallet-activity-list">{payments.map((payment) => {
            const status = (payment.status || '').toLowerCase()
            return <li key={payment.id}>
              <span className={`wallet-activity-mark${payment.type === 'payout' ? ' is-outgoing' : ''}`} aria-hidden="true">{payment.type === 'payout' ? '↗' : '↙'}</span>
              <span className="wallet-activity-copy"><strong>{payment.type === 'deposit' ? 'Deposit request' : 'Payout request'}</strong><small>{payment.payment_method || (payment.type === 'deposit' ? 'Deposit method' : 'Payout destination')} · {recordDate(payment.created_at)}</small></span>
              <span className="wallet-activity-value"><strong>{money(payment.amount)}</strong><small className={`wallet-status ${statusTone(status)}`}>{statusLabel(payment)}</small></span>
            </li>
          })}</ul> : <div className="wallet-activity-empty"><strong>No payment records yet</strong><span>Deposit and payout requests will appear here with their current service stage.</span></div>}
        </article>
      </section>

      <p className="wallet-policy-note"><span aria-hidden="true">i</span><span>Deposit requests remain under administrator review until approved and credited. Payout requests remain pending until the payment record confirms completion.</span></p>
    </div>
  )
}
