import { useEffect, useState } from 'react'
import api from '../services/api'



interface InvitedUser {
  name: string
  status: string
  tier: string
}

interface ReferralSummaryData {
  earnings: number
  users_referred: number
  task_rebate: number
}

export default function Referrals() {
  const [summary, setSummary] = useState<ReferralSummaryData | null>(null)
  const [activeInvites, setActiveInvites] = useState<InvitedUser[]>([])
  const [referralCodes, setReferralCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [userName] = useState(localStorage.getItem('user_first_name') || 'User')

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          Invite Friends <span style={{ color: '#5932EA' }}>✨</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
          Welcome back, {userName}! Refer friends and earn rewards.
        </p>
      </div>

      {/* Invitation Stats & Earnings */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Invitation Stats & Earnings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {/* Stat Card 1 */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5932EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: '0 0 8px' }}>Total Invites:</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{summary?.users_referred ?? 0}</p>
          </div>
          {/* Stat Card 2 */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#FFF7ED', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: '0 0 8px' }}>Total Invite Commission:</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>${(summary?.earnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          {/* Stat Card 3 */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#F0FDF4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/>
              </svg>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', margin: '0 0 8px' }}>Total Task Rebate Commission:</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>${(summary?.task_rebate ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Referral Codes Section */}
        {/* Share Code Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>Your Referral Code</h2>
          {referralCodes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {`${window.location.origin}/login?ref=${referralCodes[0].code}`}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Share your referral link to invite friends directly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(`${window.location.origin}/login?ref=${referralCodes[0].code}`)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: copied === `${window.location.origin}/login?ref=${referralCodes[0].code}` ? '#DCFCE7' : '#5932EA',
                  color: copied === `${window.location.origin}/login?ref=${referralCodes[0].code}` ? '#15803D' : 'white',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied === `${window.location.origin}/login?ref=${referralCodes[0].code}` ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>

      {/* How to Earn Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px' }}>How to Earn</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F5F3FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Share Code</p>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Share conder code and your in app.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Friend Joins</p>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Friend joins froor your Friend Joins.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#F0FDF4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Friend Completes Tasks</p>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Friend completes tasks and earn rewards.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>You Both Earn</p>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>You both Earn as gift and bols completes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Rebates Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Tier Rebates</h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: '#0F172A' }}>A: 10%</span>
            <span style={{ color: '#5932EA' }}>•</span>
            <span style={{ color: '#0F172A' }}>B: 4%</span>
            <span style={{ color: '#5932EA' }}>•</span>
            <span style={{ color: '#0F172A' }}>C: 1%</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9', color: '#94A3B8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Active Invitations</span>
            <span>Status</span>
          </div>
          
          {activeInvites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '14px' }}>
              No active invitations yet. Start sharing your code!
            </div>
          ) : (
            activeInvites.map((invite, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx === activeInvites.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
                    {invite.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '0 0 2px' }}>{invite.name}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Tier {invite.tier} Referral</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: invite.status === 'Completed' ? '#22C55E' : '#F59E0B' }}>
                    {invite.status}
                  </span>
                  <div style={{ width: '24px', height: '6px', borderRadius: '10px', backgroundColor: invite.status === 'Completed' ? '#22C55E' : '#F59E0B' }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
