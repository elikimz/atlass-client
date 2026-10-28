import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { formatCash } from '../services/money'

type Payment = {
  id: number
  period: string
  amount: number
  status: string
  type: string
  payment_method: string | null
  network: string | null
  proof_url: string | null
  admin_notes: string | null
  created_at: string | null
}
type Filter = 'all' | 'deposit' | 'payout'

const displayStatus = (payment: Payment) => {
  const status = payment.status.toLowerCase()
  if (status === 'pending') return 'Awaiting admin review'
  if (status === 'under_review') return 'Admin review in progress'
  if (status === 'paid') return payment.type === 'deposit' ? 'Approved · credited' : 'Paid'
  if (status === 'processing' || status === 'in_progress') return 'Processing'
  if (status === 'rejected') return 'Rejected'
  if (status === 'cancelled') return 'Cancelled'
  return payment.status ? `Service status: ${payment.status}` : 'Status unavailable'
}

const statusTone = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'is-success'
    case 'rejected': return 'is-danger'
    case 'cancelled': return 'is-muted'
    case 'pending':
    case 'under_review':
    case 'processing':
    case 'in_progress': return 'is-review'
    default: return 'is-muted'
  }
}

const money = (value: number) => formatCash(value)

export default function PaymentHistory() {
  const navigate = useNavigate()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const paymentQuery = useQuery({
    queryKey: queryKeys.payments.history(1, 50),
    queryFn: async () => (await api.get<Payment[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const payments = Array.isArray(paymentQuery.data) ? paymentQuery.data : []
  const filteredPayments = filter === 'all' ? payments : payments.filter((payment) => payment.type === filter)

  return <main className="payment-history-page">
    <header className="payment-history-head">
      <button className="payment-history-back" type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button>
      <div><span className="member-eyebrow">WALLET / AUDIT TRAIL</span><h1>Payment activity</h1><p>Deposits and payout requests with their current service-recorded stage.</p></div>
      <span className="payment-history-count">{paymentQuery.isLoading ? '…' : `${payments.length} latest records`}</span>
    </header>

    <nav className="payment-history-filters" aria-label="Filter payment history">
      {([{ key: 'all', title: 'All activity' }, { key: 'deposit', title: 'Deposits' }, { key: 'payout', title: 'Payouts' }] as const).map((item) => <button key={item.key} type="button" aria-pressed={filter === item.key} className={filter === item.key ? 'is-active' : ''} onClick={() => setFilter(item.key)}>{item.title}</button>)}
    </nav>

    {paymentQuery.isLoading ? <div className="payment-history-empty" role="status">Loading payment records…</div> : paymentQuery.isError ? <div className="member-notice member-notice--error" role="alert">Payment history is unavailable. <button type="button" onClick={() => void paymentQuery.refetch()}>Retry</button></div> : !filteredPayments.length ? <div className="payment-history-empty"><span className="member-eyebrow">NO MATCHING RECORDS</span><h2>Nothing in this view yet</h2><p>When a deposit or payout request is recorded, its latest status will appear here.</p></div> : <section className="payment-history-list" aria-label="Payment records">
      {filteredPayments.map((payment) => <button type="button" className="payment-history-row" key={payment.id} onClick={() => setSelectedPayment(payment)} aria-label={`${payment.type === 'deposit' ? 'Deposit' : 'Payout'} ${money(payment.amount)}: ${displayStatus(payment)}`}>
        <span className={`payment-history-mark ${payment.type === 'payout' ? 'is-payout' : ''}`} aria-hidden="true">{payment.type === 'payout' ? '↗' : '↙'}</span>
        <span className="payment-history-copy"><span className="member-eyebrow">{payment.type === 'deposit' ? 'DEPOSIT' : 'PAYOUT REQUEST'} · {payment.period || 'PERIOD UNAVAILABLE'}</span><strong>{payment.payment_method || (payment.type === 'deposit' ? 'Deposit method' : 'Payout destination')}</strong><small>{payment.created_at ? new Date(payment.created_at).toLocaleString() : 'Date unavailable'}</small></span>
        <span className="payment-history-value"><strong>{money(payment.amount)}</strong><span className={`payment-history-status ${statusTone(payment.status)}`}>{displayStatus(payment)}</span></span>
      </button>)}
    </section>}

    <p className="payment-history-footnote">A request marked as pending is not approved or paid. Deposits are credited only after administrator approval; payouts are complete only when the record is marked paid.</p>

    {selectedPayment && <div className="payment-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPayment(null) }}>
      <section className="payment-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
        <header><div><span className="member-eyebrow">RECORD / {selectedPayment.id}</span><h2 id="payment-detail-title">{selectedPayment.type === 'deposit' ? 'Deposit detail' : 'Payout detail'}</h2></div><button type="button" onClick={() => setSelectedPayment(null)} aria-label="Close payment details">×</button></header>
        <dl className="payment-detail-grid"><div><dt>Current stage</dt><dd><span className={`payment-history-status ${statusTone(selectedPayment.status)}`}>{displayStatus(selectedPayment)}</span></dd></div><div><dt>Amount</dt><dd>{money(selectedPayment.amount)}</dd></div><div><dt>Method</dt><dd>{selectedPayment.payment_method || 'Not supplied'}</dd></div><div><dt>Network</dt><dd>{selectedPayment.network || 'Not supplied'}</dd></div><div><dt>Created</dt><dd>{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString() : 'Date unavailable'}</dd></div></dl>
        {selectedPayment.admin_notes && <div className="payment-detail-note"><span className="member-eyebrow">REVIEW NOTE</span><p>{selectedPayment.admin_notes}</p></div>}
        {selectedPayment.proof_url?.startsWith('https://') && <a className="member-button member-button--outline" href={selectedPayment.proof_url} target="_blank" rel="noopener noreferrer">Open submitted payment proof ↗</a>}
        <button className="member-button member-button--primary payment-detail-close" type="button" onClick={() => setSelectedPayment(null)}>Close details</button>
      </section>
    </div>}
  </main>
}
