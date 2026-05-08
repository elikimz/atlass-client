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
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payments</h2>
        <p className="text-gray-600">Track your earnings and payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${overview?.total_paid.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Previous Unpaid</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${overview?.previous_unpaid.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Current Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">${overview?.current_pending.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-4">Set up your payment method to receive earnings</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            Add Payment Method
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
        <div className="space-y-4">
          {history.map((payment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
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

        {history.length === 0 && (
          <p className="text-gray-600 text-center py-8">No payment history yet</p>
        )}
      </div>
    </div>
  )
}
