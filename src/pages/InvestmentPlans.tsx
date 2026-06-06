import { useEffect, useState } from 'react'
import api from '../services/api'

interface Plan {
  id: number
  name: string
  price: number
  daily_tasks_limit: number
  validity_days: number
  is_active: boolean
}

interface User {
  id: number
  current_plan_id: number | null
  deposit_wallet_balance: number
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, userRes] = await Promise.all([api.get('/training/plans'), api.get('/auth/me')])
        setPlans(plansRes.data); setUser(userRes.data)
      } catch (err) { console.error('Failed to fetch data', err) } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleAction = async (plan: Plan) => {
    if (plan.id === user?.current_plan_id) return
    if (!window.confirm(`Are you sure you want to ${user?.current_plan_id ? 'upgrade to' : 'purchase'} the ${plan.name} plan?`)) return
    try {
      setActionLoading(plan.id)
      await api.post(`/training/plans/${plan.id}/purchase`)
      alert('Plan activated successfully!'); window.location.reload()
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed to activate plan') } finally { setActionLoading(null) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>

  const currentPlanPrice = plans.find(p => p.id === user?.current_plan_id)?.price || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Investment Plans</h1><p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Choose a plan that fits your goals and start earning</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {plans.map((plan) => {
          const isActive = plan.id === user?.current_plan_id
          const isLowerTier = plan.price < currentPlanPrice
          const canPurchase = !isActive && !isLowerTier
          const hasEnoughBalance = (user?.deposit_wallet_balance || 0) >= (plan.price - currentPlanPrice)
          
          const getPlanColors = (name: string) => {
            switch(name.toLowerCase()) {
              case 'intern': return { bg: '#6366F1', btn: '#4F46E5' }
              case 'associate': return { bg: '#8B5CF6', btn: '#7C3AED' }
              case 'partner': return { bg: '#EC4899', btn: '#DB2777' }
              case 'executive': return { bg: '#F59E0B', btn: '#D97706' }
              default: return { bg: 'var(--accent-primary)', btn: 'var(--accent-primary)' }
            }
          }
          const colors = getPlanColors(plan.name)
          const financials = { icon: '💼', daily_earnings: plan.price * 0.05, total_return: plan.price * 1.5, profit: plan.price * 0.5 }

          return (
            <div key={plan.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--card-shadow)', transition: 'transform 0.2s' }}>
              <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-heading)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-main)' }}><div style={{ fontWeight: 800, fontSize: '14px' }}>AdPulseAI</div><div style={{ fontSize: '18px' }}>🔍</div></div>
              <div style={{ backgroundColor: colors.bg, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{plan.name}</span>{isActive && <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Active</span>}</div>
              <div style={{ padding: '24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{financials.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '4px' }}>${plan.price} USD</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>(Approx. {(plan.price * 130).toLocaleString()} KSH)</div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '24px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Daily Tasks:</span><span style={{ fontWeight: 700 }}>{plan.daily_tasks_limit}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Validity:</span><span style={{ fontWeight: 700 }}>{plan.validity_days} Days</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Return:</span><span style={{ fontWeight: 700 }}>${financials.total_return.toFixed(2)}</span></div>
                </div>
                <button onClick={() => handleAction(plan)} disabled={!canPurchase || actionLoading !== null} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isActive ? 'var(--bg-main)' : isLowerTier ? 'var(--bg-main)' : colors.btn, color: isActive ? 'var(--text-muted)' : isLowerTier ? 'var(--text-muted)' : 'white', fontSize: '13px', fontWeight: 700, cursor: !canPurchase ? 'not-allowed' : 'pointer' }}>
                  {actionLoading === plan.id ? '...' : isActive ? 'ACTIVE' : isLowerTier ? 'LOCKED' : !hasEnoughBalance ? 'INSUFFICIENT BALANCE' : user?.current_plan_id ? 'UPGRADE' : 'PURCHASE'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
