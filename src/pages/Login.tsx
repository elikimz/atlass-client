import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [isStudent, setIsStudent] = useState(false)
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-4 font-sans">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#5B5FFF] rounded flex items-center justify-center text-white font-bold text-sm">AC</div>
        <span className="text-xl font-bold text-[#0F1729]">Atlas Capture</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[540px] bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-8 lg:p-12">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="bg-blue-50 text-[#5B5FFF] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              ✨ Now Hiring Worldwide
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0F1729] leading-tight mb-4">
              Help Train the Next Generation of <br className="hidden sm:block" />
              <span className="text-[#5B5FFF]">Breakthrough AI</span>
            </h1>
            <p className="text-gray-500 text-sm max-w-[400px] mx-auto">
              Get paid to complete simple tasks from home. Join thousands of contributors helping build the future of AI.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-lg font-bold text-[#0F1729]">10,000+</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Contributors</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-lg font-bold text-[#0F1729]">$2M+</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Paid Out</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-lg font-bold text-[#0F1729]">100+</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cities</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <span className="text-blue-500 text-sm">💰</span>
              <span className="text-xs font-bold text-[#0F1729]">Competitive Pay</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <span className="text-blue-500 text-sm">🕒</span>
              <span className="text-xs font-bold text-[#0F1729]">Flexible Hours</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <span className="text-blue-500 text-sm">🌐</span>
              <span className="text-xs font-bold text-[#0F1729]">Work Anywhere</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <span className="text-blue-500 text-sm">🛡️</span>
              <span className="text-xs font-bold text-[#0F1729]">Weekly Payouts</span>
            </div>
          </div>

          {/* Onboarding Badges */}
          <div className="flex justify-center gap-6 mb-8">
            <span className="text-[10px] font-bold text-teal-500 flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span> No experience required
            </span>
            <span className="text-[10px] font-bold text-teal-500 flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span> Quick onboarding
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-[#0F1729] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFF]/20 focus:border-[#5B5FFF] outline-none transition text-sm shadow-sm"
                required
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="student"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#5B5FFF] focus:ring-[#5B5FFF]"
              />
              <label htmlFor="student" className="text-xs font-medium text-gray-600 cursor-pointer">
                I'm a Philippines college/university student
              </label>
            </div>

            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B5FFF] hover:bg-[#4A4ED9] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-sm shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Start Earning Today'} <span>→</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 px-4 leading-relaxed">
              By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="w-full max-w-[540px] mt-6 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center gap-1 mb-4">
          <span className="text-blue-500 text-xl">❝</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-[#0F1729] leading-relaxed mb-6">
          "What started as extra cash on weekends turned into my full time thing."
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">🇮🇳</div>
            <div>
              <p className="text-xs font-bold text-[#0F1729]">Rajesh S.</p>
              <p className="text-[10px] text-gray-500">Mumbai, India</p>
            </div>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <p className="text-[10px] font-bold text-[#0F1729]">Earned $30k+</p>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-8">
        <a href="#" className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
          Learn more about Atlas Capture <span>↗</span>
        </a>
      </div>
    </div>
  )
}
