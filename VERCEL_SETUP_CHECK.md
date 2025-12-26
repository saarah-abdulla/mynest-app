# Vercel Environment Variables Checklist

## ✅ Required Variables

Based on your frontend code, here are the required environment variables:

### 1. API Configuration
- **`VITE_API_BASE_URL`** 
  - **Current Value**: `https://mynest-app-production.up...` (truncated in image)
  - **Should be**: `https://mynest-app-production.up.railway.app/api`
  - **Note**: Should include `/api` at the end, or the code will append it
  - **Scope**: Production (or All Environments if you want same backend for all)

### 2. Firebase Configuration (All Required)
- ✅ **`VITE_FIREBASE_API_KEY`** - Present (All Environments)
- ✅ **`VITE_FIREBASE_AUTH_DOMAIN`** - Present (All Environments) 
- ✅ **`VITE_FIREBASE_PROJECT_ID`** - Present (All Environments)
- ✅ **`VITE_FIREBASE_STORAGE_BUCKET`** - Present (All Environments)
- ✅ **`VITE_FIREBASE_MESSAGING_SENDER_ID`** - Present (All Environments)
- ✅ **`VITE_FIREBASE_APP_ID`** - Present (All Environments)

## ⚠️ Potential Issues

### 1. VITE_API_BASE_URL Format
**Check**: Does your `VITE_API_BASE_URL` include `/api` at the end?

**Correct formats:**
- ✅ `https://mynest-app-production.up.railway.app/api`
- ✅ `https://mynest-app-production.up.railway.app` (code will append `/api`)

**Incorrect:**
- ❌ `https://mynest-app-production.up.railway.app/` (trailing slash without `/api`)

### 2. Environment Scope
- **VITE_API_BASE_URL**: Currently set to "Production" only
  - ✅ This is fine if you only deploy to production
  - ⚠️ If you have Preview/Development deployments, add it to "All Environments" or set it per environment

### 3. Backend CORS Configuration
Make sure your Railway backend has `ALLOW_ORIGINS` set to include:
- `https://mynest-app.vercel.app`
- `https://mynest-app-git-main-*.vercel.app` (for preview deployments)
- Or use a wildcard pattern if needed

## 🔍 How to Verify

1. **Check the full VITE_API_BASE_URL value:**
   - In Vercel, click the eye icon to reveal the full value
   - Verify it matches your Railway backend URL

2. **Test the connection:**
   - Visit your deployed Vercel app
   - Open browser console (F12)
   - Check for any API connection errors
   - Look for: "Unable to connect to the backend at..."

3. **Verify Railway backend:**
   - Check Railway dashboard → Your backend service
   - Verify `ALLOW_ORIGINS` includes your Vercel domain
   - Test the backend URL directly: `https://mynest-app-production.up.railway.app/health`

## ✅ Quick Fixes

If `VITE_API_BASE_URL` is missing `/api`:
1. Go to Vercel → Settings → Environment Variables
2. Edit `VITE_API_BASE_URL`
3. Change from: `https://mynest-app-production.up.railway.app`
4. To: `https://mynest-app-production.up.railway.app/api`
5. Redeploy

If you need to add variables for Preview/Development:
1. Click "Add" in Environment Variables
2. Set the variable
3. Select the appropriate environment(s)
4. Save and redeploy


