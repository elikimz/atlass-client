import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function WithdrawFunds() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [method, setMethod] = useState('crypto')

  const amounts = [2.50, 8.00, 12.00, 20.00, 50.00, 100.00, 150.00, 500.00, 1000.00]

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setBalance(res.data.withdrawal_wallet_balance)
    }).catch(console.error)
  }, [])

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

      {/* Select Amount Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Select Withdrawal Amount</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          {amounts.map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              style={{
                height: '52px', borderRadius: '12px', border: selectedAmount === amt ? '2px solid #319795' : '1px solid #e5e7eb',
                backgroundColor: selectedAmount === amt ? '#319795' : 'white',
                color: selectedAmount === amt ? 'white' : '#111827',
                fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
            >
              ${amt.toFixed(2).replace('.00', '')}
              {selectedAmount === amt && (
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
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontWeight: 500 }}>Minimum withdrawal is $2.50</p>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>Choose Withdrawal Method</h3>
        
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
          <span style={{ fontWeight: 700, color: '#111827' }}>Crypto</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Amount:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>${selectedAmount?.toFixed(2)} USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Fee:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>$0.00 USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Net Received:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>${selectedAmount?.toFixed(2)} USD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>Recipient Detail:</span>
          <span style={{ fontWeight: 700, color: '#111827' }}>Recipient Detail</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        disabled={!selectedAmount}
        style={{
          width: '100%', padding: '18px', borderRadius: '30px',
          backgroundColor: !selectedAmount ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '17px', fontWeight: 700, border: 'none',
          cursor: !selectedAmount ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(49, 151, 149, 0.3)',
          marginBottom: '12px'
        }}
      >
        Confirm Withdrawal ${selectedAmount?.toFixed(2)} USD
      </button>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#111827', fontWeight: 600 }}>
        *Funds will be processed within 1-3 business days.
      </p>
    </div>
  )
}
