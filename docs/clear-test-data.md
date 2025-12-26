# Clear Test Data from Database

## ⚠️ Warning

This will delete user accounts and related data. Use only for testing/development.

## Option 1: Using Railway CLI (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Connect to Your Project
```bash
railway login
railway link
```

### Step 3: Open Prisma Studio
```bash
cd backend
railway run npx prisma studio --schema ../prisma/schema.prisma
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Delete individual records
- Clear entire tables

### Step 4: Delete Users
1. Click on "User" table
2. Select all users (or specific ones)
3. Click "Delete" button

## Option 2: Using SQL Commands via Railway

### Step 1: Connect to Database
```bash
railway run psql $DATABASE_URL
```

### Step 2: Delete Users and Related Data
```sql
-- Delete in order (respecting foreign key constraints)
DELETE FROM "JournalEntry";
DELETE FROM "ScheduleEntry";
DELETE FROM "ChildCaregiver";
DELETE FROM "Child";
DELETE FROM "Invitation";
DELETE FROM "Caregiver";
DELETE FROM "Family";
DELETE FROM "User";

-- Verify deletion
SELECT COUNT(*) FROM "User";
```

### Step 3: Exit
```sql
\q
```

## Option 3: Create a Cleanup Script

Create `backend/scripts/clearUsers.ts`:

```typescript
import { prisma } from '../src/lib/prisma'

async function clearUsers() {
  console.log('Clearing all users and related data...')
  
  // Delete in order (respecting foreign key constraints)
  await prisma.journalEntry.deleteMany()
  await prisma.scheduleEntry.deleteMany()
  await prisma.childCaregiver.deleteMany()
  await prisma.child.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.caregiver.deleteMany()
  await prisma.family.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ All users and related data cleared!')
}

clearUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Run the Script
```bash
cd backend
railway run npx ts-node scripts/clearUsers.ts
```

## Option 4: Delete Specific User by Email

If you only want to delete a specific test account:

### Via SQL
```sql
-- Find user
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Delete user and related data
DELETE FROM "JournalEntry" WHERE "authorId" IN (SELECT id FROM "User" WHERE email = 'test@example.com');
DELETE FROM "ScheduleEntry" WHERE "createdById" IN (SELECT id FROM "User" WHERE email = 'test@example.com');
DELETE FROM "User" WHERE email = 'test@example.com';
```

### Via Prisma Studio
1. Open Prisma Studio (see Option 1)
2. Go to "User" table
3. Find user by email
4. Click delete

## Option 5: Reset Entire Database (Nuclear Option)

⚠️ **This deletes EVERYTHING including schema**

```bash
cd backend
railway run npx prisma migrate reset --schema ../prisma/schema.prisma
```

This will:
- Drop all tables
- Recreate schema
- Run all migrations
- Run seed script (if configured)

## Recommended Approach for Testing

1. **Use Prisma Studio** (Option 1) - Easiest and safest
2. Delete only test users you created
3. Keep the database structure intact

## After Clearing Users

1. Test signup flow
2. Verify new user is created
3. Test login with new account
4. Verify Firebase authentication works

## Important Notes

- **Firebase Users**: Deleting from database doesn't delete Firebase auth users
- To fully reset, also delete from Firebase Console → Authentication → Users
- Or use a different email for testing

## Firebase Cleanup (Optional)

If you want to clear Firebase auth users too:

1. Go to Firebase Console
2. Authentication → Users
3. Select users to delete
4. Click "Delete user"

## Quick Command Reference

```bash
# Open Prisma Studio
railway run npx prisma studio --schema ../prisma/schema.prisma

# Connect to database
railway run psql $DATABASE_URL

# Reset database (careful!)
railway run npx prisma migrate reset --schema ../prisma/schema.prisma
```


