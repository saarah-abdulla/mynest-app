/**
 * Debug Analytics Component
 * 
 * Temporary component to debug Firebase Analytics initialization.
 * This component logs detailed information about Analytics setup.
 * 
 * To use: Import and mount this component in App.tsx temporarily.
 * Remove after debugging is complete.
 */

import { useEffect } from 'react'
import { getApps } from 'firebase/app'
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import app from '../lib/firebase'
import { analytics } from '../lib/firebase'

export function DebugAnalytics() {
  useEffect(() => {
    (async () => {
      // Check if Firebase app is already initialized
      const apps = getApps()
      console.log('[DebugAnalytics] Firebase apps:', apps.length)
      
      // Check measurement ID from environment
      const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      console.log('[DebugAnalytics] MEASUREMENT_ID:', measurementId || 'NOT SET')
      
      // Check if analytics is supported
      try {
        const supported = await isSupported()
        console.log('[DebugAnalytics] ANALYTICS_SUPPORTED:', supported)
        
        if (!supported) {
          console.warn('[DebugAnalytics] Analytics is not supported in this environment')
          return
        }
        
        // Use the analytics instance from firebase.ts if available
        // Wait a bit for async initialization to complete
        let analyticsInstance = analytics
        
        // If analytics isn't initialized yet, wait and check again
        if (!analyticsInstance) {
          console.log('[DebugAnalytics] Analytics not initialized yet, waiting...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          analyticsInstance = analytics
        }
        
        if (!analyticsInstance) {
          console.warn('[DebugAnalytics] Analytics instance still not available after waiting')
          console.warn('[DebugAnalytics] This might mean VITE_FIREBASE_MEASUREMENT_ID is not set')
          return
        } else {
          console.log('[DebugAnalytics] ✅ Using analytics instance:', analyticsInstance)
        }
        
        // Log a test event
        try {
          logEvent(analyticsInstance, 'debug_test_event', {
            timestamp: new Date().toISOString(),
            source: 'debug_component',
          })
          console.log('[DebugAnalytics] ✅ LOGGED debug_test_event successfully')
        } catch (error) {
          console.error('[DebugAnalytics] ❌ Failed to log debug_test_event:', error)
        }
      } catch (error) {
        console.error('[DebugAnalytics] Error checking Analytics support:', error)
      }
    })()
  }, [])

  // This component doesn't render anything
  return null
}

