import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { formatCash } from '../services/money'

type Payment = { id: number; amount: number; type: string; status: string; payment_method: string | null; created_at: string | null; period: string }
type CurrentUser = { deposit_wallet_balance?: number }
const MIN_CASH_DEPOSIT = 20
const AMOUNTS = [20, 50, 100, 150, 200]

function depositStatus(status: string) {
  if (status === 'pending') return 'Awaiting admin review'
  if (status === 'under_review') return 'Admin review in progress'
  if (status === 'paid') return 'Approved · credited'
  if (status === 'rejected') return 'Rejected'
  if (status === 'cancelled') return 'Cancelled'
  return status ? `Service status: ${status}` : 'Status unavailable'
}

export default function Recharge() {
  const navigate = useNavigate()
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<CurrentUser>('/auth/me')).data, staleTime: 0 })
  const historyQuery = useQuery({ queryKey: queryKeys.payments.history(1, 50), queryFn: async () => (await api.get<Payment[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [], staleTime: 0 })
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [error, setError] = useState('')

  const balance = userQuery.isError ? undefined : userQuery.data?.deposit_wallet_balance
  const payments = (Array.isArray(historyQuery.data) ? historyQuery.data : []).filter((payment) => payment.type === 'deposit').slice(0, 5)
  const amount = customAmount.trim() ? Number(customAmount) : selectedAmount ?? 0
  const validAmount = Number.isFinite(amount) && amount >= MIN_CASH_DEPOSIT

  const proceed = () => {
    setError('')
    if (!validAmount) {
      setError(`The minimum deposit is ${formatCash(MIN_CASH_DEPOSIT)}.`)
      return
    }
    navigate('/payments/mpesa', { state: { rechargeAmount: amount } })
  }

  return <main className="recharge-page">
    <header className="recharge-header"><button type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button><div><span className="member-eyebrow">WALLET / ADD FUNDS</span><h1>Recharge wallet</h1></div><button type="button" onClick={() => navigate('/payments/history')}>Activity</button></header>

    <section className="recharge-balance"><span className="member-eyebrow">DEPOSIT WALLET · SERVER BALANCE</span><strong>{balance === undefined ? '—' : formatCash(balance)}</strong><small>{userQuery.isError ? 'Balance unavailable; retry your account request.' : userQuery.isFetching ? 'Refreshing account response…' : 'Deposit funds are separate from cashable earnings.'}</small>{userQuery.isError && <button type="button" onClick={() => void userQuery.refetch()}>Retry balance</button>}</section>

    <div className="recharge-columns"><section className="recharge-card"><div className="recharge-step">01 / AMOUNT & ROUTE</div><h2>Choose cash amount</h2><p className="recharge-copy">Select the amount to send through M-Pesa. The server applies its final minimum check before starting the payment.</p>
      <div className="recharge-amounts">{AMOUNTS.map((value) => <button type="button" key={value} className={selectedAmount === value && !customAmount ? 'is-selected' : ''} onClick={() => { setSelectedAmount(value); setCustomAmount(''); setError('') }}>{formatCash(value, 0)}</button>)}</div>
      <label className="recharge-field" htmlFor="recharge-custom-amount"><span>Custom cash amount</span><input id="recharge-custom-amount" type="number" min={MIN_CASH_DEPOSIT} step="0.01" inputMode="decimal" value={customAmount} placeholder="Enter amount" onChange={(event) => { setCustomAmount(event.target.value); setSelectedAmount(null); setError('') }} /></label>
      <p className="recharge-minimum">Minimum: {formatCash(MIN_CASH_DEPOSIT)}.</p>
      <div className="recharge-methods" role="group" aria-label="Deposit method"><button type="button" className="is-selected" disabled><span className="recharge-method-mark is-persimmon">M</span><span><strong>M-Pesa</strong><small>STK prompt · payment attempt submitted to admin review</small></span><span className="recharge-radio" aria-hidden="true">✓</span></button></div>
      {error && <p className="recharge-error" role="alert">{error}</p>}
      <button type="button" className="member-button member-button--primary recharge-proceed" disabled={!validAmount} onClick={proceed}>Continue to M-Pesa <span aria-hidden="true">→</span></button>
    </section>
    <aside className="recharge-card recharge-review-note"><div className="recharge-step">PAYMENT POLICY</div><h2>Request first. Credit after review.</h2><p>After you confirm the M-Pesa prompt, the deposit request is placed in the admin review queue. The deposit wallet is credited only after approval.</p><button className="recharge-history-link" type="button" onClick={() => navigate('/payments/history')}>View payment activity →</button></aside></div>

    <section className="recharge-card recharge-history"><div className="recharge-history-head"><div><span className="member-eyebrow">LATEST SERVICE RECORDS</span><h2>Recent deposits</h2></div><button type="button" onClick={() => navigate('/payments/history')}>Full activity</button></div>
      {historyQuery.isLoading ? <p role="status">Loading deposit records…</p> : historyQuery.isError ? <p className="recharge-error" role="alert">Deposit history is unavailable. <button type="button" onClick={() => void historyQuery.refetch()}>Retry</button></p> : payments.length ? <div className="recharge-history-list">{payments.map((payment) => <div className="recharge-history-row" key={payment.id}><span><strong>{formatCash(Number(payment.amount))}</strong><small>{payment.created_at ? new Date(payment.created_at).toLocaleString() : payment.period || 'Date unavailable'}</small></span><span>{payment.payment_method || 'M-Pesa'}<small className={`recharge-status${payment.status === 'paid' ? ' is-paid' : payment.status === 'rejected' ? ' is-rejected' : ''}`}>{depositStatus(payment.status)}</small></span></div>)}</div> : <p className="recharge-copy">No deposit records have been returned for this account yet.</p>}
    </section>
  </main>
}
