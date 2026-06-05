import { useNavigate } from 'react-router-dom'

export default function WithdrawalAccounts() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0FDF4', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Withdrawal</h1>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Accounts</h2>
        </div>
        <button style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#111827', cursor: 'pointer' }}>+ Add New</button>
      </div>

      {/* Crypto Wallets Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>Crypto Wallets</h3>
        
        <div style={{ 
          backgroundColor: 'white', borderRadius: '16px', padding: '16px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>₮</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>USDT - ERC20</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>0x71C...8921</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>Primary</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
          </div>
        </div>
      </div>

      {/* Mobile Money Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>Mobile Money</h3>
        
        <div style={{ 
          backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#00AC4F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 800 }}>M-PESA</span>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>M-Pesa (Instant KES)</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>+254 712 *** 678</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '16px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✏️</button>
            <div style={{ width: '40px', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
