# ⚠️ URGENT: Fix Environment Variables

## The Problem
Your app is trying to connect to `localhost:4000` instead of your Railway backend. This means `VITE_API_BASE_URL` is **NOT SET** in Vercel.

## The Fix (Do This Now)

### Step 1: Get Your Railway Backend URL
1. Go to https://railway.app/dashboard
2. Click on your **backend service**
3. Go to **Settings** → **Domains**
4. Copy the URL (e.g., `https://mynest-app-production.up.railway.app`)

### Step 2: Add to Vercel (CRITICAL)
1. Go to https://vercel.com/dashboard
2. Select your **frontend project**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add this variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://YOUR-RAILWAY-URL.railway.app/api`
     - Replace `YOUR-RAILWAY-URL` with your actual Railway URL
     - **MUST include `/api` at the end!**
   - **Environment**: Select ✅ **Production** (and Preview if you want)
6. Click **"Save"**

### Step 3: Redeploy Vercel
**IMPORTANT**: After adding the variable, you MUST redeploy:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to complete (2-3 minutes)

### Step 4: Fix CORS in Railway
Your Vercel domain needs to be in Railway's `ALLOW_ORIGINS`:
1. Go to Railway Dashboard → Your Backend Service → **Variables**
2. Find or add `ALLOW_ORIGINS`
3. Set value to: `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app`
   - (Or your production Vercel domain if you have one)
4. Railway will auto-redeploy

## Example

If your Railway URL is: `https://mynest-app-production.up.railway.app`

Then in Vercel, set:
```
VITE_API_BASE_URL=https://mynest-app-production.up.railway.app/api
```

And in Railway, set:
```
ALLOW_ORIGINS=https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app
```

## Verify It's Working

After redeploying:
1. Hard refresh your browser (`Cmd+Shift+R` or `Ctrl+Shift+R`)
2. Open browser console (F12)
3. Check Network tab - requests should go to Railway URL, NOT localhost
4. Try completing family setup again

## Why This Happened

- `VITE_API_BASE_URL` environment variable was never set in Vercel
- Without it, the app defaults to `localhost:4000`
- The build needs this variable at **build time** (not runtime)
- That's why you must redeploy after adding it

