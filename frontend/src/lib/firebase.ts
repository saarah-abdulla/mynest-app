import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate Firebase config
const missingVars: string[] = []
if (!firebaseConfig.apiKey) missingVars.push('VITE_FIREBASE_API_KEY')
if (!firebaseConfig.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN')
if (!firebaseConfig.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID')
if (!firebaseConfig.storageBucket) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET')
if (!firebaseConfig.messagingSenderId) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID')
if (!firebaseConfig.appId) missingVars.push('VITE_FIREBASE_APP_ID')

if (missingVars.length > 0) {
  console.error('❌ Firebase configuration is missing required environment variables:')
  console.error('Missing variables:', missingVars.join(', '))
  console.error('To fix: Create a .env file in the frontend directory with:')
  console.error('VITE_FIREBASE_API_KEY=your-api-key')
  console.error('VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain')
  console.error('VITE_FIREBASE_PROJECT_ID=your-project-id')
  console.error('VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket')
  console.error('VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id')
  console.error('VITE_FIREBASE_APP_ID=your-app-id')
  throw new Error(`Firebase configuration incomplete. Missing: ${missingVars.join(', ')}`)
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
  throw error
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export default app



