/**
 * PageViewTracker Component
 * 
 * Tracks page views using Firebase Analytics when route changes.
 * This component listens to React Router location changes and logs 'page_view' events.
 * 
 * IMPORTANT: Only runs in browser (client-side only).
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    // Only track in browser
    if (typeof window === 'undefined') {
      return
    }

    // Track page view when route changes
    // Note: We don't track personal data (no user info, no query params with sensitive data)
    trackEvent('page_view', {
      page_path: location.pathname,
      page_location: window.location.href.split('?')[0], // Remove query params for privacy
    })
  }, [location.pathname])

  // This component doesn't render anything
  return null
}

