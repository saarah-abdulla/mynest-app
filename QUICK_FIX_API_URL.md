# Quick Fix: API URL Error

## Problem
Getting error: "Unable to connect to the server. Please make sure the backend is running at http://localhost:4000"

This means `VITE_API_BASE_URL` is not set in Vercel.

## Solution

### Step 1: Get Your Railway Backend URL
1. Go to https://railway.app/dashboard
2. Click on your backend service
3. Go to **Settings** → **Domains**
4. Copy the URL (e.g., `https://mynest-app-production.up.railway.app`)

### Step 2: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://YOUR-RAILWAY-URL.railway.app/api`
     - Replace `YOUR-RAILWAY-URL` with your actual Railway URL
     - **Important**: Include `/api` at the end!
   - **Environment**: Select ✅ Production (and Preview if you want)
6. Click **"Save"**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test
1. Visit your Vercel URL
2. Try to sign in
3. The error should be gone!

## Example
If your Railway URL is: `https://mynest-app-production.up.railway.app`

Then set:
```
VITE_API_BASE_URL=https://mynest-app-production.up.railway.app/api
```

## Still Not Working?
1. Check browser console (F12) for errors
2. Verify Railway backend is running (test: `https://your-railway-url.railway.app/health`)
3. Make sure you included `/api` at the end of the URL
4. Make sure you redeployed after adding the variable


