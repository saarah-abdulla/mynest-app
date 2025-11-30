import { useState, useEffect } from 'react'
import { NavigationBar } from '../components/NavigationBar'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { formatDateDDMMYYYY } from '../lib/dateUtils'
import type { User } from '../types/entities'

export function ProfilePage() {
  const { currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function fetchUser() {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const users = await api.listUsers()
        const currentUserData = users.find((u) => u.email === currentUser.email)
        if (currentUserData) {
          setUser(currentUserData)
          setDisplayName(currentUserData.displayName)
          setPhone(currentUserData.phone || '')
          setEmail(currentUserData.email)
        } else {
          setError('User profile not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [currentUser])

  const handleSave = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      await api.updateUser(user.id, {
        displayName,
        phone: phone || undefined,
      })
      setUser({ ...user, displayName, phone: phone || undefined })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getFirstName = (name: string) => {
    return name.split(' ')[0] || name
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brown mb-2">Profile</h1>
          <p className="text-lg text-brown/70">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          {editing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brown mb-2">
                  Full Name <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-background text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brown mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-brown/5 text-brown/70 cursor-not-allowed"
                />
                <p className="text-xs text-brown/60 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brown mb-2">
                  Phone Number <span className="text-brown/70">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-background text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  placeholder="+971 50 123 4567"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditing(false)
                    setDisplayName(user?.displayName || '')
                    setPhone(user?.phone || '')
                    setError(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-brown bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !displayName.trim()}
                  className="flex-1 px-4 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-2xl">
                      {user ? getFirstName(user.displayName)[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-brown">
                    {user ? getFirstName(user.displayName) : 'User'}
                  </h2>
                  <p className="text-brown/70 mt-1">{user?.displayName}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              <div className="border-t border-brown/10 pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brown/70 mb-1">Email</label>
                  <p className="text-brown">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown/70 mb-1">Phone</label>
                  <p className="text-brown">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown/70 mb-1">Role</label>
                  <p className="text-brown capitalize">{user?.role || 'parent'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown/70 mb-1">
                    Member Since
                  </label>
                  <p className="text-brown">
                    {user?.createdAt ? formatDateDDMMYYYY(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

