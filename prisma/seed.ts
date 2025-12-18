import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with demo data...')

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
      displayName: 'Sarah Hussein',
      role: 'parent',
      phone: '+971501234567',
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
      phone: '+971500000001',
      email: 'aisha.khan@example.com',
      notes: 'Specializes in toddlers and early childhood development',
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
      phone: '+971500000002',
      email: 'noor.alshamsi@example.com',
      notes: 'Bilingual (Arabic/English), available weekends',
      familyId: family.id,
    },
  })

  console.log('✅ Created caregivers')

  // Create children (with firstName, lastName, gender)
  const child1 = await prisma.child.upsert({
    where: { id: 'child_bader' },
    update: {},
    create: {
      id: 'child_bader',
      fullName: 'Bader Hussein',
      firstName: 'Bader',
      lastName: 'Hussein',
      birthdate: new Date('2018-06-15'),
      gender: 'male',
      school: 'Little Stars Academy',
      familyId: family.id,
    },
  })

  const child2 = await prisma.child.upsert({
    where: { id: 'child_adam' },
    update: {},
    create: {
      id: 'child_adam',
      fullName: 'Adam Hussein',
      firstName: 'Adam',
      lastName: 'Hussein',
      birthdate: new Date('2019-08-20'),
      gender: 'male',
      school: 'Little Stars Academy',
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

  await prisma.childCaregiver.upsert({
    where: {
      childId_caregiverId: {
        childId: child1.id,
        caregiverId: caregiver2.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      caregiverId: caregiver2.id,
    },
  })

  console.log('✅ Assigned caregivers to children')

  // Create schedule entries (events)
  const today = new Date()
  today.setHours(16, 30, 0, 0)
  today.setMinutes(0, 0, 0)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  tomorrow.setMinutes(0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)
  nextWeek.setMinutes(0, 0, 0)

  const friday = new Date()
  const daysUntilFriday = (5 - friday.getDay() + 7) % 7 || 7
  friday.setDate(friday.getDate() + daysUntilFriday)
  friday.setHours(14, 0, 0, 0)
  friday.setMinutes(0, 0, 0)

  await prisma.scheduleEntry.upsert({
    where: { id: 'schedule_001' },
    update: {},
    create: {
      id: 'schedule_001',
      title: 'Pediatrician Appointment',
      category: 'medical',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      notes: 'Annual checkup for Bader',
      location: 'Dubai Health Center',
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
      endTime: new Date(today.getTime() + 90 * 60 * 1000),
      notes: 'Weekly practice session',
      location: 'Dubai Sports Club',
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
      notes: 'Discuss academic progress',
      location: 'Little Stars Academy',
      childId: child1.id,
      createdById: parent.id,
    },
  })

  await prisma.scheduleEntry.upsert({
    where: { id: 'schedule_004' },
    update: {},
    create: {
      id: 'schedule_004',
      title: 'Birthday Party',
      category: 'social',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
      notes: "Friend's birthday celebration",
      location: 'Community Center',
      childId: child2.id,
      createdById: parent.id,
    },
  })

  console.log('✅ Created schedule entries')

  // Create journal entries with structured data
  const now = new Date()
  
  // Today's entries
  const todayMorning = new Date(now)
  todayMorning.setHours(8, 30, 0, 0)
  todayMorning.setMinutes(0, 0, 0)

  const todayLunch = new Date(now)
  todayLunch.setHours(12, 15, 0, 0)
  todayLunch.setMinutes(0, 0, 0)

  const todayNap = new Date(now)
  todayNap.setHours(14, 0, 0, 0)
  todayNap.setMinutes(0, 0, 0)

  const todayActivity = new Date(now)
  todayActivity.setHours(16, 0, 0, 0)
  todayActivity.setMinutes(0, 0, 0)

  // Yesterday's entries
  const yesterdayMorning = new Date(now)
  yesterdayMorning.setDate(yesterdayMorning.getDate() - 1)
  yesterdayMorning.setHours(8, 0, 0, 0)
  yesterdayMorning.setMinutes(0, 0, 0)

  const yesterdayLunch = new Date(now)
  yesterdayLunch.setDate(yesterdayLunch.getDate() - 1)
  yesterdayLunch.setHours(12, 30, 0, 0)
  yesterdayLunch.setMinutes(0, 0, 0)

  // Meal entry for today
  await prisma.journalEntry.upsert({
    where: { id: 'journal_001' },
    update: {},
    create: {
      id: 'journal_001',
      note: 'Breakfast: Scrambled eggs, toast, and orange juice. Ate everything!',
      mood: 'happy',
      meals: {
        breakfast: {
          date: todayMorning.toISOString().split('T')[0],
          time: '08:30',
          items: ['Scrambled eggs', 'Toast', 'Orange juice'],
          amount: 'Full portion',
        },
      },
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: todayMorning,
    },
  })

  // Meal entry for lunch
  await prisma.journalEntry.upsert({
    where: { id: 'journal_002' },
    update: {},
    create: {
      id: 'journal_002',
      note: 'Lunch: Chicken rice, vegetables, and yogurt. Tried new vegetables!',
      mood: 'happy',
      meals: {
        lunch: {
          date: todayLunch.toISOString().split('T')[0],
          time: '12:15',
          items: ['Chicken rice', 'Mixed vegetables', 'Yogurt'],
          amount: 'Most of it',
        },
      },
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: todayLunch,
    },
  })

  // Nap entry
  await prisma.journalEntry.upsert({
    where: { id: 'journal_003' },
    update: {},
    create: {
      id: 'journal_003',
      note: 'Afternoon nap: Slept well for 2 hours. Woke up refreshed.',
      mood: 'calm',
      naps: {
        date: todayNap.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        duration: '2 hours',
        quality: 'good',
      },
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: todayNap,
    },
  })

  // Activity entry
  await prisma.journalEntry.upsert({
    where: { id: 'journal_004' },
    update: {},
    create: {
      id: 'journal_004',
      note: 'Played with building blocks and read a story. Very engaged!',
      mood: 'happy',
      activities: {
        date: todayActivity.toISOString().split('T')[0],
        time: '16:00',
        type: 'Play',
        description: 'Building blocks and story time',
        other: 'Very creative with block structures',
      },
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: todayActivity,
    },
  })

  // Medication entry (scheduled)
  const medicationTime = new Date(now)
  medicationTime.setHours(9, 0, 0, 0)
  medicationTime.setMinutes(0, 0, 0)

  await prisma.journalEntry.upsert({
    where: { id: 'journal_005' },
    update: {},
    create: {
      id: 'journal_005',
      note: 'Scheduled: 09:00 - Vitamin D supplement',
      mood: null,
      medication: {
        name: 'Vitamin D Supplement',
        amount: '1 tablet',
        scheduledDate: medicationTime.toISOString().split('T')[0],
        scheduledTime: '09:00',
        status: 'scheduled',
      },
      childId: child1.id,
      authorId: parent.id,
      createdAt: medicationTime,
    },
  })

  // Medication entry (given)
  const medicationGiven = new Date(now)
  medicationGiven.setDate(medicationGiven.getDate() - 1)
  medicationGiven.setHours(9, 15, 0, 0)
  medicationGiven.setMinutes(0, 0, 0)

  await prisma.journalEntry.upsert({
    where: { id: 'journal_006' },
    update: {},
    create: {
      id: 'journal_006',
      note: 'Given: 09:15 - Vitamin D supplement',
      mood: null,
      medication: {
        name: 'Vitamin D Supplement',
        amount: '1 tablet',
        scheduledDate: medicationGiven.toISOString().split('T')[0],
        scheduledTime: '09:00',
        givenDate: medicationGiven.toISOString().split('T')[0],
        givenTime: '09:15',
        status: 'given',
      },
      childId: child1.id,
      authorId: caregiverUser.id,
      createdAt: medicationGiven,
    },
  })

  // Yesterday's meal entry
  await prisma.journalEntry.upsert({
    where: { id: 'journal_007' },
    update: {},
    create: {
      id: 'journal_007',
      note: 'Breakfast: Oatmeal with fruits. Good appetite.',
      mood: 'calm',
      meals: {
        breakfast: {
          date: yesterdayMorning.toISOString().split('T')[0],
          time: '08:00',
          items: ['Oatmeal', 'Banana', 'Berries'],
          amount: 'Full portion',
        },
      },
      childId: child2.id,
      authorId: parent.id,
      createdAt: yesterdayMorning,
    },
  })

  // Yesterday's lunch entry
  await prisma.journalEntry.upsert({
    where: { id: 'journal_008' },
    update: {},
    create: {
      id: 'journal_008',
      note: 'Lunch: Pasta with vegetables. Enjoyed it!',
      mood: 'happy',
      meals: {
        lunch: {
          date: yesterdayLunch.toISOString().split('T')[0],
          time: '12:30',
          items: ['Pasta', 'Mixed vegetables', 'Cheese'],
          amount: 'Full portion',
        },
      },
      childId: child2.id,
      authorId: caregiverUser.id,
      createdAt: yesterdayLunch,
    },
  })

  // Mood entry
  const moodTime = new Date(now)
  moodTime.setHours(18, 0, 0, 0)
  moodTime.setMinutes(0, 0, 0)

  await prisma.journalEntry.upsert({
    where: { id: 'journal_009' },
    update: {},
    create: {
      id: 'journal_009',
      note: 'Evening mood check: Very happy after playing outside.',
      mood: 'happy',
      moodDetails: 'Played in the garden, very energetic and cheerful',
      childId: child2.id,
      authorId: parent.id,
      createdAt: moodTime,
    },
  })

  console.log('✅ Created journal entries')
  console.log('🎉 Demo data seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`   - Family: ${family.name}`)
  console.log(`   - Users: 2 (1 parent, 1 caregiver)`)
  console.log(`   - Children: 2`)
  console.log(`   - Caregivers: 2`)
  console.log(`   - Schedule entries: 4`)
  console.log(`   - Journal entries: 9`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
