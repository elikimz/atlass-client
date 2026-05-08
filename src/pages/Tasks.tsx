import { useEffect, useState } from 'react'
import api from '../services/api'

interface Task {
  id: number
  name: string
  status: string
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks')
        setTasks(response.data)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Tasks</h2>
        <p className="text-gray-600">Complete training to unlock tasks and start earning</p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{task.name}</h3>
                <p className="text-gray-600 text-sm mt-1">Complete training to access labeling tasks</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  task.status === 'locked'
                    ? 'bg-gray-100 text-gray-800'
                    : task.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.status === 'locked' ? '🔒 Locked' : task.status === 'available' ? '✓ Available' : 'Active'}
                </span>
                <button
                  disabled={task.status === 'locked'}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    task.status === 'locked'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {task.status === 'locked' ? 'Locked' : 'Start Task'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-semibold mb-2">No tasks available yet</p>
          <p className="text-blue-700">Complete your training to unlock tasks</p>
        </div>
      )}
    </div>
  )
}
