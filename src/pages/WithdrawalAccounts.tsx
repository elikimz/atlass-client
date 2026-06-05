import { useNavigate } from 'react-router-dom'

export default function WithdrawalAccounts() {
  const navigate = useNavigate()

  return (
    <div style={{ 
      minHeight: '100vh', backgroundColor: '#e0f2f1', padding: '16px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111827' }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Withdrawal</h1>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Accounts</h2>
        </div>
        <button style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 700, color: '#111827', cursor: 'pointer' }}>+ Add New</button>
      </div>

      {/* Crypto Wallets Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Crypto Wallets</h3>
        
        <div style={{ 
          backgroundColor: 'white', borderRadius: '20px', padding: '16px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#319795', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: 'white' }}>₮</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>USDT - ERC20</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>0x71C...8921</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '20px' }}>Primary</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✎</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>🗑</button>
          </div>
        </div>
      </div>

      {/* Mobile Money Section */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Mobile Money</h3>
        
        <div style={{ 
          backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '85px', height: '85px', backgroundColor: '#00AC4F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px' }}>M-PESA</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>M-Pesa (Instant KES)</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>+254 712 *** 678</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingRight: '16px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✎</button>
            <div style={{ width: '44px', height: '26px', backgroundColor: '#e5e7eb', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '22px', height: '22px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
