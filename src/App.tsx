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
import WithdrawFunds from './pages/WithdrawFunds'
import WithdrawalAccounts from './pages/WithdrawalAccounts'
import Recharge from './pages/Recharge'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Placeholder from './pages/Placeholder'
import AdminPayments from './pages/AdminPayments'
import PaymentHistory from './pages/PaymentHistory'

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <div className="loading-container">
          <div className="pulse-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>AdPulseAI</span>
          </div>
          <div className="loading-bar-bg">
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500, margin: 0 }}>Initializing your workspace...</p>
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
            <Route path="/admin/payments" element={<AdminPayments />} />
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

export default App
