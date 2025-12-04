import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

/**
 * Middleware to require family access and attach familyId to request
 * Returns 403 if user has no familyId
 */
export async function requireFamilyAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authUser = (req as Request & { user?: { uid: string } }).user

  if (!authUser?.uid) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true, familyId: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.familyId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be part of a family to access this resource',
      })
    }

    // Attach familyId to request for downstream use
    ;(req as Request & { familyId?: string }).familyId = user.familyId
    ;(req as Request & { userId?: string }).userId = user.id

    next()
  } catch (error) {
    console.error('[requireFamilyAccess] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

