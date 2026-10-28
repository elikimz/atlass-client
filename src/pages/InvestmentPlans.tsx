import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { formatCash } from '../services/money'

const pageOpenedAt = Date.now()

interface Plan {
  id: number
  name: string
  price: number
  daily_earnings: number
  total_return: number
  profit: number
  daily_tasks_limit: number
  validity_days: number
  description: string
  is_upgrade_only: boolean
}

interface UserData {
  id: number
  first_name: string
  last_name: string
  deposit_wallet_balance: number
  performance_bonus_balance: number
  current_plan_id: number | null
  plan_start_date?: string
  plan_expiry_date?: string
  current_plan?: Plan
}

const money = (amount: number | null | undefined) => formatCash(amount)

function apiErrorText(error: unknown) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return 'The request could not reach the service. Check your connection and try again.'
  const response = (error as { response?: { data?: unknown; status?: number } }).response
  const data = response?.data
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = data.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      const messages = detail.map((item) => typeof item === 'object' && item !== null && 'msg' in item && typeof item.msg === 'string' ? item.msg : '').filter(Boolean)
      if (messages.length) return messages.join(' ')
    }
  }
  return response?.status && response.status >= 500 ? 'The plan service is temporarily unavailable. Try again shortly.' : 'The request could not be completed. Check the plan and wallet details, then try again.'
}

