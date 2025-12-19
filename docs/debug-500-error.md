# Debugging 500 Internal Server Error

## Current Issue

Getting a 500 error when creating a user via `POST /api/users` during profile setup.

## Step 1: Check Railway Logs

The error handling has been improved, but we need to see the actual error:

1. Go to **Railway Dashboard** → Your Backend Service
2. Click on **"Logs"** tab
3. Look for error messages around the time you tried to create the user
4. Look for lines that say:
   - `[users] Error creating/updating user:`
   - `[api] unexpected error`
   - Any Prisma error codes (P2002, P2003, P2011, etc.)

## Common Causes

### 1. Email Already Exists (P2002)

**Error Code:** `P2002`  
**Cause:** A user with this email already exists in the database  
**Fix:** The route now handles this and will update the existing user instead

### 2. Invalid Family ID (P2003)

**Error Code:** `P2003`  
**Cause:** The `familyId` provided doesn't exist in the database  
**Fix:** Only provide `familyId` if the family actually exists, or omit it for new users

### 3. Missing Required Field (P2011)

**Error Code:** `P2011`  
**Cause:** A required field in the Prisma schema is missing  
**Fix:** Check that all required fields are being sent:
- `email` (required)
- `displayName` (required, min 2 characters)
- `role` (required, must be 'parent' or 'caregiver')
- `firebaseUid` (automatically set from token)

### 4. Validation Error (ZodError)

**Error:** Zod validation failed  
**Cause:** Data doesn't match the schema  
**Common issues:**
- `displayName` is too short (< 2 characters)
- `email` is not a valid email format
- `role` is not 'parent' or 'caregiver'

## Step 2: Check What Data is Being Sent

Open your browser DevTools → Network tab:
1. Find the `POST /api/users` request
2. Click on it
3. Go to "Payload" or "Request" tab
4. Check what data is being sent

**Expected format:**
```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "role": "parent",
  "phone": "+1234567890" // optional
}
```

## Step 3: Verify Database Schema

Make sure your database schema matches what the code expects:

1. Run migrations if needed:
   ```bash
   cd backend
   railway run npx prisma migrate deploy --schema ../prisma/schema.prisma
   ```

2. Verify the User model has all required fields:
   - `firebaseUid` (unique)
   - `email` (unique)
   - `displayName`
   - `role`

## Step 4: Test with Updated Error Handling

After Railway redeploys with the new error handling:

1. Try creating a user again
2. Check the error message - it should now be more specific
3. The error will tell you exactly what's wrong:
   - "A user with this email already exists"
   - "Invalid family ID"
   - "Missing required field"
   - "Invalid user data" (with validation details)

## Quick Fixes

### If Email Already Exists

The route now automatically updates the existing user instead of failing. This should work seamlessly.

### If Validation Fails

Check the error response for `details` field - it will show which fields failed validation.

### If Database Error

Check Railway logs for the specific Prisma error code and fix accordingly.

## After Fixing

Once the error is resolved:
- User creation should work
- Profile setup should complete
- User should be redirected to dashboard or family setup

## Still Not Working?

If you're still getting a 500 error after checking logs:

1. **Share the Railway log error message** - this will help identify the exact issue
2. **Check the request payload** - verify all required fields are present
3. **Verify database migrations** - ensure schema is up to date

