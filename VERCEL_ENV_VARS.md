# Vercel Environment Variables Setup

## ⚠️ YES - You Need to Add Environment Variables to Vercel!

The frontend requires environment variables to connect to your backend and Firebase.

## Required Environment Variables

Add these to your **Vercel project**:

### 1. Backend API URL

**Variable**: `VITE_API_BASE_URL`  
**Value**: `https://your-backend.railway.app/api`  
**Example**: `https://mynest-backend-production.up.railway.app/api`

**How to get it:**
1. Go to Railway Dashboard → Your Backend Service
2. Go to "Settings" → "Generate Domain" (if not already done)
3. Copy the Railway URL
4. Add `/api` at the end

### 2. Firebase Configuration (6 variables)

Get these from Firebase Console → Project Settings → Your apps → Web app config:

**Variable**: `VITE_FIREBASE_API_KEY`  
**Value**: `AIza...` (your Firebase API key)

**Variable**: `VITE_FIREBASE_AUTH_DOMAIN`  
**Value**: `mynest-ae.firebaseapp.com` (or your project's auth domain)

**Variable**: `VITE_FIREBASE_PROJECT_ID`  
**Value**: `mynest-ae` (or your project ID)

**Variable**: `VITE_FIREBASE_STORAGE_BUCKET`  
**Value**: `mynest-ae.appspot.com` (or your project's storage bucket)

**Variable**: `VITE_FIREBASE_MESSAGING_SENDER_ID`  
**Value**: `123456789` (your messaging sender ID)

**Variable**: `VITE_FIREBASE_APP_ID`  
**Value**: `1:123456789:web:abcdef` (your app ID)

## How to Add to Vercel

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your `mynest-app` project (or whatever you named it)

### Step 2: Go to Settings
1. Click **"Settings"** tab
2. Click **"Environment Variables"** in the left sidebar

### Step 3: Add Each Variable
For each variable above:
1. Click **"Add New"** or **"+ Add"**
2. Enter the **Key** (e.g., `VITE_API_BASE_URL`)
3. Enter the **Value** (e.g., `https://your-backend.railway.app/api`)
4. Select **Environment**: 
   - ✅ Production
   - ✅ Preview (optional, for testing)
   - ✅ Development (optional, for local dev)
5. Click **"Save"**

### Step 4: Redeploy
After adding all variables:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

## Complete List (Copy-Paste Ready)

```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=mynest-ae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mynest-ae
VITE_FIREBASE_STORAGE_BUCKET=mynest-ae.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Replace:**
- `your-backend.railway.app` with your actual Railway backend URL
- All Firebase values with your actual Firebase config

## Where to Get Firebase Values

1. Go to https://console.firebase.google.com
2. Select your project: **mynest-ae**
3. Click **⚙️ Settings** (gear icon) → **Project settings**
4. Scroll down to **"Your apps"** section
5. Click on your web app (or create one if needed)
6. You'll see the config object with all values

## Verify It's Working

After adding variables and redeploying:

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for errors:
   - ❌ "VITE_API_BASE_URL is not defined" → Variable not set
   - ❌ "Firebase: Error (auth/..." → Firebase config issue
   - ✅ No errors → Good!

4. Try to sign up/login:
   - If it works → Environment variables are correct
   - If it fails → Check console for specific errors

## Troubleshooting

### "API calls failing"
- Verify `VITE_API_BASE_URL` is correct
- Check it includes `/api` at the end
- Verify backend is running (test `/health` endpoint)

### "Firebase authentication not working"
- Verify all 6 Firebase variables are set
- Check values match Firebase Console exactly
- Ensure Vercel URL is in Firebase authorized domains

### "Variables not updating"
- Redeploy after adding variables
- Check you selected the right environment (Production)
- Verify variable names start with `VITE_`

## Important Notes

- **Vite prefix**: All frontend variables MUST start with `VITE_` to be accessible in the browser
- **Case sensitive**: Variable names are case-sensitive
- **No quotes**: Don't add quotes around values in Vercel
- **Redeploy required**: Changes to environment variables require a redeploy

## Quick Checklist

- [ ] `VITE_API_BASE_URL` - Your Railway backend URL + `/api`
- [ ] `VITE_FIREBASE_API_KEY` - From Firebase Console
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- [ ] `VITE_FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `VITE_FIREBASE_APP_ID` - From Firebase Console
- [ ] Redeployed after adding variables
- [ ] Tested sign up/login


