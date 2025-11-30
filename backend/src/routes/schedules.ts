import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../middleware/asyncHandler'
import { prisma } from '../lib/prisma'

const router = Router()

const scheduleSchema = z.object({
  title: z.string().min(2),
  category: z.enum([
    'school',
    'activity',
    'meal',
    'medication',
    'sleep',
    'medical',
    'appointment',
    'social',
    'play',
    'feeding',
    'nap',
    'other',
  ]),
  location: z.string().optional(),
  notes: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  childId: z.string().min(1),
  createdById: z.string().min(1),
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
    }

    // If we have a familyId, filter children by family, then get their schedules
    let where: any = {}
    if (familyId) {
      const children = await prisma.child.findMany({
        where: { familyId },
        select: { id: true },
      })
      const childIds = children.map((c) => c.id)
      where = { childId: { in: childIds } }
    } else {
      // Authenticated user without a family should not see any schedule entries
      return res.json([])
    }

    const entries = await prisma.scheduleEntry.findMany({
      where,
      include: { child: true, createdBy: true },
      orderBy: { startTime: 'asc' },
    })
    // Transform to match frontend type
    const transformed = entries.map((entry) => ({
      id: entry.id,
      childId: entry.childId,
      title: entry.title,
      category: entry.category,
      location: entry.location,
      startTime: entry.startTime.toISOString(),
      endTime: entry.endTime.toISOString(),
      notes: entry.notes,
      createdBy: entry.createdById,
    }))
    res.json(transformed)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: req.params.id },
      include: { child: true, createdBy: true },
    })
    if (!entry) return res.status(404).json({ error: 'Schedule entry not found' })
    res.json(entry)
  }),
)

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const data = scheduleSchema.parse(req.body)
    const created = await prisma.scheduleEntry.create({ data })
    res.status(201).json(created)
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const data = scheduleSchema.partial().parse(req.body)
    const updated = await prisma.scheduleEntry.update({
      where: { id: req.params.id },
      data,
    })
    res.json(updated)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.scheduleEntry.delete({ where: { id: req.params.id } })
    res.status(204).end()
  }),
)

export default router

