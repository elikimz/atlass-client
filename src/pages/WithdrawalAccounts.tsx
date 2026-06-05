import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface WithdrawalAccount {
  id: number
  type: string
  label: string
  address: string
  network: string
  is_verified: boolean
  is_primary: boolean
}

export default function WithdrawalAccounts() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<WithdrawalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Form state
  const [type, setType] = useState('crypto')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('ERC20')
  const [isPrimary, setIsPrimary] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/withdrawal-accounts')
      setAccounts(res.data)
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/withdrawal-accounts', {
        type,
        label: type === 'crypto' ? 'Crypto Wallet' : 'M-Pesa Account',
        address,
        network,
        is_primary: isPrimary
      })
      setShowAddModal(false)
      fetchAccounts()
      // Reset form
      setAddress('')
    } catch (err) {
      alert('Failed to add account')
    } finally {
      setSubmitting(false)
    }
  }

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
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 700, color: '#319795', cursor: 'pointer' }}
        >+ Add New</button>
      </div>

      {/* Accounts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '24px' }}>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>No withdrawal accounts added yet.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#319795', color: 'white', border: 'none', fontWeight: 700 }}
            >Add Your First Account</button>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} style={{ 
              backgroundColor: 'white', borderRadius: '20px', padding: '16px', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '52px', height: '52px', 
                  backgroundColor: acc.type === 'crypto' ? '#319795' : '#00AC4F', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '26px', color: 'white' 
                }}>
                  {acc.type === 'crypto' ? '₮' : 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                    {acc.type.toUpperCase()} - {acc.network}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                      {acc.address.substring(0, 10)}...{acc.address.substring(acc.address.length - 4)}
                    </span>
                    {acc.is_primary && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '20px' }}>Primary</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', padding: '24px',
            width: '100%', maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Add Withdrawal Account</h3>
            
            <form onSubmit={handleAddAccount}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Account Type</label>
                <select 
                  value={type} onChange={e => setType(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                >
                  <option value="crypto">Crypto (USDT)</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
              </div>

              {type === 'crypto' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Network</label>
                  <select 
                    value={network} onChange={e => setNetwork(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  >
                    <option value="ERC20">ERC20</option>
                    <option value="TRC20">TRC20</option>
                    <option value="BEP20">BEP20</option>
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                  {type === 'crypto' ? 'Wallet Address' : 'Phone Number'}
                </label>
                <input 
                  type="text" required
                  placeholder={type === 'crypto' ? '0x...' : '+254...'}
                  value={address} onChange={e => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" id="isPrimary"
                  checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)}
                />
                <label htmlFor="isPrimary" style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Set as Primary Account</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: '#f3f4f6', border: 'none', fontWeight: 700, color: '#4b5563', cursor: 'pointer' }}
                >Cancel</button>
                <button 
                  type="submit" disabled={submitting}
                  style={{ 
                    flex: 2, padding: '14px', borderRadius: '16px', backgroundColor: '#319795', 
                    color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
