import { useEffect, useState } from 'react'
import api from '../services/api'

interface InvitedUser {
  name: string
  status: string
  tier: string
  is_active: boolean
}

interface ReferralCodeData {
  code: string
  signups: number
  trained: number
  earned: number
  task_rebate: number
}

interface ReferralSummary {
  earnings: number
  users_referred: number
  task_rebate: number
  total_invites: number
  active_invites: number
}

export default function Invite() {

  const [activeInvites, setActiveInvites] = useState<InvitedUser[]>([])
  const [referralCodes, setReferralCodes] = useState<ReferralCodeData[]>([])
  const [summary, setSummary] = useState<ReferralSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, codesRes, summaryRes] = await Promise.all([
          api.get('/referrals/active'),
          api.get('/referrals/codes'),
          api.get('/referrals/summary')
        ])
        setActiveInvites(activeRes.data)
        setReferralCodes(codesRes.data)
        setSummary(summaryRes.data)
      } catch (err) {
        console.error('Failed to fetch referral data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCopy = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusColor = (isActive: boolean) => {
    if (isActive) return { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' }
    return { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return '#5932EA'
      case 'B': return '#8B5CF6'
      case 'C': return '#A78BFA'
      default: return '#64748B'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'A': return '🥇'
      case 'B': return '🥈'
      case 'C': return '🥉'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const inviteLink = referralCodes.length > 0 ? `${window.location.origin}/login?ref=${referralCodes[0].code}` : ''
  const inviteCode = referralCodes.length > 0 ? referralCodes[0].code : ''

  const renderEmptyCode = (label: string) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Generating your {label}...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ padding: '24px 16px', backgroundColor: 'white' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px', lineHeight: '1.3' }}>
          Invite Friends & Get 10% 4% 1%
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
          1. Copy your link or code.<br/>
          2. Share with friends.<br/>
          3. Get 10%, 4%, or 1% commission based on their level.
        </p>
      </div>

      {/* Metrics Section */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Total Invites */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Total Invites</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{summary?.total_invites || 0}</p>
          </div>

          {/* Active Invites */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Active Invites</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{summary?.active_invites || 0}</p>
          </div>

          {/* Total Invite Commission */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Total Commission</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>${summary?.earnings?.toFixed(2) || '0.00'}</p>
          </div>

          {/* Total Task Rebate */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px', fontWeight: 500 }}>Total Task Rebate</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>${summary?.task_rebate?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1, padding: '0 16px 16px' }}>
        {/* Your Invite Link */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px', padding: '0 12px' }}>Your Invite Link</h3>
          {inviteLink ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#F5F3FF',
                borderRadius: '12px',
                border: '2px solid #8B5CF6'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#0F172A',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={() => handleCopy(inviteLink, 'link')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: copied === 'link' ? '#DCFCE7' : 'white',
                  color: copied === 'link' ? '#15803D' : '#0F172A',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied === 'link' ? '✓' : 'COPY LINK'}
              </button>
            </div>
          ) : renderEmptyCode('invite link')}
        </div>

        {/* Your Invite Code */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px', padding: '0 12px' }}>Your Invite Code</h3>
          {inviteCode ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#F5F3FF',
                borderRadius: '12px',
                border: '2px solid #8B5CF6'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={() => handleCopy(inviteCode, 'code')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: copied === 'code' ? '#DCFCE7' : 'white',
                  color: copied === 'code' ? '#15803D' : '#0F172A',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied === 'code' ? '✓' : 'COPY CODE'}
              </button>
            </div>
          ) : renderEmptyCode('invite code')}
        </div>

        {/* Tier Rebates Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px', padding: '0 12px' }}>Tier Rebates Section</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {/* Tier A */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px 12px',
              textAlign: 'center',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥇</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>(Tier A: 10% Rebate)</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: '1.3' }}>Learn the souring commission of 10%.</p>
            </div>
            {/* Tier B */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px 12px',
              textAlign: 'center',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>(Tier B: 4% Rebate)</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: '1.3' }}>Learn the shaming commission of 4%.</p>
            </div>
            {/* Tier C */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px 12px',
              textAlign: 'center',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>(Tier C: 1% Rebate)</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: '1.3' }}>Learn the scrowing commission of 1%.</p>
            </div>
          </div>
        </div>

        {/* Manage Invitations Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px', padding: '0 12px' }}>Manage Invitations</h3>
          
          {activeInvites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px' }}>No invitations yet</p>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Start sharing your code to build your network!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {/* Header Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '12px',
                padding: '12px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Name</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Status</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Level (Tier)</span>
              </div>

              {/* Data Rows */}
              {activeInvites.map((invite, idx) => {
                const statusColor = getStatusColor(invite.is_active)
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: idx === activeInvites.length - 1 ? 'none' : '1px solid #E2E8F0'
                    }}
                  >
                    {/* Name Column */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {getTierIcon(invite.tier)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{invite.name}</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0' }}>({invite.status})</p>
                      </div>
                    </div>

                    {/* Status Column */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: statusColor.bg,
                      borderRadius: '8px',
                      whiteSpace: 'nowrap'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: statusColor.dot
                      }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor.color }}>
                        {invite.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Level Column */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#F5F3FF',
                      borderRadius: '8px',
                      border: `1px solid ${getTierColor(invite.tier)}`,
                      whiteSpace: 'nowrap'
                    }}>
                      <span style={{ fontSize: '14px' }}>{getTierIcon(invite.tier)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: getTierColor(invite.tier) }}>
                        Tier {invite.tier}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
