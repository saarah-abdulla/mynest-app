import { beforeAll, afterAll, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load test environment variables from .env.test if it exists
config({ path: resolve(__dirname, '../../.env.test') })

// Use test database URL from environment
// Priority: TEST_DATABASE_URL > DATABASE_URL
let TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL

// Validate database URL format
if (!TEST_DATABASE_URL || TEST_DATABASE_URL.trim() === '') {
  throw new Error(
    '❌ TEST_DATABASE_URL or DATABASE_URL must be set for testing.\n\n' +
    'To fix this:\n' +
    '1. Create a .env.test file in the backend directory\n' +
    '2. Copy .env.test.example to .env.test\n' +
    '3. Set TEST_DATABASE_URL to your test database URL:\n' +
    '   TEST_DATABASE_URL="postgresql://user:password@localhost:5432/mynest_test?schema=public"\n\n' +
    'Example:\n' +
    '   cp .env.test.example .env.test\n' +
    '   # Then edit .env.test and add your TEST_DATABASE_URL'
  )
}

// Validate URL format
if (!TEST_DATABASE_URL.startsWith('postgresql://') && !TEST_DATABASE_URL.startsWith('postgres://')) {
  throw new Error(
    `❌ Invalid TEST_DATABASE_URL format: "${TEST_DATABASE_URL}"\n\n` +
    'The URL must start with "postgresql://" or "postgres://"\n' +
    'Example: postgresql://user:password@localhost:5432/mynest_test?schema=public'
  )
}

// Create a separate Prisma client for testing
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
})

// Schema path relative to backend directory
const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma')

beforeAll(async () => {
  console.log('[test] Setting up test database...')
  
  // Set DATABASE_URL for Prisma commands
  process.env.DATABASE_URL = TEST_DATABASE_URL
  
  try {
    // Run migrations on test database
    console.log('[test] Running migrations...')
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    })
    
    console.log('[test] Test database setup complete')
  } catch (error) {
    console.error('[test] Failed to setup test database:', error)
    throw error
  }
})

afterEach(async () => {
  // Clean up test data after each test
  // Delete in reverse order of dependencies to avoid foreign key constraints
  try {
    await testPrisma.journalEntry.deleteMany()
    await testPrisma.scheduleEntry.deleteMany()
    await testPrisma.childCaregiver.deleteMany()
    await testPrisma.invitation.deleteMany()
    await testPrisma.caregiver.deleteMany()
    await testPrisma.child.deleteMany()
    await testPrisma.user.deleteMany()
    await testPrisma.family.deleteMany()
  } catch (error) {
    console.error('[test] Error cleaning up test data:', error)
    // Don't throw - allow tests to continue
  }
})

afterAll(async () => {
  console.log('[test] Cleaning up test database...')
  
  // Clean up all test data
  try {
    await testPrisma.journalEntry.deleteMany()
    await testPrisma.scheduleEntry.deleteMany()
    await testPrisma.childCaregiver.deleteMany()
    await testPrisma.invitation.deleteMany()
    await testPrisma.caregiver.deleteMany()
    await testPrisma.child.deleteMany()
    await testPrisma.user.deleteMany()
    await testPrisma.family.deleteMany()
  } catch (error) {
    console.error('[test] Error in final cleanup:', error)
  }
  
  // Disconnect Prisma client
  await testPrisma.$disconnect()
  
  console.log('[test] Test database cleanup complete')
})

// Export test Prisma client for use in tests
export { testPrisma }

