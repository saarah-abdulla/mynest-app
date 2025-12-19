import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { ensureFirebase, verifyFirebaseToken } from './middleware/firebaseAuth'

const app = express()
const port = Number(process.env.PORT ?? 4000)

// Security: Validate ALLOW_ORIGINS is set (required for production)
const allowOriginsEnv = process.env.ALLOW_ORIGINS
const isProduction = process.env.NODE_ENV === 'production'

if (!allowOriginsEnv || allowOriginsEnv.trim() === '') {
  const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║                    SECURITY CONFIGURATION ERROR                ║
╚════════════════════════════════════════════════════════════════╝

ALLOW_ORIGINS environment variable is not set!

This is REQUIRED for security. Without it, the API would allow requests
from any origin, which is a critical security vulnerability.

HOW TO FIX:
1. Go to Railway Dashboard → Your Backend Service → Variables
2. Add a new variable:
   - Key: ALLOW_ORIGINS
   - Value: Your frontend domain(s), comma-separated
   - Example: https://mynest-app.vercel.app,https://mynest.ae

For local development, you can set it in your .env file:
   ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000

The application will not start until this is configured.
`
  console.error(errorMessage)
  process.exit(1)
}

const allowOrigins = allowOriginsEnv.split(',').map((origin) => origin.trim()).filter(Boolean)

if (allowOrigins.length === 0) {
  const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║                    SECURITY CONFIGURATION ERROR                ║
╚════════════════════════════════════════════════════════════════╝

ALLOW_ORIGINS is set but contains no valid origins!

Please check your ALLOW_ORIGINS environment variable and ensure it
contains at least one valid origin URL (e.g., https://your-app.vercel.app)

The application will not start until this is configured correctly.
`
  console.error(errorMessage)
  process.exit(1)
}

// Log allowed origins in development (for debugging)
if (!isProduction) {
  console.log(`[CORS] Allowing origins: ${allowOrigins.join(', ')}`)
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true)
      }
      
      if (allowOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (_req, res) => {
  res.json({
    message: 'MyNest API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: {
        users: '/api/users',
        families: '/api/families',
        children: '/api/children',
        caregivers: '/api/caregivers',
        schedule: '/api/schedule',
        journal: '/api/journal',
      },
    },
  })
})

// Health check endpoint - must be before auth middleware for Railway health checks
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

const shouldEnforceAuth = process.env.SKIP_AUTH !== 'true'
// Always try to initialize Firebase if credentials are available (even in skip mode)
// This allows us to extract user info for filtering
ensureFirebase()

if (shouldEnforceAuth) {
  app.use('/api', verifyFirebaseToken, routes)
} else {
  // Even in skip mode, try to extract user info from token if provided
  // This allows filtering by family while still allowing unauthenticated access
  app.use('/api', verifyFirebaseToken, routes)
}

app.use(errorHandler)

const host = process.env.HOST || '0.0.0.0'
app.listen(port, host, () => {
  console.log(`MyNest API listening on http://${host}:${port}`)
})

// Force Railway rebuild
