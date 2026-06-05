import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Recharge() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('crypto')

  const amounts = [20, 50, 100, 150, 200]

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setBalance(res.data.deposit_wallet_balance)
    }).catch(console.error)
  }, [])

  const finalAmount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0FDF4', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Recharge Account</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>🕒</button>
      </div>

      {/* Current Balance Card */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '20px', padding: '24px', textAlign: 'center', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px' 
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Current Balance</div>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>USD</div>
      </div>

      {/* Select Amount Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Select Recharge Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => {
                setSelectedAmount(amt)
                setCustomAmount('')
              }}
              style={{
                padding: '12px 4px', borderRadius: '12px', border: '1px solid #e5e7eb',
                backgroundColor: (selectedAmount === amt && !customAmount) ? '#319795' : 'white',
                color: (selectedAmount === amt && !customAmount) ? 'white' : '#111827',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              ${amt}
              {selectedAmount === amt && !customAmount && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#4fd1c5', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '14px', color: '#111827', marginBottom: '8px' }}>Or enter custom amount</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#9ca3af' }}>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="Enter amount"
              style={{
                width: '100%', padding: '12px 16px 12px 32px', borderRadius: '12px',
                border: '1px solid #e5e7eb', fontSize: '15px', outline: 'none'
              }}
            />
            {customAmount && (
              <button 
                onClick={() => setCustomAmount('')}
                style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
              >✕</button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Minimum deposit is 20$</p>
        </div>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Choose Payment Method</h3>
        
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
      <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Method:</span>
          <span style={{ fontWeight: 600 }}>{method === 'crypto' ? 'Crypto (USDT-ERC20)' : (method === 'mpesa' ? 'M-Pesa' : 'Wise')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Exchange Rate:</span>
          <span style={{ fontWeight: 600 }}>1 USDT = 1 USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Total to pay:</span>
          <span style={{ fontWeight: 600 }}>{finalAmount.toFixed(2)} {method === 'crypto' ? 'USDT' : 'USD'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Fees:</span>
          <span style={{ fontWeight: 600 }}>$0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Total Credit:</span>
          <span style={{ fontWeight: 700 }}>${finalAmount.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        disabled={finalAmount < 20}
        style={{
          width: '100%', padding: '16px', borderRadius: '16px',
          backgroundColor: finalAmount < 20 ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '16px', fontWeight: 700, border: 'none',
          cursor: finalAmount < 20 ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(49, 151, 149, 0.2)'
        }}
      >
        Proceed to pay ${finalAmount.toFixed(2)} USD
      </button>
      <p style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '12px' }}>
        * Funds will be credited after successful payment.
      </p>
    </div>
  )
}
