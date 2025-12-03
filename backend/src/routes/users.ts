import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../middleware/asyncHandler'

const router = Router()

const userSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  role: z.enum(['parent', 'caregiver']),
  phone: z.string().optional(),
  familyId: z.string().optional(),
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
      console.log(`[users] User ${authUser.uid} has familyId: ${familyId || 'none'}`)
    } else {
      console.log('[users] No authenticated user found, returning no users')
    }

    // Filter users by familyId
    const where = familyId ? { familyId } : { id: 'impossible-id' } // Return empty if no familyId
    console.log(`[users] Filtering with where:`, where)
    
    const users = await prisma.user.findMany({
      where,
      include: { family: true, caregiver: true },
    })
    console.log(`[users] Found ${users.length} users`)
    res.json(users)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    // Try to find by ID first, then by firebaseUid
    let user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { family: true, caregiver: true },
    })
    
    if (!user) {
      // Try finding by firebaseUid
      user = await prisma.user.findUnique({
        where: { firebaseUid: req.params.id },
        include: { family: true, caregiver: true },
      })
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized - Firebase token required' })
    }
    
    const data = userSchema.parse(req.body)
    const firebaseUid = authUser.uid
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { firebaseUid },
    })
    
    if (existing) {
      // Update existing user (especially familyId if provided)
      const updated = await prisma.user.update({
        where: { firebaseUid },
        data: {
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          phone: data.phone,
          // Always update familyId if provided, even if user exists
          familyId: data.familyId || existing.familyId,
        },
      })
      return res.json(updated)
    }
    
    // Create new user with firebaseUid from token
    const created = await prisma.user.create({ 
      data: {
        ...data,
        firebaseUid,
      }
    })
    res.status(201).json(created)
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const data = userSchema.partial().parse(req.body)
    // Try to find by ID first, then by firebaseUid
    let user = await prisma.user.findUnique({
      where: { id: req.params.id },
    })
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { firebaseUid: req.params.id },
      })
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    })
    res.json(updated)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)

export default router

