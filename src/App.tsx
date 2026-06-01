import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import OTPVerify from './pages/OTPVerify'
import Dashboard from './pages/Dashboard'
import Training from './pages/Training'
import LearningHub from './pages/LearningHub'
import Tasks from './pages/Tasks'
import Referrals from './pages/Referrals'
import Invite from './pages/Invite'
import Payments from './pages/Payments'
import Feedback from './pages/Feedback'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import TaskPlayer from './pages/TaskPlayer'
import InvestmentPlans from './pages/InvestmentPlans'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Placeholder from './pages/Placeholder'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const adminStatus = localStorage.getItem('user_is_admin') === 'true'
    setIsAuthenticated(!!token)
    setIsAdmin(adminStatus)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/verify" element={<OTPVerify setIsAuthenticated={setIsAuthenticated} />} />
        {isAuthenticated && isAdmin ? (
          <Route element={<AdminLayout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<Placeholder title="Manage Video Tasks" />} />
            <Route path="/admin/training" element={<Placeholder title="Manage Training" />} />
            <Route path="/admin/users" element={<Placeholder title="Manage Users" />} />
            <Route path="/admin/payments" element={<Placeholder title="Manage Payments" />} />
            <Route path="/admin/plans" element={<Placeholder title="Manage Plans" />} />
            <Route path="/" element={<Navigate to="/admin" />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Route>
        ) : isAuthenticated ? (
          <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product" element={<Placeholder title="Product" />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/income" element={<Placeholder title="Income" />} />
            <Route path="/promote" element={<Placeholder title="Promote" />} />
            <Route path="/help" element={<Placeholder title="Help" />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/hub" element={<LearningHub />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskPlayer />} />
            <Route path="/plans" element={<InvestmentPlans />} />
            <Route path="/referrals" element={<Invite />} />
            <Route path="/referrals-old" element={<Referrals />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/settings" element={<Settings setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  )
}

export default App
