import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

// Country codes list
const COUNTRY_CODES = [
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
]

// Generate a random captcha string
function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a random user ID (6-digit number)
function generateUserId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 fields
  const [userId] = useState(generateUserId)
  const [countryCode, setCountryCode] = useState('+254')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // Login fields
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  // const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      if (ref) setInviteCode(ref)
      setIsRegistering(true)
    }
  }, [location, navigate])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginUsername || !loginPassword) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username: loginUsername, password: loginPassword })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('username', loginUsername)
      setIsAuthenticated(true)
      // Fetch user info to check admin
      try {
        const meRes = await api.get('/auth/me')
        if (meRes.data.role === 'admin' || meRes.data.is_admin) {
          localStorage.setItem('user_is_admin', 'true')
          navigate('/admin')
        } else {
          localStorage.setItem('user_is_admin', 'false')
          navigate('/dashboard')
        }
      } catch {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1 → Step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!lastName.trim()) { setError('Last name is required'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address'); return
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password.length > 72) { setError('Password must be no longer than 72 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setStep(2)
  }

  // Step 2 → Register
  const handleRegisterFinal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phoneNumber.trim()) { setError('Phone number is required'); return }
    if (captchaInput.toLowerCase() !== captchaValue.toLowerCase()) {
      setError('Verification code is incorrect')
      setCaptchaValue(generateCaptcha())
      setCaptchaInput('')
      return
    }
    setLoading(true)
    try {
      // username is auto-generated from userId
      const username = `user${userId}`
      await api.post('/auth/register/final', {
        username,
        password,
        phone_number: `${countryCode}${phoneNumber}`,
        referral_code: inviteCode.trim() || undefined,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      })
      setStep(3) // Success screen
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
      setCaptchaValue(generateCaptcha())
      setCaptchaInput('')
    } finally {
      setLoading(false)
    }
  }

  const resetRegistration = () => {
    setStep(1)
    setFirstName('')
    setLastName('')
    setEmail('')
    setInviteCode('')
    setPassword('')
    setConfirmPassword('')
    setPhoneNumber('')
    setCaptchaInput('')
    setCaptchaValue(generateCaptcha())
    setError('')
    // setAcceptedTerms(false)
  }

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  // ─── Styles ───────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a6fa8 0%, #2a9fd6 30%, #1a6fa8 60%, #0d3a5c 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: 'Inter, -apple-system, sans-serif',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  }

  const starsStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `
      radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 50% 25%, rgba(255,255,255,0.9) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,0.8) 0%, transparent 100%),
      radial-gradient(1px 1px at 20% 40%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(2px 2px at 80% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 50%, rgba(255,255,255,0.5) 0%, transparent 100%)
    `,
    pointerEvents: 'none',
    zIndex: 0,
  }

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 1,
  }

  const backBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
    padding: '4px 0',
  }

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
  }

  const logoBoxStyle: React.CSSProperties = {
    width: 'min(90px, 20vw)',
    height: 'min(90px, 20vw)',
    backgroundColor: 'white',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  }

  const langSelectorStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '0 20px',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 1,
  }

  const langBtnStyle: React.CSSProperties = {
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#1a1a1a',
  }

  const cardStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '440px',
    backgroundColor: 'rgba(20, 20, 30, 0.92)',
    borderRadius: '20px',
    padding: 'min(28px, 6vw) min(24px, 5vw) min(32px, 8vw)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
    margin: '0 auto 32px',
    boxSizing: 'border-box',
  }

  const stepRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '28px',
    gap: '0',
  }

  const stepCircle = (active: boolean, completed: boolean) => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: active || completed ? '#F5A623' : '#555',
    color: active || completed ? 'white' : '#aaa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '15px',
    flexShrink: 0,
    zIndex: 1,
  } as React.CSSProperties)

  const stepLine = (active: boolean) => ({
    flex: 1,
    height: '2px',
    backgroundColor: active ? '#F5A623' : '#555',
    margin: '0 4px',
  } as React.CSSProperties)

  const inputWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2a2a3a',
    borderRadius: '10px',
    marginBottom: '12px',
    padding: '0 12px',
    height: '48px',
    border: '1px solid #3a3a4a',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ccc',
    fontSize: '14px',
    padding: '0 8px',
    height: '100%',
  }

  const iconStyle: React.CSSProperties = {
    color: '#888',
    fontSize: '18px',
    flexShrink: 0,
  }

  const registerBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    backgroundColor: '#F5A623',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.5px',
  }

  const loginBtnStyle: React.CSSProperties = {
    ...registerBtnStyle,
    backgroundColor: '#F5A623',
  }

  return (
    <div style={pageStyle}>
      {/* Starfield overlay */}
      <div style={starsStyle} />

      {/* Header */}
      <div style={headerStyle}>
        <button
          style={backBtnStyle}
          onClick={() => {
            if (isRegistering) {
              if (step === 2) { setStep(1); setError('') }
              else { setIsRegistering(false); resetRegistration() }
            }
          }}
        >
          <span style={{ fontSize: '20px' }}>‹</span>
          <span>{isRegistering ? (step === 2 ? 'Back' : 'Login') : 'Login'}</span>
        </button>
      </div>

      {/* Logo */}
      <div style={logoContainerStyle}>
        <div style={logoBoxStyle}>
          <img src="/assets/logo.png" alt="AdPulseAI" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Language selector */}
      <div style={langSelectorStyle}>
        <button style={langBtnStyle}>
          <span>🇺🇸</span>
          <span>US</span>
          <span style={{ fontSize: '10px', color: '#666' }}>▼</span>
        </button>
      </div>

      {/* Card */}
      <div style={cardStyle}>
        {isRegistering ? (
          <>
            {/* Step indicators */}
            {step < 3 && (
              <div style={stepRowStyle}>
                <div style={stepCircle(step === 1, step > 1)}>1</div>
                <div style={stepLine(step > 1)} />
                <div style={stepCircle(step === 2, step > 2)}>2</div>
                <div style={stepLine(step > 2)} />
                <div style={stepCircle(step === 3, false)}>3</div>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form onSubmit={handleStep1Next}>
                {/* First Name */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>👤</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First Name"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Last Name */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>👤</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last Name"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Email */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Invite Code */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>🎟️</span>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    placeholder="Invite Code (Optional)"
                    style={inputStyle}
                  />
                </div>

                {/* Password */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value.slice(0, 72))}
                    placeholder="Please enter a 6-16 alphanumeric password"
                    style={inputStyle}
                    required
                    maxLength={72}
                  />
                </div>

                {/* Confirm Password */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value.slice(0, 72))}
                    placeholder="Please enter the password again"
                    style={inputStyle}
                    required
                    maxLength={72}
                  />
                </div>

                {error && (
                  <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <button type="submit" style={registerBtnStyle}>
                  Next
                </button>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#888' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { setIsRegistering(false); resetRegistration() }}
                    style={{ color: '#F5A623', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Sign In
                  </span>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms" style={{ fontSize: '12px', color: '#888' }}>
                    I agree to the <span style={{ color: '#F5A623' }}>Terms and Conditions</span>
                  </label>
                </div>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleRegisterFinal}>
                {/* User ID (read-only) */}
                <div style={{ ...inputWrapStyle, backgroundColor: '#222230' }}>
                  <span style={iconStyle}>👤</span>
                  <input
                    type="text"
                    value={userId}
                    readOnly
                    style={{ ...inputStyle, color: '#aaa', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Country Code + Phone Number */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  {/* Country code selector */}
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        style={{
                          height: '48px',
                          backgroundColor: '#2a2a3a',
                          border: '1px solid #3a3a4a',
                          borderRadius: '10px',
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          color: '#ccc',
                          fontSize: '13px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>▼</span>
                    </button>
                    {showCountryDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '56px',
                        left: 0,
                        backgroundColor: '#1e1e2e',
                        border: '1px solid #3a3a4a',
                        borderRadius: '10px',
                        zIndex: 100,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        minWidth: '180px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}>
                        {COUNTRY_CODES.map(c => (
                          <div
                            key={c.code}
                            onClick={() => { setCountryCode(c.code); setShowCountryDropdown(false) }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '14px',
                              color: '#ccc',
                              backgroundColor: countryCode === c.code ? '#2a2a3a' : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2a2a3a')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = countryCode === c.code ? '#2a2a3a' : 'transparent')}
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span style={{ marginLeft: 'auto', color: '#888' }}>{c.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone input */}
                  <div style={{ ...inputWrapStyle, flex: 1, marginBottom: 0 }}>
                    <span style={iconStyle}>📱</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="Please enter a mobile phone"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Captcha row */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ ...inputWrapStyle, flex: 1, marginBottom: 0 }}>
                    <span style={iconStyle}>🔐</span>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      placeholder="Verification Code"
                      style={inputStyle}
                      required
                      maxLength={4}
                    />
                  </div>
                  {/* Captcha display */}
                  <div
                    onClick={() => { setCaptchaValue(generateCaptcha()); setCaptchaInput('') }}
                    title="Click to refresh"
                    style={{
                      width: '100px',
                      height: '48px',
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <svg width="100" height="48" style={{ position: 'absolute' }}>
                      {/* Noise lines */}
                      <line x1="0" y1="15" x2="110" y2="38" stroke="#ccc" strokeWidth="1" />
                      <line x1="0" y1="35" x2="110" y2="18" stroke="#ddd" strokeWidth="1" />
                      <line x1="20" y1="0" x2="90" y2="52" stroke="#eee" strokeWidth="1" />
                    </svg>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      letterSpacing: '4px',
                      color: '#1a1a8a',
                      position: 'relative',
                      zIndex: 1,
                      userSelect: 'none',
                      textShadow: '1px 1px 0 #8888ff',
                    }}>
                      {captchaValue}
                    </span>
                  </div>
                </div>

                {error && (
                  <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <button type="submit" style={registerBtnStyle} disabled={loading}>
                  {loading ? 'Registering...' : 'Registration'}
                </button>
              </form>
            )}

            {/* ── STEP 3: SUCCESS ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {/* All 3 steps shown as completed */}
                <div style={stepRowStyle}>
                  <div style={stepCircle(false, true)}>1</div>
                  <div style={stepLine(true)} />
                  <div style={stepCircle(false, true)}>2</div>
                  <div style={stepLine(true)} />
                  <div style={stepCircle(false, true)}>3</div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    width: '70px', height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F5A623, #f7c56a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
                    Congratulations!
                  </h2>
                  <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.7, padding: '0 8px' }}>
                    Congratulations and welcome to AdpulseAI! Your registration is complete. Now you're ready to explore opportunities, complete tasks, and start growing with us.
                  </p>
                </div>

                <button
                  onClick={() => { setIsRegistering(false); resetRegistration() }}
                  style={registerBtnStyle}
                >
                  MainPage
                </button>
              </div>
            )}
          </>
        ) : (
          /* ── LOGIN FORM ── */
          <>
            {/* Step indicators for login (decorative) */}
            <div style={stepRowStyle}>
              <div style={stepCircle(true, false)}>1</div>
              <div style={stepLine(false)} />
              <div style={stepCircle(false, false)}>2</div>
              <div style={stepLine(false)} />
              <div style={stepCircle(false, false)}>3</div>
            </div>

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={inputWrapStyle}>
                <span style={iconStyle}>👤</span>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Please enter your username"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Password */}
              <div style={inputWrapStyle}>
                <span style={iconStyle}>🔒</span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Please enter your password"
                  style={inputStyle}
                  required
                />
              </div>

              {error && (
                <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              <button type="submit" style={loginBtnStyle} disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
              Don't have an account?{' '}
              <span
                onClick={() => { setIsRegistering(true); setError('') }}
                style={{ color: '#F5A623', cursor: 'pointer', fontWeight: 600 }}
              >
                Register Now
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
