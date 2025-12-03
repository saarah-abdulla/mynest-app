import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { NavigationBar } from '../components/NavigationBar'
import { MyNestLogo } from '../components/MyNestLogo'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const invitationToken = location.state?.invitationToken

  // Auto-accept invitation if user is already logged in and has invitation token
  useEffect(() => {
    async function handleInvitationAcceptance() {
      if (currentUser && invitationToken) {
        try {
          await api.acceptInvitation(invitationToken)
          navigate('/dashboard')
        } catch (err) {
          console.error('Error accepting invitation:', err)
          // Don't show error, let user manually accept
        }
      }
    }
    handleInvitationAcceptance()
  }, [currentUser, invitationToken, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const { user } = await signup(email, password, true) // Send verification email
      
      if (!user) {
        throw new Error('Failed to create user account')
      }
      
      // Wait a moment for Firebase to initialize and ensure user is set
      // Give it enough time for auth state to update
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Double-check that currentUser is set
      if (!user.uid) {
        throw new Error('User account created but user ID not available')
      }
      
      // Check for pending invitation by email (even if no token in URL)
      let invitationToAccept = invitationToken
      if (!invitationToken) {
        try {
          const invitation = await api.getInvitationByEmail(email)
          invitationToAccept = invitation.token
        } catch (err) {
          // No invitation found for this email - that's fine, regular signup
          console.log('No invitation found for email:', email)
        }
      }
      
      // If there's an invitation, accept it (this will create user record with caregiver role and familyId)
      if (invitationToAccept) {
        try {
          await api.acceptInvitation(invitationToAccept)
          // Redirect to dashboard for caregivers (they're now linked to a family)
          navigate('/dashboard', { replace: true })
          return
        } catch (inviteErr) {
          console.error('Error accepting invitation:', inviteErr)
          // If invitation acceptance fails, create basic user record and redirect to invitation page
          try {
            await api.createUser({
              email: email,
              displayName: email.split('@')[0],
              role: 'parent',
            })
          } catch (userErr) {
            console.log('User record creation failed:', userErr)
          }
          navigate(`/invite/${invitationToAccept}`, { replace: true })
          return
        }
      }
      
      // No invitation - regular parent signup, redirect to profile setup
      // Don't create user record yet - let them set it up in profile page
      
      // Show success message about email verification
      setError('')
      // Navigate to profile setup first - use replace to prevent back navigation
      // Use window.location to ensure a full navigation
      window.location.href = '/setup/profile'
      // Also try programmatic navigation as fallback
      navigate('/setup/profile', { 
        replace: true,
        state: { 
          emailVerificationSent: true,
          email: email 
        } 
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MyNestLogo className="w-12 h-12" />
            <h1 className="text-3xl font-semibold text-brown">MyNest</h1>
          </div>
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-coral"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-brown mb-2">Create Your Account</h2>
          <p className="text-brown/70">Start coordinating care for your family</p>
        </div>

        {/* Signup Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          <h3 className="text-xl font-semibold text-brown mb-2">Sign Up</h3>
          <p className="text-sm text-brown/70 mb-6">
            Create an account to get started with MyNest.
          </p>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/60 hover:text-brown"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-brown mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-brown/70 mb-4">Already have an account?</p>
            <Link
              to="/login"
              className="block w-full bg-card border-2 border-sage text-sage font-semibold py-3 px-4 rounded-lg hover:bg-sage/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

