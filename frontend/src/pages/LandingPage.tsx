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

    // Check if we're on a Vercel domain
    const isVercelDomain = window.location.hostname.endsWith('.vercel.app')
    
    if (isVercelDomain) {
      // On Vercel, redirect to login page instead of external landing page
      navigate('/login', { replace: true })
    } else {
      // On production domain, redirect to external landing page
      window.location.href = 'https://www.mynest.ae'
    }
  }, [currentUser, navigate])

  // Check if we're on a Vercel domain
  const isVercelDomain = window.location.hostname.endsWith('.vercel.app')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brown mb-4">Welcome to MyNest</h1>
        {isVercelDomain ? (
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


