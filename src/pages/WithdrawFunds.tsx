import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { formatCash } from '../services/money'

interface WithdrawalAccount { id: number; type: string; label: string; address: string; network: string | null; is_primary: boolean }
interface PaymentRecord { id?: number; type: string; status: string; amount?: number; created_at?: string; payment_method?: string }
interface AppConfig { key: string; value: string }

export default function WithdrawFunds() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<{ withdrawal_wallet_balance?: number; current_plan_id?: number | null; has_purchased_first_package?: boolean }>('/auth/me')).data, staleTime: 0 })
  const accountsQuery = useQuery({ queryKey: ['withdrawal-accounts'] as const, queryFn: async () => (await api.get<WithdrawalAccount[]>('/withdrawal-accounts')).data ?? [] })
  const historyQuery = useQuery({ queryKey: queryKeys.payments.history(1, 50), queryFn: async () => (await api.get<PaymentRecord[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [], staleTime: 0 })
  const scheduleQuery = useQuery({ queryKey: queryKeys.appConfig, queryFn: async () => (await api.get<AppConfig[]>('/settings/config')).data ?? [], staleTime: 5 * 60_000 })
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [password, setPassword] = useState('')
  const [review, setReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const balance = userQuery.data?.withdrawal_wallet_balance
  const accounts = (accountsQuery.data ?? []).filter((item) => item.type.toLowerCase() === 'mpesa')
  const history = (historyQuery.data ?? []).filter((item) => item.type === 'payout')
  const effectiveAccountId = accountId || accounts.find((item) => item.is_primary)?.id || accounts[0]?.id || ''
  const selectedAccount = accounts.find((item) => item.id === effectiveAccountId)
  const amountValue = Number(amount)
  const pending = history.find((item) => ['pending', 'under_review', 'processing', 'in_progress'].includes(item.status))
  const todayUtc = new Date().toISOString().slice(0, 10)
  const today = history.find((item) => {
    if (!item.created_at) return false
    const createdAt = new Date(item.created_at)
    return Number.isFinite(createdAt.getTime()) && createdAt.toISOString().slice(0, 10) === todayUtc
  })
  const eligible = Boolean(userQuery.data?.has_purchased_first_package && userQuery.data?.current_plan_id)
  const schedule = Object.fromEntries((Array.isArray(scheduleQuery.data) ? scheduleQuery.data : []).map((item) => [item.key, item.value]))
  const scheduleKnown = typeof schedule.withdrawal_schedule_enabled === 'string' && typeof schedule.withdrawal_allowed_days === 'string' && typeof schedule.withdrawal_start_time === 'string' && typeof schedule.withdrawal_end_time === 'string' && typeof schedule.withdrawal_timezone === 'string'
  const scheduleLabel = !scheduleKnown ? 'Unavailable from the current config response.' : schedule.withdrawal_schedule_enabled !== 'true' ? 'Open at all times (service configuration).' : `${schedule.withdrawal_allowed_days.split(',').join(', ')} · ${schedule.withdrawal_start_time}–${schedule.withdrawal_end_time} (${schedule.withdrawal_timezone})`
  const payoutStatus = (status: string) => status === 'pending' ? 'Awaiting administrator review' : status === 'under_review' ? 'Administrator review in progress' : status === 'paid' ? 'Payout completed' : status === 'rejected' ? 'Rejected' : status === 'cancelled' ? 'Cancelled' : status === 'processing' || status === 'in_progress' ? 'Processing' : `Service status: ${status}`
  const hasPreflightError = userQuery.isError || accountsQuery.isError || historyQuery.isError
  const canReview = amount.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0 && Boolean(effectiveAccountId) && balance !== undefined && amountValue <= balance && eligible && !pending && !today && !hasPreflightError && !userQuery.isFetching && !accountsQuery.isFetching && !historyQuery.isFetching

  const openReview = () => {
    setError('')
    if (!amount.trim() || !Number.isFinite(amountValue) || amountValue <= 0) return setError('Enter a valid cash amount greater than zero.')
    if (!selectedAccount) return setError('Choose an M-Pesa account before continuing.')
    if (!eligible) return setError('The current-user response does not show the required purchased plan and active plan status.')
    if (balance === undefined) return setError('Your current balance is unavailable. Retry the account request before continuing.')
    if (amountValue > balance) return setError('The requested cash amount exceeds the current-user balance.')
    if (pending || today) return setError('Payment history shows an existing pending request or a request today. The server enforces the final checks.')
    if (historyQuery.isError) return setError('Payment history could not be checked; retry before requesting a withdrawal.')
    if (userQuery.isError || accountsQuery.isError) return setError('Required account data could not be checked; retry before requesting a withdrawal.')
    setReview(true)
  }

  const submitWithdrawal = async () => {
    if (!password.trim() || submitting || !canReview) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/payments/withdraw', { amount: amountValue, account_id: effectiveAccountId, password })
      await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }), queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }), queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }), queryClient.invalidateQueries({ queryKey: queryKeys.payments.historyBase })])
      setSuccess(true)
      setReview(false)
    } catch (err: unknown) {
      const detail = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail : null
      setError(typeof detail === 'string' ? detail : 'Cash withdrawal request failed. Check your details and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const retryAll = () => { void userQuery.refetch(); void accountsQuery.refetch(); void historyQuery.refetch(); void scheduleQuery.refetch() }

  return <main className="withdraw-page">
    <header className="withdraw-top"><button type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button><div><span className="withdraw-kicker">FIELD ATLAS / WALLET</span><h1>{success ? 'Request received' : 'Withdraw cash'}</h1></div><button type="button" onClick={() => navigate('/payments/history')}>History</button></header>
    {success ? <section className="withdraw-card" role="status"><span className="withdraw-stamp">SUBMITTED</span><h2>Cash withdrawal request submitted</h2><p>{formatCash(amountValue)} · M-Pesa · {selectedAccount?.address}. The request is recorded as pending and awaits administrator review. It is not marked paid until the payment record confirms completion.</p><button className="withdraw-primary" onClick={() => navigate('/payments')}>Return to wallet</button></section> : <>
      {(userQuery.isError || accountsQuery.isError || historyQuery.isError || scheduleQuery.isError) && <div className="withdraw-alert" role="alert">Some account, payment-history or policy details could not be loaded. No balance or eligibility is assumed. <button onClick={retryAll}>Retry all checks</button></div>}
      <section className="withdraw-balance withdraw-card"><span>Cash withdrawal wallet · current user</span><strong>{balance === undefined ? '—' : formatCash(balance)}</strong><small>{userQuery.isFetching ? 'Refreshing account response…' : balance === undefined ? 'Balance unavailable; request /auth/me.' : 'Shown from the latest /auth/me response; the server validates again.'}</small></section>
      <div className="withdraw-layout"><section className="withdraw-card withdraw-form"><div className="withdraw-step">01 / REQUEST DETAILS</div><label htmlFor="withdraw-amount">Cash amount</label><input id="withdraw-amount" type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
      <label htmlFor="withdraw-account">M-Pesa destination</label><select id="withdraw-account" value={effectiveAccountId} onChange={(event) => setAccountId(event.target.value ? Number(event.target.value) : '')}><option value="">Select M-Pesa account</option>{accounts.map((item) => <option key={item.id} value={item.id}>M-PESA · {item.address}</option>)}</select>
      {selectedAccount && <p className="withdraw-note">Cash payouts are sent to {selectedAccount.address}. Backend account verification status is not exposed by this response.</p>}
      {!accounts.length && !accountsQuery.isLoading && <p className="withdraw-note">No M-Pesa accounts found. <button className="withdraw-link" onClick={() => navigate('/withdrawal-accounts')}>Add an account</button></p>}
      <label htmlFor="withdraw-password">Withdrawal password</label><input id="withdraw-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Required at final confirmation" />
      <button className="withdraw-primary" type="button" disabled={!canReview} onClick={openReview}>Review cash request</button></section>
      <aside className="withdraw-card withdraw-checks"><div className="withdraw-step">02 / PRE-FLIGHT</div><h2>Checks from current records</h2><p><b>Eligibility:</b> {userQuery.data ? eligible ? 'Current user response has a purchased first package and plan ID.' : 'Required plan fields not satisfied in current-user response.' : 'Unavailable until /auth/me responds.'}</p><p><b>Payment history:</b> {historyQuery.isLoading ? 'Loading…' : historyQuery.isError ? 'Unavailable; retry required.' : `${history.length} payout records checked (latest page of 50).`}</p><p><b>Pending:</b> {pending ? `${payoutStatus(pending.status)} request found.` : historyQuery.isError ? 'Unknown.' : 'No pending status found in loaded history; server checks again.'}</p><p><b>Daily limit:</b> {today ? 'A payout created today appears in loaded history.' : historyQuery.isError ? 'Unknown.' : 'No payout dated today in loaded history. Server enforces one request per UTC day, regardless of outcome.'}</p><p><b>Schedule:</b> {scheduleQuery.isLoading ? 'Loading service configuration…' : scheduleQuery.isError ? 'Unavailable; the server will enforce the active schedule.' : scheduleLabel}</p></aside></div>
      {history.length > 0 && <section className="withdraw-card withdraw-history"><h2>Recent payout records</h2>{history.slice(0, 5).map((item, index) => <div className="withdraw-record" key={item.id ?? `${item.created_at}-${index}`}><span>{formatCash(Number(item.amount ?? 0))} · {item.payment_method || 'M-Pesa'}</span><span>{payoutStatus(item.status)} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unavailable'}</span></div>)}</section>}
      {error && <div className="withdraw-alert" role="alert">{error}</div>}
    </>}
    {review && <div className="withdraw-overlay"><section className="withdraw-review" role="dialog" aria-modal="true" aria-labelledby="withdraw-review-title"><span className="withdraw-step">03 / FINAL REVIEW</span><h2 id="withdraw-review-title">Confirm this cash payout</h2><p>Amount <strong>{formatCash(amountValue)}</strong></p><p>Destination <strong>M-PESA · {selectedAccount?.address}</strong></p><p><b>Configured withdrawal window:</b> {scheduleLabel}</p><p>Client checks are provisional. The server revalidates current schedule, UTC daily/pending status, password, balance and account ownership.</p><label htmlFor="final-withdraw-password">Withdrawal password</label><input id="final-withdraw-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><div className="withdraw-actions"><button type="button" onClick={() => setReview(false)} disabled={submitting}>Back</button><button className="withdraw-primary" type="button" disabled={!password.trim() || !canReview || submitting} onClick={() => void submitWithdrawal()}>{submitting ? 'Submitting…' : 'Confirm and submit once'}</button></div></section></div>}
  </main>
}
