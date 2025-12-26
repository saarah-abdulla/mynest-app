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

    // Redirect to external landing page
    window.location.href = 'https://www.mynest.ae'
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brown mb-4">Welcome to MyNest</h1>
        <p className="text-brown/70 mb-6">Redirecting to landing page...</p>
        <a 
          href="https://www.mynest.ae" 
          className="text-sage hover:underline font-medium"
        >
          Click here if you are not redirected
        </a>
      </div>
    </div>
  )
}


