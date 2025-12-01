import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { NavigationBar } from '../components/NavigationBar'
import { MyNestLogo } from '../components/MyNestLogo'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function SetupProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)

  useEffect(() => {
    // Check if we came from signup with verification email sent
    if (location.state?.emailVerificationSent) {
      setEmailVerificationSent(true)
    }

    // Pre-fill email if available
    if (currentUser?.email) {
      setDisplayName(currentUser.email.split('@')[0])
    }

    // Try to load existing user data
    async function loadUserData() {
      if (!currentUser || !currentUser.email) return

      try {
        setLoading(true)
        const users = await api.listUsers()
        const user = users.find((u) => u.email === currentUser.email)
        
        if (user && currentUser.email) {
          setDisplayName(user.displayName || currentUser.email.split('@')[0])
          setPhone(user.phone || '')
        }
      } catch (err) {
        console.log('Could not load user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [currentUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!currentUser) {
      setError('You must be logged in to set up your profile')
      return
    }

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    try {
      setSaving(true)

      // Create or update user record
      try {
        await api.createUser({
          email: currentUser.email || '',
          displayName: displayName.trim(),
          phone: phone.trim() || undefined,
          role: 'parent',
        })
      } catch (err: any) {
        // User might already exist, try to update
        if (err.message?.includes('already exists') || err.message?.includes('unique')) {
          const users = await api.listUsers()
          const existingUser = users.find((u) => u.email === currentUser.email)
          if (existingUser) {
            await api.updateUser(existingUser.id, {
              displayName: displayName.trim(),
              phone: phone.trim() || undefined,
            })
          }
        } else {
          throw err
        }
      }

      // Navigate to family setup
      navigate('/setup/family')
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleSkip() {
    // Still create basic user record, but skip to dashboard
    if (!currentUser) {
      navigate('/login')
      return
    }

    try {
      setSaving(true)

      // Create minimal user record
      try {
        await api.createUser({
          email: currentUser.email || '',
          displayName: currentUser.email?.split('@')[0] || 'User',
          role: 'parent',
        })
      } catch (err: any) {
        // User might already exist - that's fine
        console.log('User record may already exist:', err)
      }

      navigate('/dashboard')
    } catch (err: any) {
      console.error('Error creating user record:', err)
      // Still navigate to dashboard even if this fails
      navigate('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center px-4 py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Email Verification Notice */}
          {emailVerificationSent && (
            <div className="bg-sage/10 border border-sage rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brown mb-1">Verification email sent!</p>
                  <p className="text-sm text-brown/70">
                    We've sent a verification email to <strong>{currentUser?.email}</strong>. Please check your inbox.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MyNestLogo className="w-12 h-12" />
              <h1 className="text-3xl font-semibold text-brown">MyNest</h1>
            </div>
            <h2 className="text-2xl font-semibold text-brown mb-2">Set Up Your Profile</h2>
            <p className="text-brown/70">Tell us a bit about yourself</p>
          </div>

          {/* Profile Setup Card */}
          <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-light text-red-DEFAULT text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brown mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-brown/5 text-brown/60 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-brown/60">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-brown mb-2">
                  Display Name <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-brown/60">This is how your name will appear in the app</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brown mb-2">
                  Phone Number <span className="text-brown/60 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={saving || !displayName.trim()}
                  className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Continue to Family Setup'}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  className="w-full bg-card border-2 border-brown/20 text-brown/70 font-semibold py-3 px-4 rounded-lg hover:bg-brown/5 hover:text-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for Now
                </button>
                <p className="text-xs text-center text-brown/60">
                  You can create your family profile later from the dashboard
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

