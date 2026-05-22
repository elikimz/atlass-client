import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const firstName = localStorage.getItem('user_first_name') || 'Elijah'
  const lastName = localStorage.getItem('user_last_name') || 'Kimani'
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
    { label: 'Product', path: '/product', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ), hasArrow: true },
    { label: 'Customers', path: '/customers', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ), hasArrow: true },
    { label: 'Income', path: '/income', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ), hasArrow: true },
    { label: 'Promote', path: '/promote', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ), hasArrow: true },
    { label: 'Help', path: '/help', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ), hasArrow: true },
  ]

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
            width: '37px', height: '37px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="37" height="37" viewBox="0 0 37 37" fill="none">
              <path d="M18.5 0C8.28274 0 0 8.28274 0 18.5C0 28.7173 8.28274 37 18.5 37C28.7173 37 37 28.7173 37 18.5C37 8.28274 28.7173 0 18.5 0ZM27.4881 26.2441C27.0238 26.7083 26.2798 26.7083 25.8155 26.2441L18.5 18.9286L11.1845 26.2441C10.7202 26.7083 9.97619 26.7083 9.5119 26.2441C9.04762 25.7798 9.04762 25.0357 9.5119 24.5714L16.8274 17.256L9.5119 9.94048C9.04762 9.47619 9.04762 8.73214 9.5119 8.26786C9.97619 7.80357 10.7202 7.80357 11.1845 8.26786L18.5 15.5833L25.8155 8.26786C26.2798 7.80357 27.0238 7.80357 27.4881 8.26786C27.9524 8.73214 27.9524 9.47619 27.4881 9.94048L20.1726 17.256L27.4881 24.5714C27.9524 25.0357 27.9524 25.7798 27.4881 26.2441Z" fill="black"/>
            </svg>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 600, color: 'black' }}>Dashboard <span style={{ fontSize: '10px', color: '#838383', verticalAlign: 'middle' }}>v.01</span></div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '0 28px' }}>
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
        <div style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            backgroundColor: '#F2EFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600, color: '#5932EA',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'black' }}>{firstName} {lastName}</div>
            <div style={{ fontSize: '12px', color: '#757575' }}>Project Manager</div>
          </div>
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#757575' }}>
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
