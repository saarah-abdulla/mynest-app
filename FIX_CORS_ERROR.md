# Fix CORS Error

## Problem
Getting CORS error:
```
Access to fetch at 'https://mynest-app-production.up.railway.app/api/children' 
from origin 'https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app' 
has been blocked by CORS policy
```

## Solution: Add Vercel Domain to Railway

### Step 1: Get Your Vercel Domain(s)
From the error message, your Vercel domain is:
- `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app`

Also check if you have a production domain:
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Look for your production domain (e.g., `https://mynest-app.vercel.app`)

### Step 2: Add to Railway
1. Go to https://railway.app/dashboard
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Find or add variable:
   - **Key**: `ALLOW_ORIGINS`
   - **Value**: Your Vercel domain(s), comma-separated
     ```
     https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app,https://mynest-app.vercel.app
     ```
   - **Important**:
     - ✅ Include `https://`
     - ✅ No trailing slashes
     - ✅ Separate multiple domains with commas
5. Click **"Save"**

### Step 3: Wait for Redeploy
Railway will automatically redeploy when you add/update variables. Check the "Deployments" tab.

### Step 4: Test
1. Refresh your Vercel app
2. Try signing in
3. CORS errors should be gone!

## Example
If you have:
- Preview: `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app`
- Production: `https://mynest-app.vercel.app`

Set `ALLOW_ORIGINS` to:
```
https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app,https://mynest-app.vercel.app
```

## Quick Checklist
- [ ] Added `ALLOW_ORIGINS` to Railway backend variables
- [ ] Value includes your Vercel domain(s) with `https://`
- [ ] No trailing slashes
- [ ] Railway redeployed automatically
- [ ] Tested the app - CORS errors gone!

