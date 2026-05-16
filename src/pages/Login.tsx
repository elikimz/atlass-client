import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ }: { setIsAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/login', { email })
      localStorage.setItem('email', email)
      navigate('/verify')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px', fontFamily: 'Inter, sans-serif', color: '#0F1729' }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '32px', height: '32px', backgroundColor: '#5B5FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
          <span style={{ margin: 'auto' }}>AC</span>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Atlas Capture</span>
      </div>

      {/* Main Card */}
      <div style={{ width: '100%', maxWidth: '540px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '48px' }}>
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <span style={{ backgroundColor: '#EFF6FF', color: '#5B5FFF', fontSize: '10px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #DBEAFE' }}>
              <span style={{ width: '4px', height: '4px', backgroundColor: '#5B5FFF', borderRadius: '50%' }}></span>
              Now Hiring Worldwide
            </span>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-0.025em' }}>
              Help Train the Next Generation of <br />
              <span style={{ color: '#5B5FFF' }}>Breakthrough AI</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.6' }}>
              Get paid to complete simple tasks from home. Join thousands of contributors helping build the future of AI.
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', padding: '16px 8px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>10,000+</p>
              <p style={{ fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginTop: '2px' }}>Contributors</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 8px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>$2M+</p>
              <p style={{ fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginTop: '2px' }}>Paid Out</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 8px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>100+</p>
              <p style={{ fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginTop: '2px' }}>Cities</p>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
            {[
              { icon: '💰', label: 'Competitive Pay' },
              { icon: '🕒', label: 'Flexible Hours' },
              { icon: '🌐', label: 'Work Anywhere' },
              { icon: '🛡️', label: 'Weekly Payouts' }
            ].map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', backgroundColor: 'white', border: '1px solid #F1F5F9', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '16px' }}>{feature.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Onboarding Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '40px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }}></span> No experience required
            </span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }}></span> Quick onboarding
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', marginLeft: '4px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '14px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', marginLeft: '4px' }}>
              <input
                type="checkbox"
                id="student"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              />
              <label htmlFor="student" style={{ fontSize: '13px', fontWeight: '500', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                I'm a Philippines college/university student
              </label>
            </div>

            {error && <div style={{ color: '#DC2626', fontSize: '12px', backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FEE2E2', fontWeight: '500' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#5B5FFF', color: 'white', fontWeight: 'bold', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 20px rgba(91,95,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              {loading ? 'Sending...' : 'Start Earning Today'} 
              <span style={{ fontSize: '18px' }}>→</span>
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', padding: '0 24px', lineHeight: '1.6' }}>
              By continuing, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Card */}
      <div style={{ width: '100%', maxWidth: '540px', marginTop: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
          <span style={{ color: '#5B5FFF', fontSize: '24px', fontFamily: 'serif' }}>"</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ color: '#FBBF24', fontSize: '14px' }}>★</span>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.6', marginBottom: '32px' }}>
          "What started as extra cash on weekends turned into my full time thing."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid #F1F5F9' }}>🇮🇳</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Rajesh S.</p>
              <p style={{ fontSize: '11px', color: '#64748B', fontWeight: '500', margin: 0 }}>Mumbai, India</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '6px 16px', borderRadius: '9999px', border: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#5B5FFF', margin: 0 }}>Earned $30k+</p>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div style={{ marginTop: '40px', marginBottom: '48px' }}>
        <a href="#" style={{ fontSize: '13px', fontWeight: 'bold', color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Learn more about Atlas Capture 
          <span>↗</span>
        </a>
      </div>
    </div>
  )
}
