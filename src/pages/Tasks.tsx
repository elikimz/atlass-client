import { useEffect, useState } from 'react'
import api from '../services/api'

interface Task {
  id: number
  name: string
  status: string
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '24px',
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks')
      .then((r) => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Available Tasks</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Complete training to unlock tasks and start earning</p>
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: '#f0f4ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1v22M4.22 4.22l15.56 15.56M1 12h22M4.22 19.78L19.78 4.22"/>
            </svg>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>No tasks available yet</p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Complete your training to unlock tasks</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => {
            const isLocked = task.status === 'locked'
            const statusBadge = isLocked ? { label: 'Locked', color: '#9ca3af', bg: '#f3f4f6' } : { label: 'Available', color: '#16a34a', bg: '#dcfce7' }
            return (
              <div key={task.id} style={{
                ...card,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
              }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{task.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Complete training to access labeling tasks</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: statusBadge.color, backgroundColor: statusBadge.bg, padding: '4px 10px', borderRadius: '20px' }}>
                    {isLocked && '🔒 '}{statusBadge.label}
                  </span>
                  <button
                    disabled={isLocked}
                    style={{
                      padding: '7px 16px', fontSize: '13px', fontWeight: 600,
                      backgroundColor: isLocked ? '#f3f4f6' : '#6366f1',
                      color: isLocked ? '#9ca3af' : 'white',
                      border: 'none', borderRadius: '7px', cursor: isLocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLocked ? 'Locked' : 'Start Task'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
