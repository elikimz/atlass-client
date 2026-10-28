import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import './ReferralNetwork.css'
import { formatCash } from '../services/money'

type TierKey = 'A' | 'B' | 'C'

type NetworkMember = {
  id: number
  name: string
  username: string
  member_id: string
  tier: TierKey
  sponsor_name: string | null
  sponsor_username: string | null
  membership_level: string
  plan_name: string | null
  investment_status: 'Invested' | 'Not invested'
  amount_invested: number
  registration_date: string | null
  account_status: 'Active' | 'Inactive'
  has_upgraded: boolean
}

type NetworkLevel = { level: string; total: number; invested: number }
type NetworkTier = {
  total: number
  invested: number
  not_invested: number
  active: number
  inactive: number
  levels: NetworkLevel[]
  members: NetworkMember[]
}
type NetworkData = {
  overview: {
    total: number
    invested: number
    not_invested: number
    active: number
    inactive: number
    tier_a: number
    tier_b: number
    tier_c: number
  }
  tiers: Record<TierKey, NetworkTier>
}

const TIER_META: Record<TierKey, { label: string; description: string }> = {
  A: { label: 'Tier A', description: 'Direct referrals' },
  B: { label: 'Tier B', description: 'Second-level referrals' },
  C: { label: 'Tier C', description: 'Third-level referrals' },
}
const PAGE_SIZE = 8

function money(value: number) {
  return formatCash(value)
}

