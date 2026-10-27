import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

type RechargeMethod = 'crypto' | 'mpesa' | 'paypal' | 'wise' | 'payoneer'
type Payment = { id: number; amount: number; type: string; status: string; payment_method: string | null; created_at: string | null; period: string }
type CurrentUser = { deposit_wallet_balance?: number }
const USDT_ADDRESS = '0xcfed1cdcce064dc27f60bbf2292fc5c15082fc86'
const USDT_NETWORK = 'BEP20 (BNB Smart Chain)'
const CLOUDINARY_UPLOAD_PRESET = 'task_images'
const CLOUDINARY_CLOUD_NAME = 'doste1wr0'
const MIN_CRYPTO_DEPOSIT_USD = 3
const MIN_OTHER_DEPOSIT_USD = 20
const AMOUNTS = [20, 50, 100, 150, 200]
const COMING_SOON: Record<'paypal' | 'wise' | 'payoneer', string> = { paypal: 'PayPal', wise: 'Wise', payoneer: 'Payoneer' }

function depositStatus(status: string) {
  if (status === 'pending') return 'Awaiting admin review'
  if (status === 'under_review') return 'Admin review in progress'
  if (status === 'paid') return 'Approved · credited'
  if (status === 'rejected') return 'Rejected'
  if (status === 'cancelled') return 'Cancelled'
  return status ? `Service status: ${status}` : 'Status unavailable'
}

