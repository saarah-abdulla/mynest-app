# 🚨 URGENT: Fix API URL Issue

## The Problem

Your frontend is trying to connect to `http://localhost:4000` instead of your Railway backend URL. This means `VITE_API_BASE_URL` is not set correctly in Vercel.

## Quick Fix Steps

### Step 1: Check Browser Console

Open DevTools (F12) → Console tab and look for:
```
[API] Environment check: { ... }
```

This will show you what `VITE_API_BASE_URL` is currently set to.

### Step 2: Set VITE_API_BASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for `VITE_API_BASE_URL`
3. **If it doesn't exist**, click "Add New"
4. **If it exists**, click to edit it
5. Set the value to:
   ```
   https://mynest-app-production.up.railway.app/api
   ```
   **Important:** Include `/api` at the end!
6. Make sure it's set for **"Production"** environment (and optionally Preview/Development)
7. Click **"Save"**

### Step 3: Force Redeploy

1. Go to **Vercel Dashboard** → **Deployments**
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT:** Turn **OFF** "Use existing Build Cache"
5. Click **"Redeploy"**

### Step 4: Wait and Test

1. Wait 2-3 minutes for deployment to complete
2. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check the console again - you should see:
   ```
   [API] Environment check: {
     VITE_API_BASE_URL: "https://mynest-app-production.up.railway.app/api",
     API_BASE_URL: "https://mynest-app-production.up.railway.app/api",
     ...
   }
   ```

## Verify It's Fixed

After redeploy, check:
- ✅ Console shows Railway URL, not localhost
- ✅ No more `ERR_CONNECTION_REFUSED` errors
- ✅ API calls work (try signing in or viewing dashboard)

## Common Mistakes

❌ **Wrong:** `https://mynest-app-production.up.railway.app` (missing `/api`)
✅ **Correct:** `https://mynest-app-production.up.railway.app/api`

❌ **Wrong:** Set only for "Development" environment
✅ **Correct:** Set for "Production" (and optionally others)

❌ **Wrong:** Redeploying with cache enabled
✅ **Correct:** Redeploy WITHOUT build cache

## Still Not Working?

1. **Check the console log** - what does `[API] Environment check` show?
2. **Verify in Vercel** - is `VITE_API_BASE_URL` actually set?
3. **Check deployment logs** - does it show the variable being used?
4. **Try incognito window** - bypasses browser cache

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Variable Name:** `VITE_API_BASE_URL`
**Variable Value:** `https://mynest-app-production.up.railway.app/api`
**Environment:** Production (required)
