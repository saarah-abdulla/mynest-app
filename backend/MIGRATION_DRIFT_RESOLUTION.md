# Resolving Migration Drift

## Issue
Prisma detected drift: The database has `ScheduleCategory` enum values (`meal`, `medication`, `sleep`, `play`, `feeding`, `nap`) that aren't in your migration history.

## Solution Options

### Option 1: Reset Database (Recommended for Development)

If you're okay losing all data in your local development database:

```bash
cd backend
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Apply all migrations from scratch
4. Run seed script (if configured)

### Option 2: Mark Migration as Applied (If Already Applied)

If the parent invitation migration SQL was already applied manually to your database:

```bash
cd backend
npx prisma migrate resolve --applied 20251228205259_add_parent_invitations
npx prisma generate
```

### Option 3: Baseline and Apply (For Production)

If you need to preserve data and sync the migration history:

```bash
cd backend
# 1. Apply the parent invitation migration SQL manually
psql $DATABASE_URL -f prisma/migrations/20251228205259_add_parent_invitations/migration.sql

# 2. Mark it as applied
npx prisma migrate resolve --applied 20251228205259_add_parent_invitations

# 3. Regenerate Prisma client
npx prisma generate
```

## Parent Invitation Migration SQL

The migration file is at:
`backend/prisma/migrations/20251228205259_add_parent_invitations/migration.sql`

It contains:
```sql
-- AlterTable
ALTER TABLE "Invitation" 
  ALTER COLUMN "caregiverId" DROP NOT NULL,
  ADD COLUMN "invitationType" TEXT NOT NULL DEFAULT 'caregiver';

-- CreateIndex
CREATE INDEX "Invitation_invitationType_idx" ON "Invitation"("invitationType");
```

## After Migration

Once the migration is applied, regenerate Prisma client:

```bash
cd backend
npx prisma generate
```

Then verify the build still works:

```bash
npm run build
```

