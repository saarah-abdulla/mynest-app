-- First, update any existing entries with removed categories to 'other'
UPDATE "ScheduleEntry" SET category = 'other' WHERE category IN ('meal', 'medication', 'sleep', 'play', 'feeding', 'nap');

-- Create new enum type with only the categories we want
CREATE TYPE "ScheduleCategory_new" AS ENUM ('school', 'activity', 'other', 'medical', 'appointment', 'social');

-- Alter the table to use the new enum type
ALTER TABLE "ScheduleEntry" ALTER COLUMN "category" TYPE "ScheduleCategory_new" USING ("category"::text::"ScheduleCategory_new");

-- Drop the old enum type
DROP TYPE "ScheduleCategory";

-- Rename the new enum type to the original name
ALTER TYPE "ScheduleCategory_new" RENAME TO "ScheduleCategory";

