import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

interface WithdrawalAccount { id: number; type: string; label: string; address: string; network: string | null; is_verified: boolean; is_primary: boolean; full_name?: string }

export default function WithdrawalAccounts() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<WithdrawalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchAccounts = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<WithdrawalAccount[]>('/withdrawal-accounts')
      setAccounts((res.data ?? []).filter((account) => account.type.toLowerCase() === 'mpesa'))
    } catch (err) {
      console.error(err)
      setLoadError('M-Pesa accounts could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchAccounts() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const handleAddAccount = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const toastId = toast.loading('Adding M-Pesa account…')
    try {
      await api.post('/withdrawal-accounts', {
        type: 'mpesa',
        label: 'M-Pesa Account',
        address: phoneNumber.trim(),
        network: 'M-Pesa',
        full_name: fullName.trim(),
        is_primary: isPrimary,
      })
      toast.success('M-Pesa account added successfully.', { id: toastId })
      setShowAddModal(false)
      setFullName('')
      setPhoneNumber('')
      await fetchAccounts()
    } catch (err: unknown) {
      const detail = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail : null
      toast.error(typeof detail === 'string' ? detail : 'Failed to add the M-Pesa account. Please try again.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="accounts-page"><header className="accounts-head"><button type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button><div><span>FIELD ATLAS / PAYMENT ROUTES</span><h1>Withdrawal accounts</h1></div><button className="accounts-add" type="button" onClick={() => setShowAddModal(true)}>+ Add M-Pesa</button></header>
    <p className="accounts-intro">Cash payouts are sent through M-Pesa. Crypto and other payout destinations are no longer supported.</p>
    {loadError && <div className="accounts-error" role="alert">{loadError} <button onClick={() => void fetchAccounts()}>Retry</button></div>}
    {loading ? <p aria-live="polite">Loading M-Pesa accounts…</p> : accounts.length === 0 ? <section className="accounts-empty"><h2>No M-Pesa destination yet</h2><p>Add an M-Pesa number before requesting a cash withdrawal.</p><button className="accounts-add" onClick={() => setShowAddModal(true)}>Add M-Pesa account</button></section> : <div className="accounts-list">{accounts.map((account) => <article className="account-card" key={account.id}><div className="account-mark">M</div><div className="account-main"><span className="account-label">M-PESA · {account.network || 'M-Pesa'}</span><strong>{account.full_name ? `${account.full_name} · ` : ''}{account.address}</strong><span className="account-status">{account.is_verified ? 'Verified by server' : 'Unverified'}</span></div><div className="account-badges">{account.is_primary && <span className="account-primary">Primary</span>}<span className="account-status">{account.is_verified ? 'Verified' : 'Not verified'}</span></div></article>)}</div>}
    {showAddModal && <div className="accounts-overlay"><section className="accounts-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title"><span className="accounts-step">NEW M-PESA DESTINATION</span><h2 id="account-modal-title">Add M-Pesa account</h2><form onSubmit={handleAddAccount}><label htmlFor="full-name">Full name</label><input id="full-name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="As it appears on your ID" /><label htmlFor="phone-number">M-Pesa phone number</label><input id="phone-number" required value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="07XXXXXXXX or +254…" /><div className="accounts-fixed">M-Pesa · Cash payouts only</div><label className="accounts-check"><input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} /> Set as primary account</label><p className="accounts-footnote">New accounts are shown as unverified unless the server returns verified status.</p><div className="accounts-actions"><button type="button" onClick={() => setShowAddModal(false)}>Cancel</button><button className="accounts-add" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save M-Pesa account'}</button></div></form></section></div>}
  </main>
}
