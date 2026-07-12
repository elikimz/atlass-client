import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  performance_bonus_balance: number
  current_plan_id: number | null
  plan_start_date?: string
  plan_expiry_date?: string
  current_plan?: Plan
}

// Plan financial data
const PLAN_FINANCIALS: Record<string, { daily_earnings: number; total_return: number; profit: number; icon: string }> = {
  'Intern': { daily_earnings: 0.7, total_return: 2.1, profit: 2.1, icon: '💻' },
  'LV1': { daily_earnings: 0.7, total_return: 42, profit: 22, icon: '💎' },
  'LV2': { daily_earnings: 1.7, total_return: 102, profit: 52, icon: '💎' },
  'LV3': { daily_earnings: 3.5, total_return: 210, profit: 110, icon: '👑' },
  'LV4': { daily_earnings: 5.0, total_return: 300, profit: 150, icon: '👑' },
}

export default function InvestmentPlans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const fetchData = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        api.get('/plans'),
        api.get('/auth/me')
      ])
      // Sort plans by price to ensure correct order
      const sortedPlans = (plansRes.data || []).sort((a: Plan, b: Plan) => a.price - b.price)
      setPlans(sortedPlans)
      setUser(userRes.data)
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAction = async (plan: Plan) => {
    const hasExistingPlan = user?.current_plan_id !== null && user?.current_plan_id !== undefined;
    const isUpgrade = hasExistingPlan;
    
    if (user?.current_plan_id === plan.id) return;

    setActionLoading(plan.id)
    setMessage(null)
    
    try {
      const endpoint = isUpgrade ? `/plans/upgrade/${plan.id}` : `/plans/purchase/${plan.id}`;
      await api.post(endpoint)
      setMessage({ 
        type: 'success', 
        text: plan.name === 'Intern'
          ? 'Free Intern trial activated successfully!'
          : isUpgrade
            ? `Successfully upgraded to ${plan.name}!`
            : `Successfully purchased ${plan.name}!` 
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
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-main)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const isMobile = windowWidth < 768

  const getPlanColors = (name: string) => {
    if (name.includes('Intern')) return { bg: '#28A745', header: '#218838', btn: '#218838' };
    if (name.includes('LV1')) return { bg: '#3F51B5', header: '#303F9F', btn: '#303F9F' };
    if (name.includes('LV2')) return { bg: '#1976D2', header: '#1565C0', btn: '#1565C0' };
    if (name.includes('LV3')) return { bg: '#F59E0B', header: '#D97706', btn: '#1D4ED8' }; // LV3 has blue button in mockup
    if (name.includes('LV4')) return { bg: '#EAB308', header: '#CA8A04', btn: '#B45309' };
    return { bg: '#64748B', header: '#475569', btn: '#475569' };
  }

  const getFinancials = (planName: string) => {
    // Strip "(Dummy)" or other suffixes for lookup
    const key = Object.keys(PLAN_FINANCIALS).find(k => planName.includes(k)) || 'Intern'
    return PLAN_FINANCIALS[key]
  }

  const isExpired = user?.plan_expiry_date && new Date(user.plan_expiry_date) < new Date()

  return (
    <div style={{ 
      maxWidth: '100%', margin: '0 auto', padding: isMobile ? '12px' : '24px', 
      fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: 'var(--bg-main)', minHeight: '100vh' 
    }}>
      
      {/* Top Header Mockup Style */}
      <div style={{ backgroundColor: '#003399', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>AdPulseAI</div>
        <div style={{ fontSize: '18px' }}>🔍</div>
      </div>

      {/* User Status Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderBottom: '1px solid var(--border-main)' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-heading)' }}>My Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-main)' }}>
             <img src="/assets/plan-icon.jpg" alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>User_{user?.id || '1234'}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>DEPOSIT: {user?.deposit_wallet_balance?.toFixed(2) || '0.00'} USD</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0EA5E9' }}>BONUS: {user?.performance_bonus_balance?.toFixed(2) || '0.00'} USD</div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-main)', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
          ACTIVE PLAN: <span style={{ color: '#1D4ED8' }}>{user?.current_plan?.name || 'None'}</span> | VALIDITY: {isExpired ? '⚠️ EXPIRED' : (user?.current_plan?.validity_days || 0) + ' Days'}
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '12px', borderRadius: '8px', margin: '16px 0',
          backgroundColor: message.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: message.type === 'success' ? '#166534' : '#991B1B',
          fontSize: '13px', fontWeight: 600, textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* Plans Grid - 2 columns on mobile */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '10px', marginTop: '16px', marginBottom: '24px' 
      }}>
        {plans.map((plan) => {
          const colors = getPlanColors(plan.name);
          const financials = getFinancials(plan.name);
          const isActive = user?.current_plan_id === plan.id;
          const isLowerTier = user?.current_plan && plan.price < user.current_plan.price;
          const currentPlanPrice = user?.current_plan?.price || 0;
          const requiredBalance = user?.current_plan_id ? Math.max(plan.price - currentPlanPrice, 0) : plan.price;
          const hasEnoughBalance = plan.name === 'Intern' || (user?.deposit_wallet_balance || 0) >= requiredBalance;
          const canPurchase = !isActive && hasEnoughBalance && (!user?.current_plan_id || isExpired || !isLowerTier);
          
          return (
            <div key={plan.id} style={{ 
              backgroundColor: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', 
              boxShadow: 'var(--card-shadow)', border: isActive ? `2px solid ${colors.bg}` : '1px solid var(--border-main)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ backgroundColor: colors.bg, padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>{plan.name}</span>
                {isActive ? (
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Active</span>
                ) : plan.name === 'Intern' ? (
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Free Trial</span>
                ) : null}
              </div>
              
              <div style={{ padding: '12px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{financials.icon}</div>
                
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '2px' }}>{plan.price} USD</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>(Approx. {(plan.price * 130).toLocaleString()} KSH)</div>
                
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-main)', marginBottom: '16px', flex: 1 }}>
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
                    <span style={{ fontWeight: 700 }}>{financials.total_return.toFixed(1) || '0.0'} USD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Profit:</span>
                    <span style={{ fontWeight: 700 }}>{financials.profit.toFixed(1) || '0.0'} USD</span>
                  </div>
                  
                  {/* Mockup specific fields for higher tiers */}
                  {plan.price >= 100 && (
                    <>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Unlimrowte refund:</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Return:</span>
                        <span style={{ fontWeight: 700 }}>{financials.total_return.toFixed(0)} USD</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Profit:</span>
                        <span style={{ fontWeight: 700 }}>{financials.profit.toFixed(0)} USD</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleAction(plan)}
                  disabled={!canPurchase || actionLoading !== null}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '4px', border: 'none',
                    backgroundColor: isActive ? 'var(--bg-main)' : isLowerTier ? 'var(--bg-main)' : colors.btn,
                    color: isActive ? 'var(--text-muted)' : isLowerTier ? 'var(--text-muted)' : 'white',
                    fontSize: '11px', fontWeight: 800, cursor: !canPurchase ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {actionLoading === plan.id ? '...' : 
                   isActive ? 'ACTIVE' : 
                   isLowerTier ? 'LOCKED' :
                   !hasEnoughBalance ? 'INSUFFICIENT BALANCE' :
                   plan.name === 'Intern' ? 'ACTIVATE FREE TRIAL' :
                   user?.current_plan_id ? `UPGRADE TO ${plan.name} ($${plan.price.toFixed(2)})` : `PURCHASE ${plan.name} ($${plan.price.toFixed(2)})`}
                </button>
                {user?.current_plan_id && !isActive && !isLowerTier && plan.name !== 'Intern' && (
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4', fontStyle: 'italic', textAlign: 'center' }}>
                    The full plan amount will be deducted. If upgrading from an active paid tier, your previous package price will be automatically refunded to your Withdrawal Wallet immediately and available for cash out (Note: Expired plans are not eligible for a refund).
                  </div>
                )}
                {/* NEW: PesaFlux M-Pesa STK Push button (additive — does not affect existing purchase flow) */}
                {!isActive && !isLowerTier && plan.name !== 'Intern' && (
                  <button
                    onClick={() => navigate('/payments/mpesa', { state: { plan } })}
                    disabled={actionLoading !== null}
                    style={{
                      width: '100%', padding: '8px', borderRadius: '4px', border: 'none',
                      backgroundColor: '#00AC4F',
                      color: 'white',
                      fontSize: '11px', fontWeight: 800, cursor: actionLoading !== null ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase', marginTop: '6px'
                    }}
                  >
                    📱 PAY WITH M-PESA
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidelines Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '16px', border: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-main)', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            PLAN INFORMATION & PLATFORM GUIDELINES
          </h3>
          <span style={{ color: 'var(--text-heading)' }}>▲</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>Single Package Restriction:</div>
            <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
              <li>You may only have one active plan at any time. Purchases overwrite.</li>
            </ul>
          </div>
          
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>Important Note:</div>
            <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
              <li>After your plan's validity expires, you are required to upgrade to continue earning and unlock higher tiers. Lower-tier repeats are locked.</li>
            </ul>
          </div>
          
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>Upgrade Refund (3-Day Lock):</div>
            <ul style={{ margin: '4px 0', paddingLeft: '18px' }}>
              <li>When you upgrade, only the net additional cost is charged from your Deposit Wallet. Your previous plan's price is logged as a pending refund and locked for exactly 72 hours. After 3 days, the refund is automatically released to your Withdrawal Wallet as cashable earnings and counted in your Total Earnings.</li>
              <li>Plan upgrades do NOT generate invite commissions for your upline — only first-time purchases do.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
