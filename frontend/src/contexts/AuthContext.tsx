import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
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
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, sendVerification?: boolean) => Promise<{ user: User }>
  loginWithGoogle: () => Promise<void>
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
    console.log('[AuthContext] auth object:', auth)
    console.log('[AuthContext] auth app:', auth.app?.name)
    
    // Wait for Firebase Auth to initialize before attempting login
    // This is critical for Capacitor apps where initialization can be delayed
    // Access private _initializationPromise via type assertion
    const authAny = auth as any
    if (authAny._initializationPromise) {
      try {
        console.log('[AuthContext] Waiting for Firebase Auth to initialize...')
        await authAny._initializationPromise
        console.log('[AuthContext] Firebase Auth initialized, proceeding with login')
      } catch (initError) {
        console.error('[AuthContext] Firebase Auth initialization error:', initError)
        // Continue anyway - might still work
      }
    }
    
    // Add a small delay to ensure auth is ready
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Add timeout to prevent hanging
    const loginPromise = signInWithEmailAndPassword(auth, email, password)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Login request timed out. Please check your internet connection and try again.'))
      }, 15000) // 15 second timeout
    })
    
    return Promise.race([loginPromise, timeoutPromise])
      .then((userCredential: any) => {
        console.log('[AuthContext] signInWithEmailAndPassword successful, user:', userCredential.user?.email)
        // User login handled by onAuthStateChanged
        return userCredential
      })
      .catch((error) => {
        console.error('[AuthContext] signInWithEmailAndPassword error:', error)
        console.error('[AuthContext] Error code:', error.code)
        console.error('[AuthContext] Error message:', error.message)
        console.error('[AuthContext] Full error:', JSON.stringify(error, null, 2))
        throw error
      })
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider).then(() => {
      // User login handled by onAuthStateChanged
    })
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

