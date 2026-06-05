import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function WithdrawFunds() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [method, setMethod] = useState('crypto')
  const [loading, setLoading] = useState(false)

  const amounts = [2.50, 8.00, 12.00, 20.00, 50.00, 100.00, 150.00, 500.00, 1000.00]

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setBalance(res.data.withdrawal_wallet_balance)
    }).catch(console.error)
  }, [])

  const handleWithdraw = async () => {
    if (!selectedAmount) return
    setLoading(true)
    try {
      // API call for withdrawal would go here
      alert(`Withdrawal request for $${selectedAmount} submitted!`)
      navigate('/payments')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0FDF4', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Withdraw Funds</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>🕒</button>
      </div>

      {/* Available Balance Card */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '20px', padding: '24px', textAlign: 'center', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px' 
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Available Balance</div>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>USD</div>
      </div>

      {/* Select Amount Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Select Withdrawal Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              style={{
                padding: '12px 4px', borderRadius: '12px', border: '1px solid #e5e7eb',
                backgroundColor: selectedAmount === amt ? '#319795' : 'white',
                color: selectedAmount === amt ? 'white' : '#111827',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              ${amt.toFixed(2)}
              {selectedAmount === amt && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#4fd1c5', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              )}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>Minimum withdrawal is $2.50</p>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Choose Withdrawal Method</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Crypto */}
          <div 
            onClick={() => setMethod('crypto')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '12px', border: `2px solid ${method === 'crypto' ? '#319795' : '#e5e7eb'}`,
              backgroundColor: 'white', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>₮</div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Crypto (USDT - ERC20)</span>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #319795', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {method === 'crypto' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />}
            </div>
          </div>

          {/* M-Pesa */}
          <div 
            onClick={() => setMethod('mpesa')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '12px', border: `2px solid ${method === 'mpesa' ? '#319795' : '#e5e7eb'}`,
              backgroundColor: 'white', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#00AC4F', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>M</div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>M-PESA M-Pesa (Instant KES)</span>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #e5e7eb' }}>
              {method === 'mpesa' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />}
            </div>
          </div>

          {/* Wise */}
          <div 
            onClick={() => setMethod('wise')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '12px', border: `2px solid ${method === 'wise' ? '#319795' : '#e5e7eb'}`,
              backgroundColor: 'white', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#00B4D8', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>W</div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Wise (Fast International Transfer)</span>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #e5e7eb' }}>
              {method === 'wise' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {selectedAmount && (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Method:</span>
            <span style={{ fontWeight: 600 }}>{method === 'crypto' ? 'Crypto' : (method === 'mpesa' ? 'M-Pesa' : 'Wise')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Amount:</span>
            <span style={{ fontWeight: 600 }}>${selectedAmount.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Fee:</span>
            <span style={{ fontWeight: 600 }}>$0.00 USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Net Received:</span>
            <span style={{ fontWeight: 600 }}>${selectedAmount.toFixed(2)} USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#6b7280' }}>Recipient Detail:</span>
            <span style={{ fontWeight: 600 }}>Recipient Detail</span>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleWithdraw}
        disabled={!selectedAmount || loading}
        style={{
          width: '100%', padding: '16px', borderRadius: '16px',
          backgroundColor: (!selectedAmount || loading) ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '16px', fontWeight: 700, border: 'none',
          cursor: (!selectedAmount || loading) ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(49, 151, 149, 0.2)'
        }}
      >
        {loading ? 'Processing...' : `Confirm Withdrawal ${selectedAmount ? `$${selectedAmount.toFixed(2)} USD` : ''}`}
      </button>
      <p style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '12px' }}>
        *Funds will be processed within 1-3 business days.
      </p>
    </div>
  )
}
