# Debugging VITE_API_BASE_URL Not Working

## If VITE_API_BASE_URL is already set in Vercel but still not working:

### 1. Check Variable Name (Case-Sensitive)
- ✅ Correct: `VITE_API_BASE_URL`
- ❌ Wrong: `VITE_API_BASE_URL_` (trailing underscore)
- ❌ Wrong: `vite_api_base_url` (lowercase)
- ❌ Wrong: `API_BASE_URL` (missing VITE_ prefix)

### 2. Check Which Environments It's Set For
In Vercel Environment Variables, make sure `VITE_API_BASE_URL` is set for:
- ✅ **Production** (required)
- ✅ **Preview** (recommended)
- ✅ **Development** (optional, for local dev)

### 3. Verify the Value Format
- ✅ Correct: `https://mynest-app-production.up.railway.app/api`
- ❌ Wrong: `https://mynest-app-production.up.railway.app/api/` (trailing slash)
- ❌ Wrong: `mynest-app-production.up.railway.app/api` (missing https://)
- ❌ Wrong: `https://mynest-app-production.up.railway.app` (missing /api)

### 4. Force a Fresh Redeploy
After setting/updating environment variables:
1. Go to Vercel → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. **Important**: Make sure "Use existing Build Cache" is **UNCHECKED**
5. Click "Redeploy"

### 5. Check Build Logs
In Vercel deployment logs, look for:
- Environment variables being loaded
- Any errors about missing variables
- The actual API_BASE_URL being used

### 6. Verify in Browser Console
After redeploy, open browser console and check:
- Look for: `[API] Using API_BASE_URL: ...`
- Should show your Railway URL, NOT localhost
- If you see localhost, the variable isn't being picked up

### 7. Common Issues

**Issue**: Variable set but build cache used old value
**Fix**: Redeploy with "Use existing Build Cache" UNCHECKED

**Issue**: Variable set for wrong environment
**Fix**: Make sure it's set for "Production" environment

**Issue**: Variable has extra spaces or quotes
**Fix**: Check the value doesn't have quotes or leading/trailing spaces

**Issue**: Variable name typo
**Fix**: Double-check it's exactly `VITE_API_BASE_URL` (case-sensitive)

### 8. Test the Variable is Accessible
Add this temporarily to your code to debug:
```typescript
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('All env vars:', import.meta.env)
```

### 9. Nuclear Option: Delete and Re-add
If nothing works:
1. Delete `VITE_API_BASE_URL` from Vercel
2. Wait a moment
3. Add it again with the correct value
4. Redeploy (without cache)

