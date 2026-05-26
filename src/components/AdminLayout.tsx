import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface AdminLayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

export default function AdminLayout({ setIsAuthenticated }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [adminName, setAdminName] = useState('Admin')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)

    // Fetch admin data
    api.get('/auth/me')
      .then(res => {
        setAdminName(res.data.first_name || 'Admin')
      })
      .catch(err => {
        console.error('Failed to fetch admin data:', err)
        if (err.response?.status === 401) {
          handleSignOut()
        }
      })

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_first_name')
    localStorage.removeItem('user_last_name')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_is_admin')
    setIsAuthenticated(false)
    navigate('/login')
  }

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Video Tasks', path: '/admin/tasks', icon: '🎬' },
    { label: 'Training', path: '/admin/training', icon: '📚' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Payments', path: '/admin/payments', icon: '💳' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      {!isMobile && (
        <div style={{
          width: '260px',
          backgroundColor: '#1F2937',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}>
          {/* Logo */}
          <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>
                ⚙️
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>VidEarn</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Admin Portal</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {adminNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: isActive(item.path) ? 'white' : '#D1D5DB',
                  backgroundColor: isActive(item.path) ? '#3B82F6' : 'transparent',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign Out */}
          <div style={{ padding: '16px', borderTop: '1px solid #374151' }}>
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EF4444' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <div style={{ fontSize: '18px', fontWeight: 700 }}>VidEarn Admin</div>
            )}
            {!isMobile && (
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>Management Portal</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: '#1E40AF' }}>
                {adminName.charAt(0).toUpperCase()}
              </div>
              {!isMobile && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>{adminName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Administrator</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
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
          borderTop: '1px solid #E5E7EB',
          height: '70px',
          zIndex: 100,
        }}>
          {adminNavItems.slice(0, 4).map((item) => (
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
                color: isActive(item.path) ? '#3B82F6' : '#9CA3AF',
                fontSize: '11px',
                fontWeight: 500,
                flex: 1,
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
