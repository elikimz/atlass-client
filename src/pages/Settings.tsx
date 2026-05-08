import { useEffect, useState } from 'react'
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
  const [discordUsername, setDiscordUsername] = useState('')

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
    try {
      const response = await api.put('/settings/profile', formData)
      setProfile(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/settings/account')
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      } catch (error) {
        console.error('Failed to delete account:', error)
      }
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Profile</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Save Changes
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Connected Accounts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="font-semibold text-gray-900">Discord</p>
                  <p className="text-sm text-gray-600">Connect your Discord account for community updates</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Account</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-900 font-semibold mb-2">Danger Zone</p>
              <p className="text-red-700 text-sm mb-4">Permanently delete your account and all associated data</p>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Session Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Session</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600">Browser: Chrome • Last active: Just now</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token')
                  window.location.href = '/login'
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
