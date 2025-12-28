import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<{
    email: string
    caregiverName: string
    familyName: string
    expiresAt: string
  } | null>(null)

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }

      // Check if error was passed from navigation state (e.g., from signup page)
      const locationState = location.state as { error?: string } | null
      if (locationState?.error) {
        setError(locationState.error)
        setLoading(false)
        // Clear the state so it doesn't persist on refresh
        window.history.replaceState({}, document.title)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await api.getInvitation(token)
        setInvitation(data)
      } catch (err: any) {
        // Check if error has details or message
        const errorMessage = err?.details || err?.message || 'Failed to load invitation'
        setError(errorMessage)
        console.error('Error fetching invitation:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token, location.state])

  const handleAccept = async () => {
    if (!token || !currentUser) {
      // Redirect to signup/login if not authenticated
      navigate('/signup', { state: { invitationToken: token } })
      return
    }

    try {
      setAccepting(true)
      setError(null)
      await api.acceptInvitation(token)
      
      // Track invitation accepted event (no personal data logged)
      try {
        const { trackEvent } = await import('../lib/analytics')
        trackEvent('invite_accepted')
      } catch (error) {
        // Analytics is optional, don't fail if it fails
        console.warn('Failed to track invite_accepted event:', error)
      }
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      console.error('Error accepting invitation:', err)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-DEFAULT"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brown mb-2">Invitation Error</h1>
            <p className="text-brown/70 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-sage/20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-brown mb-2">You've been invited!</h1>
            <p className="text-lg text-brown/70">
              Join <strong>{invitation.familyName}</strong> as a caregiver
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-brown/70 mb-1">Caregiver Name</p>
                <p className="text-brown">{invitation.caregiverName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-brown/70 mb-1">Email</p>
                <p className="text-brown">{invitation.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-brown/70 mb-1">Family</p>
                <p className="text-brown">{invitation.familyName}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red mb-6">
              {error}
            </div>
          )}

          {!currentUser ? (
            <div className="space-y-4">
              <p className="text-center text-brown/70">
                Please sign up or log in to accept this invitation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/signup', { state: { invitationToken: token } })}
                  className="flex-1 px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => navigate('/login', { state: { invitationToken: token } })}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-brown bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
                >
                  Log In
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentUser.email?.toLowerCase() !== invitation.email.toLowerCase() && (
                <div className="rounded-lg bg-yellow/10 border border-yellow/20 p-3 text-sm text-brown mb-4">
                  <p>
                    <strong>Note:</strong> This invitation is for <strong>{invitation.email}</strong>,
                    but you're logged in as <strong>{currentUser.email}</strong>. Please log out and
                    sign in with the correct email address.
                  </p>
                </div>
              )}
              <button
                onClick={handleAccept}
                disabled={accepting || currentUser.email?.toLowerCase() !== invitation.email.toLowerCase()}
                className="w-full px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



