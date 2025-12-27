import type { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'

let firebaseInitialized = false

export function ensureFirebase() {
  if (firebaseInitialized) {
    console.log('[auth] Firebase already initialized')
    return
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[auth] Firebase credentials not set – skipping initialization')
    console.warn(`[auth] projectId: ${projectId ? 'set' : 'missing'}, clientEmail: ${clientEmail ? 'set' : 'missing'}, privateKey: ${privateKey ? 'set' : 'missing'}`)
    return
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    firebaseInitialized = true
    console.log('[auth] Firebase Admin SDK initialized successfully')
  } catch (error) {
    console.error('[auth] Failed to initialize Firebase Admin SDK:', error)
  }
}

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  // Skip auth middleware for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next()
  }
  
  // If SKIP_AUTH is true, try to extract user info but don't require it
  const skipAuth = process.env.SKIP_AUTH === 'true'
  
  // Always try to initialize Firebase if credentials are available (even in skip mode)
  // This allows us to extract user info for filtering, even if we don't enforce auth
  if (!firebaseInitialized) {
    ensureFirebase()
  }

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  // Try to verify token and extract user info if Firebase is initialized
  if (token && firebaseInitialized) {
    try {
      const decoded = await admin.auth().verifyIdToken(token)
      ;(req as Request & { user?: admin.auth.DecodedIdToken }).user = decoded
      console.log(`[auth] Token verified for user: ${decoded.uid}`)
    } catch (error) {
      if (!skipAuth) {
        console.error('[auth] verifyIdToken failed', error)
        return res.status(401).json({ error: 'Invalid Firebase token' })
      }
      // In skip mode, continue without user info (but log for debugging)
      console.log('[auth] Token verification failed in skip mode (continuing):', error instanceof Error ? error.message : error)
    }
  } else if (token && !firebaseInitialized) {
    console.log('[auth] Token provided but Firebase not initialized - cannot verify')
  } else if (!skipAuth && !token) {
    return res.status(401).json({ error: 'Missing bearer token' })
  } else if (!skipAuth && !firebaseInitialized) {
    return res.status(503).json({ error: 'Firebase not configured' })
  }

  next()
}

