import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  const isActive = (path: string) => location.pathname === path

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
    marginBottom: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: active ? 'white' : '#9197B3',
    backgroundColor: active ? '#5932EA' : 'transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  })

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )},
    { label: 'Product', path: '/training', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ), hasArrow: true },
    { label: 'Customers', path: '/tasks', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ), hasArrow: true },
    { label: 'Income', path: '/payments', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ), hasArrow: true },
    { label: 'Promote', path: '/referrals', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ), hasArrow: true },
    { label: 'Help', path: '/feedback', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ), hasArrow: true },
    { label: 'Settings', path: '/settings', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ), hasArrow: true },
  ]

  return (
    <div style={{
      display: 'flex', height: '100vh',
      backgroundColor: '#FAFBFF',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? (isMobile ? '280px' : '306px') : '0',
        minWidth: sidebarOpen ? (isMobile ? '280px' : '306px') : '0',
        flexShrink: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
        position: isMobile ? 'absolute' : 'relative',
        left: isMobile && !sidebarOpen ? '-280px' : '0',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '36px 28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '37px', height: '37px' }}>
            <svg width="37" height="37" viewBox="0 0 37 37" fill="none">
              <path d="M18.5 0.5L34.0885 9.5V27.5L18.5 36.5L2.91154 27.5V9.5L18.5 0.5Z" stroke="black" strokeWidth="2.5"/>
              <circle cx="18.5" cy="18.5" r="6" fill="black"/>
            </svg>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 600, color: 'black' }}>Dashboard <span style={{ fontSize: '10px', color: '#838383', verticalAlign: 'middle' }}>v.01</span></div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '0 28px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <Link key={item.label} to={item.path} style={navLinkStyle(isActive(item.path))}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.hasArrow && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </Link>
          ))}
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
        <div style={{ padding: isMobile ? '20px' : '40px 70px' }}>
          {/* Top Bar / Search */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
              {isMobile && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              )}
              <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 500, color: 'black' }}>Hello {firstName} 👋,</div>
            </div>
            
            <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
              <input
                type="text"
                placeholder="Search"
                style={{
                  width: isMobile ? '100%' : '216px', padding: '10px 10px 10px 40px',
                  backgroundColor: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '14px', color: '#B5B7C0', outline: 'none',
                  boxShadow: '0px 10px 60px rgba(226, 236, 249, 0.5)',
                  boxSizing: 'border-box',
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
