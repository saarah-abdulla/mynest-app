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

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password).then(() => {
      // User login handled by onAuthStateChanged
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
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

