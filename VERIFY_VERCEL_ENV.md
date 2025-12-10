# Verify VITE_API_BASE_URL in Vercel

## The Problem
Your app is still using `http://localhost:4000` even though you've set `VITE_API_BASE_URL` in Vercel.

## Step-by-Step Verification

### 1. Check Variable Exists
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Search for `VITE_API_BASE_URL`
3. **Verify:**
   - ✅ Variable name is exactly `VITE_API_BASE_URL` (case-sensitive, no typos)
   - ✅ Value is `https://your-railway-backend.up.railway.app/api` (your actual Railway URL)
   - ✅ No quotes around the value
   - ✅ No trailing slash after `/api`

### 2. Check Environment Scope
Click on `VITE_API_BASE_URL` to edit it and verify:
- ✅ **Production** is checked
- ✅ **Preview** is checked (recommended)
- ✅ **Development** is checked (optional)

**Critical**: If it's only set for "Preview" but you're viewing "Production", it won't work!

### 3. Check Your Current Deployment Environment
1. Go to **Deployments** tab
2. Look at your latest deployment
3. Check which environment it's for:
   - **Production** = `mynest-app.vercel.app`
   - **Preview** = `mynest-app-*-*.vercel.app` (with hash)

### 4. Force Fresh Redeploy (IMPORTANT)
1. Go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **CRITICAL**: Uncheck **"Use existing Build Cache"**
5. Click **"Redeploy"**

**Why**: Vite embeds environment variables at BUILD TIME. If the variable wasn't set when the build happened, it won't be in the code, even if you add it later. You MUST rebuild.

### 5. Verify After Redeploy
1. Wait for deployment to complete
2. Visit your Vercel URL
3. Open browser console (F12)
4. Look for: `[API] Environment check:`
5. Check the values:
   - `VITE_API_BASE_URL` should show your Railway URL
   - `API_BASE_URL` should show your Railway URL + `/api`
   - Should NOT show `localhost`

### 6. If Still Not Working

**Option A: Delete and Re-add Variable**
1. Delete `VITE_API_BASE_URL` from Vercel
2. Wait 30 seconds
3. Add it again with correct value
4. Redeploy WITHOUT cache

**Option B: Check for Typos**
- Variable name must be exactly: `VITE_API_BASE_URL`
- Check for hidden characters or spaces
- Copy-paste the name from this document

**Option C: Check Build Logs**
1. Go to deployment → **Build Logs**
2. Search for `VITE_API_BASE_URL`
3. See if it's being loaded during build

## Quick Test

After redeploy, check browser console for:
```javascript
[API] Environment check: {
  VITE_API_BASE_URL: "https://your-railway-backend.up.railway.app/api",
  API_BASE_URL: "https://your-railway-backend.up.railway.app/api",
  isProduction: true,
  ...
}
```

If `VITE_API_BASE_URL` is `undefined` or shows `localhost`, the variable isn't being picked up.

