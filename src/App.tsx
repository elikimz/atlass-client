import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useCallback, useEffect, type ComponentType } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Toaster, type ToasterProps } from 'react-hot-toast'

const Login = lazy(() => import('./pages/Login'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Training = lazy(() => import('./pages/Training'))
const LearningHub = lazy(() => import('./pages/LearningHub'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Referrals = lazy(() => import('./pages/Referrals'))
const Invite = lazy(() => import('./pages/Invite'))
const Payments = lazy(() => import('./pages/Payments'))
const Feedback = lazy(() => import('./pages/Feedback'))
const Settings = lazy(() => import('./pages/Settings'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminTasks = lazy(() => import('./pages/AdminTasks'))
const AdminTraining = lazy(() => import('./pages/AdminTraining'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminPasswordManagement = lazy(() => import('./pages/AdminPasswordManagement'))
const AdminPayments = lazy(() => import('./pages/AdminPayments'))
const AdminPlans = lazy(() => import('./pages/AdminPlans'))
const AdminInvites = lazy(() => import('./pages/AdminInvites'))
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'))
const TaskPlayer = lazy(() => import('./pages/TaskPlayer'))
const InvestmentPlans = lazy(() => import('./pages/InvestmentPlans'))
const WithdrawFunds = lazy(() => import('./pages/WithdrawFunds'))
const WithdrawalAccounts = lazy(() => import('./pages/WithdrawalAccounts'))
const Recharge = lazy(() => import('./pages/Recharge'))
const MpesaPayment = lazy(() => import('./pages/MpesaPayment'))
const PaymentMethodMaintenance = lazy(() => import('./pages/PaymentMethodMaintenance'))
const Placeholder = lazy(() => import('./pages/Placeholder'))
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'))
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import { AppUpdatePrompt, OfflineStatus } from './components/PWAInstall'
import api from './services/api'
import { clearSession, hasSession, persistUser } from './services/session'
import { queryKeys } from './services/queryClient'

const ToastContainer = Toaster as unknown as ComponentType<ToasterProps>

function RouteLoading() {
  return <div className="orbit-state" role="status"><span className="orbit-loader" /><p>Opening your workspace…</p></div>
}

function TrainingRoute() {
  return <Training />
}

async function fetchCurrentUser() {
  // The API interceptor refreshes an expired access token once before this
  // request fails, so a cached token is never treated as proof of identity.
  const response = await api.get('/auth/me')
  persistUser(response.data)
  return response.data
}

function AppContent() {
  const queryClient = useQueryClient()
  const sessionPresent = hasSession()
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: fetchCurrentUser,
    enabled: sessionPresent,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const currentUser = currentUserQuery.data
  const isAuthenticated = sessionPresent && Boolean(currentUser) && !currentUserQuery.isError
  const isAdmin = currentUser?.role === 'admin' || Boolean(currentUser?.is_admin)

  useEffect(() => {
    if (currentUserQuery.isError) {
      clearSession()
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
    }
  }, [currentUserQuery.isError, queryClient])

  const checkAuth = useCallback(async () => {
    if (!hasSession()) {
      clearSession()
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
      return
    }

    const result = await currentUserQuery.refetch()
    if (result.isError) {
      clearSession()
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
    }
  }, [currentUserQuery, queryClient])

  const setAuthenticationState = useCallback((authenticated: boolean) => {
    if (authenticated) {
      void checkAuth()
      return
    }
    clearSession()
    queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
  }, [checkAuth, queryClient])

  if (sessionPresent && currentUserQuery.isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div className="loading-container">
          <div className="pulse-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/assets/kinetiq-mark.svg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)' }}>Kinetiq</span>
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
      <OfflineStatus />
      <AppUpdatePrompt />
      <ToastContainer position="top-center" reverseOrder={false} />
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setIsAuthenticated={checkAuth} />} />
        {isAuthenticated && isAdmin ? (
          <>
            <Route element={<Layout setIsAuthenticated={checkAuth} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training" element={<TrainingRoute />} />
              <Route path="/training/hub" element={<LearningHub />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:taskId" element={<TaskPlayer />} />
              <Route path="/plans" element={<InvestmentPlans />} />
              <Route path="/referrals" element={<Invite />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/history" element={<PaymentHistory />} />
              <Route path="/payments/recharge" element={<Recharge />} />
              <Route path="/payments/mpesa" element={<MpesaPayment />} />
              <Route path="/payments/maintenance/:method" element={<PaymentMethodMaintenance />} />
              <Route path="/payments/payout" element={<WithdrawFunds />} />
              <Route path="/withdrawal-accounts" element={<WithdrawalAccounts />} />
              <Route path="/settings" element={<Settings setIsAuthenticated={setAuthenticationState} />} />
            </Route>
          <Route element={<AdminLayout setIsAuthenticated={checkAuth} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/training" element={<AdminTraining />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/password-management" element={<AdminPasswordManagement />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/invites" element={<AdminInvites />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Route>
          </>
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
            <Route path="/payments/mpesa" element={<MpesaPayment />} />
            <Route path="/payments/maintenance/:method" element={<PaymentMethodMaintenance />} />
            <Route path="/payments/payout" element={<WithdrawFunds />} />
            <Route path="/withdrawal-accounts" element={<WithdrawalAccounts />} />
            <Route path="/payments/withdrawal" element={<Placeholder title="Withdrawal Accounts" />} />
            <Route path="/payments/deposit" element={<Placeholder title="Deposit Wallet Details" />} />
            <Route path="/payments/earnings" element={<Placeholder title="Total Earnings" />} />
            <Route path="/payments/referral" element={<Placeholder title="Referral Commission" />} />
            <Route path="/payments/rebate" element={<Placeholder title="Task Rebate" />} />
            <Route path="/payments/periods" element={<Placeholder title="Earning Periods" />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/settings" element={<Settings setIsAuthenticated={setAuthenticationState} />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
      </Suspense>
    </Router>
  )
}

export default function App() {
  return <AppContent />
}