function parseDate(value?: string) {
  if (!value) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
  const parsed = new Date(hasTimezone ? normalized : `${normalized}Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateLabel(value?: string) {
  const parsed = parseDate(value)
  return parsed ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(parsed) : 'Date not available'
}

export default function InvestmentPlans() {
  const queryClient = useQueryClient()
  const [reviewPlan, setReviewPlan] = useState<Plan | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const plansQuery = useQuery({
    queryKey: queryKeys.plans.all,
    queryFn: async () => (await api.get<Plan[]>('/plans')).data ?? [],
    staleTime: 10 * 60 * 1000,
  })
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<UserData>('/auth/me')).data,
    staleTime: 5 * 60 * 1000,
  })
  const plans = (plansQuery.data ?? []).slice().sort((first, second) => first.price - second.price)
  const user = userQuery.data ?? null

  const purchaseMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const isUpgrade = user?.current_plan_id !== null && user?.current_plan_id !== undefined
      const endpoint = isUpgrade ? `/plans/upgrade/${plan.id}` : `/plans/purchase/${plan.id}`
      const response = await api.post(endpoint)
      return { response, plan, isUpgrade }
    },
    onMutate: () => setMessage(null),
      onSuccess: ({ response, plan, isUpgrade }) => {
      if (response.data?.user) {
        queryClient.setQueryData(queryKeys.auth.currentUser, (current: UserData | undefined) => ({ ...current, ...response.data.user }))
      }
      setMessage({
        type: 'success',
        text: plan.name === 'Intern'
          ? 'Free Intern trial activated successfully!'
          : isUpgrade ? `Successfully upgraded to ${plan.name}!` : `Successfully purchased ${plan.name}!`,
      })
      setReviewPlan(null)
    },
    onError: (error: unknown) => setMessage({ type: 'error', text: apiErrorText(error) }),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.available }),
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.active }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.historyBase }),
      ])
    },
  })

  const retryQueries = () => {
    void plansQuery.refetch()
    void userQuery.refetch()
  }

  if (plansQuery.isLoading || userQuery.isLoading) {
    return <section className="member-page-state" role="status"><span className="member-loading-indicator" /><span>Loading plan options…</span></section>
  }
  if (plansQuery.isError || userQuery.isError || !user) {
    return <section className="member-page-state member-page-state--error" role="alert"><span className="member-state-code">02 / PLANS</span><h2>Plan details are unavailable.</h2><p>Your current wallet and plan have not been changed.</p><button className="member-button member-button--primary" type="button" onClick={retryQueries}>Try again</button></section>
  }

  const hasCurrentPlan = user.current_plan_id !== null && user.current_plan_id !== undefined
  const parsedExpiry = parseDate(user.plan_expiry_date)
  const planExpired = Boolean(parsedExpiry && parsedExpiry.getTime() < pageOpenedAt)
  const currentPlan = user.current_plan ?? plans.find((plan) => plan.id === user.current_plan_id)
  const currentPlanName = currentPlan?.name || (hasCurrentPlan ? 'Current plan' : 'No active plan')
  const actionLoading = purchaseMutation.isPending ? purchaseMutation.variables?.id ?? null : null

  return (
    <div className="member-plans">
      <header className="member-page-heading member-plans-heading">
        <div><span className="member-eyebrow">GROWTH / MEMBERSHIP</span><h2>Choose your next level.</h2><p>Compare the current plan options and see how each one fits your account.</p></div>
        <Link className="member-inline-route" to="/payments">Open wallet <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="plan-account-strip" aria-label="Current membership and balances">
        <div className="plan-account-current"><span className="plan-account-index">ACCOUNT STATE</span><strong>{planExpired ? `${currentPlanName} · expired` : hasCurrentPlan ? currentPlanName : 'No current plan'}</strong><small>{hasCurrentPlan ? `Recorded expiry · ${dateLabel(user.plan_expiry_date)}` : 'Choose a plan to get started'}</small></div>
        <div className="plan-account-balance"><span>DEPOSIT WALLET</span><strong>{money(user.deposit_wallet_balance)}</strong><Link to="/payments">Add funds →</Link></div>
        <div className="plan-account-balance plan-account-balance--bonus"><span>PERFORMANCE BONUS</span><strong>{money(user.performance_bonus_balance)}</strong><small>Shown separately from deposit funds</small></div>
      </section>

      {message && <div className={`member-notice member-notice--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}

      <section className="plan-comparison-section" aria-labelledby="plan-comparison-title">
        <div className="member-section-heading"><div><span className="member-eyebrow">AVAILABLE OPTIONS / {String(plans.length).padStart(2, '0')}</span><h3 id="plan-comparison-title">Compare plans</h3><p>Values below come from the current plan catalogue.</p></div></div>
        {plans.length === 0 ? <div className="member-empty-state"><strong>No plans are available right now.</strong><span>Check again later or contact support.</span></div> : (
          <div className="plan-comparison-list">
            <div className="plan-comparison-head" aria-hidden="true"><span>PROGRAM</span><span>PRICE</span><span>DAILY ACTIVITY</span><span>TERM</span><span>ACCESS</span></div>
            {plans.map((plan, index) => {
              const isActive = user.current_plan_id === plan.id
              const isLowerTier = Boolean(hasCurrentPlan && !planExpired && currentPlan && plan.price <= currentPlan.price)
              const missingCurrentPlanDetails = hasCurrentPlan && !currentPlan
              // The backend requires the FULL new plan price for upgrades, not only the difference.
              const requiredBalance = plan.price
              const hasEnoughBalance = plan.name === 'Intern' || (user.deposit_wallet_balance || 0) >= requiredBalance
              const canPurchase = !isActive && !missingCurrentPlanDetails && hasEnoughBalance && (!plan.is_upgrade_only || (hasCurrentPlan && !planExpired && !isLowerTier)) && (!hasCurrentPlan || planExpired || !isLowerTier)
              const shortfall = Math.max(0, requiredBalance - (user.deposit_wallet_balance || 0))
              const actionLabel = actionLoading === plan.id ? 'Processing…'
                : isActive ? 'Current plan'
                  : missingCurrentPlanDetails ? 'Current plan unavailable'
                  : plan.is_upgrade_only && (!hasCurrentPlan || planExpired) ? 'Upgrade-only plan'
                    : isLowerTier ? 'Higher tier required'
                    : !hasEnoughBalance ? `Need ${money(shortfall)} more`
                      : plan.name === 'Intern' ? 'Activate free trial'
                        : hasCurrentPlan ? `Upgrade to ${plan.name}` : `Choose ${plan.name}`
              return (
                <article className={`plan-comparison-row${isActive ? ' is-current' : ''}${!canPurchase && !isActive ? ' is-unavailable' : ''}`} key={plan.id}>
                  <div className="plan-cell plan-program-cell" data-label="Program"><span className="plan-row-number">{String(index + 1).padStart(2, '0')}</span><div><div className="plan-program-title"><h4>{plan.name}</h4>{isActive && <span className="plan-state-badge">ACTIVE</span>}{plan.name === 'Intern' && !isActive && <span className="plan-trial-badge">FREE TRIAL</span>}</div><p>{plan.description || 'Plan details were not supplied.'}</p></div></div>
                  <div className="plan-cell" data-label="Price"><strong>{money(plan.price)}</strong><small>Cash</small></div>
                  <div className="plan-cell" data-label="Daily activity"><strong>{money(plan.daily_earnings)}</strong><small>{plan.daily_tasks_limit} tasks / day</small></div>
                  <div className="plan-cell" data-label="Term"><strong>{plan.validity_days}</strong><small>days</small></div>
                  <div className="plan-cell plan-action-cell" data-label="Access"><button className="member-button member-button--primary plan-action-button" type="button" onClick={() => setReviewPlan(plan)} disabled={!canPurchase || actionLoading !== null}>{actionLabel}</button>{!isActive && !isLowerTier && !hasEnoughBalance && <small className="plan-action-note">Deposit Wallet is short by {money(shortfall)}.</small>}{plan.is_upgrade_only && <small className="plan-action-note">Upgrade-only eligibility is set by the catalogue.</small>}</div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      {reviewPlan && <div className="plan-review-backdrop" role="presentation"><section className="plan-review-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-review-title"><span className="member-eyebrow">FINAL REVIEW / NO CHARGE YET</span><h3 id="plan-review-title">Review {reviewPlan.name}</h3><p>Price to charge Deposit Wallet: <strong>{money(reviewPlan.price)}</strong></p><p>Term: <strong>{reviewPlan.validity_days} days</strong></p><p>Daily task limit: <strong>{reviewPlan.daily_tasks_limit}</strong></p><p>These are catalogue terms only; no return or profit estimate is provided. The server will make the final eligibility decision.</p>{message?.type === 'error' && <p role="alert">{message.text}</p>}<div><button className="member-button member-button--outline" type="button" onClick={() => setReviewPlan(null)} disabled={purchaseMutation.isPending}>Go back</button><button className="member-button member-button--primary" type="button" onClick={() => purchaseMutation.mutate(reviewPlan)} disabled={purchaseMutation.isPending}>{purchaseMutation.isPending ? 'Submitting…' : `Confirm ${money(reviewPlan.price)}`}</button></div></section></div>}

      <details className="plan-policy-panel">
        <summary><span><small>BEFORE YOU CHOOSE</small><strong>Plan and upgrade rules</strong></span><span className="plan-policy-toggle" aria-hidden="true">＋</span></summary>
        <div className="plan-policy-grid">
          <article><span>01</span><div><strong>One active plan</strong><p>You may have only one active plan at a time. A purchase changes your current plan.</p></div></article>
          <article><span>02</span><div><strong>Expiry and eligibility</strong><p>After a plan expires, use an eligible upgrade to continue. Lower-tier repeats remain locked while a plan is active.</p></div></article>
          <article><span>03</span><div><strong>Upgrade funds</strong><p>The full new plan price is taken from Deposit Wallet. The prior plan price is returned immediately to Withdrawal Wallet.</p></div></article>
          <article><span>04</span><div><strong>Referral commissions</strong><p>Upgrades do not generate invite commissions for your upline; first-time purchases are treated differently.</p></div></article>
        </div>
      </details>
      <p className="plan-footer-note">Plan activation is applied immediately by the account service. Values and eligibility are based on the current catalogue and your account state.</p>
    </div>
  )
}
