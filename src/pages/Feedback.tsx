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
    api.get('/feedback/evaluations')
      .then((r) => setEvaluations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    border: '1px solid var(--border-main)',
    padding: '24px',
    boxShadow: 'var(--card-shadow)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Feedback & Audits</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>View your labeling quality feedback and audit results.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Campaign Audit Feedback</h2>
          <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Open</button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Detailed feedback on your recent labeling submissions</p>
      </div>

      {evaluations.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '52px', height: '52px', backgroundColor: 'var(--accent-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 6px' }}>No evaluations yet</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Complete tasks to receive feedback</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 4px' }}>{evaluation.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Episodes: {evaluation.episodes_completed} • Passing: {evaluation.episodes_passing_audit}</p>
              </div>
              <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View Details</button>
            </div>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px' }}>Tips to Improve Quality</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Watch Carefully', desc: 'Review each segment multiple times before labeling.' },
            { title: 'Follow Guidelines', desc: 'Refer to the learning hub for category definitions.' },
            { title: 'Be Consistent', desc: 'Apply the same standards to all your labels.' },
            { title: 'Ask Questions', desc: 'Use the support channel if you\'re unsure about a label.' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 2px' }}>{tip.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
