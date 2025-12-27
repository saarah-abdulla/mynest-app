import { Link } from 'react-router-dom'
import { NavigationBar } from '../components/NavigationBar'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brown mb-4">Page Not Found</h1>
          <p className="text-lg text-brown/70 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

