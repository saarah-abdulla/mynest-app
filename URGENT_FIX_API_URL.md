# 🚨 URGENT: Fix API URL in Vercel

## Problem
Your frontend is trying to connect to `http://localhost:4000` instead of your Railway backend. This is causing CORS errors and setup failures.

## Error Message
```
Access to fetch at 'http://localhost:4000/api/families' from origin 'https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app' has been blocked by CORS policy
```

## Solution: Set VITE_API_BASE_URL in Vercel

### Step 1: Get Your Railway Backend URL
1. Go to Railway Dashboard: https://railway.app
2. Select your backend service
3. Go to **Settings** → **Networking**
4. Copy your **Public Domain** (e.g., `mynest-app-production.up.railway.app`)
5. Add `/api` at the end: `https://mynest-app-production.up.railway.app/api`

### Step 2: Add Environment Variable in Vercel
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your `mynest-app` project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-backend.up.railway.app/api`
     (Replace with your actual Railway URL + `/api`)
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **"Save"**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

## Verify It's Working

After redeploy:
1. Visit your Vercel app
2. Open browser console (F12)
3. Try completing the setup again
4. Check the Network tab - requests should go to your Railway URL, not localhost

## Current Vercel Environment Variables Checklist

Make sure you have ALL of these set:

- ✅ `VITE_API_BASE_URL` = `https://your-railway-backend.up.railway.app/api`
- ✅ `VITE_FIREBASE_API_KEY` = (your Firebase API key)
- ✅ `VITE_FIREBASE_AUTH_DOMAIN` = `mynest-ae.firebaseapp.com`
- ✅ `VITE_FIREBASE_PROJECT_ID` = `mynest-ae`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET` = `mynest-ae.firebasestorage.app`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID` = (your sender ID)
- ✅ `VITE_FIREBASE_APP_ID` = (your app ID)

## Important Notes

- **Vite prefix required**: All frontend variables MUST start with `VITE_` to be accessible in the browser
- **Redeploy required**: After adding/updating environment variables, you MUST redeploy for changes to take effect
- **No trailing slash**: The URL should end with `/api`, not `/api/`

