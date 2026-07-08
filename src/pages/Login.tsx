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
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = localStorage.getItem('access_token')
    if (token) {
      const isAdmin = localStorage.getItem('user_is_admin') === 'true'
      navigate(isAdmin ? '/admin' : '/dashboard')
      return
    }

    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    const mode = params.get('mode')
    
    // If a referral code is present OR mode=register is in the URL, switch to registration view
    if (ref || mode === 'register') {
      if (ref) setReferralCode(ref)
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
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '36px', lineHeight: 1.6 }}>{isRegistering ? 'Join the community and start earning from simple tasks.' : 'Sign in with your email to access your dashboard.'}</p>

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
            <span style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5 }}>I agree to the <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); setActiveTab('terms'); }} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</a> and <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); setActiveTab('privacy'); }} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</a></span>
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

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-main)' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}</h2>
              <button onClick={() => setShowTermsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-main)', backgroundColor: 'var(--bg-main)' }}>
              <button onClick={() => setActiveTab('terms')} style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'terms' ? 'var(--bg-card)' : 'transparent', borderBottom: activeTab === 'terms' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'terms' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Terms of Service</button>
              <button onClick={() => setActiveTab('privacy')} style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'privacy' ? 'var(--bg-card)' : 'transparent', borderBottom: activeTab === 'privacy' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'privacy' ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Privacy Policy</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-main)' }}>
              {activeTab === 'terms' ? (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>AdPulseAI Terms & Conditions</h3>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Acceptance</h4>
                  <p>By creating an account or using AdPulseAI, you agree to these Terms and Conditions.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Membership Plans</h4>
                  <p>Access to premium tasks requires purchasing a membership plan. Plan fees are non-refundable once activated unless otherwise stated by applicable law.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Task Completion</h4>
                  <p>Earnings are credited only for valid, verified tasks completed according to the provided instructions. Incomplete, fraudulent, or manipulated submissions will not be rewarded.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Earnings</h4>
                  <p>Earnings depend on successful task completion and verification. Task availability may vary based on advertiser campaigns and platform operations.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Withdrawals</h4>
                  <p>Withdrawals are processed only after meeting the minimum withdrawal requirements and successful account verification. All withdrawal requests are subject to our standard processing times and fees.</p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>Privacy Policy</h3>
                  <p>At AdPulseAI, your privacy is important to us.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Information Collection</h4>
                  <p>We collect only the information necessary to create your account, verify tasks, process payments, and improve our services.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Data Security</h4>
                  <p>Your personal information is kept secure and is never sold to third parties. Information may be shared only with trusted payment providers or when required by law.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>User Responsibility</h4>
                  <p>Users are responsible for keeping their account credentials confidential.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Security Measures</h4>
                  <p>We use industry-standard security measures to protect your data, but no online system is completely secure.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Policy Updates</h4>
                  <p>We may update this Privacy Policy from time to time. Continued use of AdPulseAI means you accept any updates.</p>
                  
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '16px', marginBottom: '8px' }}>Consent</h4>
                  <p>By registering and using AdPulseAI, you consent to the collection and use of your information as described in this Privacy Policy.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-main)', display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowTermsModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-main)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
