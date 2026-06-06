import { useState } from 'react'

type Tab = 'guidelines' | 'references' | 'videos'

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '10px',
  border: '1px solid var(--border-main)',
  padding: '24px',
}

const guidelinesPages = [
  {
    title: 'Introduction to Video Labeling',
    content: (
      <div>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '16px' }}>
          Each video is divided into multiple <strong>events</strong> (segments). You'll label each event with the appropriate action or behavior. Your goal is to accurately identify and tag what is happening in each segment.
        </p>
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', margin: '0 0 4px' }}>Important</p>
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, lineHeight: 1.5 }}>Do not skip events or label them incorrectly. Every segment must be labeled with precision.</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '8px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#2563eb', margin: '0 0 4px' }}>Tip</p>
              <p style={{ fontSize: '13px', color: '#2563eb', margin: 0, lineHeight: 1.5 }}>Watch the full event before selecting a label. Context matters for accurate labeling.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Labeling Categories',
    content: (
      <div>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '16px' }}>
          You will encounter several categories of actions. Each category has specific criteria for what qualifies.
        </p>
        <div style={{ border: '1px solid var(--border-main)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-heading)', borderBottom: '1px solid var(--border-main)', width: '50%' }}>Focus On</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-heading)', borderBottom: '1px solid var(--border-main)', width: '50%' }}>Don't Focus On</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Clear, deliberate actions', 'Background movement'],
                ['Primary subject behavior', 'Incidental gestures'],
                ['Defined start/end points', 'Ambiguous transitions'],
                ['Visible, identifiable events', 'Off-screen activity'],
              ].map(([focus, avoid], i) => (
                <tr key={i} style={{ borderBottom: i < 3 ? '1px solid var(--border-main)' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {focus}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      {avoid}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
]

export default function LearningHub() {
  const [activeTab, setActiveTab] = useState<Tab>('guidelines')
  const [page, setPage] = useState(0)
  const totalPages = guidelinesPages.length

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', borderRadius: '7px',
    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Learning Hub</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Study materials, references, and training resources.</p>
      </div>

      {/* Tabs */}
      <div style={{ ...cardStyle, padding: '6px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button style={tabStyle(activeTab === 'guidelines')} onClick={() => { setActiveTab('guidelines'); setPage(0) }}>Guidelines</button>
          <button style={tabStyle(activeTab === 'references')} onClick={() => setActiveTab('references')}>References</button>
          <button style={tabStyle(activeTab === 'videos')} onClick={() => setActiveTab('videos')}>Training Video</button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'guidelines' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              {guidelinesPages[page].title}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{page + 1} of {totalPages}</span>
          </div>

          {guidelinesPages[page].content}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-main)' }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', fontSize: '13px', fontWeight: 600,
                backgroundColor: 'var(--bg-card)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-main)',
                border: '1px solid var(--border-main)', borderRadius: '7px',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', fontSize: '13px', fontWeight: 600,
                backgroundColor: page === totalPages - 1 ? 'var(--bg-main)' : 'var(--accent-primary)',
                color: page === totalPages - 1 ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: '7px',
                cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'references' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px' }}>Reference Materials</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Action Classification Guide', desc: 'Complete list of action categories and their definitions.' },
              { title: 'Edge Case Handbook', desc: 'How to handle ambiguous or difficult labeling scenarios.' },
              { title: 'Quality Standards', desc: 'Minimum quality requirements for approved submissions.' },
            ].map((ref) => (
              <div key={ref.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid var(--border-main)', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 2px' }}>{ref.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{ref.desc}</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  View
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 16px' }}>Training Videos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Getting Started with Video Labeling', duration: '8:24' },
              { title: 'Advanced Labeling Techniques', duration: '12:15' },
              { title: 'Common Mistakes to Avoid', duration: '6:40' },
            ].map((video) => (
              <div key={video.title} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: '1px solid var(--border-main)', borderRadius: '8px' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--accent-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 2px' }}>{video.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{video.duration}</p>
                </div>
                <button style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', backgroundColor: 'var(--accent-light)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Watch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
