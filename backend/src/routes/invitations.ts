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

// Get invitation by token (must come before /email/:email to avoid conflicts)
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
      return res.status(400).json({ error: 'Invitation already used or expired' })
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      })
      return res.status(400).json({ error: 'Invitation has expired' })
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

    // Get Firebase user info to get email
    let firebaseUserEmail: string | null = null
    try {
      const firebaseUser = await admin.auth().getUser(authUser.uid)
      firebaseUserEmail = firebaseUser.email || null
    } catch (err) {
      console.error('Error fetching Firebase user:', err)
      // If we can't get email from Firebase, we'll use the invitation email
      // but we need to verify the user exists in our DB first
    }

    // Find or create user record
    let user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
    })

    if (!user) {
      // User record doesn't exist, create it
      // Use Firebase email if available, otherwise use invitation email
      const userEmail = firebaseUserEmail || invitation.email

      // Verify email matches invitation
      if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
        return res.status(400).json({ 
          error: `Email mismatch. Invitation is for ${invitation.email}, but your account email is ${userEmail}` 
        })
      }

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

