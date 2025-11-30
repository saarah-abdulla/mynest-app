import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { applyActionCode, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { NavigationBar } from '../components/NavigationBar'
import { MyNestLogo } from '../components/MyNestLogo'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')

  useEffect(() => {
    async function handleVerification() {
      if (!oobCode) {
        setError('Invalid verification link')
        setLoading(false)
        return
      }

      try {
        if (mode === 'verifyEmail') {
          // Verify email address
          await applyActionCode(auth, oobCode)
          setSuccess(true)
          console.log('Email verified successfully')
          
          // Reload user to get updated emailVerified status
          if (currentUser) {
            await currentUser.reload()
          }
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else if (mode === 'resetPassword') {
          // Verify password reset code
          await verifyPasswordResetCode(auth, oobCode)
          // Redirect to password reset page
          navigate(`/reset-password?oobCode=${oobCode}`)
          return
        } else {
          setError('Invalid verification mode')
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err.message || 'Failed to verify email. The link may have expired.')
      } finally {
        setLoading(false)
      }
    }

    if (oobCode && mode) {
      handleVerification()
    } else {
      setError('Invalid verification link')
      setLoading(false)
    }
  }, [oobCode, mode, navigate, currentUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <MyNestLogo className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-brown">Verifying your email...</h1>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10 text-center">
            <div className="mb-6">
              <MyNestLogo className="w-16 h-16 mx-auto mb-4" />
            </div>

            {success ? (
              <>
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 mx-auto text-sage"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-brown mb-4">Email Verified!</h1>
                <p className="text-brown/70 mb-6">
                  Your email address has been successfully verified. Redirecting to your dashboard...
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 mx-auto text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-brown mb-4">Verification Failed</h1>
                <p className="text-brown/70 mb-6">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-card border-2 border-sage text-sage font-semibold py-3 px-4 rounded-lg hover:bg-sage/10 transition-colors"
                  >
                    Sign Up Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

