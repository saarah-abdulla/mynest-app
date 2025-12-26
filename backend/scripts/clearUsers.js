"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/lib/prisma");
async function clearUsers() {
    console.log('🧹 Clearing all users and related data...');
    try {
        // Delete in order (respecting foreign key constraints)
        console.log('Deleting journal entries...');
        await prisma_1.prisma.journalEntry.deleteMany();
        console.log('Deleting schedule entries...');
        await prisma_1.prisma.scheduleEntry.deleteMany();
        console.log('Deleting child-caregiver relationships...');
        await prisma_1.prisma.childCaregiver.deleteMany();
        console.log('Deleting children...');
        await prisma_1.prisma.child.deleteMany();
        console.log('Deleting invitations...');
        await prisma_1.prisma.invitation.deleteMany();
        console.log('Deleting caregivers...');
        await prisma_1.prisma.caregiver.deleteMany();
        console.log('Deleting families...');
        await prisma_1.prisma.family.deleteMany();
        console.log('Deleting users...');
        await prisma_1.prisma.user.deleteMany();
        console.log('✅ All users and related data cleared!');
        // Verify
        const userCount = await prisma_1.prisma.user.count();
        console.log(`📊 Remaining users: ${userCount}`);
    }
    catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
clearUsers();
//# sourceMappingURL=clearUsers.js.map