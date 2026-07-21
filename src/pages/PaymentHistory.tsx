import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

interface Payment {
  id: number
  period: string
  amount: number
  status: string
  type: string
  payment_method: string | null
  network: string | null
  proof_url: string | null
  admin_notes: string | null
  created_at: string | null
}

const statusColors: { [key: string]: { bg: string; text: string; icon: string } } = {
  pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  paid: { bg: 'rgba(34, 197, 94, 0.1)', text: '#065f46', icon: '✓' },
  rejected: { bg: 'rgba(220, 38, 38, 0.1)', text: '#991b1b', icon: '✕' },
  cancelled: { bg: 'var(--bg-main)', text: 'var(--text-muted)', icon: '−' },
}

const getDisplayStatus = (status: string) => {
  return status === 'pending' ? 'Processing' : (status.charAt(0).toUpperCase() + status.slice(1))
}

const typeColors: { [key: string]: { bg: string; text: string; icon: string } } = {
  deposit: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1e40af', icon: '📥' },
  payout: { bg: 'rgba(236, 72, 153, 0.1)', text: '#be185d', icon: '📤' },
}

export default function PaymentHistory() {
  const navigate = useNavigate()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const paymentHistoryQuery = useQuery({
    queryKey: queryKeys.payments.history(1, 50),
    queryFn: async () => (await api.get<Payment[]>('/payments/history', { params: { page: 1, limit: 50 } })).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const payments = paymentHistoryQuery.data ?? []
  const loading = paymentHistoryQuery.isLoading

  const filteredPayments = filterType === 'all' ? payments : payments.filter(p => p.type === filterType)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading payment history...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-heading)' }}>←</button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Payment History</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Track all your deposits and payouts</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-main)', paddingBottom: '12px' }}>
        {[{ label: 'All', value: 'all' }, { label: 'Deposits', value: 'deposit' }, { label: 'Payouts', value: 'payout' }].map(tab => (
          <button key={tab.value} onClick={() => setFilterType(tab.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: filterType === tab.value ? 'var(--accent-primary)' : 'transparent', color: filterType === tab.value ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPayments.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}><p style={{ fontSize: '16px', color: 'var(--text-muted)', margin: 0 }}>No payment history found</p></div>
        ) : (
          filteredPayments.map((payment) => {
            const statusColor = statusColors[payment.status] || statusColors.pending
            const typeColor = typeColors[payment.type] || typeColors.deposit
            return (
              <div key={payment.id} onClick={() => { setSelectedPayment(payment); setShowModal(true) }} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--card-shadow)', cursor: 'pointer', border: '1px solid var(--border-main)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: typeColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{typeColor.icon}</div>
                  <div><p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{payment.type === 'deposit' ? 'Deposit' : 'Payout'}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{payment.period}</p></div>
                </div>
                <div style={{ textAlign: 'right', marginRight: '16px' }}><p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>${payment.amount.toFixed(2)}</p>{payment.payment_method && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{payment.payment_method}</p>}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusColor.bg, color: statusColor.text, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}><span>{statusColor.icon}</span>{getDisplayStatus(payment.status)}</span>
              </div>
            )
          })
        )}
      </div>

      {showModal && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Payment Details</h2><button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>TYPE</p><p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{selectedPayment.type === 'deposit' ? '📥 Deposit' : '📤 Payout'}</p></div>
              <div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>STATUS</p><div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusColors[selectedPayment.status]?.bg || '#f3f4f6', color: statusColors[selectedPayment.status]?.text || '#374151', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{statusColors[selectedPayment.status]?.icon} {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>AMOUNT</p><p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>${selectedPayment.amount.toFixed(2)}</p></div>
              <div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>DATE</p><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p></div>
            </div>
            {selectedPayment.payment_method && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>PAYMENT METHOD</p><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{selectedPayment.payment_method}</p></div>
                {selectedPayment.network && (<div><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>NETWORK</p><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{selectedPayment.network}</p></div>)}
              </div>
            )}
            {selectedPayment.proof_url && (<div style={{ marginBottom: '20px' }}><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 12px' }}>PAYMENT PROOF</p><img src={selectedPayment.proof_url} alt="Payment proof" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-main)', maxHeight: '300px', objectFit: 'contain' }} /></div>)}
            {selectedPayment.admin_notes && (<div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: '12px', padding: '12px', marginBottom: '20px', border: '1px solid #FECACA' }}><p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>ADMIN NOTES</p><p style={{ fontSize: '13px', color: '#991B1B', margin: 0 }}>{selectedPayment.admin_notes}</p></div>)}
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-primary)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
