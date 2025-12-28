# Parent Invitation Manual Test Guide

## Prerequisites
1. Database migration applied: `npx prisma migrate dev`
2. Backend running and accessible
3. Firebase authentication configured
4. SMTP/SendGrid configured for email sending

## Test Steps

### 1. Create Parent Invitation

**Endpoint**: `POST /api/families/:familyId/invite-parent`
**Headers**: 
- `Authorization: Bearer <firebase_token>` (must be authenticated as a parent)

**Body**:
```json
{
  "email": "parent2@example.com"
}
```

**Expected Response** (201):
```json
{
  "id": "...",
  "token": "...",
  "email": "parent2@example.com",
  "status": "pending",
  "expiresAt": "...",
  "invitationType": "parent"
}
```

**Verify in Database**:
```sql
SELECT * FROM "Invitation" WHERE email = 'parent2@example.com';
-- Should show:
-- - invitationType = 'parent'
-- - caregiverId = NULL
-- - status = 'pending'
-- - familyId = <your_family_id>
```

### 2. Accept Parent Invitation

**Endpoint**: `POST /api/invitations/:token/accept`
**Headers**:
- `Authorization: Bearer <firebase_token>` (authenticated as the invited user)

**Expected Response** (200):
```json
{
  "message": "Parent invitation accepted successfully",
  "familyId": "..."
}
```

**Verify in Database**:
```sql
-- Check User table
SELECT * FROM "User" WHERE email = 'parent2@example.com';
-- Should show:
-- - role = 'parent'
-- - familyId = <family_id>

-- Check Invitation table
SELECT * FROM "Invitation" WHERE email = 'parent2@example.com';
-- Should show:
-- - status = 'accepted'
```

### 3. Verify Parent Access

**Endpoint**: `GET /api/users`
**Headers**: 
- `Authorization: Bearer <firebase_token>` (authenticated as the newly added parent)

**Expected Response** (200):
```json
[
  {
    "id": "...",
    "email": "parent2@example.com",
    "role": "parent",
    "familyId": "...",
    ...
  },
  ... (other family members)
]
```

## Test Scenarios

### Scenario 1: New User Accepts Parent Invitation
1. Invite a new email address (not yet registered)
2. User signs up with that email
3. User accepts invitation
4. Verify user is created with role='parent' and familyId set

### Scenario 2: Existing User Accepts Parent Invitation
1. Invite an email address that already has a Firebase account
2. User logs in with that account
3. User accepts invitation
4. Verify user's role is updated to 'parent' and familyId is set

### Scenario 3: Idempotency - Re-accepting Already Accepted Invitation
1. Accept a parent invitation successfully
2. Attempt to accept the same invitation again
3. Should return success message indicating already accepted

### Scenario 4: Invalid Invitation
1. Attempt to accept an expired invitation (expiresAt < now)
2. Should return 400 with error: "Invitation has expired"

3. Attempt to accept an already accepted invitation
4. Should return 400 with error: "Invitation already used or expired"

### Scenario 5: Email Mismatch
1. Invite email: parent2@example.com
2. User signs up/logs in with different email: other@example.com
3. Attempt to accept invitation
4. Should return 400 with error: "Email mismatch"

## Edge Cases to Test

1. **Inviting same email twice**: Should update existing invitation rather than creating duplicate
2. **Inviting user already in family**: Should return 400: "This user is already a parent in this family"
3. **Non-parent trying to invite**: Should return 403: "Only parents can invite other parents"
4. **Invalid family ID**: Should return 403 or 404

## Database Queries for Verification

```sql
-- Check all parent invitations
SELECT * FROM "Invitation" WHERE "invitationType" = 'parent';

-- Check all users with parent role in a family
SELECT * FROM "User" WHERE role = 'parent' AND "familyId" = '<family_id>';

-- Check invitation statuses
SELECT email, status, "invitationType", "expiresAt" 
FROM "Invitation" 
WHERE "invitationType" = 'parent'
ORDER BY "createdAt" DESC;
```

