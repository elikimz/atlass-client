import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { persistTokens, persistUser } from '../services/session'

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

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback
  }

  const response = (error as { response?: { data?: unknown } }).response
  const data = response?.data
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = (data as { detail?: unknown }).detail
    if (typeof detail === 'string') {
      return detail
    }
  }
  return fallback
}

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: () => Promise<void> }) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const referralFromUrl = searchParams.get('ref') || ''
  const registerFromUrl = referralFromUrl.length > 0 || searchParams.get('mode') === 'register'

  const [isRegistering, setIsRegistering] = useState(registerFromUrl)
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [inviteCode, setInviteCode] = useState(referralFromUrl)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2 fields
  const [countryCode, setCountryCode] = useState('+254')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // Login fields
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  // const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dropdownRef = useRef<HTMLDivElement>(null)

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
    const trimmedUsername = loginUsername.trim()
    if (!trimmedUsername || !loginPassword) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username: trimmedUsername, password: loginPassword })
      persistTokens(res.data)
      const meRes = await api.get('/auth/me')
      persistUser(meRes.data)
      await setIsAuthenticated()
      if (meRes.data.role === 'admin' || meRes.data.is_admin) {
        navigate('/admin')
      } else {
        navigate(meRes.data.is_trained ? '/dashboard' : '/training')
      }
    } catch (error: unknown) {
      setError(apiErrorMessage(error, 'Login failed. Please check your credentials.'))
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
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(username)) {
      setError('Username must be 3–64 characters and use only letters, numbers, hyphens, or underscores'); return
    }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
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
      await api.post('/auth/register/final', {
        username,
        password,
        phone_number: `${countryCode}${phoneNumber}`,
        referral_code: inviteCode.trim() || undefined,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      })
      const loginResponse = await api.post('/auth/login', { username, password })
      persistTokens(loginResponse.data)
      const userResponse = await api.get('/auth/me')
      persistUser(userResponse.data)
      await setIsAuthenticated()
      navigate(userResponse.data.role === 'admin' || userResponse.data.is_admin ? '/admin' : '/training')
    } catch (error: unknown) {
      setError(apiErrorMessage(error, 'Registration failed. Please try again.'))
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
    setUsername('')
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
    background: 'var(--color-canvas)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: 'inherit',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  }

  const starsStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'none',
    pointerEvents: 'none',
    zIndex: 0,
  }

  const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 1,
  }

  const backBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-primary)',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: '4px',
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
    backgroundColor: 'var(--color-surface)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--color-border-subtle)',
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
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
  }

  const cardStyle: React.CSSProperties = {
    width: 'min(90%, 480px)',
    maxWidth: '480px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '4px',
    padding: '32px',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--color-border-subtle)',
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
    backgroundColor: active || completed ? 'var(--color-primary)' : 'var(--color-border)',
    color: active || completed ? 'white' : 'var(--color-text-muted)',
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
    backgroundColor: active ? 'var(--color-primary)' : 'var(--color-border)',
    margin: '0 4px',
  } as React.CSSProperties)

  const inputWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '4px',
    marginBottom: '12px',
    padding: '0 12px',
    height: '48px',
    border: '1px solid var(--color-border)',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '14px',
    padding: '0 8px',
    height: '100%',
  }

  const iconStyle: React.CSSProperties = {
    color: 'var(--color-text-muted)',
    fontSize: '18px',
    flexShrink: 0,
  }

  const registerBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0',
  }

  const loginBtnStyle: React.CSSProperties = {
    ...registerBtnStyle,
    backgroundColor: 'var(--color-primary)',
  }

  return (
    <div style={pageStyle}>
      {/* Neutral background layer */}
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
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>▼</span>
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

                {/* Username */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    style={inputStyle}
                    minLength={3}
                    maxLength={64}
                    autoComplete="username"
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value.slice(0, 72))}
                    placeholder="Create a password (8–72 characters)"
                    style={inputStyle}
                    autoComplete="new-password"
                    required
                    maxLength={72}
                  />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ ...iconStyle, background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>

                {/* Confirm Password */}
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value.slice(0, 72))}
                    placeholder="Please enter the password again"
                    style={inputStyle}
                    autoComplete="new-password"
                    required
                    maxLength={72}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} style={{ ...iconStyle, background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>{showConfirmPassword ? '🙈' : '👁️'}</button>
                </div>

                {error && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <button type="submit" style={registerBtnStyle}>
                  Next
                </button>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { setIsRegistering(false); resetRegistration() }}
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Sign In
                  </span>
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    I agree to the <span style={{ color: 'var(--color-primary)' }}>Terms and Conditions</span>
                  </label>
                </div>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form onSubmit={handleRegisterFinal}>
                {/* Chosen username (read-only confirmation) */}
                <div style={{ ...inputWrapStyle, backgroundColor: 'var(--color-surface-inset)' }}>
                  <span style={iconStyle}>@</span>
                  <input
                    type="text"
                    value={username}
                    readOnly
                    aria-label="Chosen username"
                    style={{ ...inputStyle, color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
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
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '10px',
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          fontSize: '13px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>▼</span>
                    </button>
                    {showCountryDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '56px',
                        left: 0,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
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
                              color: 'var(--color-text-secondary)',
                              backgroundColor: countryCode === c.code ? 'var(--color-primary-soft)' : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary-soft)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = countryCode === c.code ? 'var(--color-surface)' : 'transparent')}
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>{c.code}</span>
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
                      <line x1="0" y1="15" x2="110" y2="38" stroke="var(--color-text-secondary)" strokeWidth="1" />
                      <line x1="0" y1="35" x2="110" y2="18" stroke="var(--color-border-subtle)" strokeWidth="1" />
                      <line x1="20" y1="0" x2="90" y2="52" stroke="var(--color-border-subtle)" strokeWidth="1" />
                    </svg>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 900,
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      letterSpacing: '4px',
                      color: 'var(--color-primary)',
                      position: 'relative',
                      zIndex: 1,
                      userSelect: 'none',
                      textShadow: 'none',
                    }}>
                      {captchaValue}
                    </span>
                  </div>
                </div>

                {error && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError('') }}
                    style={{ ...registerBtnStyle, backgroundColor: '#555', flex: 1 }}
                  >
                    Back
                  </button>
                  <button type="submit" style={{ ...registerBtnStyle, flex: 2 }} disabled={loading}>
                    {loading ? 'Registering...' : 'Registration'}
                  </button>
                </div>
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
                    background: 'var(--color-primary)',
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
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7, padding: '0 8px' }}>
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
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Please enter your password"
                  style={inputStyle}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowLoginPassword(value => !value)} aria-label={showLoginPassword ? 'Hide password' : 'Show password'} style={{ ...iconStyle, background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>{showLoginPassword ? '🙈' : '👁️'}</button>
              </div>

              {error && (
                <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              <button type="submit" style={loginBtnStyle} disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <span
                onClick={() => { setIsRegistering(true); setError('') }}
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
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
