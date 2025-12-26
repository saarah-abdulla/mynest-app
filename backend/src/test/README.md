# Testing Setup

This directory contains the testing infrastructure for the MyNest backend API.

## Setup

1. **Create a test database**
   - Create a separate PostgreSQL database for testing (e.g., `mynest_test`)
   - This ensures tests don't affect development or production data

2. **Configure test environment**
   - Copy `.env.test.example` to `.env.test` in the backend directory
   - Fill in your `TEST_DATABASE_URL`:
     ```
     TEST_DATABASE_URL="postgresql://user:password@localhost:5432/mynest_test?schema=public"
     ```

3. **Optional: Configure Firebase for auth tests**
   - If you want to test Firebase authentication, add Firebase credentials to `.env.test`
   - Or set `SKIP_AUTH="true"` to bypass authentication in tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `setup.ts` - Test database setup and teardown
- `app.ts` - Creates Express app instance for testing
- `helpers.ts` - Helper functions for creating test data
- `example.test.ts` - Example test file showing test structure

## Writing Tests

Example test structure:

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createTestApp } from './app'
import { testPrisma } from './setup'
import { createTestUser, createTestFamily } from './helpers'

describe('My Feature', () => {
  const app = createTestApp()

  it('should do something', async () => {
    // Create test data
    const family = await createTestFamily({
      name: 'Test Family',
      region: 'Test',
      timezone: 'UTC',
    })

    // Make request
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', 'Bearer test-token')
      .expect(200)

    // Assert
    expect(response.body).toHaveProperty('data')
  })
})
```

## Test Database

The test setup automatically:
- Runs migrations before all tests
- Cleans up test data after each test
- Cleans up all data after all tests complete

Make sure your test database is separate from development/production to avoid data loss.