function date(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function MetricCard({ label, value, detail, tone = 'default' }: { label: string; value: number; detail?: string; tone?: 'default' | 'positive' | 'muted' }) {
  return (
    <div className={`network-metric network-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}

export default function ReferralNetwork() {
  const [tier, setTier] = useState<TierKey>('A')
  const [expanded, setExpanded] = useState<Record<TierKey, boolean>>({ A: true, B: false, C: false })
  const [search, setSearch] = useState('')
  const [membership, setMembership] = useState('all')
  const [investment, setInvestment] = useState('all')
  const [accountStatus, setAccountStatus] = useState('all')
  const [page, setPage] = useState(1)

  const networkQuery = useQuery({
    queryKey: queryKeys.referrals.network,
    queryFn: async () => (await api.get<NetworkData>('/referrals/network')).data,
    staleTime: 60 * 1000,
  })
  const network = networkQuery.data
  const selectedTier = network?.tiers[tier]
  const selectedMembers = useMemo(() => selectedTier?.members ?? [], [selectedTier?.members])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return selectedMembers.filter((member) => {
      const matchesSearch = !query || [member.name, member.username, member.member_id, member.sponsor_name ?? ''].some((value) => value.toLowerCase().includes(query))
      const matchesMembership = membership === 'all' || member.membership_level === membership
      const matchesInvestment = investment === 'all' || member.investment_status === investment
      const matchesStatus = accountStatus === 'all' || member.account_status === accountStatus
      return matchesSearch && matchesMembership && matchesInvestment && matchesStatus
    })
  }, [accountStatus, investment, membership, search, selectedMembers])

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const visibleMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const maxLevelCount = Math.max(...(selectedTier?.levels ?? []).map((level) => level.total), 1)

  const changeTier = (nextTier: TierKey) => {
    setTier(nextTier)
    setPage(1)
    setExpanded((current) => ({ ...current, [nextTier]: true }))
  }
  const resetFilters = () => {
    setSearch('')
    setMembership('all')
    setInvestment('all')
    setAccountStatus('all')
    setPage(1)
  }

  if (networkQuery.isLoading) {
    return <section className="network-card network-loading" aria-label="Referral network"><div className="network-spinner" /><span>Loading your referral network…</span></section>
  }

  if (networkQuery.isError || !network) {
    return (
      <section className="network-card network-error" aria-labelledby="network-title">
        <div><span className="network-kicker">Referral network</span><h2 id="network-title">Your downline network</h2><p>We couldn’t load your network right now. Your existing dashboard is still available.</p></div>
        <button type="button" onClick={() => void networkQuery.refetch()}>Try again</button>
      </section>
    )
  }

  const overview = network.overview
  return (
    <section className="network-card" aria-labelledby="network-title">
      <div className="network-heading">
        <div><span className="network-kicker">Referral network</span><h2 id="network-title">Know your network at a glance.</h2><p>Private, member-scoped view of your first three referral levels. Totals update from registered accounts and confirmed plan purchases.</p></div>
        <button className="network-refresh" type="button" onClick={() => void networkQuery.refetch()}>Refresh</button>
      </div>

      <div className="network-metrics">
        <MetricCard label="Total downlines" value={overview.total} detail={`${overview.active} active · ${overview.inactive} inactive`} />
        <MetricCard label="Invested members" value={overview.invested} detail={`${overview.not_invested} not invested`} tone="positive" />
        <MetricCard label="Tier A" value={overview.tier_a} detail="Direct referrals" />
        <MetricCard label="Tier B" value={overview.tier_b} detail="Second level" />
        <MetricCard label="Tier C" value={overview.tier_c} detail="Third level" />
      </div>

      <div className="network-tabs" role="tablist" aria-label="Referral tiers">
        {(['A', 'B', 'C'] as TierKey[]).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={tier === key} className={tier === key ? 'is-selected' : ''} onClick={() => changeTier(key)}>
            <strong>{TIER_META[key].label}</strong><span>{TIER_META[key].description}</span><b>{network.tiers[key].total}</b>
          </button>
        ))}
      </div>

      <div className="network-tier-header">
        <div><h3>{TIER_META[tier].label} · {TIER_META[tier].description}</h3><p>{selectedTier?.invested ?? 0} invested · {selectedTier?.not_invested ?? 0} not invested · {selectedTier?.active ?? 0} active</p></div>
        <button type="button" className="network-expand" onClick={() => setExpanded((current) => ({ ...current, [tier]: !current[tier] }))}>{expanded[tier] ? 'Hide member list' : 'View full member list'}</button>
      </div>

      <div className="network-levels" aria-label={`${TIER_META[tier].label} membership breakdown`}>
        {(selectedTier?.levels ?? []).map((level) => (
          <div className="network-level" key={level.level}>
            <div className="network-level-label"><span>{level.level}</span><strong>{level.total}</strong></div>
            <div className="network-level-track"><i style={{ width: `${(level.total / maxLevelCount) * 100}%` }} /></div>
            <small>{level.invested} invested</small>
          </div>
        ))}
      </div>

      {expanded[tier] && (
        <div className="network-list-area">
          <div className="network-filters">
            <label className="network-search"><span className="sr-only">Search members</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name, username, member ID…" /></label>
            <select aria-label="Filter membership level" value={membership} onChange={(event) => { setMembership(event.target.value); setPage(1) }}><option value="all">All membership levels</option>{(selectedTier?.levels ?? []).map((level) => <option key={level.level} value={level.level}>{level.level}</option>)}</select>
            <select aria-label="Filter investment status" value={investment} onChange={(event) => { setInvestment(event.target.value); setPage(1) }}><option value="all">All investment status</option><option value="Invested">Invested</option><option value="Not invested">Not invested</option></select>
            <select aria-label="Filter account status" value={accountStatus} onChange={(event) => { setAccountStatus(event.target.value); setPage(1) }}><option value="all">All account status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
            {(search || membership !== 'all' || investment !== 'all' || accountStatus !== 'all') && <button type="button" className="network-clear" onClick={resetFilters}>Clear</button>}
          </div>

          <div className="network-table-wrap">
            <table className="network-table"><thead><tr><th>Member</th><th>Level</th><th>Investment</th><th>Joined</th><th>Status</th></tr></thead><tbody>
              {visibleMembers.map((member) => <tr key={member.id}>
                <td><div className="network-member"><span>{member.name.charAt(0).toUpperCase()}</span><div><strong>{member.name}</strong><small>@{member.username} · {member.member_id}</small>{member.sponsor_username && <em>Sponsor: @{member.sponsor_username}</em>}</div></div></td>
                <td><strong>{member.membership_level}</strong><small>{member.plan_name || 'No plan'}</small></td>
                <td><strong className={member.investment_status === 'Invested' ? 'network-invested' : 'network-not-invested'}>{member.investment_status}</strong><small>{member.amount_invested > 0 ? money(member.amount_invested) : '—'}{member.has_upgraded ? ' · upgraded' : ''}</small></td>
                <td>{date(member.registration_date)}</td>
                <td><span className={`network-status network-status-${member.account_status.toLowerCase()}`}>{member.account_status}</span></td>
              </tr>)}
              {visibleMembers.length === 0 && <tr><td colSpan={5}><div className="network-empty">No members match these filters.</div></td></tr>}
            </tbody></table>
          </div>
          <div className="network-pagination"><span>Showing {visibleMembers.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><strong>Page {page} of {pageCount}</strong><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button></div></div>
        </div>
      )}
      <p className="network-footnote">Investment means a confirmed plan purchase in the member record. Registration alone, pending payments, or a referral signup do not count as invested.</p>
    </section>
  )
}
