import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ThemeToggle from './ThemeToggle'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  is_admin: boolean
  is_trained: boolean
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)

    api.get('/auth/me')
      .then(res => {
        setUser(res.data)
        localStorage.setItem('user_first_name', res.data.first_name)
        localStorage.setItem('user_last_name', res.data.last_name)
        localStorage.setItem('user_email', res.data.email)
        localStorage.setItem('user_is_admin', res.data.is_admin ? 'true' : 'false')
        localStorage.setItem('user_is_trained', res.data.is_trained ? 'true' : 'false')
      })
      .catch(err => {
        console.error('Failed to fetch user data:', err)
        if (err.response?.status === 401) {
          handleSignOut()
        }
      })

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'User'
  const lastName = user?.last_name || localStorage.getItem('user_last_name') || ''
  const userEmail = user?.email || localStorage.getItem('user_email') || ''
  const isAdminUser = user?.is_admin || localStorage.getItem('user_is_admin') === 'true'
  const isTrainedUser = user !== null ? user.is_trained : localStorage.getItem('user_is_trained') === 'true'
  const initials = `${firstName.charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )},
    { label: 'My Tasks', path: '/tasks', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )},
    { label: 'Plans', path: '/plans', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )},
    { label: 'Invite', path: '/referrals', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
      </svg>
    )},
    isTrainedUser
      ? {
          label: 'Certificate',
          path: '/training',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          )
        }
      : {
          label: 'Training',
          path: '/training',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          )
        },
    { label: 'Payments', path: '/payments', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
    { label: 'Settings', path: '/settings', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <div style={{
          width: '306px',
          minWidth: '306px',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--sidebar-shadow)',
          zIndex: 20,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
        }}>
          <div style={{ padding: '36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/assets/logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
            </div>
            <ThemeToggle />
          </div>

          <div style={{ flex: 1, padding: '0 28px', overflowY: 'auto' }}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive(item.path) ? '#FFFFFF' : 'var(--text-muted)',
                  backgroundColor: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ color: isActive(item.path) ? '#FFFFFF' : 'var(--text-muted)' }}>{item.icon}</div>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {isAdminUser && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  marginTop: '24px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive('/admin') ? '#FFFFFF' : 'var(--text-muted)',
                  backgroundColor: isActive('/admin') ? 'var(--accent-primary)' : 'var(--bg-main)',
                  border: '1px dashed var(--border-main)',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{
              background: 'linear-gradient(107.91deg, #EAABF0 7.37%, #4623E9 95.19%)',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Upgrade to PRO to get all features!</p>
              <button style={{
                backgroundColor: 'white', color: '#4925E9', border: 'none', borderRadius: '12px',
                padding: '10px 24px', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
              }}>Upgrade Now</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{firstName} {lastName}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
              </div>
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar (Mobile Only) */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-sidebar)',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/assets/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThemeToggle />
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? '80px' : '0' }}>
          <div style={{ padding: isMobile ? '20px' : '40px' }}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-main)',
          height: '70px', zIndex: 100,
        }}>
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                textDecoration: 'none', color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontSize: '10px', fontWeight: 600,
              }}
            >
              <div style={{ color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
