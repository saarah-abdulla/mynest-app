# Fixing 404 Errors on Vercel (Sign In/Sign Up Pages)

## Problem

When clicking "Sign In" or "Sign Up" buttons, you get a `404: NOT_FOUND` error from Vercel.

## Root Cause

This happens when Vercel's routing configuration doesn't properly handle client-side routes. React Router handles routing in the browser, but Vercel needs to be told to serve `index.html` for all routes so React can take over.

## Solution

The `vercel.json` file has been updated with the correct rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/((?!.*\\.).*)$",
      "destination": "/index.html"
    }
  ]
}
```

This pattern:
- Matches all paths that don't have a file extension
- Routes them to `/index.html` so React Router can handle them
- Allows static assets (`.js`, `.css`, `.png`, etc.) to be served directly

## After Deployment

1. **Wait for Vercel to redeploy** (automatic after git push)
2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Test the routes:**
   - `https://mynest.ae/login` should work
   - `https://mynest.ae/signup` should work
   - `https://mynest.ae/dashboard` should work

## If Still Not Working

### Option 1: Force Redeploy
1. Go to Vercel Dashboard → Deployments
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. Select "Use existing Build Cache" = **OFF**
5. Click "Redeploy"

### Option 2: Check Domain Configuration
1. Go to Vercel Dashboard → Settings → Domains
2. Verify both `mynest.ae` and `www.mynest.ae` show "Valid Configuration"
3. If not, check DNS records (see `docs/dns-fix-instructions.md`)

### Option 3: Test on Vercel URL
Try accessing the routes on the Vercel-provided URL:
- `https://mynest-app.vercel.app/login`
- `https://mynest-app.vercel.app/signup`

If these work but the custom domain doesn't, it's a DNS/routing issue.

### Option 4: Verify Build Output
1. Check Vercel build logs
2. Ensure `dist/index.html` exists
3. Verify all routes are defined in `frontend/src/App.tsx`

## Common Issues

### Static Assets Not Loading
If images/CSS/JS files aren't loading, the rewrite pattern might be too broad. The current pattern `/((?!.*\\.).*)$` should handle this correctly.

### Routes Work Locally But Not on Vercel
- Check `vercel.json` is in the `frontend/` directory
- Verify the rewrite rule syntax is correct
- Ensure you're deploying from the correct branch

### 404 on Custom Domain But Works on Vercel URL
- DNS might not be fully propagated
- Domain might not be properly linked in Vercel
- Check domain status in Vercel Dashboard

## Testing

After fixing, test all routes:
- ✅ `/` (landing page)
- ✅ `/login` (sign in)
- ✅ `/signup` (sign up)
- ✅ `/dashboard` (protected)
- ✅ `/calendar` (protected)
- ✅ `/journal` (protected)
- ✅ `/family` (protected)
- ✅ `/profile` (protected)

All should load without 404 errors.


