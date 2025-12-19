import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { requireFamilyAccess } from '../middleware/requireFamilyAccess'
import { prisma } from '../lib/prisma'
import { sendInvitationEmail } from '../lib/email'
import crypto from 'crypto'

const router = Router()

const caregiverSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  notes: z.string().optional(),
  email: z.string().email().optional(),
  familyId: z.string().min(1),
  userId: z.string().optional(),
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
      console.log(`[caregivers] User ${authUser.uid} has familyId: ${familyId || 'none'}`)
    } else {
      console.log('[caregivers] No authenticated user found, returning no caregivers')
      return res.json([])
    }

    // Filter by familyId
    if (!familyId) {
      console.log('[caregivers] Authenticated user has no familyId, returning no caregivers')
      return res.json([])
    }

    const where = { familyId }
    console.log(`[caregivers] Filtering with where:`, where)
    
    try {
      const caregivers = await prisma.caregiver.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          notes: true,
          familyId: true,
          createdAt: true,
        },
      })
      console.log(`[caregivers] Found ${caregivers.length} caregivers`)
      
      // Transform to match frontend type
      const transformed = caregivers.map((caregiver: { id: string; fullName: string; email: string | null; phone: string | null; notes: string | null; familyId: string; createdAt: Date }) => ({
        id: caregiver.id,
        fullName: caregiver.fullName,
        email: caregiver.email || undefined,
        phone: caregiver.phone || undefined,
        notes: caregiver.notes || undefined,
        familyId: caregiver.familyId,
        createdAt: caregiver.createdAt.toISOString(),
      }))
      res.json(transformed)
    } catch (error: any) {
      console.error('[caregivers] Error fetching caregivers:', error)
      // If there's a schema mismatch (e.g., email field doesn't exist), try without email
      if (error.code === 'P2025' || error.message?.includes('Unknown column') || error.message?.includes('email')) {
        console.warn('[caregivers] Email column may not exist. Fetching without email field...')
        try {
          const caregivers = await prisma.caregiver.findMany({
            where,
            select: {
              id: true,
              fullName: true,
              phone: true,
              notes: true,
              familyId: true,
              createdAt: true,
            },
          })
          const transformed = caregivers.map((caregiver: { id: string; fullName: string; phone: string | null; notes: string | null; familyId: string; createdAt: Date }) => ({
            id: caregiver.id,
            fullName: caregiver.fullName,
            phone: caregiver.phone || undefined,
            notes: caregiver.notes || undefined,
            familyId: caregiver.familyId,
            createdAt: caregiver.createdAt.toISOString(),
          }))
          return res.json(transformed)
        } catch (fallbackError) {
          console.error('[caregivers] Fallback query also failed:', fallbackError)
          return res.status(500).json({ error: 'Failed to fetch caregivers' })
        }
      }
      return res.status(500).json({ 
        error: 'Failed to fetch caregivers',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }),
)

