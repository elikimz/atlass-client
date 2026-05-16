import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Certification {
  id: number
  name: string
  status: string
}

const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '20px',
}

export default function Training() {
  const navigate = useNavigate()
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/training/certifications')
      .then((r) => setCerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStart = async (id: number) => {
    try {
      await api.post(`/training/certifications/${id}/start`)
      const r = await api.get('/training/certifications')
      setCerts(r.data)
    } catch (err) {
      console.error(err)
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'completed') return { label: 'Completed', color: '#16a34a', bg: '#dcfce7' }
    if (status === 'in_progress') return { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' }
    return { label: 'Available', color: '#6b7280', bg: '#f3f4f6' }
  }

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Training Center</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Complete certifications to unlock labeling tasks.</p>
        </div>
        <button
          onClick={() => navigate('/training/hub')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', backgroundColor: 'white', color: '#374151',
            fontSize: '13px', fontWeight: 600, border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Learning Hub
        </button>
      </div>

      {/* Certifications grid */}
      {certs.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No certifications available yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {certs.map((cert) => {
            const badge = statusBadge(cert.status)
            const isActive = cert.status === 'in_progress'
            return (
              <div key={cert.id} style={{
                ...card,
                border: isActive ? '2px solid #6366f1' : '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {/* Icon */}
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>

                {/* Title + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4 }}>{cert.name}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: badge.color, backgroundColor: badge.bg, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {badge.label}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Learn the fundamentals of AI data labeling
                </p>

                {/* Progress bar for in_progress */}
                {cert.status === 'in_progress' && (
                  <div style={{ backgroundColor: '#f3f4f6', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', backgroundColor: '#6366f1', borderRadius: '4px' }} />
                  </div>
                )}

                {/* CTA */}
                {cert.status === 'available' && (
                  <button
                    onClick={() => handleStart(cert.id)}
                    style={{
                      width: '100%', padding: '8px', fontSize: '13px', fontWeight: 600,
                      backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer',
                    }}
                  >
                    Start Training
                  </button>
                )}
                {cert.status === 'in_progress' && (
                  <button style={{
                    width: '100%', padding: '8px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer',
                  }}>
                    Continue Training
                  </button>
                )}
                {cert.status === 'completed' && (
                  <button disabled style={{
                    width: '100%', padding: '8px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '7px', cursor: 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Completed
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
