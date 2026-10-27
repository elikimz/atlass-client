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
  const [type, setType] = useState('crypto')
  const [address, setAddress] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isPrimary, setIsPrimary] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const fetchAccounts = async () => { setLoading(true); setLoadError(''); try { const res = await api.get<WithdrawalAccount[]>('/withdrawal-accounts'); setAccounts(res.data ?? []) } catch (err) { console.error(err); setLoadError('Accounts could not be loaded.') } finally { setLoading(false) } }
  useEffect(() => { const timer = window.setTimeout(() => { void fetchAccounts() }, 0); return () => window.clearTimeout(timer) }, [])
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); const toastId = toast.loading('Adding account…')
    try {
      const payload: Record<string, unknown> = { type, label: type === 'crypto' ? 'Crypto Wallet' : 'M-Pesa Account', is_primary: isPrimary }
      if (type === 'crypto') { payload.address = address.trim(); payload.network = 'BEP20' }
      else { payload.address = phoneNumber.trim(); payload.network = 'M-Pesa'; payload.full_name = fullName.trim() }
      await api.post('/withdrawal-accounts', payload)
      toast.success('Account added successfully.', { id: toastId }); setShowAddModal(false); setAddress(''); setFullName(''); setPhoneNumber(''); await fetchAccounts()
    } catch (err: unknown) { const detail = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail : null; toast.error(typeof detail === 'string' ? detail : 'Failed to add account. Please try again.', { id: toastId }) } finally { setSubmitting(false) }
  }
  return <main className="accounts-page"><header className="accounts-head"><button type="button" onClick={() => navigate(-1)} aria-label="Go back">←</button><div><span>FIELD ATLAS / PAYMENT ROUTES</span><h1>Withdrawal accounts</h1></div><button className="accounts-add" type="button" onClick={() => setShowAddModal(true)}>+ Add account</button></header>
    <p className="accounts-intro">Manage destinations used for withdrawal requests. Crypto accounts must use BEP20.</p>
    {loadError && <div className="accounts-error" role="alert">{loadError} <button onClick={() => void fetchAccounts()}>Retry</button></div>}
    {loading ? <p aria-live="polite">Loading accounts…</p> : accounts.length === 0 ? <section className="accounts-empty"><h2>No destinations yet</h2><p>Add an account before requesting a withdrawal.</p><button className="accounts-add" onClick={() => setShowAddModal(true)}>Add your first account</button></section> : <div className="accounts-list">{accounts.map((acc) => <article className="account-card" key={acc.id}><div className="account-mark">{acc.type === 'crypto' ? '₮' : 'M'}</div><div className="account-main"><span className="account-label">{acc.type.toUpperCase()} · {acc.network || 'Network not specified'}</span><strong>{acc.type === 'mpesa' && acc.full_name ? `${acc.full_name} · ` : ''}{acc.address}</strong><span className="account-status">{acc.is_verified ? 'Verified by server' : 'Unverified'}</span></div><div className="account-badges">{acc.is_primary && <span className="account-primary">Primary</span>}<span className="account-status">{acc.is_verified ? 'Verified' : 'Not verified'}</span></div></article>)}</div>}
    {showAddModal && <div className="accounts-overlay"><section className="accounts-modal" role="dialog" aria-modal="true" aria-labelledby="account-modal-title"><span className="accounts-step">NEW DESTINATION</span><h2 id="account-modal-title">Add withdrawal account</h2><form onSubmit={handleAddAccount}><label htmlFor="account-type">Account type</label><select id="account-type" value={type} onChange={(e) => setType(e.target.value)}><option value="crypto">Crypto (USDT)</option><option value="mpesa">M-Pesa</option></select>{type === 'crypto' ? <><label>Network</label><div className="accounts-fixed">BEP20 · required by server</div><label htmlFor="crypto-address">Wallet address</label><input id="crypto-address" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" /></> : <><label htmlFor="full-name">Full name</label><input id="full-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As it appears on your ID" /><label htmlFor="phone-number">Phone number</label><input id="phone-number" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+254…" /></>}<label className="accounts-check"><input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> Set as primary account</label><p className="accounts-footnote">New accounts are shown as unverified unless the server returns verified status.</p><div className="accounts-actions"><button type="button" onClick={() => setShowAddModal(false)}>Cancel</button><button className="accounts-add" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save account'}</button></div></form></section></div>}
  </main>
}
