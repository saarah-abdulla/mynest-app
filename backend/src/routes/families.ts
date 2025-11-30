import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'

const router = Router()

const familySchema = z.object({
  name: z.string().min(2),
  region: z.string().min(2),
  timezone: z.string().min(2),
})

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    // Get user's familyId if authenticated
    let familyId: string | undefined
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (authUser?.uid) {
      const user = await prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { familyId: true },
      })
      familyId = user?.familyId || undefined
      console.log(`[families] User ${authUser.uid} has familyId: ${familyId || 'none'}`)
    } else {
      console.log('[families] No authenticated user found, returning no families')
    }

    // Users should only see their own family
    if (familyId) {
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        include: { children: true, caregivers: true, users: true },
      })
      console.log(`[families] Returning family: ${familyId}`)
      return res.json(family ? [family] : [])
    } else {
      // No familyId means return empty array
      console.log('[families] No familyId, returning empty array')
      return res.json([])
    }
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const family = await prisma.family.findUnique({
      where: { id: req.params.id },
      include: { children: true, caregivers: true, users: true },
    })
    if (!family) return res.status(404).json({ error: 'Family not found' })
    res.json(family)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = familySchema.parse(req.body)
    const created = await prisma.family.create({ data })
    res.status(201).json(created)
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const data = familySchema.partial().parse(req.body)
    const updated = await prisma.family.update({
      where: { id: req.params.id },
      data,
    })
    res.json(updated)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.family.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)

export default router

