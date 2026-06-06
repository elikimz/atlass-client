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

  useEffect(() => {
    fetchData()
  }, [tab])

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
          <div className="loading-bar-bg" style={{ width: '150px' }}>
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Manage Invites & Referrals</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>View and manage referral codes and relationships</p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 16px', color: '#166534', fontSize: '14px' }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #E5E7EB' }}>
        <button
          onClick={() => setTab('codes')}
          style={{
            padding: '12px 16px',
            backgroundColor: tab === 'codes' ? 'transparent' : 'transparent',
            color: tab === 'codes' ? '#5932EA' : '#6B7280',
            border: 'none',
            borderBottom: tab === 'codes' ? '2px solid #5932EA' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Referral Codes
        </button>
        <button
          onClick={() => setTab('relationships')}
          style={{
            padding: '12px 16px',
            backgroundColor: tab === 'relationships' ? 'transparent' : 'transparent',
            color: tab === 'relationships' ? '#5932EA' : '#6B7280',
            border: 'none',
            borderBottom: tab === 'relationships' ? '2px solid #5932EA' : 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Referral Relationships
        </button>
      </div>

      {/* Referral Codes Tab */}
      {tab === 'codes' && (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Code</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Signups</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Trained</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Earned</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Task Rebate</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {referralCodes.map((code) => (
                <tr key={code.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    <code style={{ backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {code.code}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{code.user_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'center', fontWeight: 600 }}>
                    {code.signups_count}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'center', fontWeight: 600 }}>
                    {code.trained_count}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'center', fontWeight: 600 }}>
                    ${code.earned_amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'center', fontWeight: 600 }}>
                    ${code.task_rebate_amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {referralCodes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No referral codes found.</p>
            </div>
          )}
        </div>
      )}

      {/* Referral Relationships Tab */}
      {tab === 'relationships' && (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Referrer ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Code Used</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Created At</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {referralRelationships.map((rel) => (
                <tr key={rel.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {rel.user_id}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{rel.referrer_id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                    <code style={{ backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {rel.referral_code_used || 'N/A'}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B7280' }}>
                    {new Date(rel.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteRelationship(rel.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {referralRelationships.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>No referral relationships found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
