import { useEffect, useState } from 'react'
import api from '../services/api'

interface DashboardData {
  footage_labeled_min: number
  approved_roles: string
  certifications_earned: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

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
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-text-primary mb-1">Welcome, kim!</h2>
        <p className="text-gray-500 text-sm">Here's what you need to do to start earning.</p>
      </div>

      {/* Your Journey Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-10">
        <h3 className="text-lg font-bold text-text-primary mb-8">Your Journey</h3>
        
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex items-start gap-6 relative">
            <div className="absolute left-5 top-10 bottom-[-48px] w-[1px] bg-gray-100"></div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold text-sm z-10">1</div>
            <div className="flex-1 bg-blue-50/30 border border-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-text-primary">Complete Training</h4>
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Next Step</span>
                </div>
                <span className="text-gray-400">📖</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Learn how to label videos accurately. Takes about 15 minutes.</p>
              <button className="bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2">
                Start Training <span>→</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-6 relative">
            <div className="absolute left-5 top-10 bottom-[-48px] w-[1px] bg-gray-100"></div>
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm z-10">2</div>
            <div className="flex-1 p-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-400">Set Up Payment</h4>
                <span className="text-gray-300">💳</span>
              </div>
              <p className="text-sm text-gray-400">Learn how payments work and add your payment details.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm">3</div>
            <div className="flex-1 p-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-400">Do Labeling Tasks</h4>
                <span className="text-gray-300">💼</span>
              </div>
              <p className="text-sm text-gray-400">Browse and complete available labeling tasks to earn money.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Footage Labeled</p>
            <p className="text-2xl font-bold text-text-primary">0 min</p>
            <p className="text-[10px] text-gray-400 mt-1">Total footage processed</p>
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-400">🕒</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Approved Roles</p>
            <p className="text-2xl font-bold text-text-primary">None yet</p>
            <p className="text-[10px] text-gray-400 mt-1">Certifications earned</p>
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-400">🏅</div>
        </div>
      </div>
    </div>
  )
}
