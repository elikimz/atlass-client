import { useEffect, useState } from 'react'
import api from '../services/api'

interface Plan {
  id: number
  name: string
  price: number
  daily_tasks_limit: number
  validity_days: number
  description: string
  is_upgrade_only: boolean
}

interface UserData {
  id: number
  first_name: string
  last_name: string
  deposit_wallet_balance: number
  current_plan_id: number | null
  plan_start_date?: string
  plan_expiry_date?: string
  current_plan?: Plan
}

// Plan financial data
const PLAN_FINANCIALS: Record<string, { daily_earnings: number; total_return: number; profit: number }> = {
  'Intern': { daily_earnings: 0.7, total_return: 2.1, profit: 2.1 },
  'LV1': { daily_earnings: 0.7, total_return: 42, profit: 22 },
  'LV2': { daily_earnings: 1.7, total_return: 102, profit: 52 },
  'LV3': { daily_earnings: 3.5, total_return: 210, profit: 110 },
  'LV4': { daily_earnings: 5.0, total_return: 300, profit: 150 },
}

export default function InvestmentPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchData = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        api.get('/plans'),
        api.get('/auth/me')
      ])
      setPlans(plansRes.data)
      setUser(userRes.data)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAction = async (plan: Plan) => {
    const isUpgrade = user?.current_plan_id !== null && user?.current_plan_id !== undefined;
    
    if (user?.current_plan_id === plan.id) return;

    setActionLoading(plan.id)
    setMessage(null)
    
    try {
      const endpoint = isUpgrade ? `/plans/upgrade/${plan.id}` : `/plans/purchase/${plan.id}`;
      await api.post(endpoint)
      setMessage({ 
        type: 'success', 
        text: isUpgrade ? `Successfully upgraded to ${plan.name}!` : `Successfully purchased ${plan.name}!` 
      })
      await fetchData() // Refresh user state
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Transaction failed. Please check your balance.' 
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const getPlanColor = (name: string) => {
    switch(name) {
      case 'Intern': return { bg: '#E6F4EA', text: '#1E7E34', btn: '#28A745', header: '#1E7E34' };
      case 'LV1': return { bg: '#E8EAF6', text: '#3F51B5', btn: '#3F51B5', header: '#3F51B5' };
      case 'LV2': return { bg: '#E3F2FD', text: '#1976D2', btn: '#1976D2', header: '#1976D2' };
      case 'LV3': return { bg: '#FFF3E0', text: '#E65100', btn: '#FB8C00', header: '#FB8C00' };
      case 'LV4': return { bg: '#FFF8E1', text: '#FBC02D', btn: '#FBC02D', header: '#FBC02D' };
      default: return { bg: '#F5F5F5', text: '#616161', btn: '#757575', header: '#616161' };
    }
  }

  const getFinancials = (planName: string) => {
    return PLAN_FINANCIALS[planName] || { daily_earnings: 0, total_return: 0, profit: 0 }
  }

  const isExpired = user?.plan_expiry_date && new Date(user.plan_expiry_date) < new Date()

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Status Section */}
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{user?.first_name || 'User'}_{user?.id || '1234'}</div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>WALLET BALANCE: {user?.deposit_wallet_balance?.toFixed(2) || '0.00'} USD</div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 600 }}>
          ACTIVE PLAN: <span style={{ color: '#3B82F6' }}>{user?.current_plan?.name || 'None'}</span> | VALIDITY: {isExpired ? '⚠️ EXPIRED' : user?.current_plan?.validity_days || 0} Days
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', borderRadius: '8px', marginBottom: '24px',
          backgroundColor: message.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: message.type === 'success' ? '#166534' : '#991B1B',
          fontSize: '14px', fontWeight: 600, border: '1px solid transparent'
        }}>
          {message.text}
        </div>
      )}

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {plans.map((plan) => {
          const colors = getPlanColor(plan.name);
          const financials = getFinancials(plan.name);
          const isActive = user?.current_plan_id === plan.id;
          const isLowerTier = user?.current_plan && plan.price < user.current_plan.price;
          const canPurchase = !isActive && (!user?.current_plan_id || isExpired || !isLowerTier);
          
          return (
            <div key={plan.id} style={{ 
              backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: isActive ? `2px solid ${colors.btn}` : '1px solid #E2E8F0',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ backgroundColor: colors.bg, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: colors.header, fontWeight: 800, fontSize: '16px' }}>{plan.name}</span>
                {isActive && <span style={{ backgroundColor: colors.btn, color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Active</span>}
                {plan.name === 'Intern' && !isActive && <span style={{ backgroundColor: colors.btn, color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>Free Trial</span>}
              </div>
              
              <div style={{ padding: '20px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#1E293B', marginBottom: '4px' }}>{plan.price} USD</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>(Approx. {(plan.price * 130).toLocaleString()} KSH)</div>
                
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Daily:</span>
                    <span style={{ fontWeight: 700 }}>{financials.daily_earnings.toFixed(1)} USD ({plan.daily_tasks_limit} Tasks)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Validity:</span>
                    <span style={{ fontWeight: 700 }}>{plan.validity_days} Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Return:</span>
                    <span style={{ fontWeight: 700 }}>{financials.total_return.toFixed(0)} USD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Profit:</span>
                    <span style={{ fontWeight: 700 }}>{financials.profit.toFixed(0)} USD</span>
                  </div>
                </div>

                {isLowerTier && (
                  <div style={{ fontSize: '12px', color: '#DC2626', marginBottom: '12px', fontWeight: 600 }}>
                    Limitroute refund: Total Return: {financials.total_return.toFixed(0)} USD
                  </div>
                )}

                <button
                  onClick={() => handleAction(plan)}
                  disabled={!canPurchase || actionLoading !== null}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                    backgroundColor: isActive ? '#E2E8F0' : isLowerTier ? '#F1F5F9' : colors.btn,
                    color: isActive ? '#64748B' : isLowerTier ? '#94A3B8' : 'white',
                    fontSize: '14px', fontWeight: 700, cursor: !canPurchase ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {actionLoading === plan.id ? 'Processing...' : 
                   isActive ? 'ACTIVE' : 
                   isLowerTier ? 'LOCKED' : 
                   user?.current_plan_id ? `UPGRADE TO ${plan.name}` : 'PURCHASE PLAN'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidelines Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
          PLAN INFORMATION & PLATFORM GUIDELINES
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: '#475569' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Single Package Restriction:</div>
            <div style={{ paddingLeft: '12px' }}>You may only have one active plan at any time. Purchases overwrite.</div>
          </div>
          
          <div>
            <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Important Note:</div>
            <div style={{ paddingLeft: '12px' }}>After your plan's validity expires, you are required to upgrade to continue earning and unlock higher tiers. Lower-tier repeats are locked.</div>
          </div>
          
          <div>
            <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Upgrade Refund:</div>
            <div style={{ paddingLeft: '12px' }}>Upgrade refund to a total performance bonus. When you upgrade, the initial price of your previous plan is refunded back to your balance.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
