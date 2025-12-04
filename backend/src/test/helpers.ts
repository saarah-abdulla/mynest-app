import { testPrisma } from './setup'
import type { User, Family, Child, Caregiver } from '@prisma/client'

/**
 * Test helper functions for creating test data
 */

export async function createTestUser(data: {
  firebaseUid: string
  email: string
  displayName: string
  role: 'parent' | 'caregiver'
  familyId?: string
}): Promise<User> {
  return await testPrisma.user.create({
    data: {
      firebaseUid: data.firebaseUid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      familyId: data.familyId,
    },
  })
}

export async function createTestFamily(data: {
  name: string
  region: string
  timezone: string
}): Promise<Family> {
  return await testPrisma.family.create({
    data: {
      name: data.name,
      region: data.region,
      timezone: data.timezone,
    },
  })
}

export async function createTestChild(data: {
  firstName: string
  lastName: string
  birthdate: Date
  gender: string
  familyId: string
  school?: string
}): Promise<Child> {
  return await testPrisma.child.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      birthdate: data.birthdate,
      gender: data.gender,
      familyId: data.familyId,
      school: data.school,
    },
  })
}

export async function createTestCaregiver(data: {
  fullName: string
  familyId: string
  phone?: string
  email?: string
  notes?: string
}): Promise<Caregiver> {
  return await testPrisma.caregiver.create({
    data: {
      fullName: data.fullName,
      familyId: data.familyId,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
    },
  })
}

/**
 * Creates a mock Firebase token for testing
 * In a real test, you would use Firebase Admin SDK to create a test token
 */
export function getMockAuthHeader(firebaseUid: string): { Authorization: string } {
  // For testing, we'll use a mock token format
  // In actual tests with Firebase, you'd generate a real test token
  return {
    Authorization: `Bearer mock-token-${firebaseUid}`,
  }
}

