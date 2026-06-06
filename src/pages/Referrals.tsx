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
        const [summaryRes, activeRes, codesRes] = await Promise.all([api.get('/referrals/summary'), api.get('/referrals/active'), api.get('/referrals/codes')])
        setSummary(summaryRes.data); setActiveInvites(activeRes.data); setReferralCodes(codesRes.data)
      } catch (err) { console.error('Failed to fetch referral data', err) } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>Invite Friends <span style={{ color: 'var(--accent-primary)' }}>✨</span></h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>Welcome back, {userName}! Refer friends and earn rewards.</p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 24px' }}>Invitation Stats & Earnings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Total Invites', val: summary?.users_referred ?? 0, icon: '👥', color: 'var(--accent-primary)', bg: 'var(--accent-light)' },
            { label: 'Invite Commission', val: `$${(summary?.earnings ?? 0).toFixed(2)}`, icon: '🎁', color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
            { label: 'Task Rebate', val: `$${(summary?.task_rebate ?? 0).toFixed(2)}`, icon: '📈', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' }
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'var(--bg-main)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>{stat.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 8px' }}>{stat.label}:</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 24px' }}>Your Referral Code</h2>
        {referralCodes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔗</div>
              <div style={{ flex: 1 }}><p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{`${window.location.origin}/login?ref=${referralCodes[0].code}`}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Share your referral link to invite friends directly.</p></div>
            </div>
            <button onClick={() => handleCopy(`${window.location.origin}/login?ref=${referralCodes[0].code}`)} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--accent-primary)', color: copied ? '#15803D' : 'white', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{copied ? '✓ Copied' : 'Copy Link'}</button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 24px' }}>How to Earn</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { t: 'Share Code', d: 'Share your code with friends.', i: '🔗', bg: 'var(--accent-light)' },
            { t: 'Friend Joins', d: 'They join using your link.', i: '👥', bg: 'rgba(59, 130, 246, 0.1)' },
            { t: 'Friend Tasks', d: 'They complete daily tasks.', i: '🎬', bg: 'rgba(34, 197, 94, 0.1)' },
            { t: 'You Both Earn', d: 'Get commissions instantly.', i: '💰', bg: 'rgba(249, 115, 22, 0.1)' }
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: step.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>{step.i}</div>
              <div><p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>{step.t}</p><p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{step.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Tier Rebates</h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontWeight: 600 }}><span style={{ color: 'var(--text-heading)' }}>A: 10%</span><span style={{ color: 'var(--accent-primary)' }}>•</span><span style={{ color: 'var(--text-heading)' }}>B: 4%</span><span style={{ color: 'var(--accent-primary)' }}>•</span><span style={{ color: 'var(--text-heading)' }}>C: 1%</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-main)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}><span>Active Invitations</span><span>Status</span></div>
          {activeInvites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>No active invitations yet. Start sharing your code!</div>
          ) : (
            activeInvites.map((invite, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx === activeInvites.length - 1 ? 'none' : '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>{invite.name.charAt(0)}</div>
                  <div><p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 2px' }}>{invite.name}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Tier {invite.tier} Referral</p></div>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#166534', fontSize: '12px', fontWeight: 700 }}>{invite.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
