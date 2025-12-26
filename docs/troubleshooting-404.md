# Troubleshooting 404 Errors on Vercel

## Common Causes

### 1. Static Assets Not Loading

**Symptoms:**
- JavaScript/CSS files return 404
- Images not loading
- Console shows: `Failed to load resource: the server responded with a status of 404`

**Solution:**
The `vercel.json` has been updated to explicitly handle static assets before routing to `index.html`. The rewrite rules now:
1. First match static assets (`.js`, `.css`, `.png`, etc.) and serve them directly
2. Then match all other routes and serve `index.html` for React Router

### 2. Client-Side Routes Returning 404

**Symptoms:**
- `/login`, `/signup`, `/dashboard` return 404
- Routes work locally but not on Vercel

**Solution:**
Ensure `vercel.json` has the catch-all rewrite rule:
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

### 3. Browser Cache Issues

**Symptoms:**
- Old JavaScript bundle still loading
- Changes not appearing after deployment

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Try incognito/private window

### 4. Deployment Not Complete

**Symptoms:**
- Changes not reflected
- Still seeing old errors

**Solution:**
1. Check Vercel Dashboard → Deployments
2. Wait for deployment to show "Ready" status
3. Force redeploy if needed (disable build cache)

## Debugging Steps

### Step 1: Check Browser Console

Open DevTools (F12) and check:
- **Network tab**: Which resources are failing?
- **Console tab**: Any JavaScript errors?
- **Application tab**: Check if service workers are caching old files

### Step 2: Verify Build Output

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check "Build Logs" for errors
4. Verify `dist/index.html` exists in build output

### Step 3: Test Direct URLs

Try accessing these directly:
- `https://your-domain.vercel.app/index.html` (should work)
- `https://your-domain.vercel.app/assets/index-xxx.js` (should work)
- `https://your-domain.vercel.app/login` (should serve index.html)

### Step 4: Check vercel.json Location

Ensure `vercel.json` is in the **root of your frontend directory**, not the project root:
```
mynest_app/
├── frontend/
│   ├── vercel.json  ← Should be here
│   ├── src/
│   └── package.json
```

### Step 5: Verify Vercel Project Settings

1. Go to Vercel Dashboard → Settings → General
2. Check:
   - **Root Directory**: Should be `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Quick Fixes

### Fix 1: Force Fresh Deployment

```bash
# In Vercel Dashboard:
1. Go to Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Turn OFF "Use existing Build Cache"
5. Click "Redeploy"
```

### Fix 2: Clear Vercel Cache

1. Vercel Dashboard → Settings → General
2. Scroll to "Build & Development Settings"
3. Clear build cache (if available)

### Fix 3: Verify Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Ensure `VITE_API_BASE_URL` is set correctly
3. Redeploy after changing environment variables

## Testing Checklist

After fixing, test these:

- [ ] Root path `/` loads correctly
- [ ] `/login` route works
- [ ] `/signup` route works
- [ ] `/dashboard` route works (after login)
- [ ] Static assets load (check Network tab)
- [ ] Images load (`/mynest-logo.png`)
- [ ] CSS loads correctly
- [ ] JavaScript bundles load correctly

## Still Not Working?

1. **Check Vercel Status**: https://www.vercel-status.com/
2. **Review Build Logs**: Look for errors in deployment
3. **Test on Vercel URL**: Try `your-app.vercel.app` instead of custom domain
4. **Contact Support**: Vercel support can check server-side routing

## Common Error Messages

### "Failed to load resource: 404"
- **Cause**: File not found or routing issue
- **Fix**: Check `vercel.json` rewrite rules

### "Cannot GET /login"
- **Cause**: Server trying to serve `/login` as a file
- **Fix**: Ensure rewrite rule routes to `index.html`

### "MIME type error"
- **Cause**: Wrong content-type header
- **Fix**: Usually resolves with correct rewrite rules

### "Blank page"
- **Cause**: JavaScript bundle not loading
- **Fix**: Check Network tab, verify assets are accessible


