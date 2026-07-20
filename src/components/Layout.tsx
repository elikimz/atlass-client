import { useState, useEffect, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { endSession, persistUser } from '../services/session'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  username: string
  role: string
  is_admin: boolean
  is_trained: boolean
}

interface NotificationSummary {
  is_read: boolean
}

function isUnauthorizedError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'response' in error
    && (error as { response?: { status?: number } }).response?.status === 401
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [user, setUser] = useState<UserData | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleSignOut = useCallback(async () => {
    await endSession()
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate, setIsAuthenticated])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications')
        const notifications = Array.isArray(res.data) ? res.data as NotificationSummary[] : []
        const count = notifications.filter((notification) => !notification.is_read).length
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to fetch unread count:', err)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)

    // Fetch real user data from backend
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
        persistUser(res.data)
      } catch (error: unknown) {
        console.error('Failed to fetch user data:', error)
        if (isUnauthorizedError(error)) {
          void handleSignOut()
        }
      }
    }
    
    fetchUser()

    return () => window.removeEventListener('resize', handleResize)
  }, [handleSignOut])

  const firstName = user?.first_name || localStorage.getItem('user_first_name') || 'User'
  const lastName = user?.last_name || localStorage.getItem('user_last_name') || ''
  const userEmail = user?.email || localStorage.getItem('user_email') || ''
  const isAdminUser = user?.is_admin || localStorage.getItem('user_is_admin') === 'true'
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
    { label: 'Training', path: '/training', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    )},
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
    { label: 'Admin', path: '/admin', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
      </svg>
    )},
  ]

  const isActive = (path: string) => location.pathname === path

  const mobileNavItems = navItems.filter(item => (item.label !== 'Admin' || isAdminUser) && item.label !== 'Settings')

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Sidebar (Desktop Only) */}
      {!isMobile && (
        <div style={{
          width: '280px',
          minWidth: '280px',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.02)',
          zIndex: 20,
        }}>
          <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/assets/logo.png" alt="AdPulseAI Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
            </div>
            <ThemeToggle />
          </div>

          <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
            {navItems.filter(item => item.label !== 'Admin' || isAdminUser).map((item) => (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive(item.path) ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive(item.path) ? 'var(--accent-primary)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ color: 'inherit', position: 'relative' }}>
                  {item.icon}
                  {item.label === 'Dashboard' && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '16px',
                      height: '16px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-card)',
                      fontWeight: 'bold',
                      padding: '0 2px'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border-main)' }}>
            <button 
              onClick={handleSignOut}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                backgroundColor: 'rgba(208, 0, 75, 0.1)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '14px', fontWeight: 600, color: '#D0004B',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '16px 20px' : '20px 40px',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--card-shadow)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/assets/logo.png" alt="AdPulseAI Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
              </div>
            )}
            {!isMobile && (
              <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-main)' }}>Overview</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && <ThemeToggle />}
            <NotificationBell />

            <div 
              onClick={() => navigate('/settings')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {initials}
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{firstName} {lastName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
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
          display: 'flex', alignItems: 'center',
          backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-main)', height: '75px', zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '0 5px'
        }}>
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            height: '100%',
            alignItems: 'center'
          }}>
            {mobileNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  textDecoration: 'none', color: isActive(item.path) ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: '10px', fontWeight: 500,
                  flexShrink: 0,
                  flex: 1,
                  height: '100%',
                  minWidth: '60px'
                }}
              >
                <div style={{ color: 'inherit', transform: 'scale(0.85)', position: 'relative' }}>
                  {item.icon}
                  {item.label === 'Dashboard' && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-8px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '16px',
                      height: '16px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-card)',
                      fontWeight: 'bold',
                      padding: '0 2px'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                  {item.label === 'Payments' ? 'Pay' : item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
