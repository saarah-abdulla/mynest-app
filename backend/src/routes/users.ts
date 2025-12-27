import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../middleware/asyncHandler'
import type { User, Family, Caregiver } from '@prisma/client'

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
    let currentUserId: string | undefined
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (authUser?.uid) {
      const user = await prisma.user.findUnique({
        where: { firebaseUid: authUser.uid },
        select: { id: true, familyId: true },
      })
      familyId = user?.familyId || undefined
      currentUserId = user?.id
      console.log(`[users] User ${authUser.uid} has familyId: ${familyId || 'none'}, userId: ${currentUserId || 'none'}`)
    } else {
      console.log('[users] No authenticated user found, returning no users')
    }

    // If user has a familyId, return all users in that family
    // If user has no familyId, return only the current user (for profile setup)
    type UserWithRelations = User & {
      family: Family | null
      caregiver: Caregiver | null
    }
    let users: UserWithRelations[]
    
    if (familyId) {
      users = await prisma.user.findMany({
        where: { familyId },
        include: { family: true, caregiver: true },
      })
      console.log(`[users] Found ${users.length} users in family ${familyId}`)
    } else if (currentUserId) {
      // User has no family yet, but return themselves so profile setup works
      users = await prisma.user.findMany({
        where: { id: currentUserId },
        include: { family: true, caregiver: true },
      })
      console.log(`[users] User has no family, returning only themselves (${users.length} user)`)
    } else {
      // No authenticated user or user doesn't exist in DB yet
      users = []
      console.log(`[users] No user found in database, returning empty list`)
    }
    
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
    
    try {
      const data = userSchema.parse(req.body)
      const firebaseUid = authUser.uid
      
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { firebaseUid },
      })
      
      if (existing) {
        // Update existing user, but don't overwrite familyId if user already has one
        // This prevents users from accidentally changing families during profile setup
        const updateData: any = {
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          phone: data.phone,
        }
        
        // Only update familyId if:
        // 1. It's provided in the request AND
        // 2. The user doesn't already have one (new user completing setup)
        // This prevents overwriting existing familyId when updating profile info
        if (data.familyId && !existing.familyId) {
          updateData.familyId = data.familyId
        } else if (!data.familyId && existing.familyId) {
          // Keep existing familyId if not provided
          updateData.familyId = existing.familyId
        }
        
        const updated = await prisma.user.update({
          where: { firebaseUid },
          data: updateData,
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
    } catch (error: any) {
      console.error('[users] Error creating/updating user:', error)
      
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid user data',
          details: error.errors 
        })
      }
      
      // Handle Prisma unique constraint violations
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field'
        return res.status(400).json({ 
          error: `A user with this ${field} already exists`,
          field 
        })
      }
      
      // Handle Prisma foreign key violations
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          error: 'Invalid family ID or reference',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
      
      // Handle missing required fields
      if (error.code === 'P2011') {
        return res.status(400).json({ 
          error: 'Missing required field',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
      
      // Generic error
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
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
    
    // Protect against overwriting existing familyId unless explicitly intended
    // Only update familyId if user doesn't already have one
    const updateData = { ...data }
    if ('familyId' in updateData && updateData.familyId && user.familyId) {
      // User already has a familyId, don't overwrite it
      // Remove familyId from update data to preserve existing value
      delete updateData.familyId
      console.log(`[users] PUT: User ${user.id} already has familyId ${user.familyId}, preserving it`)
    }
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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

