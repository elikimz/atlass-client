import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

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
import AdminTasks from './pages/AdminTasks'
import AdminTraining from './pages/AdminTraining'
import AdminUsers from './pages/AdminUsers'
import AdminPayments from './pages/AdminPayments'
import AdminPlans from './pages/AdminPlans'
import AdminInvites from './pages/AdminInvites'
import AdminNotifications from './pages/AdminNotifications'
import TaskPlayer from './pages/TaskPlayer'
import InvestmentPlans from './pages/InvestmentPlans'
import WithdrawFunds from './pages/WithdrawFunds'
import WithdrawalAccounts from './pages/WithdrawalAccounts'
import Recharge from './pages/Recharge'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Placeholder from './pages/Placeholder'
import PaymentHistory from './pages/PaymentHistory'
import { ThemeProvider } from './context/ThemeContext'

function TrainingRoute() {
  return <Training />
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    const adminStatus = localStorage.getItem('user_is_admin') === 'true'
    
    if (token) {
      // Token exists, keep the user logged in
      setIsAuthenticated(true)
      setIsAdmin(adminStatus)
    } else {
      setIsAuthenticated(false)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    checkAuth()
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div className="loading-container">
          <div className="pulse-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)' }}>AdPulseAI</span>
          </div>
          <div className="loading-bar-bg">
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, margin: 0 }}>Initializing your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={checkAuth} />} />
        <Route path="/verify" element={<OTPVerify setIsAuthenticated={checkAuth} />} />
        {isAuthenticated && isAdmin ? (
          <Route element={<AdminLayout setIsAuthenticated={checkAuth} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/training" element={<AdminTraining />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/invites" element={<AdminInvites />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/" element={<Navigate to="/admin" />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Route>
        ) : isAuthenticated ? (
          <Route element={<Layout setIsAuthenticated={checkAuth} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product" element={<Placeholder title="Product" />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/income" element={<Placeholder title="Income" />} />
            <Route path="/promote" element={<Placeholder title="Promote" />} />
            <Route path="/help" element={<Placeholder title="Help" />} />
            <Route path="/training" element={<TrainingRoute />} />
            <Route path="/training/hub" element={<LearningHub />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskPlayer />} />
            <Route path="/plans" element={<InvestmentPlans />} />
            <Route path="/referrals" element={<Invite />} />
            <Route path="/referrals-old" element={<Referrals />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/history" element={<PaymentHistory />} />
            <Route path="/payments/recharge" element={<Recharge />} />
            <Route path="/payments/payout" element={<WithdrawFunds />} />
            <Route path="/withdrawal-accounts" element={<WithdrawalAccounts />} />
            <Route path="/payments/withdrawal" element={<Placeholder title="Withdrawal Accounts" />} />
            <Route path="/payments/deposit" element={<Placeholder title="Deposit Wallet Details" />} />
            <Route path="/payments/earnings" element={<Placeholder title="Total Earnings" />} />
            <Route path="/payments/referral" element={<Placeholder title="Referral Commission" />} />
            <Route path="/payments/rebate" element={<Placeholder title="Task Rebate" />} />
            <Route path="/payments/periods" element={<Placeholder title="Earning Periods" />} />
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
