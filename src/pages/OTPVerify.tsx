import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function OTPVerify({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/verify', {
        email,
        otp_code: otp,
      })
      localStorage.setItem('access_token', response.data.access_token)
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-[#5B5FFF] rounded flex items-center justify-center text-white font-bold text-sm">AC</div>
          <span className="text-xl font-bold text-[#0F1729]">Atlas Capture</span>
        </div>
      </div>

      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0F1729] mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm">We sent a 6-digit code to</p>
            <p className="text-[#0F1729] font-bold text-sm mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#0F1729] mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B5FFF]/20 focus:border-[#5B5FFF] outline-none transition text-center text-2xl tracking-[0.5em] font-bold text-[#0F1729]"
                required
              />
            </div>

            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#5B5FFF] hover:bg-[#4A4ED9] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[#5B5FFF] hover:text-[#4A4ED9] text-xs font-bold"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
