# Fixing 404 Errors on Vercel Deployment

## Current Issue

The `/signup` route (and likely other routes) are returning 404 errors on Vercel, even though they work locally.

## Root Cause

Vercel needs to be configured to:
1. Serve `index.html` for all client-side routes
2. Handle static assets correctly
3. Have the correct root directory set (if monorepo)

## Solution Steps

### Step 1: Verify vercel.json Location

Ensure `vercel.json` is in the **frontend directory**:
```
mynest_app/
├── frontend/
│   ├── vercel.json  ← Must be here
│   ├── src/
│   ├── package.json
│   └── dist/ (after build)
```

### Step 2: Check Vercel Project Settings

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Verify these settings:
   - **Root Directory**: `frontend` (if using monorepo)
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Verify vercel.json Content

The `vercel.json` should have these rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/assets/:path*",
      "destination": "/assets/:path*"
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "destination": "/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Force Fresh Deployment

1. Go to **Vercel Dashboard** → **Deployments**
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT**: Turn **OFF** "Use existing Build Cache"
5. Click **"Redeploy"**

### Step 5: Wait and Test

1. Wait for deployment to complete (usually 2-3 minutes)
2. Test these URLs:
   - `https://mynest-app.vercel.app/` (should work)
   - `https://mynest-app.vercel.app/login` (should work)
   - `https://mynest-app.vercel.app/signup` (should work)
   - `https://mynest-app.vercel.app/dashboard` (should work after login)

## Alternative: Use Vercel CLI

If dashboard redeploy doesn't work, try using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to project
cd frontend
vercel link

# Deploy with no cache
vercel --prod --force
```

## Troubleshooting

### If Routes Still Don't Work

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments → Latest
   - Click "Build Logs"
   - Look for errors or warnings

2. **Verify dist/index.html Exists**:
   - In build logs, check if `dist/index.html` was created
   - If not, the build might be failing

3. **Test Static Assets**:
   - Try accessing: `https://mynest-app.vercel.app/assets/index-xxx.js`
   - If this works, routing is fine, but rewrite rules might be wrong

4. **Check Network Tab**:
   - Open DevTools → Network
   - Navigate to `/signup`
   - See what requests are made
   - Check if `index.html` is being served

### Common Issues

#### Issue: "Cannot find module" in build logs
- **Fix**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

#### Issue: Build succeeds but routes 404
- **Fix**: This is a routing issue - verify `vercel.json` is correct
- Check that rewrite rules are in the right order (specific to general)

#### Issue: Works on Vercel URL but not custom domain
- **Fix**: This is a DNS/domain configuration issue
- See `docs/dns-fix-instructions.md`

## Verification Checklist

After fixing, verify:

- [ ] Root path `/` loads
- [ ] `/login` route works
- [ ] `/signup` route works  
- [ ] `/dashboard` route works (after login)
- [ ] Static assets load (check Network tab)
- [ ] No 404 errors in console
- [ ] Favicon loads (or at least doesn't cause errors)

## Next Steps

Once the Vercel deployment works:

1. Test on custom domain (`mynest.ae`)
2. Update Railway `ALLOW_ORIGINS` to include custom domain
3. Test full authentication flow
4. Verify all routes work on custom domain

