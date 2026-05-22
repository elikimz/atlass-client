import { useEffect, useState } from 'react'
import api from '../services/api'

interface Plan {
  id: number
  name: string
  price: number
  daily_tasks_limit: number
  validity_days: number
  description: string
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)',
  border: '1px solid #F1F5F9',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  position: 'relative',
  overflow: 'hidden'
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    api.get('/plans')
      .then(res => setPlans(res.data))
      .catch(err => console.error('Failed to fetch plans', err))
      .finally(() => setLoading(false))
  }, [])

  const handlePurchase = async (planId: number) => {
    setPurchasing(planId)
    setMessage(null)
    try {
      const res = await api.post('/plans/purchase', { plan_id: planId })
      setMessage({ type: 'success', text: res.data.message })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Purchase failed. Please check your deposit wallet.' })
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Investment Plans <span style={{ color: '#5932EA' }}>🚀</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
          Upgrade your plan to unlock higher earning potential and more daily tasks.
        </p>
      </div>

      {message && (
        <div style={{ 
          padding: '16px 20px', 
          borderRadius: '12px', 
          backgroundColor: message.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: message.type === 'success' ? '#15803D' : '#B91C1C',
          fontSize: '14px',
          fontWeight: 600,
          border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={cardStyle}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 20px', backgroundColor: '#F5F3FF', color: '#5932EA', fontSize: '12px', fontWeight: 700, borderBottomLeftRadius: '20px' }}>
              POPULAR
            </div>
            
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#5932EA' }}>${plan.price}</span>
              <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>/ {plan.validity_days} days</span>
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{plan.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{plan.daily_tasks_limit} Daily Video Tasks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Tier A/B/C Network Rebates</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Priority Support</span>
              </div>
            </div>

            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={purchasing !== null}
              style={{
                marginTop: 'auto',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: '#5932EA',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: purchasing !== null ? 0.7 : 1
              }}
            >
              {purchasing === plan.id ? 'Processing...' : 'Purchase Plan'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '24px', padding: '32px', border: '1px dashed #E2E8F0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Need a Custom Plan?</h3>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Contact our support team for enterprise solutions and bulk network rates.</p>
      </div>
    </div>
  )
}
