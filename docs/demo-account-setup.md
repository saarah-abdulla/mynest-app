# Demo Account Setup Guide

This guide explains how to set up and access the demo accounts created by the seed script.

## Step 1: Run the Seed Script

First, populate your database with demo data:

### Local Development:
```bash
cd backend
npm run seed
```

### Railway (Production):
```bash
railway run npm run seed
```

This creates:
- **Family**: Hussein Family
- **Parent account**: `parent@hussein.family`
- **Caregiver account**: `caregiver@hussein.family`
- **Children**: Bader and Adam Hussein
- **Caregivers**: Aisha Khan and Noor Al Shamsi
- **Schedule entries**: 4 events
- **Journal entries**: 9 entries (meals, naps, activities, medication)

## Step 2: Create Firebase Authentication Users

The seed script creates database records, but you also need Firebase authentication users to sign in.

### Option A: Sign Up Through the App (Recommended)

1. Go to your app's signup page
2. Sign up with one of these emails:
   - **Parent account**: `parent@hussein.family`
   - **Caregiver account**: `caregiver@hussein.family`
3. Use any password (e.g., `demo123456`)
4. Complete the profile setup
5. The app will automatically link your Firebase account to the existing database record

### Option B: Create Users in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/mynest-ae/authentication/users)
2. Click "Add user"
3. Create users with these emails:
   - `parent@hussein.family`
   - `caregiver@hussein.family`
4. Set temporary passwords
5. Sign in through the app

## Step 3: Link Firebase UID to Database

If you created Firebase users manually, you need to update the database records:

### Via Prisma Studio:
```bash
cd backend
railway run npx prisma studio --schema ../prisma/schema.prisma
```

1. Open the "User" table
2. Find the user by email (`parent@hussein.family` or `caregiver@hussein.family`)
3. Update the `firebaseUid` field with the actual Firebase UID from Firebase Console

### Via SQL:
```bash
railway run psql $DATABASE_URL
```

```sql
-- Get Firebase UID from Firebase Console, then:
UPDATE "User" 
SET "firebaseUid" = 'your-actual-firebase-uid-here'
WHERE email = 'parent@hussein.family';
```

## Step 4: Sign In and View Demo Data

1. Go to your app's login page
2. Sign in with:
   - **Email**: `parent@hussein.family`
   - **Password**: (the password you set)
3. You should see:
   - Dashboard with 2 children (Bader and Adam)
   - Family page with caregivers
   - Calendar with 4 scheduled events
   - Journal page with 9 activity entries

## Demo Account Credentials

### Parent Account
- **Email**: `parent@hussein.family`
- **Password**: (set during signup)
- **Role**: Parent
- **Access**: Full access to all features

### Caregiver Account
- **Email**: `caregiver@hussein.family`
- **Password**: (set during signup)
- **Role**: Caregiver
- **Access**: Can view and update activities, but cannot edit/delete children or caregivers

## What You'll See

### Dashboard
- 2 children cards (Bader and Adam)
- Recent activities (meals, naps, activities)
- Upcoming events (medical appointments, soccer practice, etc.)

### Family Page
- 2 children with details
- 2 caregivers (Aisha Khan and Noor Al Shamsi)
- Caregiver assignments

### Calendar
- 4 scheduled events:
  - Pediatrician Appointment (tomorrow)
  - Soccer Practice (today)
  - Parent-Teacher Conference (Friday)
  - Birthday Party (next week)

### Journal Page
- 9 journal entries including:
  - Meal logs (breakfast, lunch)
  - Nap entries
  - Activity logs
  - Medication entries (scheduled and given)
  - Mood entries

## Troubleshooting

### "User not found" error
- Make sure you ran the seed script
- Verify the email matches exactly (`parent@hussein.family`)
- Check that `firebaseUid` in database matches Firebase Console

### "No family found" error
- The seed script should create the family automatically
- Check that `familyId` is set in the User record
- Re-run the seed script if needed

### Can't see demo data
- Clear browser cache
- Check that you're signed in with the correct account
- Verify database has the seed data (use Prisma Studio)

## Quick Reset

To reset and start fresh:

```bash
# Clear all data
cd backend
railway run npx ts-node scripts/clearUsers.ts

# Re-seed
railway run npm run seed
```

Then sign up again with `parent@hussein.family` or `caregiver@hussein.family`.


