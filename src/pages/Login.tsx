import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { clearSession, persistTokens, persistUser, type SessionUser, type TokenPair } from '../services/session'

const COUNTRIES = [
  { code: '+254', flag: '🇰🇪', name: 'Kenya' }, { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' }, { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' }, { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' }, { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+91', flag: '🇮🇳', name: 'India' }, { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
]

function getApiError(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') return data.detail
  return fallback
}

function getRegistrationError(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return 'We could not reach the account service. Check your connection. If you already submitted, try signing in before registering again.'
  }

  const response = (error as { response?: { data?: unknown; status?: number } }).response
  if (!response) {
    return 'We could not reach the account service. Check your connection. If you already submitted, try signing in before registering again.'
  }

  const status = response.status ?? 0
  const data = response.data
  const detail = typeof data === 'object' && data !== null && 'detail' in data ? data.detail : null

  if (typeof detail === 'string') {
    const message = detail.toLowerCase()
    if (message.includes('email') && /(already|registered|exists|in use|duplicate)/.test(message)) {
      return 'That email address is already registered. Sign in or use “Forgot password?” if you need to recover your account.'
    }
    if (/(phone|mobile)/.test(message) && /(already|registered|exists|in use|duplicate)/.test(message)) {
      return 'That mobile number is already registered. Sign in with your phone or email, or use a different number.'
    }
    if (message.includes('password') && /(72|utf-8|too long|too short|at least|minimum)/.test(message)) {
      return /(72|utf-8|too long)/.test(message)
        ? 'Password must be no more than 72 UTF-8 bytes.'
        : 'Password must contain at least 8 characters.'
    }
    if (status >= 500) {
      return 'Account creation is temporarily unavailable. If you already submitted, try signing in before registering again.'
    }
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail.map((issue): string | null => {
      if (typeof issue !== 'object' || issue === null) return null
      const validation = issue as { loc?: unknown; type?: unknown; msg?: unknown }
      const field = Array.isArray(validation.loc) && validation.loc.length > 0
        ? String(validation.loc[validation.loc.length - 1])
        : ''
      const type = typeof validation.type === 'string' ? validation.type : ''
      const rawMessage = typeof validation.msg === 'string' ? validation.msg.toLowerCase() : ''

      if (field === 'password') {
        if (type === 'string_too_short') return 'Password must contain at least 8 characters.'
        if (type === 'string_too_long' || /72|utf-8|too long/.test(rawMessage)) return 'Password must be no more than 72 UTF-8 bytes.'
        return 'Check your password. Use at least 8 characters and no more than 72 UTF-8 bytes.'
      }
      if (field === 'email') {
        if (type === 'string_too_long') return 'Email address must be 254 characters or fewer.'
        return 'Enter a valid email address.'
      }
      if (field === 'phone_number') return 'Enter a valid mobile number with its country calling code.'
      if (field === 'referral_code') return 'Check your referral code, or clear the field to continue without one.'
      return null
    }).filter((message): message is string => Boolean(message))

    if (messages.length > 0) return [...new Set(messages)].join(' ')
  }

  if (status === 409) return 'Some account details are already in use. Try signing in, or check your email address and mobile number.'
  if (status === 422) return 'Some details need attention. Check your mobile number, email address, and password.'
  if (status === 429) return 'There have been too many attempts. Wait a moment, then try again.'
  if (status >= 500) return 'Account creation is temporarily unavailable. If you already submitted, try signing in before registering again.'
  return 'We could not create your account. Check your details or try signing in if you may already have an account.'
}

