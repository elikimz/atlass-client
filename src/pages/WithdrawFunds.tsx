import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

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
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<WithdrawalAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [withdrawalPassword, setWithdrawalPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const amounts = [2.50, 8.00, 12.00, 20.00, 50.00, 100.00, 150.00, 500.00, 1000.00]
  const networkFee = 0.50

  useEffect(() => {
    // Fetch balance
    api.get('/auth/me').then(res => {
      setBalance(res.data.withdrawal_wallet_balance)
    }).catch(console.error)

    // Fetch withdrawal accounts
    api.get('/withdrawal-accounts').then(res => {
      setAccounts(res.data)
      const primary = res.data.find((a: WithdrawalAccount) => a.is_primary)
      if (primary) setSelectedAccountId(primary.id)
      else if (res.data.length > 0) setSelectedAccountId(res.data[0].id)
    }).catch(console.error)
  }, [])

  const handleConfirmWithdrawal = () => {
    if (!selectedAmount || !selectedAccountId) return
    if (selectedAmount > balance) {
      setError('Insufficient balance')
      return
    }
    setError(null)
    setShowPasswordModal(true)
  }

  const handleSubmitWithdrawal = async () => {
    if (!withdrawalPassword) return
    setSubmitting(true)
    setError(null)

    try {
      await api.post('/payments/withdraw', {
        amount: selectedAmount,
        account_id: selectedAccountId,
        password: withdrawalPassword
      })
      setSuccess(true)
      setShowPasswordModal(false)
      // Redirect after 3 seconds
      setTimeout(() => navigate('/payments'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Withdrawal failed. Please check your password.')
    } finally {
      setSubmitting(false)
    }
  }

  const netReceived = selectedAmount ? selectedAmount - networkFee : 0

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', backgroundColor: '#e0f2f1', padding: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', textAlign: 'center'
      }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#d1fae5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '24px'
        }}>✓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Withdrawal Submitted!</h1>
        <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '32px' }}>
          Your funds are being processed. <br/>
          Amount: <strong>${selectedAmount?.toFixed(2)}</strong>
        </p>
        <div style={{ backgroundColor: '#fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontWeight: 600 }}>
            ⏳ Final State: Processing
          </p>
        </div>
        <button 
          onClick={() => navigate('/payments')}
          style={{ 
            padding: '14px 32px', borderRadius: '24px', backgroundColor: '#319795', 
            color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' 
          }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: '#e0f2f1', padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Withdraw Funds</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>🕒</button>
      </div>

      {/* Available Balance Card */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>Available Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      {/* Step 1 & 2: Select Channel & Amount */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>1. Select Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              style={{
                height: '48px', borderRadius: '12px', border: selectedAmount === amt ? '2px solid #319795' : '1px solid #e5e7eb',
                backgroundColor: selectedAmount === amt ? '#319795' : 'white',
                color: selectedAmount === amt ? 'white' : '#111827',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ${amt.toFixed(2).replace('.00', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Select Saved Address */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>2. Destination Wallet</h3>
        <select 
          value={selectedAccountId || ''} 
          onChange={(e) => setSelectedAccountId(Number(e.target.value))}
          style={{ 
            width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb',
            fontSize: '15px', fontWeight: 600, color: '#111827', outline: 'none'
          }}
        >
          <option value="" disabled>Select Destination Wallet</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.type.toUpperCase()} - {acc.network} ({acc.address.substring(0,6)}...{acc.address.substring(acc.address.length-4)}) {acc.is_primary ? '[Primary]' : ''}
            </option>
          ))}
        </select>
        {accounts.length === 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', fontWeight: 600 }}>
              ❌ No withdrawal accounts found.
            </p>
            <button 
              onClick={() => navigate('/withdrawal-accounts')}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#319795', 
                color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' 
              }}
            >
              + Add Withdrawal Account
            </button>
          </div>
        )}
      </div>

      {/* Step 4: Live Summary Check */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '20px', padding: '20px', 
        marginBottom: '24px', border: '1px solid #e5e7eb' 
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>Withdrawal Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Withdrawal Amount:</span>
          <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>${selectedAmount?.toFixed(2) || '0.00'} USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Network Fee:</span>
          <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 700 }}>-${networkFee.toFixed(2)} USDT</span>
        </div>
        <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '15px', color: '#111827', fontWeight: 700 }}>Net Received:</span>
          <span style={{ fontSize: '16px', color: '#319795', fontWeight: 800 }}>${netReceived.toFixed(2)} USDT</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#991b1b', margin: 0, fontWeight: 600 }}>❌ {error}</p>
        </div>
      )}

      {/* Step 5: Confirm Button */}
      <button
        onClick={handleConfirmWithdrawal}
        disabled={!selectedAmount || !selectedAccountId}
        style={{
          width: '100%', padding: '18px', borderRadius: '30px',
          backgroundColor: (!selectedAmount || !selectedAccountId) ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '17px', fontWeight: 700, border: 'none',
          cursor: (!selectedAmount || !selectedAccountId) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(49, 151, 149, 0.3)',
          marginBottom: '12px'
        }}
      >
        Confirm Withdrawal
      </button>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '32px',
            width: '100%', maxWidth: '400px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔐</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Security Verification</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Enter your withdrawal password to authorize this transaction.</p>
            
            <input 
              type="password"
              placeholder="Enter Withdrawal Password"
              value={withdrawalPassword}
              onChange={(e) => setWithdrawalPassword(e.target.value)}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e5e7eb',
                fontSize: '16px', textAlign: 'center', marginBottom: '24px', outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowPasswordModal(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#f3f4f6', border: 'none', fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={handleSubmitWithdrawal}
                disabled={!withdrawalPassword || submitting}
                style={{ 
                  flex: 2, padding: '14px', borderRadius: '16px', backgroundColor: '#319795', 
                  color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
                  opacity: (!withdrawalPassword || submitting) ? 0.6 : 1
                }}
              >
                {submitting ? 'Verifying...' : 'Submit Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