router.get(
  '/:id',
  requireFamilyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const familyId = (req as Request & { familyId?: string }).familyId
    
    const caregiver = await prisma.caregiver.findUnique({
      where: { 
        id: req.params.id,
        familyId: familyId!, // Ensure caregiver belongs to user's family
      },
      include: {
        family: true,
        user: true,
        assignments: { include: { child: true } },
      },
    })
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' })
    res.json(caregiver)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can create caregivers
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can create caregivers' })
    }

    let data
    try {
      data = caregiverSchema.parse(req.body)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('[caregivers] Validation error:', error.errors)
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      throw error
    }

    try {
      // Create caregiver data object
      const caregiverData: any = {
        fullName: data.fullName,
        phone: data.phone,
        notes: data.notes,
        familyId: data.familyId,
        userId: data.userId,
      }
      
      // Only include email if it's provided
      if (data.email) {
        caregiverData.email = data.email
      }

      const created = await prisma.caregiver.create({ data: caregiverData })

      // If email is provided, try to create and send invitation (non-blocking)
      if (data.email && authUser?.uid) {
        // Use a promise that doesn't block the response
        Promise.resolve().then(async () => {
          try {
            // Get family and inviter info
            const family = await prisma.family.findUnique({
              where: { id: data.familyId },
            })
            
            const inviter = await prisma.user.findUnique({
              where: { firebaseUid: authUser.uid },
            })

            if (!family || !inviter) {
              console.warn(`Cannot send invitation: family or inviter not found for caregiver ${created.id}`)
              return
            }

            // Generate invitation token
            const token = crypto.randomBytes(32).toString('hex')
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 7)

            // Try to create invitation (may fail if table doesn't exist)
            try {
              await prisma.invitation.create({
                data: {
                  token,
                  email: data.email!,
                  caregiverId: created.id,
                  familyId: data.familyId,
                  invitedBy: inviter.id,
                  expiresAt,
                },
              })

              // Send invitation email
              const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`
              
              try {
                await sendInvitationEmail({
                  to: data.email!,
                  caregiverName: created.fullName,
                  familyName: family.name,
                  inviterName: inviter.displayName,
                  invitationLink,
                })
                console.log(`Invitation email sent to ${data.email} for caregiver ${created.id}`)
              } catch (emailError) {
                console.error('Failed to send invitation email:', emailError)
                // Email failure is not critical
              }
            } catch (invitationError: any) {
              // If invitation creation fails (e.g., table doesn't exist), log but don't fail
              console.warn('Failed to create invitation (this is optional):', invitationError.message)
              if (invitationError.code === 'P2003' || invitationError.code === 'P2025' || invitationError.code === 'P2010') {
                console.warn('Invitation table may not exist. Run database migrations: npx prisma migrate dev')
              }
            }
          } catch (error) {
            console.error('Error in invitation process (non-critical):', error)
            // Don't fail caregiver creation if invitation fails
          }
        }).catch((error) => {
          console.error('Unhandled error in invitation promise:', error)
        })
      }

      res.status(201).json(created)
    } catch (error: any) {
      console.error('Error creating caregiver:', error)
      
      // Handle specific database errors
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A caregiver with this information already exists' })
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid family ID' })
      }
      if (error.code === 'P2011') {
        // Missing required value - might be email field doesn't exist
        return res.status(400).json({ 
          error: 'Database schema mismatch. Please run migrations: npx prisma migrate dev',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }
      
      // Generic error
      return res.status(500).json({ 
        error: 'Failed to create caregiver',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }),
)

router.put(
  '/:id',
  requireFamilyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    const familyId = (req as Request & { familyId?: string }).familyId
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can edit caregivers
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can edit caregivers' })
    }

    // Verify caregiver belongs to user's family
    const caregiver = await prisma.caregiver.findUnique({
      where: { 
        id: req.params.id,
        familyId: familyId!, // Ensure caregiver belongs to user's family
      },
      select: { familyId: true },
    })

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' })
    }

    const data = caregiverSchema.partial().parse(req.body)
    const updated = await prisma.caregiver.update({
      where: { id: req.params.id },
      data,
    })
    res.json(updated)
  }),
)

router.delete(
  '/:id',
  requireFamilyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    const familyId = (req as Request & { familyId?: string }).familyId
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check user role - only parents can delete caregivers
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can delete caregivers' })
    }

    // Verify caregiver belongs to user's family
    const caregiver = await prisma.caregiver.findUnique({
      where: { 
        id: req.params.id,
        familyId: familyId!, // Ensure caregiver belongs to user's family
      },
      select: { familyId: true },
    })

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' })
    }

    try {
      // Delete related records first
      await prisma.childCaregiver.deleteMany({
        where: { caregiverId: req.params.id },
      })
      
      // Delete invitation if exists
      await prisma.invitation.deleteMany({
        where: { caregiverId: req.params.id },
      })
      
      // Now delete the caregiver
      await prisma.caregiver.delete({ where: { id: req.params.id } })
      res.status(204).end()
    } catch (error: any) {
      console.error('Error deleting caregiver:', error)
      return res.status(500).json({ 
        error: 'Failed to delete caregiver. Please try again.' 
      })
    }
  }),
)

export default router

