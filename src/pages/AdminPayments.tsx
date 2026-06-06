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
  user: { first_name: string; last_name: string; email: string }
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

  useEffect(() => { fetchPayments() }, [])
  useEffect(() => { if (notification) { const timer = setTimeout(() => setNotification(null), 5000); return () => clearTimeout(timer) } }, [notification])

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => setNotification({ message, type })
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
      setReviewingPayment(null); fetchPayments()
    } catch (err: any) { showNotify(err.response?.data?.detail || 'Failed to approve payment', 'error') }
  }

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) { showNotify('Please provide a rejection reason', 'error'); return }
    try {
      await api.post(`/admin/payments/${id}/reject`, { admin_notes: rejectionReason })
      showNotify('Payment rejected successfully')
      setReviewingPayment(null); setRejectionReason(''); fetchPayments()
    } catch (err: any) { showNotify(err.response?.data?.detail || 'Failed to reject payment', 'error') }
  }

  const filteredPayments = payments.filter(p => {
    const type = (p.type || '').toLowerCase()
    if (activeTab === 'deposit') return type === 'deposit'
    return type === 'payout' || type === 'withdrawal'
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {notification && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px', backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>{notification.message}
        </div>
      )}

      {reviewingPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-main)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-heading)' }}>Review {reviewingPayment.type}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>${reviewingPayment.amount.toFixed(2)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Method</div><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{reviewingPayment.payment_method}</div></div>
                <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Network</div><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{reviewingPayment.network || 'N/A'}</div></div>
              </div>
              {reviewingPayment.proof_url && (
                <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment Proof</div><a href={reviewingPayment.proof_url} target="_blank" rel="noreferrer"><img src={reviewingPayment.proof_url} alt="Proof" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-main)' }} /></a></div>
              )}
              <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>Rejection Reason (Required if rejecting)</label><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this payment is being rejected..." rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-main)', fontSize: '14px', outline: 'none', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}><button onClick={() => { setReviewingPayment(null); setRejectionReason(''); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button><button onClick={() => handleReject(reviewingPayment.id)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Reject</button><button onClick={() => handleApprove(reviewingPayment.id)} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Approve</button></div>
          </div>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Financial Management</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Review and process deposit and withdrawal requests</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-main)', paddingBottom: '2px' }}>
        <button onClick={() => setActiveTab('deposit')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'deposit' ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'deposit' ? '2px solid var(--accent-primary)' : '2px solid transparent' }}>Deposits</button>
        <button onClick={() => setActiveTab('withdrawal')} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'withdrawal' ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: activeTab === 'withdrawal' ? '2px solid var(--accent-primary)' : '2px solid transparent' }}>Withdrawals</button>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-main)' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>User</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Method</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '16px' }}><div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{payment.user?.first_name} {payment.user?.last_name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{payment.user?.email}</div></td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: activeTab === 'deposit' ? '#059669' : '#DC2626' }}>{activeTab === 'deposit' ? '+' : '-'}${payment.amount.toFixed(2)}</td>
                <td style={{ padding: '16px' }}><div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{payment.payment_method}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{payment.network || 'N/A'}</div></td>
                <td style={{ padding: '16px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: payment.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : payment.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: payment.status === 'paid' ? '#166534' : payment.status === 'pending' ? '#92400E' : '#991B1B' }}>{payment.status.toUpperCase()}</span></td>
                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(payment.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>{payment.status === 'pending' ? <button onClick={() => setReviewingPayment(payment)} style={{ padding: '8px 16px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Review</button> : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Processed</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredPayments.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div><p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0 }}>No {activeTab} requests found.</p></div>}
    </div>
  )
}
