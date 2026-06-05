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
    <div style={{ 
      minHeight: '100vh', backgroundColor: '#e0f2f1', padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Recharge Account</h1>
        <button onClick={() => navigate('/payments/history')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>🕒</button>
      </div>

      {/* Current Balance Card */}
      <div style={{ 
        backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>Current Balance</div>
        <div style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: 600 }}>USD</div>
      </div>

      {/* Select Amount Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Select Recharge Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => {
                setSelectedAmount(amt)
                setCustomAmount('')
              }}
              style={{
                height: '52px', borderRadius: '12px', border: (selectedAmount === amt && !customAmount) ? '2px solid #319795' : '1px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              ${amt}
              {selectedAmount === amt && !customAmount && (
                <div style={{ 
                  position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#4fd1c5', 
                  borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  border: '2px solid white', fontWeight: 800
                }}>✓</div>
              )}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#111827', marginBottom: '8px', fontWeight: 600 }}>Or enter custom amount</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontWeight: 600 }}>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="Enter amount"
              style={{
                width: '100%', padding: '14px 40px 14px 32px', borderRadius: '12px',
                border: '1px solid #e5e7eb', fontSize: '16px', outline: 'none',
                fontWeight: 500
              }}
            />
            {customAmount && (
              <button 
                onClick={() => setCustomAmount('')}
                style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
              >✕</button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontWeight: 500 }}>Minimum deposit is 20$</p>
        </div>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Choose Payment Method</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Crypto */}
          <div 
            onClick={() => setMethod('crypto')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '16px', border: `2px solid ${method === 'crypto' ? '#319795' : 'transparent'}`,
              backgroundColor: 'white', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#319795', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>₮</div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Crypto (USDT - ERC20)</span>
            </div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #319795', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {method === 'crypto' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }}>
                <span style={{ color: 'white', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>✓</span>
              </div>}
            </div>
          </div>

          {/* M-Pesa */}
          <div 
            onClick={() => setMethod('mpesa')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '16px', border: `2px solid ${method === 'mpesa' ? '#319795' : 'transparent'}`,
              backgroundColor: 'white', cursor: 'pointer', opacity: 0.8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#00AC4F' }}>M</div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>M-PESA M-Pesa (Instant KES)</span>
            </div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #e5e7eb' }}></div>
          </div>

          {/* Wise */}
          <div 
            onClick={() => setMethod('wise')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '16px', border: `2px solid ${method === 'wise' ? '#319795' : 'transparent'}`,
              backgroundColor: 'white', cursor: 'pointer', opacity: 0.8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#00B4D8' }}>W</div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Wise (Fast International Transfer)</span>
            </div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #e5e7eb' }}></div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div style={{ marginBottom: '24px', padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Method:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>Crypto (USDT-ERC20)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Exchange Rate:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>1 USDT = 1 USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Total to pay:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>{finalAmount.toFixed(2)} USDT</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Fees:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>$0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Total Credit:</span>
          <span style={{ fontWeight: 800, color: '#111827' }}>${finalAmount.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        disabled={finalAmount < 20}
        style={{
          width: '100%', padding: '18px', borderRadius: '30px',
          backgroundColor: finalAmount < 20 ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '17px', fontWeight: 700, border: 'none',
          cursor: finalAmount < 20 ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(49, 151, 149, 0.3)',
          marginBottom: '12px'
        }}
      >
        Proceed to pay ${finalAmount.toFixed(2)} USD
      </button>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#111827', fontWeight: 600 }}>
        * Funds will be credited after successful payment.
      </p>
    </div>
  )
}
