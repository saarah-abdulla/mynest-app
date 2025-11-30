import { Router } from 'express'
import users from './users'
import families from './families'
import children from './children'
import caregivers from './caregivers'
import schedules from './schedules'
import journal from './journal'
import invitations from './invitations'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    message: 'MyNest API v1',
    endpoints: {
      users: '/api/users',
      families: '/api/families',
      children: '/api/children',
      caregivers: '/api/caregivers',
      schedule: '/api/schedule',
      journal: '/api/journal',
    },
  })
})

router.use('/users', users)
router.use('/families', families)
router.use('/children', children)
router.use('/caregivers', caregivers)
router.use('/schedule', schedules)
router.use('/journal', journal)
router.use('/invitations', invitations)

export default router

