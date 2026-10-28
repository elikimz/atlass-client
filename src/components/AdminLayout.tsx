import { useState, useEffect, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { endSession, persistUser } from '../services/session'

interface AdminLayoutProps { setIsAuthenticated: (value: boolean) => void }

function isUnauthorizedError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401
}

type AdminNavItem = { label: string; path: string; code: string }
const adminGroups: { title: string; items: AdminNavItem[] }[] = [
  { title: 'OPERATIONS', items: [{ label: 'Dashboard', path: '/admin', code: '00' }, { label: 'Members', path: '/admin/users', code: '01' }, { label: 'Payments', path: '/admin/payments', code: '02' }] },
  { title: 'PROGRAMS', items: [{ label: 'Task queue', path: '/admin/tasks', code: '03' }, { label: 'Training', path: '/admin/training', code: '04' }, { label: 'Plans', path: '/admin/plans', code: '05' }] },
  { title: 'COMMUNITY & TRUST', items: [{ label: 'Invitations', path: '/admin/invites', code: '06' }, { label: 'Notifications', path: '/admin/notifications', code: '07' }, { label: 'Password support', path: '/admin/password-management', code: '08' }] },
]

export default function AdminLayout({ setIsAuthenticated }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [adminName, setAdminName] = useState('Administrator')
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
        setAdminName(response.data.first_name || 'Administrator')
      } catch (error: unknown) {
        console.error('Failed to fetch admin data:', error)
        if (isUnauthorizedError(error)) void handleSignOut()
      }
    }
    window.addEventListener('resize', handleResize)
    void fetchAdmin()
    return () => window.removeEventListener('resize', handleResize)
  }, [handleSignOut])

  const activeItem = adminGroups.flatMap((group) => group.items).find((item) => item.path === location.pathname)
  const activePath = (path: string) => location.pathname === path
  const initials = adminName.trim().slice(0, 1).toUpperCase() || 'A'

  return <div className="admin-atlas-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {isMobile && isMenuOpen && <button className="admin-atlas-scrim" type="button" aria-label="Close administration navigation" onClick={() => setIsMenuOpen(false)} />}
    <aside className={`admin-atlas-sidebar${isMobile ? ' is-mobile' : ''}${isMenuOpen ? ' is-open' : ''}`} aria-label="Administration navigation" aria-hidden={isMobile && !isMenuOpen}>
      <Link className="admin-atlas-brand" to="/admin" aria-label="Pacecraft administration home" onClick={() => setIsMenuOpen(false)}><img src="/assets/pacecraft-mark-ivory-harbor.png" alt="" /><span><strong>Pacecraft</strong><small>OPERATIONS ATLAS</small></span><i>ADMIN</i></Link>
      <div className="admin-atlas-identity"><span>{initials}</span><div><strong>{adminName}</strong><small>Administrator access</small></div><b aria-label="Account active" /></div>
      <nav className="admin-atlas-nav">{adminGroups.map((group) => <section key={group.title} aria-label={group.title}><h2>{group.title}</h2>{group.items.map((item) => <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} aria-current={activePath(item.path) ? 'page' : undefined} className={`admin-atlas-link${activePath(item.path) ? ' is-active' : ''}`}><span>{item.code}</span><strong>{item.label}</strong>{activePath(item.path) && <i aria-hidden="true" />}</Link>)}</section>)}</nav>
      <footer className="admin-atlas-footer"><span>CONTROL DESK / 01</span><button type="button" onClick={handleSignOut}>Sign out <b aria-hidden="true">↗</b></button></footer>
    </aside>

    <div className="admin-atlas-main">
      <header className="admin-atlas-topbar">
        <div className="admin-atlas-topbar-start">{isMobile && <button type="button" className="admin-atlas-menu-button" onClick={() => setIsMenuOpen(true)} aria-label="Open administration navigation" aria-expanded={isMenuOpen}>☰</button>}<div><span>CONTROL ROOM / PACECRAFT</span><h1>{activeItem?.label || 'Operations'}</h1></div></div>
        <div className="admin-atlas-topbar-end"><span className="admin-atlas-live"><i /> ADMIN SESSION</span><button type="button" onClick={() => window.open('/dashboard', '_blank', 'noopener,noreferrer')}>Open member workspace <b aria-hidden="true">↗</b></button><span className="admin-atlas-avatar" aria-label={`${adminName} administrator`}>{initials}</span></div>
      </header>
      <main className="admin-atlas-content" id="main-content"><Outlet /></main>
    </div>
  </div>
}
