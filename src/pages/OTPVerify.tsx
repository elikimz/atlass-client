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
      
      // Fetch user data to check for admin status
      const userRes = await api.get('/auth/me')
      const user = userRes.data
      
      localStorage.setItem('user_first_name', user.first_name)
      localStorage.setItem('user_last_name', user.last_name)
      localStorage.setItem('user_email', user.email)
      localStorage.setItem('user_is_admin', user.is_admin ? 'true' : 'false')
      
      setIsAuthenticated(true)
      
      if (user.is_admin) {
        navigate('/admin')
      } else {
        // Check if user has completed training
        try {
          const certsRes = await api.get('/training/certifications')
          const certs = certsRes.data
          const allCompleted = certs.length > 0 && certs.every((c: any) => c.status === 'completed')
          
          if (allCompleted) {
            navigate('/dashboard')
          } else {
            navigate('/training')
          }
        } catch (err) {
          console.error('Failed to check certifications:', err)
          navigate('/training')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f0f4ff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: '0 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/assets/logo.png" alt="AdPulseAI Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>AdPulseAI</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: 'white', borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: '36px 32px',
      }}>
        {/* Email icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: '#f0f4ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '8px' }}>
          Check your email
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '4px' }}>
          We sent a 6-digit verification code to
        </p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'center', marginBottom: '28px' }}>
          {email}
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength={6}
            required
            style={{
              width: '100%', padding: '12px 16px',
              fontSize: '24px', fontWeight: 700, letterSpacing: '0.4em',
              textAlign: 'center', color: '#111827',
              border: '1px solid #d1d5db', borderRadius: '10px',
              backgroundColor: '#f9fafb', outline: 'none',
              boxSizing: 'border-box', marginBottom: '16px',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.backgroundColor = 'white' }}
            onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#f9fafb' }}
          />

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%', padding: '11px', fontSize: '14px', fontWeight: 600,
              backgroundColor: (loading || otp.length !== 6) ? '#a5b4fc' : '#6366f1',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#6366f1' }}
          >
            ← Use a different email
          </button>
        </div>
      </div>
    </div>
  )
}
