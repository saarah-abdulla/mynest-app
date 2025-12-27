# Caregiver Lifecycle and Database Updates

## When is a Caregiver Added to the Database?

A **caregiver record is created** when a parent (authenticated user with role 'parent') calls the API endpoint:

```
POST /api/caregivers
```

This happens in `backend/src/routes/caregivers.ts` (line 190):

```typescript
const created = await prisma.caregiver.create({ data: caregiverData })
```

At this point, the caregiver record contains:
- `fullName` - The caregiver's name
- `phone` - Optional phone number
- `notes` - Optional notes
- `email` - Optional email address
- `familyId` - The family they belong to
- `userId` - **NULL initially** (no user account linked yet)

## What Happens When a Caregiver Signs Up?

When a caregiver receives an invitation email and signs up to accept it:

1. **User signs up** - Firebase account is created
2. **Invitation is accepted** - `POST /api/invitations/:token/accept` is called
3. **User record is created/updated**:
   - If the user doesn't exist: A new `User` record is created with `role: 'caregiver'` and `familyId`
   - If the user already exists: The user's `role` is updated to `'caregiver'` and `familyId` is set

4. **Caregiver record IS UPDATED** - This is the key part! 

In `backend/src/routes/invitations.ts` (lines 334-338):

```typescript
// Link user to caregiver
await prisma.caregiver.update({
  where: { id: invitation.caregiverId },
  data: { userId: user.id },
})
```

The caregiver record's `userId` field is **updated** to link it to the newly created/authenticated user account.

## Summary

- **Caregiver created**: By parent via `POST /api/caregivers` (userId = NULL)
- **Invitation sent**: Email invitation is sent to caregiver's email
- **Caregiver signs up**: Creates Firebase account
- **Invitation accepted**: 
  - User record created/updated with role 'caregiver'
  - **Caregiver record updated** - `userId` field is set to link to the user

So yes, **the caregiver record IS updated when they sign up** - specifically the `userId` field is populated to create the link between the caregiver and user records.

