import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

interface WithdrawalAccount {
  id: number
  type: string
  label: string
  address: string
  network: string
  is_primary: boolean
}

export default function WithdrawFunds() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<{ withdrawal_wallet_balance?: number; current_plan_id?: number | null; has_purchased_first_package?: boolean }>('/auth/me')).data,
    staleTime: 5 * 60 * 1000,
  })
  const accountsQuery = useQuery({
    queryKey: ['withdrawal-accounts'] as const,
    queryFn: async () => (await api.get<WithdrawalAccount[]>('/withdrawal-accounts')).data ?? [],
    staleTime: 5 * 60 * 1000,
  })
  const paymentHistoryQuery = useQuery({
    queryKey: queryKeys.payments.history(1, 50),
    queryFn: async () => (await api.get<any[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const balance = userQuery.data?.withdrawal_wallet_balance ?? 0
  const isEligible = Boolean(userQuery.data?.has_purchased_first_package && userQuery.data?.current_plan_id)
  const accounts = accountsQuery.data ?? []
  const withdrawalHistory = (paymentHistoryQuery.data ?? []).filter((payment: any) => payment.type === 'payout')
  const pendingWithdrawal = withdrawalHistory.find((payment: any) => ['pending', 'processing', 'in_progress'].includes(payment.status))
  const hasPendingWithdrawal = Boolean(pendingWithdrawal)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [withdrawalPassword, setWithdrawalPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const amounts = [2.50, 8.00, 12.00, 20.00, 50.00, 100.00, 150.00, 500.00, 1000.00]
  const networkFee = 0.00

  useEffect(() => {
    if (selectedAccountId || accounts.length === 0) return
    const primary = accounts.find((account) => account.is_primary)
    setSelectedAccountId(primary?.id ?? accounts[0].id)
  }, [accounts, selectedAccountId])

  const handleConfirmWithdrawal = () => {
    if (hasPendingWithdrawal) { setError('You already have a withdrawal being processed. Wait until it is processed or canceled before requesting another withdrawal.'); return }
    if (!isEligible) { setError('Recharge your account and purchase a plan before requesting a withdrawal.'); return }
    if (!selectedAmount || !selectedAccountId) return
    if (selectedAmount > balance) { setError('Insufficient balance'); return }
    setError(null); setShowPasswordModal(true)
  }

  const handleSubmitWithdrawal = async () => {
    if (!withdrawalPassword) return
    setSubmitting(true); setError(null)
    try {
      await api.post('/payments/withdraw', { amount: selectedAmount, account_id: selectedAccountId, password: withdrawalPassword })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.overview }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.historyBase }),
      ])
      setSuccess(true); setShowPasswordModal(false); setTimeout(() => navigate('/payments'), 3000)
    } catch (err: any) { setError(err.response?.data?.detail || 'Withdrawal failed. Please check your password.') } finally { setSubmitting(false) }
  }

  const netReceived = selectedAmount ? selectedAmount - networkFee : 0

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '24px' }}>✓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>Withdrawal Submitted!</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>Your funds are being processed. <br/>Amount: <strong>${selectedAmount?.toFixed(2)}</strong></p>
        <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}><p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontWeight: 600 }}>⏳ Final State: Processing</p></div>
        <button onClick={() => navigate('/payments')} style={{ padding: '14px 32px', borderRadius: '24px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Withdraw Funds</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>🕒</button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '24px', textAlign: 'center', boxShadow: 'var(--card-shadow)', marginBottom: '14px', border: '1px solid var(--border-main)' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Available Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text-heading)' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      {hasPendingWithdrawal && <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '16px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', lineHeight: 1.5 }}><strong>Withdrawal already in progress</strong><br />You cannot request another withdrawal until this one is processed or canceled.</div>}
      {!hasPendingWithdrawal && !isEligible && <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: '16px', padding: '14px 16px', marginBottom: '24px', fontSize: '13px', lineHeight: 1.5 }}><strong>Withdrawal unavailable</strong><br />Please recharge your account and purchase an active plan to enable the withdrawal of your available earnings. Withdrawals can only be processed once an active plan is in place.</div>}

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>1. Select Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {amounts.map(amt => (
            <button key={amt} onClick={() => setSelectedAmount(amt)} style={{ height: '48px', borderRadius: '12px', border: selectedAmount === amt ? '2px solid var(--accent-primary)' : '1px solid var(--border-main)', backgroundColor: selectedAmount === amt ? 'var(--accent-primary)' : 'var(--bg-card)', color: selectedAmount === amt ? 'white' : 'var(--text-main)', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>${amt.toFixed(2).replace('.00', '')}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '16px' }}>2. Destination Wallet</h3>
        <select value={selectedAccountId || ''} onChange={(e) => setSelectedAccountId(Number(e.target.value))} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-main)', fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', outline: 'none', backgroundColor: 'var(--bg-card)' }}>
          <option value="" disabled>Select Destination Wallet</option>
          {accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.type.toUpperCase()} - {acc.network} ({acc.address.substring(0,6)}...{acc.address.substring(acc.address.length-4)}) {acc.is_primary ? '[Primary]' : ''}</option>))}
        </select>
        {accounts.length === 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', fontWeight: 600 }}>❌ No withdrawal accounts found.</p>
            <button onClick={() => navigate('/withdrawal-accounts')} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+ Add Withdrawal Account</button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-main)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Withdrawal Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>Withdrawal Amount:</span><span style={{ fontSize: '14px', color: 'var(--text-heading)', fontWeight: 700 }}>${selectedAmount?.toFixed(2) || '0.00'} USD</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>Network Fee:</span><span style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 700 }}>${networkFee.toFixed(2)} USDT</span></div>
        <div style={{ height: '1px', backgroundColor: 'var(--border-main)', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '15px', color: 'var(--text-heading)', fontWeight: 700 }}>Net Received:</span><span style={{ fontSize: '16px', color: 'var(--accent-primary)', fontWeight: 800 }}>${netReceived.toFixed(2)} USDT</span></div>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}><p style={{ fontSize: '13px', color: '#991b1b', margin: 0, fontWeight: 600 }}>❌ {error}</p></div>}

      <button onClick={handleConfirmWithdrawal} disabled={hasPendingWithdrawal || !isEligible || !selectedAmount || !selectedAccountId} style={{ width: '100%', padding: '18px', borderRadius: '30px', backgroundColor: (hasPendingWithdrawal || !isEligible || !selectedAmount || !selectedAccountId) ? 'var(--text-muted)' : 'var(--accent-primary)', color: 'white', fontSize: '17px', fontWeight: 700, border: 'none', cursor: (hasPendingWithdrawal || !isEligible || !selectedAmount || !selectedAccountId) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(49, 151, 149, 0.3)', marginBottom: '12px' }}>Confirm Withdrawal</button>

      {withdrawalHistory.length > 0 && (
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px solid var(--border-main)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '16px' }}>Recent Withdrawals</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-main)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '13px' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '13px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '13px' }}>Method</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '13px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((w, i) => {
                  const isPending = w.status === 'pending' || w.status === 'processing' || w.status === 'in_progress'
                  const isPaid = w.status === 'paid'
                  const isRejected = w.status === 'rejected' || w.status === 'cancelled'
                  const statusColor = isPending ? '#f59e0b' : isPaid ? '#10b981' : isRejected ? '#ef4444' : '#6b7280'
                  const displayStatus = isPending ? 'Processing' : isPaid ? 'Paid' : isRejected ? 'Rejected' : w.status.charAt(0).toUpperCase() + w.status.slice(1)
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-main)' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>${w.amount?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>{w.payment_method?.toUpperCase() || 'N/A'}</td>
                      <td style={{ padding: '12px' }}><span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: statusColor + '20', color: statusColor }}>{displayStatus}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔐</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>Security Verification</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Enter your withdrawal password to authorize this transaction.</p>
            <input type="password" placeholder="Enter Withdrawal Password" value={withdrawalPassword} onChange={(e) => setWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-main)', fontSize: '16px', textAlign: 'center', marginBottom: '24px', outline: 'none', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-main)', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmitWithdrawal} disabled={submitting} style={{ flex: 2, padding: '14px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Verifying...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
