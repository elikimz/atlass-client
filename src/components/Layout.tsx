import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Layout() {
  const location = useLocation()
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'} 
        fixed lg:relative z-50 h-full bg-[#0B1120] text-white transition-all duration-300 flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5B5FFF] rounded flex items-center justify-center font-bold text-sm shrink-0">AC</div>
            {(sidebarOpen || isMobile) && (
              <div className="overflow-hidden whitespace-nowrap">
                <span className="font-bold text-sm block leading-none">Atlas Capture</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Labels</span>
              </div>
            )}
          </div>
          {isMobile && sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          )}
        </div>

        <div className="px-4 mb-4 flex-1 overflow-y-auto">
          {(sidebarOpen || isMobile) && <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Navigation</p>}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#1E293B] text-white'
                    : 'text-gray-400 hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {(sidebarOpen || isMobile) && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5B5FFF] to-[#4A4FD9] rounded-full flex items-center justify-center text-xs shrink-0 font-bold text-white">KF</div>
            {(sidebarOpen || isMobile) && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">kim ff</p>
                <p className="text-[10px] text-gray-500 truncate">elijahkimani1293@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-600 hover:text-gray-900 p-1 lg:hidden"
            >
              ☰
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600 relative">
              🔔
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
