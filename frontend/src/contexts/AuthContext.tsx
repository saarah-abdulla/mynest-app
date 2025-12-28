import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  signup: (email: string, password: string, sendVerification?: boolean) => Promise<{ user: User }>
  loginWithGoogle: () => Promise<any>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function signup(email: string, password: string, sendVerification: boolean = true) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Track signup event (no personal data logged)
    try {
      const { trackEvent } = await import('../lib/analytics')
      trackEvent('sign_up', { method: 'email' })
    } catch (error) {
      // Analytics is optional, don't fail signup if it fails
      console.warn('Failed to track signup event:', error)
    }
    
    // Send verification email if requested
    if (sendVerification && userCredential.user) {
      try {
        await sendEmailVerification(userCredential.user)
        console.log('Verification email sent')
      } catch (error) {
        console.error('Failed to send verification email:', error)
        // Don't fail signup if email sending fails
      }
    }
    
    return { user: userCredential.user }
  }

  async function login(email: string, password: string) {
    console.log('[AuthContext] login called with email:', email)
    
    // Workaround: Use Firebase REST API directly since Firebase Auth SDK is stuck
    // This is needed because Firebase Auth initialization promise hangs in Capacitor
    const authAny = auth as any
    const apiKey = authAny.app?.options?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY
    
    if (!apiKey) {
      throw new Error('Firebase API key not found')
    }
    
    console.log('[AuthContext] Using Firebase REST API for login (Firebase Auth SDK workaround)')
    
    try {
      // Call Firebase REST API directly
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('[AuthContext] Firebase REST API error:', errorData)
        throw new Error(errorData.error?.message || 'Login failed')
      }
      
      const data = await response.json()
      console.log('[AuthContext] Firebase REST API login successful, email:', data.email)
      
      // Store the idToken in sessionStorage so API calls can use it
      if (data.idToken) {
        sessionStorage.setItem('firebase_id_token', data.idToken)
        sessionStorage.setItem('firebase_user_email', data.email)
        sessionStorage.setItem('firebase_user_id', data.localId)
        console.log('[AuthContext] Stored idToken in sessionStorage')
      }
      
      // Skip SDK method - it's stuck, so we'll use the REST API response directly
      // Create a minimal user object for the response
      // The API calls will use the token from sessionStorage
      console.log('[AuthContext] Creating mock user object from REST API response')
      const mockUser = {
        email: data.email,
        uid: data.localId,
        getIdToken: async () => {
          // Check if token is still in sessionStorage, if not, return the one we have
          const storedToken = sessionStorage.getItem('firebase_id_token')
          return storedToken || data.idToken
        },
        displayName: data.displayName || '',
        emailVerified: data.emailVerified || false,
      } as any
      
      // Manually update auth state
      console.log('[AuthContext] Setting current user state...')
      setCurrentUser(mockUser)
      setLoading(false) // Stop loading since we have the user
      
      console.log('[AuthContext] Auth state updated with mock user, email:', data.email)
      console.log('[AuthContext] Login function completing, returning user credential')
      return {
        user: mockUser,
      } as any
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error)
      throw error
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    // Track login event (no personal data logged)
    try {
      const { trackEvent } = await import('../lib/analytics')
      trackEvent('login', { method: 'google' })
    } catch (error) {
      // Analytics is optional, don't fail login if it fails
      console.warn('Failed to track login event:', error)
    }
    
    // User login handled by onAuthStateChanged
    return result
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    console.log('[AuthContext] Setting up onAuthStateChanged listener')
    
    let isMounted = true
    
    // Check current user immediately as fallback
    const checkCurrentUser = () => {
      try {
        const currentUser = auth.currentUser
        console.log('[AuthContext] Current user check:', currentUser ? currentUser.email : 'null')
        if (isMounted && currentUser !== null) {
          // If there's a current user, set it immediately
          setCurrentUser(currentUser)
          setLoading(false)
        }
      } catch (error) {
        console.error('[AuthContext] Error checking current user:', error)
      }
    }
    
    // Set a timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[AuthContext] onAuthStateChanged timeout - using current user fallback')
        checkCurrentUser()
        // If still loading after timeout, force it to false
        setLoading(false)
      }
    }, 3000) // 3 second timeout

    // Check current user after a short delay (in case auth is still initializing)
    const initialCheckTimeout = setTimeout(() => {
      checkCurrentUser()
    }, 100)

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (isMounted) {
          console.log('[AuthContext] onAuthStateChanged fired, user:', user ? user.email : 'null')
          clearTimeout(timeoutId)
          clearTimeout(initialCheckTimeout)
          setCurrentUser(user)
          setLoading(false)
        }
      },
      (error) => {
        if (isMounted) {
          console.error('[AuthContext] onAuthStateChanged error:', error)
          clearTimeout(timeoutId)
          clearTimeout(initialCheckTimeout)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      clearTimeout(initialCheckTimeout)
      unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

