# Railway Database Setup

## ⚠️ IMPORTANT: Configure DATABASE_URL

Your Railway deployment is failing because `DATABASE_URL` environment variable is not set.

## Quick Fix

### Step 1: Get DATABASE_URL from PostgreSQL Service

1. Go to Railway Dashboard
2. Open your project
3. Click on your **PostgreSQL database service**
4. Go to **"Variables"** tab
5. Find `DATABASE_URL` and **copy the value**

It should look like:
```
postgresql://postgres:password@hostname:5432/railway
```

### Step 2: Add DATABASE_URL to Backend Service

1. In Railway Dashboard, click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the DATABASE_URL from Step 1
5. Click **"Add"**

### Step 3: Redeploy

Railway will automatically redeploy when you add environment variables. Or manually trigger:
1. Go to backend service → **"Deployments"**
2. Click **"Redeploy"**

## Verify

After adding DATABASE_URL, check the logs:
1. Go to backend service → **"Deployments"** → Latest deployment
2. Click **"View Logs"**
3. You should see:
   - ✅ "Running database migrations..."
   - ✅ "Migration successful"
   - ✅ "Starting server..."

## Complete Environment Variables Checklist

Make sure these are set in your **backend service** (not database service):

- [ ] `DATABASE_URL` - From PostgreSQL service variables
- [ ] `FIREBASE_PROJECT_ID` - Your Firebase project ID
- [ ] `FIREBASE_CLIENT_EMAIL` - Firebase Admin SDK email
- [ ] `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK private key (with `\n` for newlines)
- [ ] `PORT` - `4000` (optional, defaults to 4000)
- [ ] `NODE_ENV` - `production`
- [ ] `ALLOW_ORIGINS` - Your frontend URL (e.g., `https://your-app.vercel.app`)

## Troubleshooting

**"Environment variable not found: DATABASE_URL"**
- Make sure you added it to the **backend service**, not the database service
- Verify the variable name is exactly `DATABASE_URL` (case-sensitive)
- Check that it's not in a different environment (production vs. development)

**"Connection refused"**
- Verify DATABASE_URL is correct
- Check that PostgreSQL service is running
- Ensure database is accessible from backend service

**"Migration failed"**
- Check DATABASE_URL format is correct
- Verify database has proper permissions
- Check Railway logs for specific error messages

