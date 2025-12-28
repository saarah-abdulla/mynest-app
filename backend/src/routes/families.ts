import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { requireFamilyAccess } from '../middleware/requireFamilyAccess'
import { prisma } from '../lib/prisma'
import crypto from 'crypto'
import { sendInvitationEmail } from '../lib/email'

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
  requireFamilyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    const familyId = (req as Request & { familyId?: string }).familyId
    
    // Verify the family ID matches the user's family
    if (req.params.id !== familyId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own family' })
    }
    
    // Check user role - only parents can edit family details
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser!.uid },
      select: { role: true },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can edit family details' })
    }
    
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

// Invite a parent to the family
router.post(
  '/:id/invite-parent',
  requireFamilyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    const familyId = (req as Request & { familyId?: string }).familyId
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Verify the family ID matches
    if (req.params.id !== familyId) {
      return res.status(403).json({ error: 'Forbidden: You can only invite parents to your own family' })
    }
    
    // Check user role - only parents can invite other parents
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true, id: true },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can invite other parents' })
    }
    
    const { email } = req.body
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }
    
    // Get family info
    const family = await prisma.family.findUnique({
      where: { id: familyId! },
    })
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' })
    }
    
    // Check if user with this email already exists and is already a parent in this family
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    
    if (existingUser && existingUser.familyId === familyId && existingUser.role === 'parent') {
      return res.status(400).json({ error: 'This user is already a parent in this family' })
    }
    
    // Check if there's already a pending parent invitation for this email and family
    // Note: Filter manually since invitationType may not be in generated types yet
    const existingInvitations = await prisma.invitation.findMany({
      where: {
        email: email.toLowerCase(),
        familyId: familyId!,
        status: 'pending',
      },
    })
    const existingInvitation = existingInvitations.find((inv: any) => {
      // Parent invitations have invitationType='parent' OR no caregiverId
      return (inv.invitationType === 'parent' || !inv.caregiverId)
    })
    
    // Get inviter displayName for email (before creating invitation)
    const inviterUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { displayName: true },
    })
    
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now
    
    let invitation
    if (existingInvitation) {
      // Update existing invitation
      invitation = await prisma.invitation.update({
        where: { id: existingInvitation.id },
        data: {
          token,
          status: 'pending',
          expiresAt,
          invitedBy: user.id,
        },
      })
    } else {
      // Create new parent invitation (caregiverId is null for parent invitations)
      invitation = await prisma.invitation.create({
        data: {
          token,
          email: email.toLowerCase(),
          familyId: familyId!,
          invitedBy: user.id,
          expiresAt,
          invitationType: 'parent',
          caregiverId: null, // Explicitly null for parent invitations
        } as any, // Type assertion needed until Prisma client is regenerated with new schema
      })
    }
    
    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`
    
    // Get inviter displayName for email (already fetched above)
    try {
      await sendInvitationEmail({
        to: email,
        parentName: email.split('@')[0], // Use email username as name
        familyName: family.name,
        inviterName: inviterUser?.displayName || 'A family member',
        invitationLink,
        invitationType: 'parent',
      })
    } catch (error) {
      console.error('Failed to send parent invitation email:', error)
      // Don't fail the request if email fails, but log it
    }
    
    res.status(201).json({
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      invitationType: 'parent',
    })
  }),
)

export default router

