import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'
import { sendInvitationEmail } from '../lib/email'
import crypto from 'crypto'
import admin from 'firebase-admin'

const router = Router()

const invitationSchema = z.object({
  caregiverId: z.string().min(1),
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
        },
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
        },
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
    const authUser = (req as Request & { user?: { uid: string } }).user

    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Decode the email parameter
    const decodedEmail = decodeURIComponent(email).toLowerCase()

    // Find pending invitation for this email
    const invitation = await prisma.invitation.findFirst({
      where: {
        email: decodedEmail,
        status: 'pending',
        expiresAt: { gt: new Date() },
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

    res.json({
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      caregiverName: invitation.caregiver.fullName,
      familyName: invitation.family.name,
      expiresAt: invitation.expiresAt.toISOString(),
    })
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

    res.json({
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      caregiverName: invitation.caregiver.fullName,
      familyName: invitation.family.name,
      expiresAt: invitation.expiresAt.toISOString(),
    })
  }),
)

// Accept invitation (link user account to caregiver)
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
      include: { caregiver: true },
    })

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already used or expired' })
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })
      return res.status(400).json({ error: 'Invitation has expired' })
    }

    // Find existing user record first (if they already have an account)
    let user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
    })

    // Try to get email - prefer database user email, fallback to Firebase, then invitation email
    let userEmail: string
    if (user) {
      // User already exists - use their database email
      userEmail = user.email
    } else {
      // New user - try to get email from Firebase Admin SDK, fallback to invitation email
      let firebaseUserEmail: string | null = null
      try {
        const firebaseUser = await admin.auth().getUser(authUser.uid)
        firebaseUserEmail = firebaseUser.email || null
      } catch (err: any) {
        // Firebase Admin SDK error - likely credential issue, but we can still proceed
        // We'll use the invitation email as fallback
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

    if (!user) {
      // User record doesn't exist, create it

      // Create user record
      user = await prisma.user.create({
        data: {
          firebaseUid: authUser.uid,
          email: userEmail,
          displayName: userEmail.split('@')[0], // Default to email username
          role: 'caregiver', // Set as caregiver since they're accepting an invitation
          familyId: invitation.familyId,
        },
      })
    } else {
      // User exists, verify email matches invitation
      if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        return res.status(400).json({ 
          error: `Email mismatch. Invitation is for ${invitation.email}, but your account email is ${user.email}` 
        })
      }
      // Ensure the user role is set to caregiver (in case they were created as parent first)
      // This will be updated again below, but set it here to ensure consistency
      if (user.role !== 'caregiver') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'caregiver' },
        })
      }
    }

    // Check if caregiver is already linked to a user (invitation already accepted)
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: invitation.caregiverId },
    })

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' })
    }

    if (caregiver.userId && caregiver.userId !== user.id) {
      // Caregiver is already linked to a different user
      return res.status(400).json({ 
        error: 'This invitation has already been accepted by another user',
        details: 'This caregiver account is already linked to a different user',
      })
    }

    if (caregiver.userId === user.id) {
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
        caregiverId: invitation.caregiverId,
        familyId: invitation.familyId,
      })
    }

    // Link user to caregiver
    await prisma.caregiver.update({
      where: { id: invitation.caregiverId },
      data: { userId: user.id },
    })

    // Update user to have caregiver role and familyId
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'caregiver',
        familyId: invitation.familyId,
      },
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    })

    res.json({
      message: 'Invitation accepted successfully',
      caregiverId: invitation.caregiverId,
      familyId: invitation.familyId,
    })
  }),
)

export default router

