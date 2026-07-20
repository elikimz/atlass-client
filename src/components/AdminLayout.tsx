import { useState, useEffect, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { endSession, persistUser } from '../services/session'
import ThemeToggle from './ThemeToggle'

interface AdminLayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

function isUnauthorizedError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'response' in error
    && (error as { response?: { status?: number } }).response?.status === 401
}

export default function AdminLayout({ setIsAuthenticated }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [adminName, setAdminName] = useState('Admin')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = useCallback(async () => {
    await endSession()
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate, setIsAuthenticated])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) setIsMenuOpen(false)
    }
    const fetchAdmin = async () => {
      try {
        const response = await api.get('/auth/me')
        persistUser(response.data)
        setAdminName(response.data.first_name || 'Admin')
      } catch (error: unknown) {
        console.error('Failed to fetch admin data:', error)
        if (isUnauthorizedError(error)) {
          void handleSignOut()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    void fetchAdmin()
    return () => window.removeEventListener('resize', handleResize)
  }, [handleSignOut])

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Video Tasks', path: '/admin/tasks', icon: '🎬' },
    { label: 'Training', path: '/admin/training', icon: '📚' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Payments', path: '/admin/payments', icon: '💳' },
    { label: 'Plans', path: '/admin/plans', icon: '💎' },
    { label: 'Invites', path: '/admin/invites', icon: '✉️' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <div style={{ position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, bottom: 0, width: '260px', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-sidebar)', display: (isMobile && !isMenuOpen) ? 'none' : 'flex', flexDirection: 'column', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', zIndex: 1000, transition: 'transform 0.3s ease-in-out', transform: (isMobile && !isMenuOpen) ? 'translateX(-100%)' : 'translateX(0)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-sidebar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div><div style={{ fontSize: '15px', fontWeight: 700 }}>AdPulseAI</div><div style={{ fontSize: '10px', color: 'var(--text-muted-sidebar)' }}>Admin Portal</div></div>
          </div>
          {isMobile && <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted-sidebar)', fontSize: '20px', cursor: 'pointer' }}>✕</button>}
        </div>
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {adminNavItems.map((item) => (
            <Link key={item.label} to={item.path} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', textDecoration: 'none', color: isActive(item.path) ? 'white' : 'var(--text-muted-sidebar)', backgroundColor: isActive(item.path) ? 'var(--accent-primary)' : 'transparent', transition: 'all 0.2s', fontSize: '14px', fontWeight: 500 }}><span style={{ fontSize: '18px' }}>{item.icon}</span><span>{item.label}</span></Link>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-sidebar)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>{adminName.charAt(0).toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}><div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div><div style={{ fontSize: '11px', color: 'var(--text-muted-sidebar)' }}>Administrator</div></div>
          </div>
          <button onClick={handleSignOut} style={{ width: '100%', padding: '10px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Sign Out</button>
        </div>
      </div>

      {isMobile && isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '64px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && <button onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-heading)', padding: '4px' }}>☰</button>}
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>{adminNavItems.find(i => isActive(i.path))?.label || 'Admin Portal'}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ThemeToggle />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isMobile && <div style={{ textAlign: 'right' }}><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)' }}>{adminName}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Admin Account</div></div>}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontWeight: 700 }}>{adminName.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px' }}><Outlet /></main>
      </div>
    </div>
  )
}