function BrandMark() {
  return <img className="auth-brand-mark" src="/assets/kinetiq-mark.svg" alt="" />
}

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: () => Promise<void> }) {
  const navigate = useNavigate()
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const referralFromUrl = (search.get('ref') || localStorage.getItem('pending_referral_code') || '').trim()
  const [isRegistering, setIsRegistering] = useState(Boolean(referralFromUrl) || search.get('mode') === 'register')
  const [countryCode, setCountryCode] = useState('+254')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [referralCode, setReferralCode] = useState(referralFromUrl)
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [recoveryStage, setRecoveryStage] = useState<0 | 1 | 2>(0)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (referralFromUrl) localStorage.setItem('pending_referral_code', referralFromUrl)
  }, [referralFromUrl])

  const changeMode = (register: boolean) => {
    setIsRegistering(register)
    setRecoveryStage(0)
    setError('')
    setNotice('')
  }

  const finishSession = async (tokens: TokenPair) => {
    persistTokens(tokens)
    let profile: SessionUser
    try {
      profile = (await api.get<SessionUser>('/auth/me')).data
    } catch (cause) {
      clearSession()
      throw cause
    }
    persistUser(profile)
    await setIsAuthenticated()
    navigate(profile.role === 'admin' || profile.is_admin ? '/admin' : '/dashboard')
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const response = await api.post<TokenPair>('/auth/login', { username: identifier.trim(), password: loginPassword })
      await finishSession(response.data)
    } catch (cause) {
      setError(getApiError(cause, 'We could not sign you in. Check your details and try again.'))
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    const typedDigits = phone.replace(/\D/g, '')
    const nationalDigits = countryCode === '+1' ? typedDigits : typedDigits.replace(/^0/, '')
    const fullPhone = `${countryCode}${nationalDigits}`
    if (nationalDigits.length < 5 || nationalDigits.length + countryCode.replace(/\D/g, '').length > 15) {
      setError('Enter a valid mobile number, including the area code if needed.')
      return
    }
    if (registerPassword.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    if (new TextEncoder().encode(registerPassword).length > 72) {
      setError('Password must be 72 UTF-8 bytes or fewer.')
      return
    }
    setBusy(true)
    let registrationCompleted = false
    try {
      await api.post('/auth/register/final', {
        phone_number: fullPhone,
        email: email.trim(),
        password: registerPassword,
        referral_code: referralCode.trim() || undefined,
      })
      registrationCompleted = true
      const response = await api.post<TokenPair>('/auth/login', { username: fullPhone, password: registerPassword })
      localStorage.removeItem('pending_referral_code')
      await finishSession(response.data)
    } catch (cause) {
      setError(registrationCompleted
        ? 'Your account was created, but automatic sign-in did not finish. Sign in using your mobile number or email and password.'
        : getRegistrationError(cause))
    } finally {
      setBusy(false)
    }
  }

  const handleRecoveryRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post('/auth/password-reset/request', { email: recoveryEmail.trim() })
      setRecoveryStage(2)
      setNotice('A reset code is on its way to your inbox.')
    } catch (cause) {
      setError(getApiError(cause, 'We could not send the reset code. Try again in a moment.'))
    } finally {
      setBusy(false)
    }
  }

  const handleRecoveryConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(recoveryCode)) {
      setError('Enter the six-digit code from your email.')
      return
    }
    if (newPassword.length < 8 || new TextEncoder().encode(newPassword).length > 72) {
      setError('Choose a password between 8 characters and 72 UTF-8 bytes.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Those passwords do not match.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const response = await api.post('/auth/password-reset/confirm', {
        email: recoveryEmail.trim(), code: recoveryCode, new_password: newPassword,
      })
      setRecoveryStage(0)
      setIdentifier(recoveryEmail.trim())
      setLoginPassword('')
      setRecoveryCode('')
      setNewPassword('')
      setConfirmNewPassword('')
      setNotice(response.data.message || 'Password updated. Sign in with your new password.')
    } catch (cause) {
      setError(getApiError(cause, 'That code could not be verified. Request a fresh code and try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-scene">
      <section className="auth-showcase" aria-label="About Kinetiq">
        <Link className="auth-showcase-brand" to="/" aria-label="Kinetiq sign in"><BrandMark /><span>Kinetiq</span></Link>
        <div className="auth-showcase-copy">
          <span className="auth-kicker"><span className="auth-kicker-dot" /> A workspace built around your momentum</span>
          <h1>Make room<br />for your next<br /><em>big move.</em></h1>
          <p>Learn a skill. Take on meaningful tasks. See your progress add up—all from one focused workspace.</p>
          <div className="auth-journey-steps" aria-label="How Kinetiq works">
            <div className="auth-journey-step"><span>01</span><strong>Learn a skill</strong><small>Practice with a clear path.</small></div>
            <div className="auth-journey-step"><span>02</span><strong>Choose real work</strong><small>Browse tasks when ready.</small></div>
            <div className="auth-journey-step"><span>03</span><strong>Track your progress</strong><small>Keep activity and earnings visible.</small></div>
          </div>
        </div>
        <div className="auth-showcase-foot"><span>Learn by doing.</span><span>Move at your pace.</span><span>Keep the momentum.</span></div>
      </section>

      <section className="auth-workspace">
        <Link className="auth-mobile-brand" to="/" aria-label="Kinetiq sign in"><BrandMark /><span>Kinetiq</span></Link>
        <div className="auth-form-card">
          <div className="auth-mode-switch" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={!isRegistering && recoveryStage === 0} className={!isRegistering && recoveryStage === 0 ? 'is-active' : ''} onClick={() => changeMode(false)}>Sign in</button>
            <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? 'is-active' : ''} onClick={() => changeMode(true)}>Create account</button>
          </div>

          {recoveryStage > 0 ? (
            <>
              <div className="auth-form-heading"><span className="auth-eyebrow">ACCOUNT RECOVERY</span><h2>{recoveryStage === 1 ? 'Let’s get you back in.' : 'Set a new password.'}</h2><p>{recoveryStage === 1 ? 'We’ll email you a one-time reset code.' : `Enter the six-digit code sent to ${recoveryEmail}.`}</p></div>
              {recoveryStage === 1 ? (
                <form className="auth-form" onSubmit={handleRecoveryRequest}>
                  <label className="auth-field"><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} required /></label>
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Sending code…' : 'Send reset code'} <span>→</span></button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRecoveryConfirm}>
                  <label className="auth-field"><span>Six-digit code</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, ''))} required /></label>
                  <label className="auth-field"><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
                  <label className="auth-field"><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={8} value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} required /></label>
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'} <span>→</span></button>
                </form>
              )}
              <button className="auth-text-button" type="button" onClick={() => { setRecoveryStage(0); setError(''); setNotice('') }}>← Back to sign in</button>
            </>
          ) : isRegistering ? (
            <>
              <div className="auth-form-heading"><span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Create your account.</h2><p>Just the essentials. You can finish your profile later.</p></div>
              <form className="auth-form" onSubmit={handleRegister}>
                <label className="auth-field"><span>Mobile number</span><div className="auth-phone-control"><select aria-label="Country calling code" value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>{COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.code} · {country.name}</option>)}</select><input type="tel" inputMode="tel" autoComplete="tel-national" placeholder="712 345 678" value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^\d\s()-]/g, ''))} required /></div><small>We use this number for secure account access.</small></label>
                <label className="auth-field"><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                <label className="auth-field"><span>Password</span><div className="auth-password-control"><input type={showRegisterPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} placeholder="At least 8 characters" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} required /><button type="button" aria-label={showRegisterPassword ? 'Hide password' : 'Show password'} onClick={() => setShowRegisterPassword((value) => !value)}>{showRegisterPassword ? 'Hide' : 'Show'}</button></div></label>
                <label className="auth-field"><span>Referral code <small>Optional</small></span><input autoComplete="off" placeholder="Add a code if you have one" value={referralCode} onChange={(event) => setReferralCode(event.target.value)} /></label>
                <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Creating your space…' : 'Create my account'} <span>→</span></button>
              </form>
              <p className="auth-legal">By continuing, you agree to use your account responsibly and keep your sign-in details private.</p>
            </>
          ) : (
            <>
              <div className="auth-form-heading"><span className="auth-eyebrow">WELCOME BACK</span><h2>Pick up where<br />you left off.</h2><p>Sign in with the email or mobile number on your account.</p></div>
              <form className="auth-form" onSubmit={handleLogin}>
                <label className="auth-field"><span>Email or mobile number</span><input type="text" autoComplete="username" placeholder="Email or +254 712 345 678" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required /></label>
                <label className="auth-field"><span>Password</span><div className="auth-password-control"><input type={showLoginPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required /><button type="button" aria-label={showLoginPassword ? 'Hide password' : 'Show password'} onClick={() => setShowLoginPassword((value) => !value)}>{showLoginPassword ? 'Hide' : 'Show'}</button></div></label>
                <div className="auth-inline-actions"><span>Secure sign-in</span><button className="auth-text-button" type="button" onClick={() => { setRecoveryEmail(identifier.includes('@') ? identifier : ''); setRecoveryStage(1); setError(''); setNotice('') }}>Forgot password?</button></div>
                <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Signing you in…' : 'Sign in'} <span>→</span></button>
              </form>
              <p className="auth-legal">New here? <button className="auth-inline-link" type="button" onClick={() => changeMode(true)}>Create a free account</button></p>
            </>
          )}

          {error && <div className="auth-feedback auth-feedback--error" role="alert">{error}</div>}
          {notice && <div className="auth-feedback auth-feedback--success" role="status">{notice}</div>}
        </div>
      </section>
    </main>
  )
}
