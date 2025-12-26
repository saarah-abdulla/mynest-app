import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { NavigationBar } from '../components/NavigationBar'
import { MyNestLogo } from '../components/MyNestLogo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const invitationToken = location.state?.invitationToken

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      console.log('[LoginPage] Attempting to sign in with email:', email)
      await login(email, password)
      console.log('[LoginPage] Login successful, waiting for auth state...')
      
      // Wait a moment for Firebase auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // If there's an invitation token, accept it automatically
      if (invitationToken) {
        try {
          console.log('[LoginPage] Accepting invitation token:', invitationToken)
          await api.acceptInvitation(invitationToken)
          console.log('[LoginPage] Invitation accepted successfully')
        } catch (inviteErr) {
          console.error('[LoginPage] Error accepting invitation:', inviteErr)
          // Continue to dashboard even if invitation acceptance fails
        }
      }
      
      console.log('[LoginPage] Navigating to dashboard...')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('[LoginPage] Login error:', err)
      console.error('[LoginPage] Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      })
      setError(err.message || 'Failed to sign in. Please check your credentials and try again.')
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
          <h2 className="text-2xl font-semibold text-brown mb-2">Welcome Back</h2>
          <p className="text-brown/70">Sign in to your family coordination hub</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          <h3 className="text-xl font-semibold text-brown mb-2">Sign In</h3>
          <p className="text-sm text-brown/70 mb-6">
            Enter your email and password to access your account.
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-sage rounded border-brown/20 focus:ring-sage"
                />
                <span className="ml-2 text-sm text-brown/70">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-sage hover:text-sage-dark font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-brown/70 mb-4">Don&apos;t have an account?</p>
            <Link
              to="/signup"
              className="block w-full bg-card border-2 border-sage text-sage font-semibold py-3 px-4 rounded-lg hover:bg-sage/10 transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

