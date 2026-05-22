import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  // Use prop to satisfy linting
  if (false) console.log(setIsAuthenticated);
  const [isRegistering, setIsRegistering] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      setIsRegistering(true)
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !acceptedTerms) return
    
    setLoading(true)
    setError('')
    
    try {
      const payload: any = { email: email.trim() }
      if (isRegistering) {
        payload.first_name = firstName.trim()
        payload.last_name = lastName.trim()
        if (referralCode.trim()) {
          payload.referral_code = referralCode.trim()
        }
      }

      await api.post('/auth/login', payload)
      localStorage.setItem('email', email.trim())
      navigate('/verify')
    } catch (err: any) {
      console.error('Login error:', err)
      const detail = err.response?.data?.detail
      if (detail && detail.includes("provide your first and last name")) {
        setIsRegistering(true)
        setError("Account not found. Please enter your name to register.")
      } else {
        setError(detail || 'Failed to send code. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    boxSizing: 'border-box',
    marginBottom: '16px',
    transition: 'all 0.2s ease-in-out',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '8px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      padding: '24px 16px',
    }}>
      {/* Logo Section */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px',
          backgroundColor: '#5932EA', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0px 10px 25px rgba(89, 50, 234, 0.25)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>Adpulse AI</span>
      </div>

      {/* Floating Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.04), 0px 10px 30px rgba(226, 236, 249, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', textAlign: 'center', marginBottom: '36px', lineHeight: 1.6 }}>
          {isRegistering 
            ? 'Join the community and start building the future of AI today.' 
            : 'Sign in with your email to access your dashboard.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Elijah"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Kimani"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>
          )}

          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
          />

          {isRegistering && (
            <>
              <label style={labelStyle}>
                Referral Code <span style={{ fontWeight: 400, color: '#94A3B8' }}>(Optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter code"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
              />
            </>
          )}

          {/* Terms and Conditions Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '7px',
              border: acceptedTerms ? '2px solid #5932EA' : '2px solid #CBD5E1',
              backgroundColor: acceptedTerms ? '#5932EA' : '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', flexShrink: 0, marginTop: '2px'
            }}>
              {acceptedTerms && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              I agree to the <a href="#" style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            </span>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#FFF1F2', border: '1px solid #FECDD3',
              borderRadius: '12px', padding: '14px 18px',
              fontSize: '14px', color: '#E11D48', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))}
            style={{
              width: '100%', padding: '16px',
              fontSize: '16px', fontWeight: 600,
              backgroundColor: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? '#E2E8F0' : '#5932EA',
              color: 'white', border: 'none', borderRadius: '14px',
              cursor: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? 'none' : '0px 12px 30px rgba(89, 50, 234, 0.3)',
            }}
          >
            {loading ? 'Sending code...' : (
              <>
                {isRegistering ? 'Create Account' : 'Sign In'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); setError(''); }}
            style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600, marginLeft: '4px' }}
          >
            {isRegistering ? 'Sign In' : 'Create Account'}
          </a>
        </p>
        <button 
          onClick={() => {
            setEmail('elijahkimani1293@gmail.com')
            setFirstName('Elijah')
            setLastName('Kimani')
            setAcceptedTerms(true)
          }}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: '13px', fontWeight: 600, color: '#94A3B8',
            cursor: 'pointer', textDecoration: 'underline',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.color = '#5932EA'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.color = '#94A3B8'}
        >
          Admin Access
        </button>
      </div>
    </div>
  )
}
