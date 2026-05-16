import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isStudent, setIsStudent] = useState(false)
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
      setError(err.response?.data?.detail || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { value: '10,000+', label: 'Contributors' },
    { value: '$2M+', label: 'Paid Out' },
    { value: '100+', label: 'Cities' },
  ]

  const features = [
    { icon: '$', label: 'Competitive Pay' },
    { icon: '◷', label: 'Flexible Hours' },
    { icon: '◎', label: 'Work Anywhere' },
    { icon: '◷', label: 'Weekly Payouts' },
  ]

  const testimonials = [
    { quote: '"What started as extra cash on weekends turned into my full time thing."', flag: '🇮🇳', name: 'Rajesh S.', location: 'Mumbai, India', earned: '$30k+' },
    { quote: '"Between classes I record a few tasks. Pays for my books and then some."', flag: '🇯🇴', name: 'Shan A.', location: 'Amman, Jordan', earned: '$5k+' },
    { quote: '"I was skeptical at first, but the weekly payouts convinced me."', flag: '🇵🇭', name: 'Maria L.', location: 'Manila, Philippines', earned: '$8k+' },
  ]

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f0f4ff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '0 16px',
    }}>
      {/* Logo */}
      <div style={{ paddingTop: '32px', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: '#6366f1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Adpulse AI</span>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        backgroundColor: 'white', borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '32px 28px',
        marginTop: '8px',
      }}>
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#f0f4ff', color: '#6366f1',
            fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px',
            border: '1px solid #e0e7ff',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Now Hiring Worldwide
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.3, marginBottom: '10px' }}>
          Help Train the Next Generation of{' '}
          <span style={{ color: '#6366f1' }}>Breakthrough AI</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
          Get paid to complete simple tasks from home. Join thousands of contributors helping build the future of AI.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ backgroundColor: 'white', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          {features.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '22px', height: '22px', backgroundColor: '#ede9fe', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>
                {f.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Extra badges */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {['No experience required', 'Quick onboarding'].map((t) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t}
            </span>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #d1d5db', borderRadius: '8px',
              outline: 'none', backgroundColor: 'white', color: '#111827',
              boxSizing: 'border-box', marginBottom: '12px',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
          />

          {/* Philippines student checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              role="checkbox"
              aria-checked={isStudent}
              onClick={() => setIsStudent(!isStudent)}
              style={{
                width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                border: isStudent ? '2px solid #6366f1' : '2px solid #d1d5db',
                backgroundColor: isStudent ? '#6366f1' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              {isStudent && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
            <label style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }} onClick={() => setIsStudent(!isStudent)}>
              I'm a Philippines college/university student
            </label>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600,
              backgroundColor: loading ? '#a5b4fc' : '#6366f1',
              color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Sending code...' : (
              <>
                Start Earning Today
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>
      </div>

      {/* Testimonial */}
      <div style={{
        width: '100%', maxWidth: '420px',
        backgroundColor: 'white', borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '20px 24px',
        marginTop: '12px',
      }}>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
          {[1,2,3,4,5].map((i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginBottom: '14px' }}>
          {testimonials[0].quote}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{testimonials[0].flag}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{testimonials[0].name}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{testimonials[0].location}</div>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', backgroundColor: '#f0f4ff', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e0e7ff' }}>
            Earned {testimonials[0].earned}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 0 32px', textAlign: 'center' }}>
        <a href="https://atlascapture.io" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Learn more about Adpulse AI
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
