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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Here's your progress at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Footage Labeled</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.footage_labeled_min || 0}</p>
              <p className="text-gray-500 text-xs mt-1">minutes</p>
            </div>
            <div className="text-4xl">📹</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approved Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.approved_roles || 'None'}</p>
              <p className="text-gray-500 text-xs mt-1">yet</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Certifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data?.certifications_earned || 0}</p>
              <p className="text-gray-500 text-xs mt-1">earned</p>
            </div>
            <div className="text-4xl">🎓</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Journey</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <div>
              <p className="font-semibold text-gray-900">Complete Training</p>
              <p className="text-sm text-gray-600">Finish the certification course</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">2</div>
            <div>
              <p className="font-semibold text-gray-900">Start Labeling</p>
              <p className="text-sm text-gray-600">Begin your first task</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">3</div>
            <div>
              <p className="font-semibold text-gray-900">Get Paid</p>
              <p className="text-sm text-gray-600">Receive weekly payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
