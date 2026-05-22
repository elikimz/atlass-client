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
  const firstName = localStorage.getItem('user_first_name') || 'Kim'
  const lastName = localStorage.getItem('user_last_name') || 'FF'
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: active ? 'white' : '#9197B3',
    backgroundColor: active ? '#5932EA' : 'transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div style={{
      display: 'flex', height: '100vh',
      backgroundColor: '#FAFBFF',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '306px' : '0',
        minWidth: sidebarOpen ? '306px' : '0',
        flexShrink: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '36px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '37px', height: '37px', backgroundColor: '#5932EA', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 600, color: 'black' }}>Adpulse AI <span style={{ fontSize: '10px', color: '#838383', verticalAlign: 'middle' }}>v.01</span></div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '0 28px', overflowY: 'auto' }}>
          {/* Dashboard */}
          <Link to="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Dashboard</span>
          </Link>

          {/* Training */}
          <div>
            <button
              onClick={() => setTrainingOpen(!trainingOpen)}
              style={{
                ...navLinkStyle(isTrainingActive),
                width: '100%', border: 'none', cursor: 'pointer',
                backgroundColor: isTrainingActive ? '#5932EA' : 'transparent',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span style={{ flex: 1, textAlign: 'left' }}>Training</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: trainingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {trainingOpen && (
              <div style={{ paddingLeft: '24px', marginTop: '4px' }}>
                <Link to="/training" style={navLinkStyle(isActive('/training'))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span>Certifications</span>
                </Link>
                <Link to="/training/hub" style={navLinkStyle(isActive('/training/hub'))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>Learning Hub</span>
                </Link>
              </div>
            )}
          </div>

          {/* Tasks */}
          <Link to="/tasks" style={navLinkStyle(isActive('/tasks'))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>Tasks</span>
          </Link>

          {/* Referrals */}
          <Link to="/referrals" style={navLinkStyle(isActive('/referrals'))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Referrals</span>
          </Link>

          {/* Payments */}
          <Link to="/payments" style={navLinkStyle(isActive('/payments'))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>Payments</span>
          </Link>

          {/* Settings */}
          <Link to="/settings" style={navLinkStyle(isActive('/settings'))}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Settings</span>
          </Link>
        </div>

        {/* User Profile */}
        <div style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #F0F0F0' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            backgroundColor: '#F2EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600, color: '#5932EA',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{firstName} {lastName}</div>
            <div style={{ fontSize: '12px', color: '#757575', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
          </div>
          <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#757575', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <div style={{ padding: '40px 70px' }}>
          {/* Top Bar / Search */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, color: 'black' }}>Hello {firstName} 👋,</div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search"
                style={{
                  width: '216px', padding: '10px 10px 10px 40px',
                  backgroundColor: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '14px', color: '#B5B7C0', outline: 'none',
                  boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
                }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
