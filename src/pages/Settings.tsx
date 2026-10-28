import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../services/api'
import { queryKeys } from '../services/queryClient'
import { endSession } from '../services/session'

type Profile = {
  username: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  has_withdrawal_password: boolean
}
type AppConfig = { key: string; value: string }
type SessionUser = { is_trained?: boolean }

function apiMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

function externalHref(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export default function Settings({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const profileKey = queryKeys.profile
  const configKey = queryKeys.appConfig
  const profileQuery = useQuery({ queryKey: profileKey, queryFn: async () => (await api.get<Profile>('/settings/profile')).data, staleTime: 30_000 })
  const configQuery = useQuery({ queryKey: configKey, queryFn: async () => (await api.get<AppConfig[]>('/settings/config')).data, staleTime: 5 * 60_000 })
  const userQuery = useQuery({ queryKey: queryKeys.auth.currentUser, queryFn: async () => (await api.get<SessionUser>('/auth/me')).data, staleTime: 30_000 })

  const profile = profileQuery.data
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [certificateError, setCertificateError] = useState('')
  const isTrained = userQuery.data?.is_trained === true

  const profileMutation = useMutation({
    mutationFn: async () => (await api.put<Profile>('/settings/profile', { first_name: firstName, last_name: lastName })).data,
    onSuccess: async (saved) => {
      queryClient.setQueryData(profileKey, saved)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser })
      setEditing(false)
      toast.success('Profile updated.')
    },
  })
  const passwordMutation = useMutation({
    mutationFn: async () => api.post('/settings/withdrawal-password', {
      current_password: profile?.has_withdrawal_password ? currentPassword : null,
      new_password: newPassword,
    }),
    onSuccess: async () => {
      queryClient.setQueryData<Profile>(profileKey, (current) => current ? { ...current, has_withdrawal_password: true } : current)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError('')
      toast.success('Withdrawal password updated.')
    },
    onError: (error) => setPasswordError(apiMessage(error, 'The withdrawal password could not be updated.')),
  })

  const config = Object.fromEntries((Array.isArray(configQuery.data) ? configQuery.data : []).map((entry) => [entry.key, entry.value]))
  const links = [
    { key: 'telegram_link', label: 'Telegram' },
    { key: 'whatsapp_link', label: 'WhatsApp' },
    { key: 'support_ticket_url', label: 'Support desk' },
  ].map((item) => ({ ...item, href: externalHref(config[item.key]) })).filter((item) => item.href)

  const saveProfile = () => {
    if (!profile) return
    void profileMutation.mutate()
  }
  const savePassword = () => {
    setPasswordError('')
    if (profile?.has_withdrawal_password && !currentPassword) return setPasswordError('Enter your current withdrawal password first.')
    if (newPassword.length < 4) return setPasswordError('The server requires at least 4 characters.')
    if (newPassword !== confirmPassword) return setPasswordError('The new password and confirmation do not match.')
    passwordMutation.mutate()
  }
  const downloadCertificate = async () => {
    if (!isTrained) return
    setCertificateError('')
    try {
      const response = await api.get('/training/certificate', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'Pacecraft_Certificate.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setCertificateError(apiMessage(error, 'Certificate could not be downloaded. The server must confirm training eligibility.'))
    }
  }
  const signOut = async () => {
    await endSession()
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <main className="atlas-settings-page">
      <header className="atlas-settings-heading"><span className="member-eyebrow">ACCOUNT / CONTROL DESK</span><h1>Your account, clearly.</h1><p>Profile, payout security and official account links—all shown from service responses.</p></header>
      <div className="atlas-settings-columns">
        <section className="atlas-settings-primary">
          <article className="atlas-settings-card">
            <div className="atlas-settings-card-head"><div><span className="member-eyebrow">01 / IDENTITY</span><h2>Member record</h2></div><span className="atlas-settings-index">01</span></div>
            {profileQuery.isLoading ? <p role="status">Loading member record…</p> : profileQuery.isError || !profile ? <div className="member-notice member-notice--error" role="alert">Profile unavailable. No account data is assumed. <button type="button" onClick={() => void profileQuery.refetch()}>Retry profile</button></div> : editing ? <div className="atlas-settings-form">
              <label htmlFor="profile-first-name">First name</label><input id="profile-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" />
              <label htmlFor="profile-last-name">Last name</label><input id="profile-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" />
              <div className="atlas-settings-readonly"><span>Username</span><strong>{profile.username}</strong><small>This account identifier cannot be changed here.</small></div>
              {profileMutation.isError && <p className="member-notice member-notice--error" role="alert">{apiMessage(profileMutation.error, 'Profile could not be saved.')}</p>}
              <div className="atlas-settings-actions"><button className="member-button member-button--primary" type="button" onClick={saveProfile} disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Saving…' : 'Save profile'}</button><button className="member-button member-button--outline" type="button" onClick={() => setEditing(false)} disabled={profileMutation.isPending}>Cancel</button></div>
            </div> : <>
              <dl className="atlas-settings-details"><div><dt>Display name</dt><dd>{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Not provided'}</dd></div><div><dt>Username</dt><dd>{profile.username}</dd></div><div><dt>Email</dt><dd>{profile.email || 'Not provided'}</dd></div><div><dt>Phone</dt><dd>{profile.phone_number || 'Not provided'}</dd></div></dl>
              <button className="member-button member-button--outline" type="button" onClick={() => { setFirstName(profile.first_name || ''); setLastName(profile.last_name || ''); setEditing(true) }}>Edit profile</button>
            </>}
          </article>

          <article className="atlas-settings-card atlas-settings-card--security">
            <div className="atlas-settings-card-head"><div><span className="member-eyebrow">02 / PAYOUT SAFETY</span><h2>Withdrawal password</h2></div><span className={`atlas-settings-state${profile?.has_withdrawal_password ? ' is-set' : ''}`}>{profileQuery.isError ? 'Status unavailable' : profile?.has_withdrawal_password ? 'Configured' : 'Not configured'}</span></div>
            {profileQuery.isError ? <p>Retry your profile request to learn whether a password is already set.</p> : profile?.has_withdrawal_password && <><p>Current password is required by the service before replacing an existing payout password.</p><label htmlFor="withdraw-current-password">Current password</label><input id="withdraw-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></>}
            <div className="atlas-settings-form"><label htmlFor="withdraw-new-password">{profile?.has_withdrawal_password ? 'New password' : 'Set a password'}</label><input id="withdraw-new-password" type="password" autoComplete="new-password" minLength={4} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><label htmlFor="withdraw-confirm-password">Confirm new password</label><input id="withdraw-confirm-password" type="password" autoComplete="new-password" minLength={4} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {passwordError && <p className="member-notice member-notice--error" role="alert">{passwordError}</p>}
              <button className="member-button member-button--primary" type="button" onClick={savePassword} disabled={passwordMutation.isPending || profileQuery.isLoading || profileQuery.isError}>{passwordMutation.isPending ? 'Updating…' : profile?.has_withdrawal_password ? 'Replace withdrawal password' : 'Set withdrawal password'}</button>
            </div>
          </article>

          <article className="atlas-settings-card">
            <div className="atlas-settings-card-head"><div><span className="member-eyebrow">03 / LEARNING RECORD</span><h2>Certificate</h2></div><span className="atlas-settings-index">03</span></div>
            {userQuery.isLoading ? <p role="status">Checking training record…</p> : userQuery.isError ? <div className="member-notice member-notice--error" role="alert">Training eligibility is unknown. <button type="button" onClick={() => void userQuery.refetch()}>Retry</button></div> : <><p>{isTrained ? 'The account service reports training complete.' : 'The account service does not report training complete yet.'}</p><button className="member-button member-button--outline" type="button" disabled={!isTrained} onClick={() => void downloadCertificate()}>{isTrained ? 'Download official certificate' : 'Certificate unavailable'}</button></>}
            {certificateError && <p className="member-notice member-notice--error" role="alert">{certificateError}</p>}
          </article>
        </section>

        <aside className="atlas-settings-aside">
          <section className="atlas-settings-card atlas-settings-links"><div className="atlas-settings-card-head"><div><span className="member-eyebrow">04 / SUPPORT</span><h2>Verified links</h2></div></div>
            {configQuery.isLoading ? <p role="status">Loading configured links…</p> : configQuery.isError ? <div className="member-notice member-notice--error" role="alert">Support links unavailable. <button type="button" onClick={() => void configQuery.refetch()}>Retry</button></div> : links.length ? <ul>{links.map((item) => <li key={item.key}><a href={item.href!} target="_blank" rel="noopener noreferrer">{item.label}<span aria-hidden="true">↗</span></a></li>)}</ul> : <p>No public support or community links are configured.</p>}
            <p className="atlas-settings-footnote">Only HTTPS links supplied by the configuration service are shown. No membership in external groups is implied.</p>
          </section>
          <section className="atlas-settings-card atlas-settings-session"><span className="member-eyebrow">05 / SESSION</span><h2>Leave this device?</h2><p>Signing out ends this session. You will need to authenticate again to open the member workspace.</p><button className="member-button member-button--outline" type="button" onClick={() => void signOut()}>Sign out</button></section>
        </aside>
      </div>
    </main>
  )
}
