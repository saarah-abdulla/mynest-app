import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { ensureFirebase, verifyFirebaseToken } from './middleware/firebaseAuth'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const allowOrigins = process.env.ALLOW_ORIGINS?.split(',').map((origin) => origin.trim())

app.use(
  cors({
    origin: allowOrigins ?? '*',
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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
