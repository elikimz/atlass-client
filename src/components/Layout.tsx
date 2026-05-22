import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // handleSignOut is available for future use if needed
  /*
  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
    navigate('/login')
  }
  */

  const firstName = localStorage.getItem('user_first_name') || 'John'
  const lastName = localStorage.getItem('user_last_name') || 'Doe'
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  const bottomNavItems = [
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
    { label: 'Invite', path: '/referrals', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#FAFBFF',
      fontFamily: 'Poppins, Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '16px 20px' : '20px 40px',
        backgroundColor: 'white',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #5932EA 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M5 3L19 12L5 21V3Z"/>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'black' }}>VidEarn</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification Bell */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: '4px', right: '4px',
              width: '18px', height: '18px', borderRadius: '50%',
              backgroundColor: '#5932EA', color: 'white',
              fontSize: '10px', fontWeight: 600, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>4</span>
          </button>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => navigate('/settings')}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#F2EFFF', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 600, color: '#5932EA',
              }}
              title="Go to Settings"
            >
              {initials}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('access_token');
                setIsAuthenticated(false);
                navigate('/login');
              }}
              style={{
                marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer',
                color: '#757575', display: 'flex', alignItems: 'center'
              }}
              title="Sign Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: isMobile ? '80px' : '0',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ padding: isMobile ? '20px' : '40px 50px' }}>
          <Outlet />
        </div>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: 'white',
          borderTop: '1px solid #F0F0F0',
          height: '70px',
          zIndex: 100,
        }}>
          {bottomNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none',
                color: isActive(item.path) ? '#5932EA' : '#B5B7C0',
                fontSize: '12px',
                fontWeight: 500,
                flex: 1,
                height: '100%',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ color: 'inherit' }}>{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
