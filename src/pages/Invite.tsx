import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import ReferralNetwork from '../components/ReferralNetwork'

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
const money = (amount: number | null | undefined) => `$${(Number.isFinite(amount) ? Number(amount) : 0).toFixed(2)}`

function sourceLabel(source: string) {
  return source.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function dateLabel(value?: string) {
  if (!value) return 'Date not supplied'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date not supplied' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export default function Invite() {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [copyError, setCopyError] = useState('')
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
  const inviteCode = referralCodes[0]?.code || ''
  const inviteLink = inviteCode ? `${window.location.origin}/?ref=${encodeURIComponent(inviteCode)}` : ''

  const handleCopy = async (text: string, type: 'link' | 'code') => {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      window.setTimeout(() => setCopied((current) => current === type ? null : current), 2000)
    } catch {
      setCopyError('Clipboard access was blocked. Select the field and copy it manually.')
    }
  }

  const retryQueries = () => {
    void activeInvitesQuery.refetch()
    void referralCodesQuery.refetch()
    void summaryQuery.refetch()
    void commissionHistoryQuery.refetch()
  }

  if (loading) return <div className="member-page-state" role="status"><span className="member-loading-indicator" /><span>Loading your referral workspace…</span></div>
  if (activeInvitesQuery.isError || referralCodesQuery.isError || summaryQuery.isError || commissionHistoryQuery.isError) {
    return <section className="member-page-state member-page-state--error" role="alert"><span className="member-state-code">03 / REFERRALS</span><h2>Referral data did not load.</h2><p>Your invite code and network have not been changed.</p><button className="member-button member-button--primary" type="button" onClick={retryQueries}>Reload referral data</button></section>
  }

  const tierEarnings = [
    { label: 'Tier A', value: summary?.tier_a_invite_earnings },
    { label: 'Tier B', value: summary?.tier_b_invite_earnings },
    { label: 'Tier C', value: summary?.tier_c_invite_earnings },
  ]

  return (
    <div className="member-referrals">
      <header className="member-page-heading member-referrals-heading">
        <div><span className="member-eyebrow">COMMUNITY / REFERRALS</span><h2>Build your circle.</h2><p>Share your invite, follow your network and see commissions recorded against your account.</p></div>
        <span className="referral-heading-stamp"><b>INVITE</b><i aria-hidden="true">→</i><b>CONNECT</b></span>
      </header>

      <section className="referral-share-studio" aria-label="Your referral link and code">
        <div className="referral-share-copy"><span className="referral-share-kicker">YOUR PERSONAL INVITE</span><h3>One link.<br /><em>Your community.</em></h3><p>Send your link to someone you know. Their signup is connected to your referral code.</p><div className="referral-share-step"><span>01</span> Copy your link or code <span aria-hidden="true">/</span> 02 Share it <span aria-hidden="true">/</span> 03 Follow progress</div></div>
        <div className="referral-share-fields">
          <label className="referral-share-field"><span>SHARE LINK</span><div className="referral-share-input-row"><input aria-label="Your referral link" value={inviteLink} readOnly placeholder={referralCodesQuery.isLoading ? 'Generating your link…' : 'Your link will appear here'} /><button className="referral-copy-button" type="button" onClick={() => void handleCopy(inviteLink, 'link')} disabled={!inviteLink}>{copied === 'link' ? 'Copied' : 'Copy link'}</button></div></label>
          <label className="referral-share-field"><span>REFERRAL CODE</span><div className="referral-share-input-row"><input aria-label="Your referral code" value={inviteCode} readOnly placeholder="Code not available yet" /><button className="referral-copy-button referral-copy-button--light" type="button" onClick={() => void handleCopy(inviteCode, 'code')} disabled={!inviteCode}>{copied === 'code' ? 'Copied' : 'Copy code'}</button></div></label>
          {copyError && <p className="referral-copy-error" role="alert">{copyError}</p>}
          {copied && <p className="referral-copy-success" role="status">{copied === 'link' ? 'Invite link copied.' : 'Referral code copied.'}</p>}
          {inviteCode && <small className="referral-share-note">The invite link uses the first referral code currently returned for your account.</small>}
        </div>
      </section>

      <section className="referral-overview" aria-label="Referral performance">
        <article className="referral-overview-main"><span>COMMISSION EARNED</span><strong>{money(summary?.earnings)}</strong><small>Posted referral commissions</small></article>
        <article><span>TOTAL INVITES</span><strong>{summary?.total_invites ?? 0}</strong><small>People connected to your link</small></article>
        <article><span>ACTIVE INVITES</span><strong>{summary?.active_invites ?? 0}</strong><small>Currently active accounts</small></article>
        <article><span>TASK REBATE</span><strong>{money(summary?.task_rebate)}</strong><small>Tracked separately from commissions</small></article>
      </section>

      <section className="referral-performance-grid">
        <article className="member-panel referral-tier-panel">
          <div className="member-section-heading"><div><span className="member-eyebrow">COMMISSION VIEW</span><h3>By referral tier</h3><p>Amounts shown here come from your current summary.</p></div></div>
          <div className="referral-tier-list">{tierEarnings.map((tier, index) => <div className="referral-tier-row" key={tier.label}><span className="referral-tier-index">0{index + 1}</span><span>{tier.label} invitation earnings</span><strong>{tier.value === undefined ? '—' : money(tier.value)}</strong></div>)}</div>
          <p className="referral-rate-note">Commission rates can depend on current platform rules. Each credited transaction below displays the rate and eligible amount actually returned by the service.</p>
        </article>
        <article className="member-panel referral-direct-panel">
          <div className="member-section-heading"><div><span className="member-eyebrow">YOUR NETWORK</span><h3>People in your circle</h3><p>{activeInvites.length} records across the referral tiers · page {safeInvitePage} of {invitePageCount}</p></div></div>
          {activeInvites.length === 0 ? <div className="referral-empty"><span aria-hidden="true">01</span><strong>Your first connection starts here.</strong><p>Share your referral link to see invitees appear in this list.</p></div> : (
            <div className="referral-invite-list">{visibleInvites.map((invite, index) => <div className="referral-invite-row" key={`${invite.name}-${index}`}><span className="referral-invite-initial" aria-hidden="true">{invite.name?.trim().charAt(0).toUpperCase() || 'M'}</span><span className="referral-invite-person"><strong>{invite.name || 'Member'}</strong><small>Tier {invite.tier}</small></span><span className={`referral-status${invite.is_active ? ' is-active' : ''}`}>{invite.is_active ? 'Active' : 'Inactive'}</span></div>)}</div>
          )}
          {activeInvites.length > INVITES_PER_PAGE && <div className="referral-pagination"><button type="button" onClick={() => setCurrentInvitePage((page) => Math.max(1, page - 1))} disabled={safeInvitePage === 1}>← Previous</button><span>{safeInvitePage} / {invitePageCount}</span><button type="button" onClick={() => setCurrentInvitePage((page) => Math.min(invitePageCount, page + 1))} disabled={safeInvitePage === invitePageCount}>Next →</button></div>}
        </article>
      </section>

      <section className="member-panel referral-commission-panel">
        <div className="member-section-heading"><div><span className="member-eyebrow">ACCOUNT LEDGER</span><h3>Commission history</h3><p>Recorded referral credits with their source, actual rate and eligible base.</p></div><span className="referral-ledger-count">{commissionHistory.length} entries</span></div>
        {commissionHistory.length === 0 ? <div className="referral-empty referral-empty--compact"><strong>No commissions have been awarded yet.</strong><p>Eligible credits will appear here when they are posted to your account.</p></div> : (
          <div className="referral-ledger-list">
            <div className="referral-ledger-heading"><span>TRANSACTION</span><span>ELIGIBLE BASE</span><span>RATE</span><span>AMOUNT</span><span>DATE</span></div>
            {commissionHistory.map((entry) => <div className="referral-ledger-row" key={entry.id}><div><strong>Tier {entry.tier} · {sourceLabel(entry.source_type)}</strong><small>Referral commission</small></div><span data-label="Eligible base">{money(entry.eligible_amount)}</span><span data-label="Rate">{(entry.rate * 100).toFixed(2)}%</span><strong data-label="Amount">+{money(entry.amount)}</strong><time dateTime={entry.created_at} data-label="Date">{dateLabel(entry.created_at)}</time></div>)}
          </div>
        )}
      </section>

      <section className="referral-network-section"><ReferralNetwork /></section>
    </div>
  )
}
