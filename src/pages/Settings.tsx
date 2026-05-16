import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface UserProfile {
  first_name: string | null
  last_name: string | null
  email: string
}

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ first_name: '', last_name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/settings/profile')
        setProfile(response.data)
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.put('/settings/profile', formData)
      setProfile(response.data)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/settings/account')
        localStorage.removeItem('access_token')
        navigate('/login')
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete account')
      }
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-600">Your personal information</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-[#5B5FFF] hover:text-[#4A4FD9] font-semibold text-sm"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">Contact support to update your email address.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#5B5FFF] text-white font-semibold rounded-lg hover:bg-[#4A4FD9] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Email</p>
              <p className="text-gray-900 font-semibold mt-1">{profile?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">First Name</p>
              <p className="text-gray-900 font-semibold mt-1">{profile?.first_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Last Name</p>
              <p className="text-gray-900 font-semibold mt-1">{profile?.last_name || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Discord Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">💬</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Discord</h2>
            <p className="text-sm text-gray-600">Connect for support and announcements</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">Join our Discord server for support, announcements, and to connect with the team.</p>
        <button className="px-6 py-2 bg-[#5B5FFF] text-white font-semibold rounded-lg hover:bg-[#4A4FD9] transition-colors">
          Connect Discord
        </button>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔐</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Account</h2>
            <p className="text-sm text-gray-600">Manage your account settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about new tasks and platform announcements.</p>
            </div>
            <button className="px-4 py-2 text-[#5B5FFF] font-semibold hover:bg-blue-50 rounded-lg transition-colors">
              Manage
            </button>
          </div>

          <div className="pt-4">
            <p className="font-semibold text-gray-900 mb-2">Delete Account</p>
            <p className="text-sm text-gray-600 mb-4">Permanently delete your account and personal data.</p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Session Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📱</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Session</h2>
            <p className="text-sm text-gray-600">Your current session information</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign out this session
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign out all sessions
          </button>
        </div>
      </div>
    </div>
  )
}
