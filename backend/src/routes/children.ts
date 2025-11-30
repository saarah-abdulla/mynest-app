import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'

const router = Router()

const childSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fullName: z.string().min(2).optional(), // Optional, will be computed from firstName + lastName
  birthdate: z.coerce.date(),
  gender: z.string().min(1), // Required in API
  school: z.string().optional(),
  familyId: z.string().min(1),
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
      console.log(`[children] User ${authUser.uid} has familyId: ${familyId || 'none'}`)
    } else {
      console.log('[children] No authenticated user found, returning no children')
      return res.json([])
    }

    // If the user has no family yet, do not leak other families' data
    if (!familyId) {
      console.log('[children] Authenticated user has no familyId, returning no children')
      return res.json([])
    }

    const where = { familyId }
    console.log(`[children] Filtering with where:`, where)
    
    const children = await prisma.child.findMany({
      where,
      include: {
        family: true,
        caregivers: {
          include: {
            caregiver: true,
          },
        },
      },
    })
    console.log(`[children] Found ${children.length} children`)
    // Transform to match frontend type
    const transformed = children.map((child) => ({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      fullName: child.fullName || `${child.firstName} ${child.lastName}`.trim(),
      birthdate: child.birthdate.toISOString().split('T')[0],
      gender: child.gender,
      school: child.school,
      familyId: child.familyId,
      caregivers: child.caregivers.map((cc) => ({
        id: cc.caregiver.id,
        fullName: cc.caregiver.fullName,
        phone: cc.caregiver.phone,
        notes: cc.caregiver.notes,
        familyId: cc.caregiver.familyId,
        createdAt: cc.caregiver.createdAt.toISOString(),
      })),
      createdAt: child.createdAt.toISOString(),
    }))
    res.json(transformed)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const child = await prisma.child.findUnique({
      where: { id: req.params.id },
      include: {
        family: true,
        caregivers: {
          include: { caregiver: true },
        },
        schedule: true,
        journal: true,
      },
    })
    if (!child) return res.status(404).json({ error: 'Child not found' })
    res.json(child)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can create children
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can create children' })
    }

    const data = childSchema.parse(req.body)
    // Compute fullName from firstName and lastName
    const fullName = `${data.firstName} ${data.lastName}`.trim()
    const created = await prisma.child.create({
      data: {
        ...data,
        fullName,
      },
    })
    res.status(201).json(created)
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can edit children
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true, familyId: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can edit children' })
    }

    // Verify child belongs to user's family
    const child = await prisma.child.findUnique({
      where: { id: req.params.id },
      select: { familyId: true },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    if (child.familyId !== user.familyId) {
      return res.status(403).json({ error: 'You can only edit children from your own family' })
    }

    const data = childSchema.partial().parse(req.body)
    // Compute fullName if firstName or lastName are being updated
    let updateData = { ...data }
    if (data.firstName || data.lastName) {
      // Get current child to compute fullName
      const current = await prisma.child.findUnique({
        where: { id: req.params.id },
        select: { firstName: true, lastName: true },
      })
      if (current) {
        const firstName = data.firstName ?? current.firstName
        const lastName = data.lastName ?? current.lastName
        updateData.fullName = `${firstName} ${lastName}`.trim()
      }
    }
    const updated = await prisma.child.update({
      where: { id: req.params.id },
      data: updateData,
    })
    res.json(updated)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can delete children
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true, familyId: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can delete children' })
    }

    if (!user.familyId) {
      return res.status(403).json({ error: 'User does not belong to a family' })
    }

    // Verify child belongs to user's family
    const child = await prisma.child.findUnique({
      where: { id: req.params.id },
      select: { familyId: true },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    if (child.familyId !== user.familyId) {
      return res.status(403).json({ error: 'You can only delete children from your own family' })
    }

    try {
      // Delete related records first
      await prisma.scheduleEntry.deleteMany({
        where: { childId: req.params.id },
      })
      
      await prisma.journalEntry.deleteMany({
        where: { childId: req.params.id },
      })
      
      await prisma.childCaregiver.deleteMany({
        where: { childId: req.params.id },
      })
      
      // Now delete the child
      await prisma.child.delete({ where: { id: req.params.id } })
      res.status(204).end()
    } catch (error: any) {
      console.error('Error deleting child:', error)
      return res.status(500).json({ 
        error: 'Failed to delete child. Please try again.' 
      })
    }
  }),
)

export default router

