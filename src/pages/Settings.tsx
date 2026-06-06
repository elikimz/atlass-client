import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Profile {
  first_name: string
  last_name: string
  email: string
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '10px',
  border: '1px solid var(--border-main)',
  padding: '24px',
}

export default function Settings({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [withdrawalPassword, setWithdrawalPassword] = useState('')
  const [settingWithdrawalPassword, setSettingWithdrawalPassword] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    api.get('/settings/profile')
      .then((r) => {
        setProfile(r.data)
        setFirstName(r.data.first_name || '')
        setLastName(r.data.last_name || '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/profile', { first_name: firstName, last_name: lastName })
      setProfile({ ...profile!, first_name: firstName, last_name: lastName })
      setEditing(false)
      localStorage.setItem('user_first_name', firstName)
      localStorage.setItem('user_last_name', lastName)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleSetWithdrawalPassword = async () => {
    if (!withdrawalPassword) return
    setSettingWithdrawalPassword(true)
    try {
      await api.post('/settings/withdrawal-password', { password: withdrawalPassword })
      alert('Withdrawal password set successfully!')
      setWithdrawalPassword('')
    } catch (err) {
      console.error(err)
      alert('Failed to set withdrawal password')
    } finally {
      setSettingWithdrawalPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await api.delete('/settings/account')
        handleSignOut()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleDownloadCertificate = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await api.get('/training/certificate', { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'AdPulseAI_Certificate.pdf')
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error('Failed to download certificate', err)
      alert('Failed to download certificate. Please ensure training is completed.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="loading-container">
          <div className="loading-bar-bg" style={{ width: '150px' }}>
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Loading your profile...</p>
        </div>
      </div>
    )
  }

  const isTrained = localStorage.getItem('user_is_trained') === 'true'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Manage your account and preferences.</p>
      </div>

      {isTrained && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>🎓</span>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Training Certificate</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>You have successfully completed your training</p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', margin: '0 0 12px' }}>Download your official Video Reviewing Mastery certificate to showcase your skills.</p>
          <button onClick={handleDownloadCertificate} disabled={downloading} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: downloading ? 0.7 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {downloading ? 'Downloading...' : 'Download Certificate (PDF)'}
          </button>
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '18px' }}>👤</span>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Profile</h2>
        </div>
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave() }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '7px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '7px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Email</label>
              <input type="email" value={profile?.email || ''} disabled style={{ width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '7px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed', boxSizing: 'border-box' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Contact support to update your email address.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={saving} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '7px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px' }}>First Name</p><p style={{ fontSize: '14px', color: 'var(--text-heading)', margin: 0 }}>{profile?.first_name || 'Not set'}</p></div>
            <div><p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px' }}>Last Name</p><p style={{ fontSize: '14px', color: 'var(--text-heading)', margin: 0 }}>{profile?.last_name || 'Not set'}</p></div>
            <div><p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 4px' }}>Email</p><p style={{ fontSize: '14px', color: 'var(--text-heading)', margin: 0 }}>{profile?.email}</p></div>
            <button onClick={() => setEditing(true)} style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit Profile</button>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>💬</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Discord</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Connect for support and announcements</p>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', margin: '0 0 12px' }}>Join our Discord server for support, announcements, and to connect with the team.</p>
        <button style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>Connect Discord</button>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '18px' }}>💳</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Withdrawal Accounts</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Manage your payout destinations</p>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-main)', margin: '0 0 12px' }}>Add and manage your crypto wallets and mobile money accounts for withdrawals.</p>
        <button onClick={() => navigate('/withdrawal-accounts')} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>Manage Accounts</button>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Security</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Protect your funds</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>Withdrawal Password</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="password" placeholder="Set new withdrawal password" value={withdrawalPassword} onChange={(e) => setWithdrawalPassword(e.target.value)} style={{ flex: 1, padding: '8px 12px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '7px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
            <button onClick={handleSetWithdrawalPassword} disabled={!withdrawalPassword || settingWithdrawalPassword} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', opacity: (!withdrawalPassword || settingWithdrawalPassword) ? 0.6 : 1 }}>{settingWithdrawalPassword ? 'Saving...' : 'Set'}</button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>This password is required for all withdrawals. Keep it safe.</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '18px' }}>🔐</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Account</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Manage your account settings</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleSignOut} style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '7px', cursor: 'pointer' }}>Sign Out</button>
          <button onClick={handleDeleteAccount} style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: 'transparent', color: '#6B7280', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'underline' }}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}
