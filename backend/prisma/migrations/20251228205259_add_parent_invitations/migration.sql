-- AlterTable
ALTER TABLE "Invitation" 
  ALTER COLUMN "caregiverId" DROP NOT NULL,
  ADD COLUMN "invitationType" TEXT NOT NULL DEFAULT 'caregiver';

-- CreateIndex
CREATE INDEX "Invitation_invitationType_idx" ON "Invitation"("invitationType");
