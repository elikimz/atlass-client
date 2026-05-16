import { useEffect, useState } from 'react'
import api from '../services/api'

interface Evaluation {
  id: number
  name: string
  episodes_completed: string
  episodes_passing_audit: string
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '24px',
}

export default function Feedback() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/feedback/evaluations')
      .then((r) => setEvaluations(r.data))
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
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Feedback & Audits</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>View your labeling quality feedback and audit results.</p>
      </div>

      {/* Campaign Audit Feedback */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Campaign Audit Feedback</h2>
          <button style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 600,
            backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}>
            Open
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Detailed feedback on your recent labeling submissions</p>
      </div>

      {/* Evaluations */}
      {evaluations.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: '#f0f4ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>No evaluations yet</p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Complete tasks to receive feedback</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {evaluations.map((eval) => (
            <div key={eval.id} style={{
              ...card,
              padding: '16px 20px',
              border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{eval.name}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  Episodes: {eval.episodes_completed} • Passing: {eval.episodes_passing_audit}
                </p>
              </div>
              <button style={{
                padding: '6px 12px', fontSize: '12px', fontWeight: 600,
                backgroundColor: '#f0f4ff', color: '#6366f1', border: 'none', borderRadius: '6px', cursor: 'pointer',
              }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quality Tips */}
      <div style={card}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Tips to Improve Quality</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Watch Carefully', desc: 'Review each segment multiple times before labeling.' },
            { title: 'Follow Guidelines', desc: 'Refer to the learning hub for category definitions.' },
            { title: 'Be Consistent', desc: 'Apply the same standards to all your labels.' },
            { title: 'Ask Questions', desc: 'Use the support channel if you\'re unsure about a label.' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{tip.title}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
