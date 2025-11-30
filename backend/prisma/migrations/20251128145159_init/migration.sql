-- CreateEnum
CREATE TYPE "Role" AS ENUM ('parent', 'caregiver');

-- CreateEnum
CREATE TYPE "ScheduleCategory" AS ENUM ('school', 'activity', 'meal', 'medication', 'sleep', 'other');

-- CreateEnum
CREATE TYPE "ChildMood" AS ENUM ('happy', 'calm', 'tired', 'fussy');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "familyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caregiver" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "familyId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caregiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "school" TEXT,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildCaregiver" (
    "childId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildCaregiver_pkey" PRIMARY KEY ("childId","caregiverId")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ScheduleCategory" NOT NULL,
    "notes" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "mood" "ChildMood",
    "childId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Caregiver_userId_key" ON "Caregiver"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caregiver" ADD CONSTRAINT "Caregiver_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caregiver" ADD CONSTRAINT "Caregiver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildCaregiver" ADD CONSTRAINT "ChildCaregiver_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildCaregiver" ADD CONSTRAINT "ChildCaregiver_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "Caregiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
