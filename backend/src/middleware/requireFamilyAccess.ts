import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

type AuthedRequest = Request & {
  user?: { uid: string }
  familyId?: string
}

export async function requireFamilyAccess(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthedRequest
  const authUser = authReq.user

  if (!authUser?.uid) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { firebaseUid: authUser.uid },
    select: { familyId: true },
  })

  if (!user?.familyId) {
    return res.status(403).json({ error: 'Forbidden: User does not belong to a family' })
  }

  authReq.familyId = user.familyId
  return next()
}
