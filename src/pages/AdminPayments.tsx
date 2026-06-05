import { useEffect, useState } from 'react'
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
    id: number
    email: string
    first_name: string
    last_name: string
  }
}

const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
  pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  paid: { bg: '#ecfdf5', text: '#065f46', icon: '✓' },
  rejected: { bg: '#fef2f2', text: '#991b1b', icon: '✕' },
  cancelled: { bg: '#f3f4f6', text: '#374151', icon: '−' },
}

const getDisplayStatus = (status: string) => {
  return status === 'pending' ? 'Processing' : (status.charAt(0).toUpperCase() + status.slice(1))
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('pending')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments')
      setPayments(response.data)
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId: number) => {
    setActionLoading(true)
    try {
      await api.post(`/admin/payments/${paymentId}/approve`)
      await fetchPayments()
      setShowModal(false)
      setSelectedPayment(null)
    } catch (err) {
      console.error('Failed to approve payment:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (paymentId: number) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setActionLoading(true)
    try {
      await api.post(`/admin/payments/${paymentId}/reject`, {
        admin_notes: rejectReason
      })
      await fetchPayments()
      setShowModal(false)
      setSelectedPayment(null)
      setRejectReason('')
    } catch (err) {
      console.error('Failed to reject payment:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredPayments = filterStatus === 'all'
    ? payments
    : payments.filter(p => p.status === filterStatus)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280' }}>Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937', margin: '0 0 8px' }}>Payment Management</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Review and approve user deposit requests</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
        {[
          { label: 'All', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'paid' },
          { label: 'Rejected', value: 'rejected' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: filterStatus === tab.value ? '#3B82F6' : 'transparent',
              color: filterStatus === tab.value ? 'white' : '#6B7280',
              cursor: 'pointer', fontSize: '14px', fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {filteredPayments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>No payments found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#374151' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Method</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => {
                  const statusColor = statusColors[payment.status] || statusColors.pending
                  return (
                    <tr key={payment.id} style={{ borderBottom: idx < filteredPayments.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                        <div style={{ fontWeight: 600 }}>{payment.user.first_name} {payment.user.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{payment.user.email}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                        {payment.payment_method} ({payment.network})
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          backgroundColor: statusColor.bg, color: statusColor.text,
                          padding: '4px 12px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: 700
                        }}>
                          <span>{statusColor.icon}</span>
                          {getDisplayStatus(payment.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6B7280' }}>
                        {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowModal(true)
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none',
                            backgroundColor: '#3B82F6', color: 'white',
                            cursor: 'pointer', fontSize: '12px', fontWeight: 600
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px',
            maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Review Payment</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 8px' }}>USER</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {selectedPayment.user.first_name} {selectedPayment.user.last_name}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{selectedPayment.user.email}</p>
            </div>

            {/* Payment Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 6px' }}>Amount</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  ${selectedPayment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 6px' }}>Status</p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: statusColors[selectedPayment.status].bg,
                  color: statusColors[selectedPayment.status].text,
                  padding: '6px 12px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 700
                }}>
                  {statusColors[selectedPayment.status].icon} {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 6px' }}>Method</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  {selectedPayment.payment_method} ({selectedPayment.network})
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 6px' }}>Date</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  {new Date(selectedPayment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Proof Image */}
            {selectedPayment.proof_url && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 12px' }}>PAYMENT PROOF</p>
                <img
                  src={selectedPayment.proof_url}
                  alt="Payment proof"
                  style={{
                    width: '100%', borderRadius: '12px', border: '1px solid #E5E7EB',
                    maxHeight: '300px', objectFit: 'contain'
                  }}
                />
              </div>
            )}

            {/* Admin Notes (if exists) */}
            {selectedPayment.admin_notes && (
              <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '12px', marginBottom: '20px', border: '1px solid #FECACA' }}>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, margin: '0 0 6px' }}>ADMIN NOTES</p>
                <p style={{ fontSize: '13px', color: '#991B1B', margin: 0 }}>{selectedPayment.admin_notes}</p>
              </div>
            )}

            {/* Rejection Reason Input (if rejecting) */}
            {selectedPayment.status === 'pending' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '8px' }}>
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this payment is being rejected..."
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB',
                    fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB',
                  backgroundColor: 'white', color: '#374151', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600
                }}
              >
                Close
              </button>

              {selectedPayment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedPayment.id)}
                    disabled={actionLoading || !rejectReason.trim()}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                      backgroundColor: !rejectReason.trim() ? '#FCA5A5' : '#EF4444',
                      color: 'white', cursor: !rejectReason.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 600
                    }}
                  >
                    {actionLoading ? '⏳ Processing...' : '✕ Reject'}
                  </button>

                  <button
                    onClick={() => handleApprove(selectedPayment.id)}
                    disabled={actionLoading}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                      backgroundColor: actionLoading ? '#A0AEC0' : '#10B981',
                      color: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 600
                    }}
                  >
                    {actionLoading ? '⏳ Processing...' : '✓ Approve'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
