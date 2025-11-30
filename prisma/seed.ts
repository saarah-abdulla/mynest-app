import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a family
  const family = await prisma.family.upsert({
    where: { id: 'fam_hussein' },
    update: {},
    create: {
      id: 'fam_hussein',
      name: 'Hussein Family',
      region: 'Dubai, UAE',
      timezone: 'Asia/Dubai',
    },
  })

  console.log('✅ Created family:', family.name)

  // Create users
  const parent = await prisma.user.upsert({
    where: { firebaseUid: 'firebase_parent_001' },
    update: {},
    create: {
      firebaseUid: 'firebase_parent_001',
      email: 'parent@hussein.family',
      displayName: 'Parent User',
      role: 'parent',
      familyId: family.id,
    },
  })

  const caregiverUser = await prisma.user.upsert({
    where: { firebaseUid: 'firebase_caregiver_001' },
    update: {},
    create: {
      firebaseUid: 'firebase_caregiver_001',
      email: 'caregiver@hussein.family',
      displayName: 'Aisha Khan',
      role: 'caregiver',
      familyId: family.id,
    },
  })

  console.log('✅ Created users')

  // Create caregivers
  const caregiver1 = await prisma.caregiver.upsert({
    where: { id: 'caregiver_001' },
    update: {},
    create: {
      id: 'caregiver_001',
      fullName: 'Aisha Khan',
      phone: '+97150000000',
      notes: 'Specializes in toddlers',
      familyId: family.id,
      userId: caregiverUser.id,
    },
  })

  const caregiver2 = await prisma.caregiver.upsert({
    where: { id: 'caregiver_002' },
    update: {},
    create: {
      id: 'caregiver_002',
      fullName: 'Noor Al Shamsi',
      phone: '+97150111111',
      notes: 'Bilingual (Arabic/English)',
      familyId: family.id,
    },
  })

  console.log('✅ Created caregivers')

  // Create children
  const child1 = await prisma.child.upsert({
    where: { id: 'child_bader' },
    update: {},
    create: {
      id: 'child_bader',
      fullName: 'Bader Hussein',
      birthdate: new Date('2018-06-15'),
      school: 'school_age',
      familyId: family.id,
    },
  })

  const child2 = await prisma.child.upsert({
    where: { id: 'child_adam' },
    update: {},
    create: {
      id: 'child_adam',
      fullName: 'Adam Hussein',
      birthdate: new Date('2019-08-20'),
      school: 'school_age',
      familyId: family.id,
    },
  })

  console.log('✅ Created children')

  // Assign caregivers to children
  await prisma.childCaregiver.upsert({
    where: {
      childId_caregiverId: {
        childId: child1.id,
        caregiverId: caregiver1.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      caregiverId: caregiver1.id,
    },
  })

  await prisma.childCaregiver.upsert({
    where: {
      childId_caregiverId: {
        childId: child2.id,
        caregiverId: caregiver1.id,
      },
    },
    update: {},
    create: {
      childId: child2.id,
      caregiverId: caregiver1.id,
    },
  })

  console.log('✅ Assigned caregivers to children')

  // Create schedule entries
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const today = new Date()
  today.setHours(16, 30, 0, 0)

  const friday = new Date()
  const daysUntilFriday = (5 - friday.getDay() + 7) % 7 || 7
  friday.setDate(friday.getDate() + daysUntilFriday)
  friday.setHours(14, 0, 0, 0)

  await prisma.scheduleEntry.upsert({
    where: { id: 'schedule_001' },
    update: {},
    create: {
      id: 'schedule_001',
      title: 'Pediatrician Appointment',
      category: 'medical',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      childId: child1.id,
      createdById: parent.id,
    },
  })

  await prisma.scheduleEntry.upsert({
    where: { id: 'schedule_002' },
    update: {},
    create: {
      id: 'schedule_002',
      title: 'Soccer Practice',
      category: 'activity',
      startTime: today,
      endTime: new Date(today.getTime() + 60 * 60 * 1000),
      childId: child2.id,
      createdById: parent.id,
    },
  })

  await prisma.scheduleEntry.upsert({
    where: { id: 'schedule_003' },
    update: {},
    create: {
      id: 'schedule_003',
      title: 'Parent-Teacher Conference',
      category: 'school',
      startTime: friday,
      endTime: new Date(friday.getTime() + 60 * 60 * 1000),
      childId: child1.id,
      createdById: parent.id,
    },
  })

  console.log('✅ Created schedule entries')

  // Create journal entries
  const journalDate1 = new Date()
  journalDate1.setHours(10, 30, 0, 0)

  const journalDate2 = new Date()
  journalDate2.setDate(journalDate2.getDate() - 1)
  journalDate2.setHours(18, 45, 0, 0)

  await prisma.journalEntry.upsert({
    where: { id: 'journal_001' },
    update: {},
    create: {
      id: 'journal_001',
      note: 'Bader ate all his lunch and tried a new fruit.',
      mood: 'happy',
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: journalDate1,
    },
  })

  await prisma.journalEntry.upsert({
    where: { id: 'journal_002' },
    update: {},
    create: {
      id: 'journal_002',
      note: 'Adam practiced reading Arabic letters after dinner.',
      mood: 'calm',
      childId: child2.id,
      authorId: parent.id,
      createdAt: journalDate2,
    },
  })

  console.log('✅ Created journal entries')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



