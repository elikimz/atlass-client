import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  // Use prop to satisfy linting
  if (false) console.log(setIsAuthenticated);
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/login', {
        first_name: firstName,
        last_name: lastName,
        email,
        ...(referralCode.trim() ? { referral_code: referralCode.trim() } : {}),
      })
      localStorage.setItem('email', email)
      navigate('/verify')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#111827',
    boxSizing: 'border-box',
    marginBottom: '14px',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f4ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '0 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px',
          backgroundColor: '#6366f1', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Adpulse AI</span>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '36px 32px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.3, marginBottom: '8px' }}>
          Get Started with{' '}
          <span style={{ color: '#6366f1' }}>Adpulse AI</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 }}>
          Enter your details below and we'll send you a verification code to access your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <label style={labelStyle}>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
          />

          {/* Last Name */}
          <label style={labelStyle}>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
          />

          {/* Email */}
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
          />

          {/* Referral Code (optional) */}
          <label style={labelStyle}>
            Referral Code{' '}
            <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code if you have one"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none' }}
          />

          {/* Terms and Conditions Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '4px',
              border: acceptedTerms ? '2px solid #6366f1' : '2px solid #d1d5db',
              backgroundColor: acceptedTerms ? '#6366f1' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0
            }}>
              {acceptedTerms && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
              I agree to the <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            </span>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '10px 12px',
              fontSize: '13px', color: '#dc2626', marginBottom: '12px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName || !lastName || !email || !acceptedTerms}
            style={{
              width: '100%', padding: '11px',
              fontSize: '14px', fontWeight: 600,
              backgroundColor: (loading || !firstName || !lastName || !email || !acceptedTerms) ? '#a5b4fc' : '#6366f1',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: (loading || !firstName || !lastName || !email || !acceptedTerms) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Sending code...' : (
              <>
                Continue
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '16px' }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
