import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'

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
  tier_a_invite_earnings?: number
  tier_b_invite_earnings?: number
  tier_c_invite_earnings?: number
}

interface CommissionHistoryEntry {
  id: number
  tier: number
  amount: number
  rate: number
  eligible_amount: number
  source_type: string
  created_at?: string
}

const INVITES_PER_PAGE = 10

export default function Invite() {
  const [copied, setCopied] = useState<string | null>(null)
  const [currentInvitePage, setCurrentInvitePage] = useState(1)
  const activeInvitesQuery = useQuery({
    queryKey: queryKeys.referrals.active,
    queryFn: async () => (await api.get<InvitedUser[]>('/referrals/active')).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const referralCodesQuery = useQuery({
    queryKey: queryKeys.referrals.codes,
    queryFn: async () => (await api.get<ReferralCodeData[]>('/referrals/codes')).data ?? [],
    staleTime: 10 * 60 * 1000,
  })
  const summaryQuery = useQuery({
    queryKey: queryKeys.referrals.summary,
    queryFn: async () => (await api.get<ReferralSummary>('/referrals/summary')).data,
    staleTime: 2 * 60 * 1000,
  })
  const commissionHistoryQuery = useQuery({
    queryKey: queryKeys.referrals.commissions,
    queryFn: async () => (await api.get<CommissionHistoryEntry[]>('/referrals/commissions')).data ?? [],
    staleTime: 2 * 60 * 1000,
  })
  const activeInvites = activeInvitesQuery.data ?? []
  const referralCodes = referralCodesQuery.data ?? []
  const summary = summaryQuery.data ?? null
  const commissionHistory = commissionHistoryQuery.data ?? []
  const loading = activeInvitesQuery.isLoading || referralCodesQuery.isLoading || summaryQuery.isLoading || commissionHistoryQuery.isLoading
  const invitePageCount = Math.max(1, Math.ceil(activeInvites.length / INVITES_PER_PAGE))
  const safeInvitePage = Math.min(currentInvitePage, invitePageCount)
  const visibleInvites = activeInvites.slice((safeInvitePage - 1) * INVITES_PER_PAGE, safeInvitePage * INVITES_PER_PAGE)

  const handleCopy = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-main)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const inviteLink = referralCodes.length > 0 ? `${window.location.origin}/?ref=${encodeURIComponent(referralCodes[0].code)}` : ''
  const inviteCode = referralCodes.length > 0 ? referralCodes[0].code : ''

  const renderEmptyCode = (label: string) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border-main)' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Generating your {label}...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      <div style={{ padding: '24px 16px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-main)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', lineHeight: '1.3' }}>
          Invite Friends & Get 10% 4% 1%
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
          1. Copy your link or code.<br/>
          2. Share with friends.<br/>
          3. Earn up to 10%, 4%, or 1% by referral tier. Membership rates are configurable and capped by the tier rate.
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>Total Invites</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{summary?.total_invites || 0}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>Active Invites</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{summary?.active_invites || 0}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>Total Commission</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>${(summary?.earnings || 0).toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-main)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>Total Task Rebate</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>${summary?.task_rebate?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', padding: '0 12px' }}>Your Invite Link</h3>
          {inviteLink ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '2px solid var(--accent-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <input type="text" value={inviteLink} readOnly style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 500, color: 'var(--text-main)', fontFamily: 'monospace', outline: 'none' }} />
              </div>
              <button onClick={() => handleCopy(inviteLink, 'link')} style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: copied === 'link' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)', color: copied === 'link' ? '#22C55E' : 'var(--text-heading)', border: '1px solid var(--border-main)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{copied === 'link' ? '✓' : 'COPY LINK'}</button>
            </div>
          ) : renderEmptyCode('invite link')}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', padding: '0 12px' }}>Your Invite Code</h3>
          {inviteCode ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '2px solid var(--accent-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="text" value={inviteCode} readOnly style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace', outline: 'none' }} />
              </div>
              <button onClick={() => handleCopy(inviteCode, 'code')} style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: copied === 'code' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)', color: copied === 'code' ? '#22C55E' : 'var(--text-heading)', border: '1px solid var(--border-main)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{copied === 'code' ? '✓' : 'COPY CODE'}</button>
            </div>
          ) : renderEmptyCode('invite code')}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', padding: '0 12px' }}>Tier Rebates Section</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥇</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px' }}>(Tier A: 10% Rebate)</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>Direct referrals earn up to 10% of the eligible transaction amount.</p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px' }}>(Tier B: 4% Rebate)</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>Second-level referrals earn up to 4%.</p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', border: '1px solid var(--border-main)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 6px' }}>(Tier C: 1% Rebate)</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.3' }}>Third-level referrals earn up to 1%.</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', padding: '0 12px' }}>Manage Invitations</h3>
          {activeInvites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No active invitations yet. Start sharing your link!</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              {visibleInvites.map((invite, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: i < visibleInvites.length - 1 ? '1px solid var(--border-main)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: '0 0 2px' }}>{invite.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Tier {invite.tier}</p>
                    </div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: invite.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: invite.is_active ? '#22C55E' : '#DC2626', fontSize: '12px', fontWeight: 600 }}>{invite.is_active ? 'Active' : 'Inactive'}</div>
                </div>
              ))}
            </div>
          )}
          {activeInvites.length > INVITES_PER_PAGE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px', padding: '0 4px' }}>
              <button
                type="button"
                onClick={() => setCurrentInvitePage((page) => Math.max(1, page - 1))}
                disabled={safeInvitePage === 1}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)', color: safeInvitePage === 1 ? 'var(--text-muted)' : 'var(--text-heading)', cursor: safeInvitePage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                Page {safeInvitePage} of {invitePageCount}
              </span>
              <button
                type="button"
                onClick={() => setCurrentInvitePage((page) => Math.min(invitePageCount, page + 1))}
                disabled={safeInvitePage === invitePageCount}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-main)', backgroundColor: 'var(--bg-card)', color: safeInvitePage === invitePageCount ? 'var(--text-muted)' : 'var(--text-heading)', cursor: safeInvitePage === invitePageCount ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px', padding: '0 12px' }}>Commission History</h3>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
            {commissionHistory.length === 0 ? <p style={{ padding: '24px', color: 'var(--text-muted)', margin: 0 }}>No referral commissions have been awarded yet.</p> : commissionHistory.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border-main)' }}>
                <div><p style={{ margin: 0, fontWeight: 600, color: 'var(--text-heading)' }}>Tier {entry.tier} · {entry.source_type.replace('_', ' ')}</p><p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'} · {(entry.rate * 100).toFixed(2)}% of ${entry.eligible_amount.toFixed(2)}</p></div>
                <strong style={{ color: '#F97316' }}>+${entry.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
