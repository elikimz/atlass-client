import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function OTPVerify({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = localStorage.getItem('access_token')
    if (token) {
      const isAdmin = localStorage.getItem('user_is_admin') === 'true'
      navigate(isAdmin ? '/admin' : '/dashboard')
      return
    }

    const storedEmail = localStorage.getItem('email')
    if (!storedEmail) navigate('/login')
    else setEmail(storedEmail)
  }, [navigate])

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/verify', { email, otp_code: otp.trim() })
      localStorage.setItem('access_token', response.data.access_token)
      const userRes = await api.get('/auth/me')
      const user = userRes.data
      localStorage.setItem('user_first_name', user.first_name || '')
      localStorage.setItem('user_last_name', user.last_name || '')
      localStorage.setItem('user_email', user.email)
      localStorage.setItem('user_role', user.role || 'user')
      localStorage.setItem('user_is_admin', (user.role === 'admin' || user.is_admin) ? 'true' : 'false')
      localStorage.setItem('user_is_trained', user.is_trained ? 'true' : 'false')
      setIsAuthenticated(true)
      if (user.role === 'admin' || user.is_admin) navigate('/admin')
      else if (user.is_trained) navigate('/dashboard')
      else navigate('/training')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '0 16px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/assets/logo.png" alt="AdPulseAI Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)', padding: '36px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: 'var(--accent-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)', textAlign: 'center', marginBottom: '8px' }}>Check your email</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4px' }}>We sent a 6-digit verification code to</p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', textAlign: 'center', marginBottom: '16px' }}>{email}</p>

        {/* Spam Folder Notification */}
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ fontSize: '12px', color: '#D97706', margin: 0, lineHeight: 1.4 }}>If you don't see the email, please check your <strong>spam folder</strong>.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '8px' }}>Verification Code</label>
          <input type="text" value={otp} onChange={handleOtpChange} placeholder="000000" maxLength={6} required style={{ width: '100%', padding: '12px 16px', fontSize: '24px', fontWeight: 700, letterSpacing: '0.4em', textAlign: 'center', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '10px', backgroundColor: 'var(--bg-main)', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', transition: 'border-color 0.15s' }} />
          {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{error}</div>}
          <button type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600, backgroundColor: (loading || otp.length !== 6) ? 'var(--border-main)' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}>{loading ? 'Verifying...' : 'Verify Code'}</button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>← Use a different email</button>
        </div>
      </div>
    </div>
  )
}
