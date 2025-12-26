# Fix Railway "No start command found" Error

## The Problem

Railway is looking in the root directory, but your backend code is in the `backend/` folder.

## Solution: Set Root Directory in Railway

### Step 1: Open Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Click on your **backend service** (the one showing the error)

### Step 2: Set Root Directory

1. Click on **"Settings"** tab
2. Scroll down to **"Root Directory"** section
3. Enter: `backend`
4. Click **"Save"** or the service will auto-save

### Step 3: Redeploy

After saving, Railway will automatically:
- Redeploy the service
- Look in the `backend/` directory
- Find `package.json` with the `start` script
- Run the build and start commands

## Alternative: Use Railway CLI

If you prefer command line:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set root directory
railway variables set RAILWAY_SERVICE_ROOT=backend
```

## Verify It's Working

After setting the root directory, check the build logs:
1. Go to your service → **"Deployments"** tab
2. Click on the latest deployment
3. You should see:
   - `npm install` running
   - `npm run build` running
   - `npx prisma generate` running
   - `npm start` as the start command

## What Railway Will Find After Setting Root Directory

Once root directory is set to `backend`, Railway will:
- ✅ Find `backend/package.json` with `"start": "node dist/index.js"`
- ✅ Find `backend/railway.json` with build/start commands
- ✅ Build the TypeScript code to `dist/`
- ✅ Run migrations automatically

## Still Having Issues?

If it still doesn't work:
1. Check that `backend/package.json` has the `start` script
2. Verify `backend/railway.json` exists
3. Check Railway logs for specific errors
4. Make sure the build completes successfully before start command runs


