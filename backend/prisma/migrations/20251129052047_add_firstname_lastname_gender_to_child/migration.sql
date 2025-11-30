-- Step 1: Add columns as nullable first
ALTER TABLE "Child" ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "gender" TEXT;

-- Step 2: Populate firstName and lastName from fullName for existing records
-- Split fullName by space - take first word as firstName, rest as lastName
UPDATE "Child"
SET 
  "firstName" = SPLIT_PART("fullName", ' ', 1),
  "lastName" = CASE 
    WHEN LENGTH("fullName") > LENGTH(SPLIT_PART("fullName", ' ', 1)) THEN
      SUBSTRING("fullName" FROM LENGTH(SPLIT_PART("fullName", ' ', 1)) + 2)
    ELSE ''
  END
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Step 3: Set default values for any remaining nulls (fallback)
UPDATE "Child"
SET 
  "firstName" = COALESCE("firstName", "fullName"),
  "lastName" = COALESCE("lastName", '')
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Step 4: Make firstName and lastName NOT NULL
ALTER TABLE "Child" 
  ALTER COLUMN "firstName" SET NOT NULL,
  ALTER COLUMN "lastName" SET NOT NULL;
