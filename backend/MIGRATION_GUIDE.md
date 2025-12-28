# Migration Guide for Parent Invitations

## Current Status

✅ **Parent Invitation Migration Created**: `20251228205259_add_parent_invitations`
✅ **Backend Code Complete**: All TypeScript compiles successfully
⚠️ **Database Drift Detected**: ScheduleCategory enum has extra values

## Recommended Approach (Development)

Since you're seeing drift detection, the cleanest solution is to reset your development database:

```bash
cd backend
npx prisma migrate reset
```

This will:
1. Drop and recreate the database
2. Apply all migrations cleanly (including the parent invitation migration)
3. Run seed script (if configured)

**Note**: This will delete all data in your local database. If you need to preserve data, see the alternative below.

## Alternative: Manual SQL Application

If you need to preserve your data, you can apply the migration SQL manually:

```bash
cd backend

# Apply the parent invitation migration SQL directly
psql $DATABASE_URL -f prisma/migrations/20251228205259_add_parent_invitations/migration.sql

# Mark the migration as applied
npx prisma migrate resolve --applied 20251228205259_add_parent_invitations

# Regenerate Prisma client
npx prisma generate

# Verify build
npm run build
```

## Migration SQL

The parent invitation migration (`20251228205259_add_parent_invitations/migration.sql`) contains:

```sql
-- AlterTable
ALTER TABLE "Invitation" 
  ALTER COLUMN "caregiverId" DROP NOT NULL,
  ADD COLUMN "invitationType" TEXT NOT NULL DEFAULT 'caregiver';

-- CreateIndex
CREATE INDEX "Invitation_invitationType_idx" ON "Invitation"("invitationType");
```

## After Migration

Once applied, regenerate Prisma client:

```bash
cd backend
npx prisma generate
npm run build
```

## Production Deployment

For production (Railway), use:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

This will only apply pending migrations without resetting the database.

