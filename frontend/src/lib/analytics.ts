/**
 * Firebase Analytics helper functions
 * 
 * This module provides safe analytics event tracking that gracefully handles
 * cases where Analytics is unavailable (e.g., server-side rendering, unsupported browsers).
 * 
 * IMPORTANT: Never log personal data (email, name, phone, child data) in analytics events.
 */

import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

/**
 * Safely track an analytics event
 * 
 * @param eventName - The name of the event (e.g., 'sign_up', 'login', 'page_view')
 * @param params - Optional event parameters (must not contain personal data)
 * 
 * @example
 * trackEvent('sign_up', { method: 'email' })
 * trackEvent('page_view', { page_path: '/dashboard' })
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  // Only track in browser environment
  if (typeof window === 'undefined') {
    return
  }

  // Only track if analytics is initialized and available
  if (!analytics) {
    return
  }

  try {
    logEvent(analytics, eventName, params)
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.warn('[Analytics] Failed to track event:', eventName, error)
  }
}

