import { useState, useEffect } from 'react'
import api from '../services/api'

interface ReferralCode {
  id: number
  user_id: number
  code: string
  signups_count: number
  trained_count: number
  earned_amount: number
  task_rebate_amount: number
}

interface ReferralRelationship {
  id: number
  user_id: number
  referrer_id: number
  referral_code_used: string
  created_at: string
}

export default function AdminInvites() {
  const [tab, setTab] = useState<'codes' | 'relationships'>('codes')
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [referralRelationships, setReferralRelationships] = useState<ReferralRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchData() }, [tab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (tab === 'codes') {
        const response = await api.get('/admin/referral-codes')
        setReferralCodes(response.data)
      } else {
        const response = await api.get('/admin/referral-relationships')
        setReferralRelationships(response.data)
      }
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCode = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this referral code?')) {
      try {
        await api.delete(`/admin/referral-codes/${id}`)
        setSuccess('Referral code deleted successfully')
        fetchData()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete referral code')
      }
    }
  }

  const handleDeleteRelationship = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this referral relationship?')) {
      try {
        await api.delete(`/admin/referral-relationships/${id}`)
        setSuccess('Referral relationship deleted successfully')
        fetchData()
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete referral relationship')
      }
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}><div className="loading-bar-fill"></div></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Manage Invites & Referrals</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>View and manage referral codes and relationships</p>
      </div>

      {error && <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px' }}>{success}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-main)' }}>
        <button onClick={() => setTab('codes')} style={{ padding: '12px 16px', backgroundColor: 'transparent', color: tab === 'codes' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', borderBottom: tab === 'codes' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Referral Codes</button>
        <button onClick={() => setTab('relationships')} style={{ padding: '12px 16px', backgroundColor: 'transparent', color: tab === 'relationships' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', borderBottom: tab === 'relationships' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Referral Relationships</button>
      </div>

      {tab === 'codes' && (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-main)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Code</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Signups</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Trained</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Earned</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Task Rebate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {referralCodes.map((code) => (
                <tr key={code.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}><code style={{ backgroundColor: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)' }}>{code.code}</code></td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>{code.user_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)', textAlign: 'center', fontWeight: 600 }}>{code.signups_count}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)', textAlign: 'center', fontWeight: 600 }}>{code.trained_count}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)', textAlign: 'center', fontWeight: 600 }}>${code.earned_amount.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)', textAlign: 'center', fontWeight: 600 }}>${code.task_rebate_amount.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}><button onClick={() => handleDeleteCode(code.id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {referralCodes.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px' }}><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No referral codes found.</p></div>}
        </div>
      )}

      {tab === 'relationships' && (
        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-main)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Referrer ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Code Used</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Created At</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {referralRelationships.map((rel) => (
                <tr key={rel.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{rel.user_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>{rel.referrer_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-main)' }}><code style={{ backgroundColor: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)' }}>{rel.referral_code_used || 'N/A'}</code></td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(rel.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}><button onClick={() => handleDeleteRelationship(rel.id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {referralRelationships.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px' }}><p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No referral relationships found.</p></div>}
        </div>
      )}
    </div>
  )
}
