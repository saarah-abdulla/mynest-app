import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'

const router = Router()

const journalSchema = z.object({
  note: z.string().min(2),
  mood: z.enum(['happy', 'calm', 'tired', 'fussy']).optional(),
  moodDetails: z.string().optional(),
  meals: z.any().optional(),
  naps: z.any().optional(),
  activities: z.any().optional(),
  medication: z.any().optional(),
  childId: z.string().min(1),
  authorId: z.string().min(1),
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
      console.log(`[journal] User ${authUser.uid} has familyId: ${familyId || 'none'}`)
    } else {
      console.log('[journal] No authenticated user found, returning no entries')
    }

    // Filter by familyId through child relationship
    let where: any = {}
    if (familyId) {
      // Get children in this family
      const children = await prisma.child.findMany({
        where: { familyId },
        select: { id: true },
      })
      const childIds = children.map((c: { id: string }) => c.id)
      where = { childId: { in: childIds } }
    } else {
      // No familyId means no entries
      where = { id: 'impossible-id' } // Return empty result
    }

    console.log(`[journal] Filtering with where:`, where)
    
    const entries = await prisma.journalEntry.findMany({
      where,
      include: { child: true, author: true },
      orderBy: { createdAt: 'desc' },
    })
    console.log(`[journal] Found ${entries.length} entries`)
    
    // Transform to match frontend type
    const transformed = entries.map((entry: { id: string; childId: string; authorId: string; note: string; mood: string | null; moodDetails: string | null; meals: any; naps: any; activities: any; medication: any; createdAt: Date }) => ({
      id: entry.id,
      childId: entry.childId,
      authorId: entry.authorId,
      note: entry.note,
      mood: entry.mood,
      moodDetails: entry.moodDetails || undefined,
      meals: entry.meals || undefined,
      naps: entry.naps || undefined,
      activities: entry.activities || undefined,
      medication: entry.medication || undefined,
      createdAt: entry.createdAt.toISOString(),
    }))
    res.json(transformed)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: req.params.id },
      include: { child: true, author: true },
    })
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    res.json(entry)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('[journal] Received request body:', JSON.stringify(req.body, null, 2))
      const data = journalSchema.parse(req.body)
      console.log('[journal] Parsed data:', {
        note: data.note?.substring(0, 50),
        hasMedication: !!data.medication,
        hasMeals: !!data.meals,
        hasNaps: !!data.naps,
        hasActivities: !!data.activities,
        medication: data.medication,
      })
      
      const created = await prisma.journalEntry.create({ 
        data: {
          note: data.note,
          mood: data.mood || null,
          moodDetails: data.moodDetails || null,
          meals: data.meals || null,
          naps: data.naps || null,
          activities: data.activities || null,
          medication: data.medication || null,
          childId: data.childId,
          authorId: data.authorId,
        }
      })
      
      console.log('[journal] Created entry:', created.id)
      
      // Transform to match frontend type
      const transformed = {
        id: created.id,
        childId: created.childId,
        authorId: created.authorId,
        note: created.note,
        mood: created.mood || undefined,
        moodDetails: created.moodDetails || undefined,
        meals: created.meals || undefined,
        naps: created.naps || undefined,
        activities: created.activities || undefined,
        medication: created.medication || undefined,
        createdAt: created.createdAt.toISOString(),
      }
      res.status(201).json(transformed)
    } catch (error: any) {
      console.error('[journal] Error creating entry:', error)
      console.error('[journal] Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      })
      throw error // Re-throw to let asyncHandler handle it
    }
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const authUser = (req as Request & { user?: { uid: string } }).user
    
    if (!authUser?.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { id: true, role: true, familyId: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get the entry to check ownership and family
    const entry = await prisma.journalEntry.findUnique({
      where: { id: req.params.id },
      include: { child: true, author: true },
    })

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    // Verify entry belongs to user's family
    if (entry.child.familyId !== user.familyId) {
      return res.status(403).json({ error: 'You can only edit journal entries from your own family' })
    }

    // Allow editing if:
    // 1. User is a parent (can edit any entry in their family), OR
    // 2. User is a caregiver (can edit any entry in their family, but with restrictions)
    if (user.role !== 'parent' && user.role !== 'caregiver') {
      return res.status(403).json({ error: 'Invalid user role' })
    }

    // Parse the request body
    const requestData = journalSchema.partial().parse(req.body)
    
    // If user is a caregiver editing a medication entry, only allow status updates
    if (user.role === 'caregiver' && entry.medication) {
      // Only allow updating medication status
      const medicationArray = Array.isArray(entry.medication) ? entry.medication : [entry.medication]
      const existingMed = (medicationArray[0] as any) || {}
      
      // Get the new status from request
      const newMedication = requestData.medication
      if (newMedication && Array.isArray(newMedication) && newMedication.length > 0) {
        const newMed = newMedication[0] as any
        const newStatus = newMed?.status
        
        // Only update the status, preserve all other fields
        const updatedMedication = [{
          ...existingMed,
          status: newStatus || existingMed.status,
          // Allow givenDate and givenTime to be updated if status is 'given'
          givenDate: newStatus === 'given' ? (newMed?.givenDate || existingMed.givenDate) : existingMed.givenDate,
          givenTime: newStatus === 'given' ? (newMed?.givenTime || existingMed.givenTime) : existingMed.givenTime,
        }]
        
        // Update the note to reflect the new status
        const noteLines = entry.note.split('\n')
        const statusLineIndex = noteLines.findIndex((line: string) => line.startsWith('Status:'))
        if (statusLineIndex >= 0) {
          noteLines[statusLineIndex] = `Status: ${newStatus || existingMed.status}`
        } else {
          noteLines.push(`Status: ${newStatus || existingMed.status}`)
        }
        
        // Add given date/time if status is 'given'
        if (newStatus === 'given' && newMed?.givenDate) {
          const givenTime = newMed?.givenTime ? ` at ${newMed.givenTime}` : ''
          const givenLine = `Given: ${newMed.givenDate}${givenTime}`
          const givenLineIndex = noteLines.findIndex((line: string) => line.startsWith('Given:'))
          if (givenLineIndex >= 0) {
            noteLines[givenLineIndex] = givenLine
          } else {
            noteLines.push(givenLine)
          }
        }
        
        const data = {
          note: noteLines.join('\n'),
          medication: updatedMedication,
        }
        
        const updated = await prisma.journalEntry.update({
          where: { id: req.params.id },
          data,
        })
        return res.json(updated)
      }
    }

    // For parents or caregivers editing non-medication entries, allow full edit
    // (Caregivers can fully edit entries they created, or any entry if it's not medication)
    const updated = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: requestData,
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

    // Check user role - only parents can delete journal entries
    const user = await prisma.user.findUnique({
      where: { firebaseUid: authUser.uid },
      select: { role: true, familyId: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can delete journal entries' })
    }

    // Verify entry belongs to user's family
    const entry = await prisma.journalEntry.findUnique({
      where: { id: req.params.id },
      include: { child: true },
    })

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' })
    }

    if (entry.child.familyId !== user.familyId) {
      return res.status(403).json({ error: 'You can only delete journal entries from your own family' })
    }

    await prisma.journalEntry.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)

export default router

