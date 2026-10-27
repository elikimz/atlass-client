import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { endSession } from '../services/session'
import { queryKeys } from '../services/queryClient'
import NotificationBell from './NotificationBell'

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void
}

interface UserData {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  username?: string | null
  role?: string | null
  is_admin?: boolean
  is_trained?: boolean
}

interface NotificationSummary {
  is_read: boolean
}

type NavItem = { label: string; path: string; glyph: string }

const homeItem: NavItem = { label: 'Overview', path: '/dashboard', glyph: '⌂' }
const tasksItem: NavItem = { label: 'Task queue', path: '/tasks', glyph: '▤' }
const trainingItem: NavItem = { label: 'Learning', path: '/training', glyph: '△' }
const plansItem: NavItem = { label: 'Plans', path: '/plans', glyph: '◫' }
const inviteItem: NavItem = { label: 'Referrals', path: '/referrals', glyph: '↗' }
const walletItem: NavItem = { label: 'Wallet', path: '/payments', glyph: '◈' }
const settingsItem: NavItem = { label: 'Settings', path: '/settings', glyph: '⚙' }
const adminItem: NavItem = { label: 'Admin', path: '/admin', glyph: '⋯' }

function isItemActive(pathname: string, path: string) {
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(`${path}/`))
}

function titleForPath(pathname: string) {
  if (pathname.startsWith('/payments/recharge')) return 'Add funds'
  if (pathname.startsWith('/payments/history')) return 'Payment activity'
  if (pathname.startsWith('/payments/payout') || pathname.startsWith('/withdrawal-accounts')) return 'Withdraw earnings'
  if (pathname.startsWith('/payments/mpesa')) return 'M-Pesa'
  if (pathname.startsWith('/payments/maintenance')) return 'Payment method'
  if (pathname.startsWith('/tasks/')) return 'Task workspace'
  if (pathname.startsWith('/tasks')) return 'Task queue'
  if (pathname.startsWith('/training')) return 'Learning studio'
  if (pathname.startsWith('/plans')) return 'Plans'
  if (pathname.startsWith('/referrals')) return 'Referral network'
  if (pathname.startsWith('/settings')) return 'Account settings'
  if (pathname.startsWith('/admin')) return 'Administration'
  return 'Member overview'
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreMenuPath, setMoreMenuPath] = useState<string | null>(null)
  const isMoreOpen = moreMenuPath === location.pathname
  const userQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await api.get<UserData>('/auth/me')).data,
    staleTime: 5 * 60 * 1000,
  })
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => (await api.get<NotificationSummary[]>('/notifications')).data ?? [],
    staleTime: 30 * 1000,
  })
  const user = userQuery.data ?? null
  const unreadCount = (notificationsQuery.data ?? []).filter((notification) => !notification.is_read).length
  const userEmail = user?.email || localStorage.getItem('user_email') || ''
  const firstName = user?.first_name?.trim() || 'Member'
  const lastName = user?.last_name?.trim() || ''
  const isAdminUser = Boolean(user?.is_admin || user?.role === 'admin')
  const initials = `${firstName.charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || 'M'
  const pageTitle = titleForPath(location.pathname)

  const handleSignOut = useCallback(async () => {
    await endSession()
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate, setIsAuthenticated])

  const groups: { title: string; items: NavItem[] }[] = [
    { title: 'Workspace', items: [homeItem, tasksItem, trainingItem] },
    { title: 'Grow', items: [plansItem, inviteItem] },
    { title: 'Money', items: [walletItem] },
    { title: 'Account', items: isAdminUser ? [settingsItem, adminItem] : [settingsItem] },
  ]
  const mobileItems = [homeItem, tasksItem, plansItem, inviteItem, walletItem]
  const moreItems = [trainingItem, settingsItem, ...(isAdminUser ? [adminItem] : [])]

  const renderNavLink = (item: NavItem, mobile = false) => {
    const active = isItemActive(location.pathname, item.path)
    const label = item.path === '/payments' && mobile ? 'Wallet' : item.label
    return (
      <Link
        key={item.path}
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={`member-nav-link${active ? ' is-active' : ''}${mobile ? ' member-nav-link--mobile' : ''}`}
        onClick={() => setMoreMenuPath(null)}
      >
        <span className="member-nav-glyph" aria-hidden="true">{item.glyph}</span>
        <span className="member-nav-label">{label}</span>
        {item.path === '/dashboard' && unreadCount > 0 && <span className="member-unread-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
        {active && !mobile && <span className="member-nav-active-mark" aria-hidden="true" />}
      </Link>
    )
  }

  return (
    <div className="site-shell member-app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="member-sidebar" aria-label="Main navigation">
        <Link className="member-brand" to="/dashboard" aria-label="Kinetiq home">
          <img src="/assets/kinetiq-mark.svg" alt="" />
          <span><strong>Kinetiq</strong><small>MEMBER WORKSPACE</small></span>
        </Link>
        <div className="member-sidebar-user">
          <span className="member-sidebar-avatar" aria-hidden="true">{initials}</span>
          <span className="member-sidebar-user-copy"><strong>{firstName}{lastName ? ` ${lastName}` : ''}</strong><small>{userEmail || 'Your account'}</small></span>
          <span className="member-online-dot" aria-label="Account active" />
        </div>
        <nav className="member-sidebar-nav">
          {groups.map((group) => (
            <section className="member-nav-group" key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              {group.items.map((item) => renderNavLink(item))}
            </section>
          ))}
        </nav>
        <div className="member-sidebar-footer">
          <button className="member-signout" type="button" onClick={handleSignOut}><span aria-hidden="true">↪</span> Sign out</button>
          <small className="member-sidebar-footnote">A clear path to your next step.</small>
        </div>
      </aside>

      <div className="member-main-column">
        <header className="member-topbar">
          <div className="member-topbar-heading">
            <span className="member-topbar-kicker">YOUR WORKSPACE</span>
            <h1>{pageTitle}</h1>
          </div>
          <div className="member-topbar-actions">
            <NotificationBell />
            <button className="member-profile-button" type="button" onClick={() => navigate('/settings')} aria-label={`Open account settings for ${firstName}`}>
              <span className="member-profile-avatar" aria-hidden="true">{initials}</span>
              <span className="member-profile-copy"><strong>{firstName}{lastName ? ` ${lastName}` : ''}</strong><small>{userEmail || 'Member account'}</small></span>
              <span className="member-profile-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </header>

        <main className="app-content" id="main-content">
          <div className="member-page-container"><Outlet /></div>
        </main>
      </div>

      <nav className="app-mobile-nav" aria-label="Primary mobile navigation">
        {mobileItems.map((item) => renderNavLink(item, true))}
        <button className={`member-nav-link member-nav-link--mobile member-more-button${isMoreOpen ? ' is-active' : ''}`} type="button" onClick={() => setMoreMenuPath((path) => path === location.pathname ? null : location.pathname)} aria-expanded={isMoreOpen} aria-controls="member-more-menu">
          <span className="member-nav-glyph" aria-hidden="true">···</span><span className="member-nav-label">More</span>
        </button>
      </nav>

      {isMoreOpen && (
        <div className="member-more-overlay">
          <button className="member-more-scrim" type="button" aria-label="Close more menu" onClick={() => setMoreMenuPath(null)} />
          <section className="member-more-sheet" id="member-more-menu" role="dialog" aria-modal="true" aria-labelledby="member-more-title">
            <div className="member-more-grip" aria-hidden="true" />
            <div className="member-more-heading"><div><span>MORE DESTINATIONS</span><h2 id="member-more-title">Keep moving.</h2></div><button type="button" aria-label="Close menu" onClick={() => setMoreMenuPath(null)}>×</button></div>
            <div className="member-more-links">{moreItems.map((item) => renderNavLink(item))}</div>
            <button className="member-signout member-signout--mobile" type="button" onClick={handleSignOut}><span aria-hidden="true">↪</span> Sign out</button>
          </section>
        </div>
      )}
    </div>
  )
}
