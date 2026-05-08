import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/login', { email })
      localStorage.setItem('email', email)
      navigate('/verify')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
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
            <h1 className="text-2xl font-bold text-[#0F1729] mb-2">Welcome back</h1>
            <p className="text-gray-500 text-sm">Enter your email to sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#0F1729] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B5FFF]/20 focus:border-[#5B5FFF] outline-none transition text-sm"
                required
              />
            </div>

            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B5FFF] hover:bg-[#4A4ED9] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? 'Sending...' : 'Sign In with Email'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 px-4 leading-relaxed">
              By clicking continue, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
