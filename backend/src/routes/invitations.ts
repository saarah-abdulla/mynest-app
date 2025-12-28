import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'
import { sendInvitationEmail } from '../lib/email'
import crypto from 'crypto'
import admin from 'firebase-admin'

const router = Router()

const invitationSchema = z.object({
  caregiverId: z.string().min(1).optional(),
})

// Generate a secure random token
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create invitation and send email
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { caregiverId } = invitationSchema.parse(req.body)
    const authUser = (req as Request & { user?: { uid: string } }).user

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!caregiverId) {
      return res.status(400).json({ error: 'caregiverId is required for caregiver invitations' })
    }

    // Get caregiver and family info
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: caregiverId },
      include: { family: true },
    })

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' })
    }

    if (!caregiver.email) {
      return res.status(400).json({ error: 'Caregiver email is required' })
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
    })

    if (!inviter) {
      return res.status(404).json({ error: 'Inviter not found' })
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findUnique({
      where: { caregiverId },
    })

    const token = generateInvitationToken()
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
          invitedBy: inviter.id,
          invitationType: 'caregiver',
        } as any, // Type assertion needed until Prisma client is regenerated
      })
    } else {
      // Create new invitation
      invitation = await prisma.invitation.create({
        data: {
          token,
          email: caregiver.email,
          caregiverId: caregiver.id,
          familyId: caregiver.familyId,
          invitedBy: inviter.id,
          expiresAt,
          invitationType: 'caregiver',
        } as any, // Type assertion needed until Prisma client is regenerated
      })
    }

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`
    
    try {
      await sendInvitationEmail({
        to: caregiver.email,
        caregiverName: caregiver.fullName,
        familyName: caregiver.family.name,
        inviterName: inviter.displayName,
        invitationLink,
        invitationType: 'caregiver',
      })
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
    })
  }),
)

// Get invitation by email (for auto-acceptance after signup)
// IMPORTANT: This route must come BEFORE /:token to avoid route conflicts
// Express matches routes in order, so more specific routes must come first
router.get(
  '/email/:email',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params

    const invitation = await prisma.invitation.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'pending',
      },
      include: {
        caregiver: true,
        family: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!invitation) {
      return res.status(404).json({ error: 'No pending invitation found for this email' })
    }

    // Return invitation details (caregiver may be null for parent invitations)
    const response: any = {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      familyName: invitation.family.name,
      expiresAt: invitation.expiresAt.toISOString(),
      invitationType: (invitation as any).invitationType || 'caregiver', // Default to caregiver for backward compatibility
    }
    
    // Include caregiverName for caregiver invitations
    if (invitation.caregiver) {
      response.caregiverName = invitation.caregiver.fullName
    }
    
    // Include parentName for parent invitations
    if ((invitation as any).parentName) {
      response.parentName = (invitation as any).parentName
    }
    
    res.json(response)
  }),
)

// Get invitation by token
router.get(
  '/:token',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        caregiver: true,
        family: true,
      },
    })

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      const statusMessage = invitation.status === 'accepted' 
        ? 'This invitation has already been accepted' 
        : invitation.status === 'expired'
        ? 'This invitation has expired'
        : `Invitation status: ${invitation.status}`
      return res.status(400).json({ 
        error: 'Invitation already used or expired',
        details: statusMessage,
        status: invitation.status,
      })
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })
      return res.status(400).json({ 
        error: 'Invitation has expired',
        expiresAt: invitation.expiresAt.toISOString(),
      })
    }

    // Return invitation details (caregiver may be null for parent invitations)
    const response: any = {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      familyName: invitation.family.name,
      expiresAt: invitation.expiresAt.toISOString(),
      invitationType: (invitation as any).invitationType || 'caregiver', // Default to caregiver for backward compatibility
    }
    
    // Include caregiverName for caregiver invitations
    if (invitation.caregiver) {
      response.caregiverName = invitation.caregiver.fullName
    }
    
    // Include parentName for parent invitations
    if ((invitation as any).parentName) {
      response.parentName = (invitation as any).parentName
    }
    
    res.json(response)
  }),
)

// Accept invitation (link user account to caregiver OR add user as parent)
router.post(
  '/:token/accept',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params
    const authUser = (req as Request & { user?: { uid: string } }).user

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { caregiver: true, family: true },
    })

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    // Check expiration first
    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })
      return res.status(400).json({ 
        error: 'Invitation has expired',
        expiresAt: invitation.expiresAt.toISOString(),
      })
    }

    // Determine invitation type (default to 'caregiver' for backward compatibility)
    const invitationType = (invitation as any).invitationType || 'caregiver'

    // Find existing user record first (if they already have an account)
    let user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
    })

    // Try to get email - prefer database user email, fallback to Firebase, then invitation email
    let userEmail: string
    if (user) {
      userEmail = user.email
    } else {
      // New user - try to get email from Firebase Admin SDK, fallback to invitation email
      let firebaseUserEmail: string | null = null
      try {
        const firebaseUser = await admin.auth().getUser(authUser.uid)
        firebaseUserEmail = firebaseUser.email || null
      } catch (err: any) {
        if (err?.code?.includes('credential') || err?.codePrefix === 'app') {
          console.warn('[invitations] Could not fetch Firebase user email (credential issue), using invitation email instead')
        } else {
          console.error('[invitations] Error fetching Firebase user:', err?.message || err)
        }
      }
      userEmail = firebaseUserEmail || invitation.email
    }

    // Verify email matches invitation
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(400).json({ 
        error: `Email mismatch. Invitation is for ${invitation.email}, but your account email is ${userEmail}` 
      })
    }

    // Handle parent invitations
    if (invitationType === 'parent') {
      // Check if user is already a parent in this family (idempotency check - do this BEFORE status check)
      if (user && user.familyId === invitation.familyId && user.role === 'parent') {
        // User is already a parent in this family - invitation was already accepted
        // Mark invitation as accepted if it's still pending (idempotency)
        if (invitation.status === 'pending') {
          await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'accepted' },
          })
        }
        return res.json({
          message: 'Invitation already accepted - you are already a parent in this family',
          familyId: invitation.familyId,
        })
      }

      // Now check invitation status (but only if idempotency check didn't pass)
      if (invitation.status !== 'pending') {
        const statusMessage = invitation.status === 'accepted' 
          ? 'This invitation has already been accepted'
          : invitation.status === 'expired'
          ? 'This invitation has expired'
          : `Invitation status: ${invitation.status}`
        return res.status(400).json({ 
          error: 'Invitation already used or expired',
          details: statusMessage,
          status: invitation.status,
        })
      }

      // Create or update user as parent
      if (!user) {
        // Use parentName from invitation if available, otherwise fall back to email username
        const displayName = (invitation as any).parentName || userEmail.split('@')[0]
        
        // Create new user record with parent role
        user = await prisma.user.create({
          data: {
            firebaseUid: authUser.uid,
            email: userEmail,
            displayName: displayName,
            role: 'parent',
            familyId: invitation.familyId,
          },
        })
        console.log(`[invitations] Created new user ${user.id} with role 'parent' and displayName '${displayName}' for invitation ${invitation.id}`)
      } else {
        // Update existing user to be a parent in this family
        // If invitation has parentName and user's displayName is still email-based, update it
        const parentName = (invitation as any).parentName
        const updateData: any = {
          role: 'parent',
          familyId: invitation.familyId,
        }
        if (parentName && (!user.displayName || user.displayName === userEmail.split('@')[0])) {
          updateData.displayName = parentName
        }
        
        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        })
        console.log(`[invitations] Updated user ${user.id} to parent role and familyId ${invitation.familyId}`)
      }

      // Mark invitation as accepted
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      })

      return res.json({
        message: 'Parent invitation accepted successfully',
        familyId: invitation.familyId,
      })
    }

    // Handle caregiver invitations (existing logic)
    const caregiverId = invitation.caregiverId
    if (!caregiverId) {
      return res.status(400).json({ error: 'Invalid invitation: caregiver invitation must have caregiverId' })
    }

    // Check if caregiver is already linked to this user (idempotency check - do this BEFORE status check)
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: caregiverId },
    })

    if (caregiver && caregiver.userId === user?.id) {
      // User is already linked to this caregiver - invitation was already accepted
      // Mark invitation as accepted if it's still pending (idempotency)
      if (invitation.status === 'pending') {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'accepted' },
        })
      }
      return res.json({
        message: 'Invitation already linked successfully',
        caregiverId: caregiverId,
        familyId: invitation.familyId,
      })
    }

    // Now check invitation status (but only if idempotency check didn't pass)
    if (invitation.status !== 'pending') {
      const statusMessage = invitation.status === 'accepted' 
        ? 'This invitation has already been accepted'
        : invitation.status === 'expired'
        ? 'This invitation has expired'
        : `Invitation status: ${invitation.status}`
      return res.status(400).json({ 
        error: 'Invitation already used or expired',
        details: statusMessage,
        status: invitation.status,
      })
    }

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' })
    }

    if (caregiver.userId && caregiver.userId !== user?.id) {
      // Caregiver is already linked to a different user
      return res.status(400).json({ 
        error: 'This invitation has already been accepted by another user',
        details: 'This caregiver account is already linked to a different user',
      })
    }

    // Create or update user record
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: authUser.uid,
          email: userEmail,
          displayName: userEmail.split('@')[0], // Default to email username
          role: 'caregiver',
          familyId: invitation.familyId,
        },
      })
      console.log(`[invitations] Created new user ${user.id} with role 'caregiver' for invitation ${invitation.id}`)
    } else {
      // Update existing user to be a caregiver
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'caregiver',
          familyId: invitation.familyId,
        },
      })
      console.log(`[invitations] Updated user ${user.id} to caregiver role and familyId ${invitation.familyId}`)
    }

    // Link user to caregiver
    await prisma.caregiver.update({
      where: { id: caregiverId },
      data: { userId: user.id },
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    })

    res.json({
      message: 'Invitation accepted successfully',
      caregiverId: caregiverId,
      familyId: invitation.familyId,
    })
  }),
)

export default router
