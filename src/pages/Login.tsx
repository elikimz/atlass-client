import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [step, setStep] = useState(1)
  
  // Form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [captcha, setCaptcha] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      const isAdmin = localStorage.getItem('user_is_admin') === 'true'
      navigate(isAdmin ? '/admin' : '/dashboard')
      return
    }

    const params = new URLSearchParams(location.search)
    const ref = params.get('ref')
    const mode = params.get('mode')
    
    if (ref || mode === 'register') {
      if (ref) setReferralCode(ref)
      setIsRegistering(true)
    }
  }, [location, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || !acceptedTerms) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('username', username)
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register/step1', { username, password })
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterFinal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || !acceptedTerms) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register/final', {
        username,
        password,
        phone_number: phoneNumber,
        referral_code: referralCode,
        first_name: firstName,
        last_name: lastName
      })
      setStep(3)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid #334155', borderRadius: '12px', outline: 'none', backgroundColor: '#1E293B', color: '#F8FAFC', boxSizing: 'border-box', marginBottom: '16px'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px'
  }

  const cardStyle: React.CSSProperties = {
    width: '100%', maxWidth: '460px', backgroundColor: '#0F172A', borderRadius: '24px', padding: '48px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid #1E293B'
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600, backgroundColor: '#5932EA', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px'
  }

  const stepIndicatorStyle = (active: boolean) => ({
    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: active ? '#FDBA74' : '#334155', color: active ? '#0F172A' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px 16px' }}>
      {/* Logo Section */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/assets/logo.png" alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
        <span style={{ fontSize: '26px', fontWeight: 700, color: 'white' }}>AdPulseAI</span>
      </div>

      <div style={cardStyle}>
        {isRegistering ? (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '12px' }}>Create Account</h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', textAlign: 'center', marginBottom: '36px' }}>Join the community and start earning from simple tasks.</p>
            
            {/* Step Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={stepIndicatorStyle(step >= 1)}>1</div>
              <div style={{ width: '40px', height: '1px', borderTop: '1px dashed #334155' }}></div>
              <div style={stepIndicatorStyle(step >= 2)}>2</div>
              <div style={{ width: '40px', height: '1px', borderTop: '1px dashed #334155' }}></div>
              <div style={stepIndicatorStyle(step >= 3)}>3</div>
            </div>

            {step === 1 && (
              <form onSubmit={handleRegisterStep1}>
                <label style={labelStyle}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="6-16 letters or numbers" required style={inputStyle} />
                
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6-16 alphanumeric password" required style={inputStyle} />
                
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Please enter the password again" required style={inputStyle} />
                
                {error && <p style={{ color: '#FB7185', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                
                <button type="submit" style={buttonStyle} disabled={loading}>
                  {loading ? 'Processing...' : 'Next Step'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleRegisterFinal}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" style={inputStyle} />
                  </div>
                </div>

                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter mobile phone number" required style={inputStyle} />

                <label style={labelStyle}>Referral Code (Optional)</label>
                <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter code" style={inputStyle} />

                <label style={labelStyle}>Verification Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" value={captcha} onChange={(e) => setCaptcha(e.target.value)} placeholder="Verification Code" style={{ ...inputStyle, flex: 1 }} />
                  <div style={{ width: '100px', height: '46px', backgroundColor: '#334155', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5932EA', fontWeight: 'bold', fontSize: '20px', letterSpacing: '2px', fontStyle: 'italic' }}>3784</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: acceptedTerms ? '#5932EA' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {acceptedTerms && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>I agree to the <span style={{ color: '#8B5CF6' }}>Terms of Service</span> and <span style={{ color: '#8B5CF6' }}>Privacy Policy</span></span>
                </div>

                {error && <p style={{ color: '#FB7185', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                
                <button type="submit" style={buttonStyle} disabled={loading || !acceptedTerms}>
                  {loading ? 'Registering...' : 'Create Account'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '16px' }}>Congratulations!</h2>
                <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
                  Congratulations and welcome to AdpulseAI! Your registration is complete. Now you’re ready to explore opportunities, complete tasks, and start growing with us.
                </p>
                <button onClick={() => { setIsRegistering(false); setStep(1); }} style={buttonStyle}>
                  Go to Login
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '12px' }}>Welcome Back</h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', textAlign: 'center', marginBottom: '36px' }}>Sign in with your username to access your dashboard.</p>
            
            <form onSubmit={handleLogin}>
              <label style={labelStyle}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required style={inputStyle} />
              
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required style={inputStyle} />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: acceptedTerms ? '#5932EA' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {acceptedTerms && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>I agree to the <span style={{ color: '#8B5CF6' }}>Terms of Service</span> and <span style={{ color: '#8B5CF6' }}>Privacy Policy</span></span>
              </div>

              {error && <p style={{ color: '#FB7185', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
              
              <button type="submit" style={buttonStyle} disabled={loading || !acceptedTerms}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <p style={{ fontSize: '14px', color: '#94A3B8' }}>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setStep(1); setError(''); }} 
            style={{ color: '#8B5CF6', fontWeight: 600, marginLeft: '8px', cursor: 'pointer' }}
          >
            {isRegistering ? 'Sign In' : 'Create Account'}
          </span>
        </p>
      </div>
    </div>
  )
}
