import { useNavigate, useParams } from 'react-router-dom'

const providers = {
  paypal: { name: 'PayPal', logo: 'https://cdn.simpleicons.org/paypal/003087' },
  wise: { name: 'Wise', logo: 'https://cdn.simpleicons.org/wise/163300' },
  payoneer: { name: 'Payoneer', logo: 'https://cdn.simpleicons.org/payoneer/ff4800' },
} as const

const maintenanceMessage = 'The payment method is currently under maintenance and is temporarily unavailable. Our technical team is working on the necessary updates to restore the service.'

export default function PaymentMethodMaintenance() {
  const navigate = useNavigate()
  const { method } = useParams<{ method: string }>()
  const provider = method && method in providers ? providers[method as keyof typeof providers] : null

  if (!provider) {
    navigate('/payments/recharge', { replace: true })
    return null
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '24px 16px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
        <button onClick={() => navigate('/payments/recharge')} style={{ display: 'block', marginBottom: '28px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '15px', cursor: 'pointer' }}>← Back to recharge</button>
        <div style={{ width: '82px', height: '82px', margin: '0 auto 20px', borderRadius: '20px', backgroundColor: 'white', border: '1px solid var(--border-main)', display: 'grid', placeItems: 'center' }}>
          <img src={provider.logo} alt={`${provider.name} logo`} style={{ width: '54px', height: '54px' }} />
        </div>
        <p style={{ margin: '0 0 8px', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Payment method</p>
        <h1 style={{ margin: '0 0 22px', color: 'var(--text-heading)', fontSize: '30px', fontWeight: 800 }}>{provider.name}</h1>
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: '16px', padding: '18px', fontSize: '15px', lineHeight: 1.6, fontWeight: 600 }}>{maintenanceMessage}</div>
        <button onClick={() => navigate('/payments/recharge')} style={{ width: '100%', marginTop: '24px', padding: '15px 20px', border: 'none', borderRadius: '14px', backgroundColor: 'var(--accent-primary)', color: 'white', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>Return to recharge</button>
      </section>
    </main>
  )
}
