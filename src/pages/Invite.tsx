import { useEffect, useState } from 'react'
import api from '../services/api'

interface InvitedUser {
  name: string
  status: string
  tier: string
  is_active: boolean
}

interface ReferralSummaryData {
  earnings: number
  users_referred: number
  task_rebate: number
}

interface ReferralCodeData {
  code: string
  signups: number
  trained: number
  earned: number
  task_rebate: number
}

export default function Invite() {
  const [summary, setSummary] = useState<ReferralSummaryData | null>(null)
  const [activeInvites, setActiveInvites] = useState<InvitedUser[]>([])
  const [referralCodes, setReferralCodes] = useState<ReferralCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, activeRes, codesRes] = await Promise.all([
          api.get('/referrals/summary'),
          api.get('/referrals/active'),
          api.get('/referrals/codes')
        ])
        setSummary(summaryRes.data)
        setActiveInvites(activeRes.data)
        setReferralCodes(codesRes.data)
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

  const getStatusColor = (status: string, isActive: boolean) => {
    if (status === 'Accepted' && isActive) return { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E' }
    if (status === 'Accepted') return { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          Invite Friends & Get 10% 4% 1% <span style={{ color: '#5932EA', fontSize: '16px', fontWeight: 500 }}>- Welcome, {localStorage.getItem('user_first_name') || 'User'}!</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
          1. Copy your link or code. 2. Share with friends. 3. Get 10%, 4%, or 1% commission based on their level.
        </p>
      </div>

      {/* Your Invite Link Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Your Invite Link</h2>
        {inviteLink && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F5F3FF', borderRadius: '16px', border: '2px solid #8B5CF6' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <input
              type="text"
              value={inviteLink}
              readOnly
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F172A',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleCopy(inviteLink, 'link')}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: copied === 'link' ? '#DCFCE7' : '#5932EA',
                color: copied === 'link' ? '#15803D' : 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {copied === 'link' ? '✓ COPIED' : 'COPY LINK'}
            </button>
          </div>
        )}
      </div>

      {/* Your Invite Code Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Your Invite Code</h2>
        {inviteCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F5F3FF', borderRadius: '16px', border: '2px solid #8B5CF6' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              type="text"
              value={inviteCode}
              readOnly
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '16px',
                fontWeight: 700,
                color: '#0F172A',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleCopy(inviteCode, 'code')}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: copied === 'code' ? '#DCFCE7' : '#5932EA',
                color: copied === 'code' ? '#15803D' : 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {copied === 'code' ? '✓ COPIED' : 'COPY CODE'}
            </button>
          </div>
        )}
      </div>

      {/* Tier Rebates Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Tier Rebates Section</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {/* Tier A Card */}
          <div style={{ backgroundColor: '#F5F3FF', borderRadius: '20px', padding: '24px', textAlign: 'center', border: '2px solid #EEF2FF' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥇</div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>(Tier A: 10% Rebate)</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Learn the souring commission of 10%.</p>
          </div>
          {/* Tier B Card */}
          <div style={{ backgroundColor: '#F5F3FF', borderRadius: '20px', padding: '24px', textAlign: 'center', border: '2px solid #EEF2FF' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥈</div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>(Tier B: 4% Rebate)</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Learn the shaming commission of 4%.</p>
          </div>
          {/* Tier C Card */}
          <div style={{ backgroundColor: '#F5F3FF', borderRadius: '20px', padding: '24px', textAlign: 'center', border: '2px solid #EEF2FF' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🥉</div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>(Tier C: 1% Rebate)</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Learn the scrowing commission of 1%.</p>
          </div>
        </div>
      </div>

      {/* Manage Invitations Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Manage Invitations</h2>
        
        {activeInvites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>No invitations yet</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Start sharing your code to build your network!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            {/* Header Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', padding: '12px 0', borderBottom: '2px solid #F1F5F9', color: '#94A3B8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Name</span>
              <span style={{ textAlign: 'center' }}>Status</span>
              <span style={{ textAlign: 'center' }}>Level (Tier)</span>
            </div>

            {/* Data Rows */}
            {activeInvites.map((invite, idx) => {
              const statusColor = getStatusColor(invite.status, invite.is_active)
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: idx === activeInvites.length - 1 ? 'none' : '1px solid #F1F5F9'
                  }}
                >
                  {/* Name Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: getTierColor(invite.tier)
                    }}>
                      {getTierIcon(invite.tier)}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '0 0 2px' }}>{invite.name}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>({invite.status})</p>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: statusColor.bg,
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: statusColor.dot
                    }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor.color }}>
                      {invite.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Level Column */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#F5F3FF',
                    borderRadius: '12px',
                    border: `1px solid ${getTierColor(invite.tier)}`
                  }}>
                    <span style={{ fontSize: '16px' }}>{getTierIcon(invite.tier)}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: getTierColor(invite.tier) }}>
                      Tier {invite.tier}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Commission Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Total Invite Commission */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: 0 }}>Total Invite Commission</p>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            ${(summary?.earnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Referrals */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: 0 }}>Total Referrals</p>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {summary?.users_referred ?? 0}
          </p>
        </div>

        {/* Total Task Rebate */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🎁</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: 0 }}>Total Task Rebate</p>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            ${(summary?.task_rebate ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
