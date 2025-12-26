# 🔴 URGENT: Fix CORS Error

## The Problem
Your frontend (Vercel) is trying to connect to your backend (Railway), but Railway is blocking it due to CORS.

**Error**: `Access to fetch at 'https://mynest-app-production.up.railway.app/api/families' from origin 'https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app' has been blocked by CORS policy`

## The Fix (Do This Now)

### Step 1: Add Vercel Domain to Railway
1. Go to https://railway.app/dashboard
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Find or add variable:
   - **Key**: `ALLOW_ORIGINS`
   - **Value**: `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app`
     - **Important**: Include `https://`, no trailing slash
   - If you have a production domain too, add it comma-separated:
     ```
     https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app,https://mynest-app.vercel.app
     ```
5. Click **"Save"**

### Step 2: Wait for Railway to Redeploy
Railway will automatically redeploy when you add/update variables. Check:
1. Go to **"Deployments"** tab
2. Wait for new deployment to complete (usually 1-2 minutes)
3. Check logs to ensure server restarted

### Step 3: Test
1. Hard refresh your Vercel app (`Cmd+Shift+R` or `Ctrl+Shift+R`)
2. Try accessing the dashboard again
3. CORS errors should be gone!

## Verify It's Set Correctly

In Railway Variables, you should see:
```
ALLOW_ORIGINS=https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app
```

Or if you have multiple domains:
```
ALLOW_ORIGINS=https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app,https://mynest-app.vercel.app
```

## Common Mistakes

❌ **Wrong**: `mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app` (missing https://)
❌ **Wrong**: `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app/` (trailing slash)
✅ **Correct**: `https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app`

## Still Not Working?

1. **Check Railway logs**: Make sure the server restarted after adding the variable
2. **Verify the variable name**: Must be exactly `ALLOW_ORIGINS` (case-sensitive)
3. **Check for typos**: Copy-paste the Vercel URL exactly
4. **Wait a bit**: Sometimes takes 2-3 minutes for changes to propagate

## Quick Test

After adding `ALLOW_ORIGINS`, test the backend directly:
```bash
curl -H "Origin: https://mynest-pk0edtdj2-saarahs-projects-a9475d0e.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://mynest-app-production.up.railway.app/api/families
```

You should see CORS headers in the response.


