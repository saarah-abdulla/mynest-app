import { prisma } from '../src/lib/prisma'

async function clearUsers() {
  console.log('🧹 Clearing all users and related data...')
  
  try {
    // Delete in order (respecting foreign key constraints)
    console.log('Deleting journal entries...')
    await prisma.journalEntry.deleteMany()
    
    console.log('Deleting schedule entries...')
    await prisma.scheduleEntry.deleteMany()
    
    console.log('Deleting child-caregiver relationships...')
    await prisma.childCaregiver.deleteMany()
    
    console.log('Deleting children...')
    await prisma.child.deleteMany()
    
    console.log('Deleting invitations...')
    await prisma.invitation.deleteMany()
    
    console.log('Deleting caregivers...')
    await prisma.caregiver.deleteMany()
    
    console.log('Deleting families...')
    await prisma.family.deleteMany()
    
    console.log('Deleting users...')
    await prisma.user.deleteMany()
    
    console.log('✅ All users and related data cleared!')
    
    // Verify
    const userCount = await prisma.user.count()
    console.log(`📊 Remaining users: ${userCount}`)
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearUsers()

