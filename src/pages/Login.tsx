import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
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
      const payload: any = { email: email.trim().toLowerCase() }
      if (isRegistering) {
        payload.first_name = firstName.trim()
        payload.last_name = lastName.trim()
        if (referralCode.trim()) payload.referral_code = referralCode.trim()
      }
      await api.post('/auth/login', payload)
      localStorage.setItem('email', email.trim().toLowerCase())
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
    width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '12px', outline: 'none', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box', marginBottom: '16px', transition: 'all 0.2s ease-in-out'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/logo.png" alt="AdPulseAI Logo" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', boxShadow: 'var(--card-shadow)' }} />
        <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>AdPulseAI</span>
      </div>

      <div style={{ width: '100%', maxWidth: '460px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '48px 40px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.02em' }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '36px', lineHeight: 1.6 }}>{isRegistering ? 'Join the community and start building the future of AI today.' : 'Sign in with your email to access your dashboard.'}</p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={labelStyle}>First Name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required style={inputStyle} /></div>
              <div><label style={labelStyle}>Last Name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required style={inputStyle} /></div>
            </div>
          )}
          <label style={labelStyle}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required style={inputStyle} />
          {isRegistering && (
            <><label style={labelStyle}>Referral Code <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span></label><input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter code" style={inputStyle} /></>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
            <div style={{ width: '22px', height: '22px', borderRadius: '7px', border: acceptedTerms ? '2px solid var(--accent-primary)' : '2px solid var(--border-main)', backgroundColor: acceptedTerms ? 'var(--accent-primary)' : 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0, marginTop: '2px' }}>
              {acceptedTerms && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>I agree to the <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a></span>
          </div>
          {error && <div style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', border: '1px solid #FECDD3', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#E11D48', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
          <button type="submit" disabled={loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600, backgroundColor: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? 'var(--border-main)' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '14px', cursor: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s ease', boxShadow: (loading || !email || !acceptedTerms || (isRegistering && (!firstName || !lastName))) ? 'none' : '0px 12px 30px rgba(89, 50, 234, 0.3)' }}>
            {loading ? 'Sending code...' : <>{isRegistering ? 'Create Account' : 'Sign In'}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
          </button>
        </form>
      </div>
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{isRegistering ? 'Already have an account?' : "Don't have an account?"} <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); setError(''); }} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, marginLeft: '4px' }}>{isRegistering ? 'Sign In' : 'Create Account'}</a></p>
      </div>
    </div>
  )
}