function errorDetail(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function Recharge() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<CurrentUser>('/auth/me')).data, staleTime: 0 })
  const historyQuery = useQuery({ queryKey: queryKeys.payments.history(1, 50), queryFn: async () => (await api.get<Payment[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [], staleTime: 0 })
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState<RechargeMethod>('crypto')
  const [step, setStep] = useState<'amount' | 'crypto' | 'success'>('amount')
  const [copied, setCopied] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [error, setError] = useState('')
  const [copiedError, setCopiedError] = useState('')

  const balance = userQuery.isError ? undefined : userQuery.data?.deposit_wallet_balance
  const payments = (Array.isArray(historyQuery.data) ? historyQuery.data : []).filter((payment) => payment.type === 'deposit').slice(0, 5)
  const amount = customAmount.trim() ? Number(customAmount) : selectedAmount ?? 0
  const minimum = method === 'crypto' ? MIN_CRYPTO_DEPOSIT_USD : MIN_OTHER_DEPOSIT_USD
  const validAmount = Number.isFinite(amount) && amount >= minimum
  const comingSoon = method === 'paypal' || method === 'wise' || method === 'payoneer'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(USDT_ADDRESS)}&bgcolor=ffffff&color=1746e8&margin=10`

  const selectMethod = (next: RechargeMethod) => {
    setMethod(next)
    setError('')
  }
  const proceed = () => {
    setError('')
    if (!validAmount) return setError(`The minimum for this method is $${minimum.toFixed(2)} USD.`)
    if (method === 'paypal' || method === 'wise' || method === 'payoneer') return setError(`${COMING_SOON[method]} is not available for deposits yet.`)
    if (method === 'mpesa') return navigate('/payments/mpesa', { state: { rechargeAmount: amount } })
    setStep('crypto')
  }
  const copyAddress = async () => {
    setCopiedError('')
    try {
      await navigator.clipboard.writeText(USDT_ADDRESS)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopiedError('Clipboard access is unavailable. Select and copy the address manually.')
    }
  }
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for payment proof.')
      event.target.value = ''
      return
    }
    setProofFile(file)
    setUploadedProofUrl(null)
    setError('')
    const reader = new FileReader()
    reader.onload = (loadEvent) => setProofPreview(typeof loadEvent.target?.result === 'string' ? loadEvent.target.result : null)
    reader.onerror = () => setError('The selected image could not be previewed. Choose it again.')
    reader.readAsDataURL(file)
  }
  const uploadProof = async () => {
    if (!proofFile) return setError('Select an image before uploading proof.')
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Proof upload did not complete. Check your connection and retry.')
      const data = await response.json() as { secure_url?: string }
      if (!data.secure_url || !data.secure_url.startsWith('https://')) throw new Error('The upload service did not return a secure proof URL.')
      setUploadedProofUrl(data.secure_url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Proof upload failed.')
    } finally {
      setUploading(false)
    }
  }
  const submitDeposit = async () => {
    if (!uploadedProofUrl || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/payments/deposit', { amount, payment_method: 'USDT', network: 'BEP20', proof_url: uploadedProofUrl })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.historyBase }),
      ])
      setReviewOpen(false)
      setStep('success')
    } catch (submitError) {
      setError(errorDetail(submitError, 'The deposit request could not be submitted. Check the details and try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="recharge-page">
    <header className="recharge-header"><button type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button><div><span className="member-eyebrow">WALLET / ADD FUNDS</span><h1>{step === 'success' ? 'Request received' : step === 'crypto' ? 'Payment instructions' : 'Recharge wallet'}</h1></div><button type="button" onClick={() => navigate('/payments/history')}>Activity</button></header>

    <section className="recharge-balance"><span className="member-eyebrow">DEPOSIT WALLET · SERVER BALANCE</span><strong>{balance === undefined ? '—' : `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong><small>{userQuery.isError ? 'Balance unavailable; retry your account request.' : userQuery.isFetching ? 'Refreshing account response…' : 'Deposit funds are separate from cashable earnings.'}</small>{userQuery.isError && <button type="button" onClick={() => void userQuery.refetch()}>Retry balance</button>}</section>

    {step === 'amount' && <>
      <div className="recharge-columns"><section className="recharge-card"><div className="recharge-step">01 / AMOUNT & ROUTE</div><h2>Choose deposit amount</h2><p className="recharge-copy">Select a supported amount or enter a custom USD amount. The server applies its final minimum check.</p>
        <div className="recharge-amounts">{AMOUNTS.map((value) => <button type="button" key={value} className={selectedAmount === value && !customAmount ? 'is-selected' : ''} onClick={() => { setSelectedAmount(value); setCustomAmount(''); setError('') }}>${value}</button>)}</div>
        <label className="recharge-field" htmlFor="recharge-custom-amount"><span>Custom amount (USD)</span><input id="recharge-custom-amount" type="number" min={minimum} step="0.01" inputMode="decimal" value={customAmount} placeholder="Enter amount" onChange={(event) => { setCustomAmount(event.target.value); setSelectedAmount(null); setError('') }} /></label>
        <p className="recharge-minimum">Minimum: ${minimum.toFixed(2)} USD for {method === 'crypto' ? 'crypto' : 'this route'}.</p>
        <div className="recharge-methods" role="group" aria-label="Deposit method">
          <button type="button" className={method === 'crypto' ? 'is-selected' : ''} onClick={() => selectMethod('crypto')}><span className="recharge-method-mark">₮</span><span><strong>USDT · BEP20</strong><small>BNB Smart Chain · proof reviewed by staff</small></span><span className="recharge-radio" aria-hidden="true" /></button>
          <button type="button" className={method === 'mpesa' ? 'is-selected' : ''} onClick={() => selectMethod('mpesa')}><span className="recharge-method-mark is-persimmon">M</span><span><strong>M-Pesa</strong><small>Payment attempt is submitted to admin review</small></span><span className="recharge-radio" aria-hidden="true" /></button>
          {(['paypal', 'wise', 'payoneer'] as const).map((value) => <button type="button" key={value} className="is-unavailable" onClick={() => selectMethod(value)}><span className="recharge-method-mark is-muted">—</span><span><strong>{COMING_SOON[value]}</strong><small>Not currently available</small></span><span className="recharge-unavailable">Unavailable</span></button>)}
        </div>
        {error && <p className="recharge-error" role="alert">{error}</p>}
        <button type="button" className="member-button member-button--primary recharge-proceed" disabled={!validAmount || comingSoon} onClick={proceed}>{method === 'mpesa' ? 'Continue to M-Pesa' : 'Proceed to deposit instructions'} <span aria-hidden="true">→</span></button>
      </section>
      <aside className="recharge-card recharge-review-note"><div className="recharge-step">PAYMENT POLICY</div><h2>Request first. Credit after review.</h2><p>Submitting proof creates a deposit request. The deposit wallet is not credited until the payment is verified and an administrator approves the record.</p><button className="recharge-history-link" type="button" onClick={() => navigate('/payments/history')}>View payment activity →</button></aside></div>

      <section className="recharge-card recharge-history"><div className="recharge-history-head"><div><span className="member-eyebrow">LATEST SERVICE RECORDS</span><h2>Recent deposits</h2></div><button type="button" onClick={() => navigate('/payments/history')}>Full activity</button></div>
        {historyQuery.isLoading ? <p role="status">Loading deposit records…</p> : historyQuery.isError ? <p className="recharge-error" role="alert">Deposit history is unavailable. <button type="button" onClick={() => void historyQuery.refetch()}>Retry</button></p> : payments.length ? <div className="recharge-history-list">{payments.map((payment) => <div className="recharge-history-row" key={payment.id}><span><strong>${Number(payment.amount).toFixed(2)}</strong><small>{payment.created_at ? new Date(payment.created_at).toLocaleString() : payment.period || 'Date unavailable'}</small></span><span>{payment.payment_method || 'Deposit'}<small className={`recharge-status${payment.status === 'paid' ? ' is-paid' : payment.status === 'rejected' ? ' is-rejected' : ''}`}>{depositStatus(payment.status)}</small></span></div>)}</div> : <p className="recharge-copy">No deposit records have been returned for this account yet.</p>}
      </section>
    </>}

    {step === 'crypto' && <section className="recharge-card recharge-crypto"><div className="recharge-step">02 / SEND & UPLOAD</div><div className="recharge-crypto-summary"><div><span className="member-eyebrow">REQUESTED AMOUNT</span><h2>${amount.toFixed(2)} <small>USDT</small></h2><p>Network: {USDT_NETWORK}</p></div><img src={qrUrl} alt="QR code for the USDT payment address" width="132" height="132" /></div>
      <div className="recharge-address"><span className="member-eyebrow">DESTINATION ADDRESS · BEP20</span><div><code>{USDT_ADDRESS}</code><button type="button" onClick={() => void copyAddress()}>{copied ? 'Copied' : 'Copy'}</button></div>{copiedError && <p role="alert">{copiedError}</p>}</div>
      <div className="recharge-upload"><label htmlFor="recharge-proof">Payment proof image</label><p>Upload a screenshot of the transfer. This is stored with your request for administrator review; upload does not verify payment.</p>{proofPreview ? <div className="recharge-preview"><img src={proofPreview} alt="Preview of selected payment proof" /><button type="button" onClick={() => { setProofFile(null); setProofPreview(null); setUploadedProofUrl(null); setError('') }}>Remove image</button></div> : <input id="recharge-proof" type="file" accept="image/*" onChange={handleFileSelect} />}{error && <p className="recharge-error" role="alert">{error}</p>}{proofFile && <button className="member-button member-button--outline" type="button" onClick={() => void uploadProof()} disabled={uploading || Boolean(uploadedProofUrl)}>{uploading ? 'Uploading proof…' : uploadedProofUrl ? 'Proof uploaded securely' : 'Upload payment proof'}</button>}</div>
      {uploadedProofUrl && <div className="recharge-uploaded" role="status">Secure proof URL received. The service will review this request after submission.</div>}
      <div className="recharge-crypto-actions"><button className="member-button member-button--outline" type="button" onClick={() => { setStep('amount'); setError(''); setProofFile(null); setProofPreview(null); setUploadedProofUrl(null) }}>Back to amount</button><button className="member-button member-button--primary" type="button" disabled={!uploadedProofUrl} onClick={() => setReviewOpen(true)}>Review deposit request</button></div>
    </section>}

    {step === 'success' && <section className="recharge-card recharge-success" role="status"><span className="recharge-success-mark" aria-hidden="true">✓</span><span className="member-eyebrow">REQUEST SUBMITTED · PENDING REVIEW</span><h2>Deposit request received</h2><p>Your ${amount.toFixed(2)} USDT request was submitted. It is pending administrator review; the deposit wallet is not credited until the payment proof is verified and the request is approved.</p><div><button className="member-button member-button--primary" type="button" onClick={() => navigate('/payments/history')}>View payment status</button><button className="member-button member-button--outline" type="button" onClick={() => navigate('/dashboard')}>Back to workspace</button></div></section>}

    {reviewOpen && <div className="recharge-review-backdrop"><section className="recharge-review-dialog" role="dialog" aria-modal="true" aria-labelledby="recharge-review-title"><span className="recharge-step">03 / FINAL REVIEW</span><h2 id="recharge-review-title">Submit deposit for review?</h2><dl><div><dt>Amount</dt><dd>${amount.toFixed(2)} USDT</dd></div><div><dt>Network</dt><dd>{USDT_NETWORK}</dd></div><div><dt>Destination</dt><dd>{USDT_ADDRESS}</dd></div><div><dt>Proof</dt><dd>{proofFile?.name || 'Uploaded image'}</dd></div></dl><p>This creates a pending deposit request. No wallet credit occurs until an administrator verifies the payment and approves it.</p>{error && <p className="recharge-error" role="alert">{error}</p>}<div className="recharge-review-actions"><button className="member-button member-button--outline" type="button" disabled={submitting} onClick={() => setReviewOpen(false)}>Back</button><button className="member-button member-button--primary" type="button" disabled={!uploadedProofUrl || submitting} onClick={() => void submitDeposit()}>{submitting ? 'Submitting…' : 'Submit for admin review'}</button></div></section></div>}
  </main>
}
