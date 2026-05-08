import { useEffect, useState } from 'react'
import api from '../services/api'

interface Evaluation {
  id: number
  name: string
  episodes_completed: string
  episodes_passing_audit: string
}

export default function Feedback() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await api.get('/feedback/evaluations')
        setEvaluations(response.data)
      } catch (error) {
        console.error('Failed to fetch evaluations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluations()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Evaluations</h2>
        <p className="text-gray-600">Track your evaluation progress and audit results</p>
      </div>

      <div className="space-y-6">
        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{evaluation.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Track your progress through this evaluation tier</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                In Progress
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium">Episodes Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{evaluation.episodes_completed}</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium">Passing Audit</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{evaluation.episodes_passing_audit}</p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Feedback</h4>
              <p className="text-gray-600 text-sm">
                Complete episodes to receive detailed feedback on your labeling accuracy and quality.
              </p>
            </div>
          </div>
        ))}
      </div>

      {evaluations.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-semibold mb-2">No evaluations available yet</p>
          <p className="text-blue-700">Start labeling tasks to receive evaluations</p>
        </div>
      )}
    </div>
  )
}
