import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/summary')
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B5FFF]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, kim!</h1>
        <p className="text-gray-600">Here's what you need to do to start earning.</p>
      </div>

      {/* Your Journey Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Journey</h2>
        
        <div className="space-y-6">
          {/* Step 1: Complete Training */}
          <div className="flex gap-6 pb-6 border-b border-gray-200">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#5B5FFF] text-white font-bold text-lg">
                1
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">Complete Training</h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-[#5B5FFF] text-xs font-semibold rounded-full">Next Step</span>
              </div>
              <p className="text-gray-600 mb-4">Learn how to label videos accurately. Takes about 15 minutes.</p>
              <button
                onClick={() => navigate('/training')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#5B5FFF] text-white font-semibold rounded-lg hover:bg-[#4A4FD9] transition-colors"
              >
                Start Training
                <span>→</span>
              </button>
            </div>
            <div className="flex-shrink-0 text-2xl">📚</div>
          </div>

          {/* Step 2: Set Up Payment */}
          <div className="flex gap-6 pb-6 border-b border-gray-200">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                2
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Set Up Payment</h3>
              <p className="text-gray-600">Learn how payments work and add your payment details.</p>
            </div>
            <div className="flex-shrink-0 text-2xl">💳</div>
          </div>

          {/* Step 3: Do Labeling Tasks */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                3
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Do Labeling Tasks</h3>
              <p className="text-gray-600">Browse and complete available labeling tasks to earn money.</p>
            </div>
            <div className="flex-shrink-0 text-2xl">✓</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Footage Labeled */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Footage Labeled</h3>
            <span className="text-2xl">📹</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {data?.footage_labeled_min ?? '--'}
          </p>
          <p className="text-sm text-gray-500">Total footage processed</p>
        </div>

        {/* Approved Roles */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Approved Roles</h3>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {data?.approved_roles ?? 'None yet'}
          </p>
          <p className="text-sm text-gray-500">Certifications earned</p>
        </div>
      </div>
    </div>
  )
}
