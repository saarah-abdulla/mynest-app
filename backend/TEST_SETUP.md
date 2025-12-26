# Test Setup Guide

## Quick Fix for Current Error

Your `.env.test` file has an invalid `TEST_DATABASE_URL`. It currently has:
```
TEST_DATABASE_URL="mynest_test2"
```

But it needs to be a full PostgreSQL connection string. Update it to:
```
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/mynest_test2?schema=public"
```

## Full Setup Instructions

### 1. Create a Test Database

```bash
# Using PostgreSQL command line
createdb mynest_test2

# Or using psql
psql -U postgres
CREATE DATABASE mynest_test2;
```

### 2. Configure .env.test

Edit `backend/.env.test` and set your `TEST_DATABASE_URL`:

```bash
# Replace with your actual database credentials
TEST_DATABASE_URL="postgresql://your_username:your_password@localhost:5432/mynest_test2?schema=public"
```

**Common connection string formats:**
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/mynest_test2?schema=public`
- With username: `postgresql://myuser:mypass@localhost:5432/mynest_test2?schema=public`
- No password: `postgresql://postgres@localhost:5432/mynest_test2?schema=public`

### 3. Run Tests

```bash
npm test
```

## Troubleshooting

### Error: "the URL must start with the protocol `postgresql://` or `postgres://`"

This means your `TEST_DATABASE_URL` is not a valid PostgreSQL connection string. Make sure it:
- Starts with `postgresql://` or `postgres://`
- Includes username, password (if required), host, port, and database name
- Example: `postgresql://user:pass@localhost:5432/dbname?schema=public`

### Error: "Vitest cannot be imported in a CommonJS module"

This should be fixed now. If you still see it:
1. Make sure you're running tests from the `backend/` directory
2. Delete the `dist/` folder: `rm -rf dist/`
3. Run tests again: `npm test`

### Database Connection Errors

If you get connection errors:
1. Make sure PostgreSQL is running: `pg_isready`
2. Verify your database exists: `psql -l | grep mynest_test2`
3. Check your credentials are correct in `.env.test`
4. Test the connection: `psql "postgresql://user:pass@localhost:5432/mynest_test2"`


