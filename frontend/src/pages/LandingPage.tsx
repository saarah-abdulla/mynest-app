import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate('/dashboard', { replace: true })
      return
    }

    // Check if we're on a Vercel domain, localhost, or Capacitor
    const hostname = window.location.hostname
    const isVercelDomain = hostname.endsWith('.vercel.app')
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    const isCapacitor = typeof (window as any).Capacitor !== 'undefined'
    const isCapacitorScheme = window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:'
    
    // Redirect to login for Vercel, localhost, or Capacitor (not external redirect)
    if (isVercelDomain || isLocalhost || isCapacitor || isCapacitorScheme) {
      navigate('/login', { replace: true })
    } else {
      // On production domain, redirect to external landing page
      window.location.href = 'https://www.mynest.ae'
    }
  }, [currentUser, navigate])

  // Check if we should redirect to login (not external landing page)
  const hostname = window.location.hostname
  const isVercelDomain = hostname.endsWith('.vercel.app')
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isCapacitor = typeof (window as any).Capacitor !== 'undefined'
  const isCapacitorScheme = window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:'
  const shouldRedirectToLogin = isVercelDomain || isLocalhost || isCapacitor || isCapacitorScheme

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brown mb-4">Welcome to MyNest</h1>
        {shouldRedirectToLogin ? (
          <p className="text-brown/70 mb-6">Redirecting to login...</p>
        ) : (
          <>
            <p className="text-brown/70 mb-6">Redirecting to landing page...</p>
            <a 
              href="https://www.mynest.ae" 
              className="text-sage hover:underline font-medium"
            >
              Click here if you are not redirected
            </a>
          </>
        )}
      </div>
    </div>
  )
}


