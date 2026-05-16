import { useEffect, useState } from 'react'
import api from '../services/api'

interface PaymentOverview {
  total_paid: number
  previous_unpaid: number
  current_pending: number
}

interface PaymentHistory {
  period: string
  amount: number
  status: string
}

export default function Payments() {
  const [overview, setOverview] = useState<PaymentOverview | null>(null)
  const [history, setHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, historyRes] = await Promise.all([
          api.get('/payments/overview'),
          api.get('/payments/history'),
        ])
        setOverview(overviewRes.data)
        setHistory(historyRes.data)
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B5FFF]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-600">Manage your payment method and view your earnings.</p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Paid</h3>
            <span className="text-2xl">💵</span>
          </div>
          <p className="text-3xl font-bold text-green-600">${overview?.total_paid.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Previous Unpaid</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${overview?.previous_unpaid.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">${overview?.current_pending.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600 mb-6">How you'll receive your earnings</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">You can choose between crypto (USDC/USDT) or Wise bank transfer.</p>
          <button className="px-6 py-2 bg-[#5B5FFF] text-white font-semibold rounded-lg hover:bg-[#4A4FD9] transition-colors">
            Set Up Payment Method
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h2>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{payment.period}</p>
                  <p className="text-sm text-gray-600 mt-1">Status: {payment.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                    payment.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {payment.status === 'in_progress' ? 'In Progress' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No payment history yet</p>
            <p className="text-gray-500 text-sm mt-2">Complete tasks to start earning</p>
          </div>
        )}
      </div>
    </div>
  )
}
