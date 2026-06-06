import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Profile {
  first_name: string
  last_name: string
  email: string
  has_withdrawal_password: bool
}

interface AppConfig {
  key: string
  value: string
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '12px',
  border: '1px solid var(--border-main)',
  padding: '24px',
  boxShadow: 'var(--card-shadow)',
}

export default function Settings({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // Withdrawal Password States
  const [currentWithdrawalPassword, setCurrentWithdrawalPassword] = useState('')
  const [newWithdrawalPassword, setNewWithdrawalPassword] = useState('')
  const [confirmWithdrawalPassword, setConfirmWithdrawalPassword] = useState('')
  const [settingWithdrawalPassword, setSettingWithdrawalPassword] = useState(false)
  
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, configRes] = await Promise.all([
          api.get('/settings/profile'),
          api.get('/settings/config')
        ])
        setProfile(profileRes.data)
        setFirstName(profileRes.data.first_name || '')
        setLastName(profileRes.data.last_name || '')
        
        const configMap: Record<string, string> = {}
        if (Array.isArray(configRes.data)) {
          configRes.data.forEach((c: AppConfig) => { configMap[c.key] = c.value })
        }
        setConfigs(configMap)
      } catch (err) {
        console.error('Failed to fetch settings', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings/profile', { first_name: firstName, last_name: lastName })
      setProfile({ ...profile!, first_name: firstName, last_name: lastName })
      setEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleUpdateWithdrawalPassword = async () => {
    const hasExisting = profile?.has_withdrawal_password
    
    if (hasExisting && !currentWithdrawalPassword) {
      alert('Please enter your current withdrawal password')
      return
    }
    if (!newWithdrawalPassword || newWithdrawalPassword.length < 4) {
      alert('New password must be at least 4 characters')
      return
    }
    if (newWithdrawalPassword !== confirmWithdrawalPassword) {
      alert('New passwords do not match')
      return
    }

    setSettingWithdrawalPassword(true)
    try {
      await api.post('/settings/withdrawal-password', {
        current_password: hasExisting ? currentWithdrawalPassword : null,
        new_password: newWithdrawalPassword
      })
      alert('Withdrawal password updated successfully!')
      setCurrentWithdrawalPassword('')
      setNewWithdrawalPassword('')
      setConfirmWithdrawalPassword('')
      // Refresh profile to update has_withdrawal_password state
      const profileRes = await api.get('/settings/profile')
      setProfile(profileRes.data)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update withdrawal password')
    } finally {
      setSettingWithdrawalPassword(false)
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
      alert('Failed to download certificate. Please ensure training is completed.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="loading-spinner" /></div>

  const isTrained = localStorage.getItem('user_is_trained') === 'true'
  const hasWithdrawalPass = profile?.has_withdrawal_password

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Manage your account, security, and community connections.</p>
      </div>

      {/* Profile Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Profile Information</h2>
        </div>
        
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={profile?.email || ''} disabled style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setEditing(false)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Full Name</p><p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{profile?.first_name} {profile?.last_name}</p></div>
              <div><p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase' }}>Email</p><p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>{profile?.email}</p></div>
            </div>
            <button onClick={() => setEditing(true)} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Edit Profile</button>
          </div>
        )}
      </div>

      {/* Support & Community Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤝</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Support & Community</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 20px' }}>Connect for assistance, announcements, and chats. Join our active community groups or reach out directly for 24/7 support.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <a href={configs.telegram_link || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', backgroundColor: '#0088cc', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            Join Telegram
          </a>
          <a href={`https://wa.me/${configs.whatsapp_number?.replace(/\+/g, '') || ''}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', backgroundColor: '#25D366', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM6.07 17.05l-.2-.34c-.76-1.27-1.16-2.73-1.16-4.23 0-4.43 3.61-8.04 8.04-8.04 2.15 0 4.16.84 5.67 2.35 1.51 1.51 2.35 3.52 2.35 5.67 0 4.43-3.61 8.04-8.04 8.04-1.5 0-2.96-.4-4.23-1.16l-.34-.2-3.14.82.83-3.06z"/></svg>
            WhatsApp Support
          </a>
        </div>
      </div>

      {/* Help Center Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎫</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Help Center</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 20px' }}>Need direct help? If you have questions regarding your plan, tasks, or payments, open a live chat ticket.</p>
        <a href={configs.support_ticket_url || '#'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', backgroundColor: 'var(--bg-main)', color: 'var(--text-heading)', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', border: '1px solid var(--border-main)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Open Support Ticket
        </a>
      </div>

      {/* Security Section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛡️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Withdrawal Security</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {hasWithdrawalPass ? (
            <>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Update your existing withdrawal password to keep your funds secure.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="password" placeholder="Current Withdrawal Password" value={currentWithdrawalPassword} onChange={(e) => setCurrentWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
                <input type="password" placeholder="New Withdrawal Password" value={newWithdrawalPassword} onChange={(e) => setNewWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
                <input type="password" placeholder="Confirm New Withdrawal Password" value={confirmWithdrawalPassword} onChange={(e) => setConfirmWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Set a withdrawal password to protect your funds. This password will be required for all payout requests.</p>
              <input type="password" placeholder="Enter new withdrawal password" value={newWithdrawalPassword} onChange={(e) => setNewWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              <input type="password" placeholder="Confirm withdrawal password" value={confirmWithdrawalPassword} onChange={(e) => setConfirmWithdrawalPassword(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border-main)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
            </>
          )}
          
          <button onClick={handleUpdateWithdrawalPassword} disabled={settingWithdrawalPassword || !newWithdrawalPassword || newWithdrawalPassword !== confirmWithdrawalPassword} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 700, backgroundColor: '#14B8A6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (settingWithdrawalPassword || !newWithdrawalPassword || newWithdrawalPassword !== confirmWithdrawalPassword) ? 0.6 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {settingWithdrawalPassword ? 'Updating...' : hasWithdrawalPass ? 'Update Password' : 'Set Password'}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Withdrawal passwords must be at least 4 characters long. Never share this password with anyone.</p>
        </div>
      </div>

      {/* Certificate Section */}
      {isTrained && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Training Certificate</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>You have successfully completed your training</p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', margin: '0 0 16px' }}>Download your official Video Reviewing Mastery certificate to showcase your professional skills.</p>
          <button onClick={handleDownloadCertificate} disabled={downloading} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', opacity: downloading ? 0.7 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {downloading ? 'Downloading...' : 'Download Certificate (PDF)'}
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div style={{ ...cardStyle, borderColor: 'rgba(220, 38, 38, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔐</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Account Management</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={handleSignOut} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, backgroundColor: 'transparent', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
          <button onClick={() => { if (window.confirm('Are you sure? This cannot be undone.')) api.delete('/settings/account').then(handleSignOut) }} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700, backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', textDecoration: 'underline' }}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}
