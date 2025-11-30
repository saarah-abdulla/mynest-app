-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "activities" JSONB,
ADD COLUMN     "meals" JSONB,
ADD COLUMN     "medication" JSONB,
ADD COLUMN     "moodDetails" TEXT,
ADD COLUMN     "naps" JSONB;
