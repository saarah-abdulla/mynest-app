import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createTestApp } from './app'
import { testPrisma } from './setup'
import { createTestUser, createTestFamily, getMockAuthHeader } from './helpers'

describe('API Health Check', () => {
  const app = createTestApp()

  it('should return API info at root', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200)

    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toBe('MyNest API v1')
  })

  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body).toHaveProperty('status')
    expect(response.body.status).toBe('ok')
  })
})

describe('Users API', () => {
  const app = createTestApp()
  let testFamily: any
  let testUser: any

  beforeEach(async () => {
    // Create test data
    testFamily = await testPrisma.family.create({
      data: {
        name: 'Test Family',
        region: 'Test Region',
        timezone: 'UTC',
      },
    })

    testUser = await createTestUser({
      firebaseUid: 'test-firebase-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'parent',
      familyId: testFamily.id,
    })
  })

  it('should list users in the same family', async () => {
    // Note: This test requires proper Firebase token mocking
    // For now, it demonstrates the test structure
    const response = await request(app)
      .get('/api/users')
      .set(getMockAuthHeader('test-firebase-uid-123'))
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
  })
})


