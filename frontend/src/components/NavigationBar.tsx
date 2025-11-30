import { useNavigate, useLocation } from 'react-router-dom'
import { MyNestLogo } from './MyNestLogo'
import { useAuth } from '../contexts/AuthContext'

export function NavigationBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-card border-b border-brown/10 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <MyNestLogo className="w-10 h-10" />
            <span className="text-xl font-semibold text-brown">MyNest</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className={`text-base font-bold transition-colors ${
                isActive('/dashboard')
                  ? 'text-brown border-b-2 border-sage pb-1'
                  : 'text-brown hover:text-brown'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/family')}
              className={`text-base font-bold transition-colors ${
                isActive('/family')
                  ? 'text-brown border-b-2 border-sage pb-1'
                  : 'text-brown hover:text-brown'
              }`}
            >
              Family
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className={`text-base font-bold transition-colors ${
                isActive('/calendar')
                  ? 'text-brown border-b-2 border-sage pb-1'
                  : 'text-brown hover:text-brown'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => navigate('/journal')}
              className={`text-base font-bold transition-colors ${
                isActive('/journal')
                  ? 'text-brown border-b-2 border-sage pb-1'
                  : 'text-brown hover:text-brown'
              }`}
            >
              Journal
            </button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-brown/70 hover:text-brown hover:bg-brown/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <button className="p-2 rounded-lg text-brown/70 hover:text-brown hover:bg-brown/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg text-brown/70 hover:text-brown hover:bg-brown/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg text-brown/70 hover:text-brown hover:bg-brown/5 transition-colors font-medium text-sm flex items-center gap-2"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

