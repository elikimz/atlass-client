import { useState, useEffect } from 'react'
import api from '../services/api'

interface Payment {
  id: number
  user_id: number
  amount: number
  status: string
  type: string
  payment_method: string
  network: string
  proof_url: string
  admin_notes: string
  created_at: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

interface Notification {
  message: string
  type: 'success' | 'error'
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>('deposit')
  const [notification, setNotification] = useState<Notification | null>(null)
  const [reviewingPayment, setReviewingPayment] = useState<Payment | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/payments')
      setPayments(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to fetch payments', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/payments/${id}/approve`)
      showNotify('Payment approved successfully')
      setReviewingPayment(null)
      fetchPayments()
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to approve payment', 'error')
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      showNotify('Please provide a rejection reason', 'error')
      return
    }
    try {
      await api.post(`/admin/payments/${id}/reject`, { admin_notes: rejectionReason })
      showNotify('Payment rejected successfully')
      setReviewingPayment(null)
      setRejectionReason('')
      fetchPayments()
    } catch (err: any) {
      showNotify(err.response?.data?.detail || 'Failed to reject payment', 'error')
    }
  }

  const filteredPayments = payments.filter(p => {
    const type = (p.type || '').toLowerCase()
    if (activeTab === 'deposit') return type === 'deposit'
    return type === 'payout' || type === 'withdrawal'
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}>
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Custom Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px',
          backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          {notification.message}
        </div>
      )}

      {/* Review Modal */}
      {reviewingPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Review {reviewingPayment.type}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>${reviewingPayment.amount.toFixed(2)}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Method</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{reviewingPayment.payment_method}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Network</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{reviewingPayment.network || 'N/A'}</div>
                </div>
              </div>

              {reviewingPayment.proof_url && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Payment Proof</div>
                  <a href={reviewingPayment.proof_url} target="_blank" rel="noreferrer">
                    <img src={reviewingPayment.proof_url} alt="Proof" style={{ width: '100%', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  </a>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this payment is being rejected..."
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setReviewingPayment(null); setRejectionReason(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(reviewingPayment.id)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(reviewingPayment.id)}
                style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Financial Management</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Review and process deposit and withdrawal requests</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('deposit')}
          style={{
            padding: '12px 24px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === 'deposit' ? '#3B82F6' : '#6B7280',
            borderBottom: activeTab === 'deposit' ? '2px solid #3B82F6' : '2px solid transparent'
          }}
        >
          Deposits
        </button>
        <button
          onClick={() => setActiveTab('withdrawal')}
          style={{
            padding: '12px 24px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === 'withdrawal' ? '#3B82F6' : '#6B7280',
            borderBottom: activeTab === 'withdrawal' ? '2px solid #3B82F6' : '2px solid transparent'
          }}
        >
          Withdrawals
        </button>
      </div>

      {/* Payments Table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>User</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Method</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{payment.user?.first_name} {payment.user?.last_name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{payment.user?.email}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: activeTab === 'deposit' ? '#059669' : '#DC2626' }}>
                  {activeTab === 'deposit' ? '+' : '-'}${payment.amount.toFixed(2)}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#374151' }}>{payment.payment_method}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{payment.network || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    backgroundColor: payment.status === 'paid' ? '#DCFCE7' : payment.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                    color: payment.status === 'paid' ? '#166534' : payment.status === 'pending' ? '#92400E' : '#991B1B'
                  }}>
                    {payment.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#6B7280' }}>
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  {payment.status === 'pending' ? (
                    <button
                      onClick={() => setReviewingPayment(payment)}
                      style={{
                        padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600
                      }}
                    >
                      Review
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>No {activeTab} requests found.</p>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
