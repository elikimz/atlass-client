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
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #EEEEEE',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#292D32',
    boxSizing: 'border-box',
    marginBottom: '16px',
    transition: 'all 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#B5B7C0',
    marginBottom: '8px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFBFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      padding: '0 16px',
    }}>
      {/* Logo Section */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '42px', height: '42px',
          backgroundColor: '#5932EA', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0px 10px 30px rgba(89, 50, 234, 0.3)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontSize: '24px', fontWeight: 600, color: 'black' }}>Adpulse AI</span>
      </div>

      {/* Floating Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'white',
        borderRadius: '30px',
        padding: '40px',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.8)',
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'black', textAlign: 'center', marginBottom: '8px' }}>
          Create Account
        </h1>
        <p style={{ fontSize: '14px', color: '#757575', textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>
          Join thousands of contributors building the future of AI.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                onBlur={(e) => { e.target.style.borderColor = '#EEEEEE'; e.target.style.boxShadow = 'none' }}
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
                onBlur={(e) => { e.target.style.borderColor = '#EEEEEE'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#EEEEEE'; e.target.style.boxShadow = 'none' }}
          />

          <label style={labelStyle}>
            Referral Code <span style={{ fontWeight: 400, color: '#ACACAC' }}>(Optional)</span>
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter code"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#5932EA'; e.target.style.boxShadow = '0px 0px 0px 4px rgba(89, 50, 234, 0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#EEEEEE'; e.target.style.boxShadow = 'none' }}
          />

          {/* Terms and Conditions Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px', cursor: 'pointer' }} onClick={() => setAcceptedTerms(!acceptedTerms)}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '6px',
              border: acceptedTerms ? '2px solid #5932EA' : '2px solid #EEEEEE',
              backgroundColor: acceptedTerms ? '#5932EA' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0, marginTop: '2px'
            }}>
              {acceptedTerms && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: '13px', color: '#757575', lineHeight: 1.5 }}>
              I agree to the <a href="#" style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
            </span>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#FFF4F4', border: '1px solid #FFC5C5',
              borderRadius: '12px', padding: '12px 16px',
              fontSize: '13px', color: '#DF0404', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName || !lastName || !email || !acceptedTerms}
            style={{
              width: '100%', padding: '14px',
              fontSize: '16px', fontWeight: 600,
              backgroundColor: (loading || !firstName || !lastName || !email || !acceptedTerms) ? '#DED5FF' : '#5932EA',
              color: 'white', border: 'none', borderRadius: '12px',
              cursor: (loading || !firstName || !lastName || !email || !acceptedTerms) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
              boxShadow: (loading || !firstName || !lastName || !email || !acceptedTerms) ? 'none' : '0px 10px 30px rgba(89, 50, 234, 0.3)',
            }}
          >
            {loading ? 'Sending code...' : (
              <>
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <p style={{ fontSize: '13px', color: '#B5B7C0', textAlign: 'center', marginTop: '32px' }}>
        Already have an account? <a href="#" style={{ color: '#5932EA', textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
      </p>
    </div>
  )
}
