import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [trainingOpen, setTrainingOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/training')) {
      setTrainingOpen(true)
    }
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path
  const isTrainingActive = location.pathname.startsWith('/training')

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const userEmail = localStorage.getItem('user_email') || 'elijahkimani1293@gmail.com'
  const firstName = localStorage.getItem('user_first_name') || 'kim'
  const lastName = localStorage.getItem('user_last_name') || 'ff'
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 10px',
    borderRadius: '6px',
    marginBottom: '2px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    color: active ? 'white' : '#94a3b8',
    backgroundColor: active ? '#1e293b' : 'transparent',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{
      display: 'flex', height: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '220px' : '0',
        minWidth: sidebarOpen ? '220px' : '0',
        flexShrink: 0,
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 50 : 'auto' as any,
        top: 0,
        left: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', backgroundColor: '#6366f1', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', lineHeight: 1.3, whiteSpace: 'nowrap' }}>Adpulse AI</div>
              <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Labels</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: '6px' }}>
            Navigation
          </div>

          {/* Dashboard */}
          <Link to="/dashboard" onClick={() => isMobile && setSidebarOpen(false)} style={navLinkStyle(isActive('/dashboard'))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>

          {/* Training collapsible */}
          <div style={{ marginBottom: '2px' }}>
            <button
              onClick={() => setTrainingOpen(!trainingOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '7px 10px', borderRadius: '6px',
                background: isTrainingActive ? '#1e293b' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                color: isTrainingActive ? 'white' : '#94a3b8',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span style={{ flex: 1, textAlign: 'left' }}>Training</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: trainingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {trainingOpen && (
              <div style={{ paddingLeft: '22px', marginTop: '2px' }}>
                <Link to="/training" onClick={() => isMobile && setSidebarOpen(false)}
                  style={{ ...navLinkStyle(isActive('/training')), fontSize: '12px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  Certifications
                </Link>
                <Link to="/training/hub" onClick={() => isMobile && setSidebarOpen(false)}
                  style={{ ...navLinkStyle(isActive('/training/hub')), fontSize: '12px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Learning Hub
                </Link>
              </div>
            )}
          </div>

          {/* Tasks */}
          <Link to="/tasks" onClick={() => isMobile && setSidebarOpen(false)} style={navLinkStyle(isActive('/tasks'))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Tasks
          </Link>

          {/* Referrals */}
          <Link to="/referrals" onClick={() => isMobile && setSidebarOpen(false)} style={navLinkStyle(isActive('/referrals'))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Referrals
          </Link>

          {/* Payments */}
          <Link to="/payments" onClick={() => isMobile && setSidebarOpen(false)} style={navLinkStyle(isActive('/payments'))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Payments
          </Link>

          {/* Feedback */}
          <Link to="/feedback" onClick={() => isMobile && setSidebarOpen(false)} style={navLinkStyle(isActive('/feedback'))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Feedback
          </Link>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <Link to="/settings" onClick={() => isMobile && setSidebarOpen(false)}
            style={{ ...navLinkStyle(isActive('/settings')), padding: '10px 18px', borderRadius: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </Link>

          <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {firstName} {lastName}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </div>
            </div>
            <button onClick={handleSignOut} title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          backgroundColor: 'white', borderBottom: '1px solid #e5e7eb',
          padding: '0 20px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '4px', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 28px' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
