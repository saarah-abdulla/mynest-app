import express from 'express'
import cors from 'cors'
import routes from '../routes'
import { errorHandler } from '../middleware/errorHandler'
import { verifyFirebaseToken } from '../middleware/firebaseAuth'

/**
 * Creates an Express app instance for testing
 * This allows us to test the API without starting the full server
 */
export function createTestApp() {
  const app = express()
  
  // Use minimal CORS for testing (allow all origins in test)
  app.use(cors({
    origin: '*',
    credentials: true,
  }))
  
  app.use(express.json())
  
  // Mount API routes with authentication middleware
  // In tests, SKIP_AUTH can be set to true to bypass Firebase auth
  app.use('/api', verifyFirebaseToken, routes)
  
  // Add health check endpoint for testing
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  // Error handler must be last
  app.use(errorHandler)
  
  return app
}

