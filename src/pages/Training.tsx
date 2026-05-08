import { useEffect, useState } from 'react'
import api from '../services/api'

interface Certification {
  id: number
  name: string
  status: string
}

export default function Training() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'certifications' | 'hub'>('certifications')

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await api.get('/training/certifications')
        setCertifications(response.data)
      } catch (error) {
        console.error('Failed to fetch certifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertifications()
  }, [])

  const handleStartCertification = async (id: number) => {
    try {
      await api.post(`/training/certifications/${id}/start`)
      // Refresh certifications
      const response = await api.get('/training/certifications')
      setCertifications(response.data)
    } catch (error) {
      console.error('Failed to start certification:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Training Center</h2>
        <p className="text-gray-600">Complete certifications to unlock tasks and earn more</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'certifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Certifications
        </button>
        <button
          onClick={() => setActiveTab('hub')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'hub'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Learning Hub
        </button>
      </div>

      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">~25 min • 3 steps</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cert.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : cert.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cert.status === 'in_progress' ? 'In Progress' : cert.status === 'completed' ? 'Completed' : 'Available'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Learn the fundamentals of AI data labeling</p>
              {cert.status === 'available' && (
                <button
                  onClick={() => handleStartCertification(cert.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Start Training
                </button>
              )}
              {cert.status === 'in_progress' && (
                <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg">
                  Continue Training
                </button>
              )}
              {cert.status === 'completed' && (
                <button className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg" disabled>
                  ✓ Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hub' && (
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning Hub</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Guidelines</h4>
              <p className="text-gray-600">Each video is divided into multiple events (segments). You'll label each event with the appropriate action or behavior.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">References</h4>
              <p className="text-gray-600">Access detailed reference materials and examples to help you label accurately.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Training Videos</h4>
              <p className="text-gray-600">Watch our comprehensive training videos to understand the labeling process.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
