import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    })
  }

  console.error('[api] unexpected error', err)
  
  // In development, show more error details
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production'
  
  if (isDevelopment && err instanceof Error) {
    return res.status(500).json({ 
      error: 'Unexpected server error',
      message: err.message,
      stack: err.stack,
      name: err.name,
    })
  }
  
  return res.status(500).json({ error: 'Unexpected server error' })
}

