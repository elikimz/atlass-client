import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Recharge() {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [method, setMethod] = useState('crypto')

  const amounts = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0FDF4', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Recharge Wallet</h1>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Select Amount Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Select Deposit Amount</h3>
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
                transition: 'all 0.2s'
              }}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Choose Method Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Choose Deposit Method</h3>
        
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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Crypto (USDT - TRC20)</span>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #319795', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {method === 'crypto' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />}
            </div>
          </div>

          {/* Card */}
          <div 
            onClick={() => setMethod('card')}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '16px', borderRadius: '12px', border: `2px solid ${method === 'card' ? '#319795' : '#e5e7eb'}`,
              backgroundColor: 'white', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#E0E7FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💳</div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Credit/Debit Card</span>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #e5e7eb' }}>
              {method === 'card' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#319795' }} />}
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        disabled={!selectedAmount}
        style={{
          width: '100%', padding: '16px', borderRadius: '16px',
          backgroundColor: !selectedAmount ? '#a0aec0' : '#319795',
          color: 'white', fontSize: '16px', fontWeight: 700, border: 'none',
          cursor: !selectedAmount ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(49, 151, 149, 0.2)'
        }}
      >
        Proceed to Deposit {selectedAmount ? `$${selectedAmount}` : ''}
      </button>
    </div>
  )
}
