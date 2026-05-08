import { useEffect, useState } from 'react'
import api from '../services/api'

interface ReferralCode {
  code: string
  signups: number
  trained: number
  earned: number
}

interface ReferralSummary {
  earnings: number
  users_referred: number
  passed_training: number
}

export default function Referrals() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null)
  const [codes, setCodes] = useState<ReferralCode[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [showAddCode, setShowAddCode] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, codesRes] = await Promise.all([
          api.get('/referrals/summary'),
          api.get('/referrals/codes'),
        ])
        setSummary(summaryRes.data)
        setCodes(codesRes.data)
      } catch (error) {
        console.error('Failed to fetch referrals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/referrals/codes', { code: newCode })
      setNewCode('')
      setShowAddCode(false)
      // Refresh codes
      const response = await api.get('/referrals/codes')
      setCodes(response.data)
    } catch (error) {
      console.error('Failed to add referral code:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h2>
        <p className="text-gray-600">Earn money by referring friends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${summary?.earnings.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Users Referred</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.users_referred || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Passed Training</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{summary?.passed_training || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Your Referral Codes</h3>
          <button
            onClick={() => setShowAddCode(!showAddCode)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Add Code
          </button>
        </div>

        {showAddCode && (
          <form onSubmit={handleAddCode} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter referral code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Add
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {codes.map((code) => (
            <div key={code.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <code className="bg-gray-100 px-3 py-1 rounded font-mono font-semibold text-gray-900">{code.code}</code>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Copy</button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Signups</p>
                  <p className="font-bold text-gray-900">{code.signups}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trained</p>
                  <p className="font-bold text-gray-900">{code.trained}</p>
                </div>
                <div>
                  <p className="text-gray-600">Earned</p>
                  <p className="font-bold text-gray-900">${code.earned.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {codes.length === 0 && (
          <p className="text-gray-600 text-center py-8">No referral codes yet. Create one to get started!</p>
        )}
      </div>
    </div>
  )
}
