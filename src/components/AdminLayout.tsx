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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) setIsMenuOpen(false)
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

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = () => {
    localStorage.clear()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Video Tasks', path: '/admin/tasks', icon: '🎬' },
    { label: 'Training', path: '/admin/training', icon: '📚' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Payments', path: '/admin/payments', icon: '💳' },
    { label: 'Plans', path: '/admin/plans', icon: '💎' },
    { label: 'Invites', path: '/admin/invites', icon: '✉️' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Desktop Sidebar / Mobile Drawer Overlay */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        backgroundColor: '#1F2937',
        color: 'white',
        display: (isMobile && !isMenuOpen) ? 'none' : 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        transition: 'transform 0.3s ease-in-out',
        transform: (isMobile && !isMenuOpen) ? 'translateX(-100%)' : 'translateX(0)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>AdPulseAI</div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Admin Portal</div>
            </div>
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
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

        {/* User Info & Sign Out */}
        <div style={{ padding: '16px', borderTop: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobile && isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header style={{
          height: '64px',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button 
                onClick={() => setIsMenuOpen(true)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#374151', padding: '4px' }}
              >
                ☰
              </button>
            )}
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {adminNavItems.find(i => isActive(i.path))?.label || 'Admin Portal'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{adminName}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Admin Account</div>
              </div>
            )}
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontWeight: 700 }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
