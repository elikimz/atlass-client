import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/training', label: 'Training', icon: '🎓' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/referrals', label: 'Referrals', icon: '🔗' },
    { path: '/payments', label: 'Payments', icon: '💰' },
    { path: '/feedback', label: 'Feedback', icon: '📝' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-sm">AC</div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-sm block leading-none">Atlas Capture</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Labels</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 mb-4">
          {sidebarOpen && <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Navigation</p>}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-sidebar-active text-white'
                    : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">KF</div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">kim ff</p>
                <p className="text-[10px] text-gray-500 truncate">elijahkimani1293@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
              ☰
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">🔔</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
