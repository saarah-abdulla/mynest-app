# iOS Firebase Configuration for Capacitor

## Problem: App Stuck on Loading Screen

If your iOS app is stuck on a loading spinner, it's likely because Firebase environment variables aren't embedded in the build.

## Solution: Set Firebase Environment Variables Before Building

### Step 1: Create a `.env` file (Recommended)

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

Add your Firebase configuration variables:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Where to find these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app (or create one if needed)
6. Copy the config values

### Step 2: Rebuild the App

After creating the `.env` file, rebuild:

```bash
cd frontend
npm run build
npx cap sync
```

### Alternative: Export Variables Before Build

If you prefer not to use a `.env` file, export variables before building:

```bash
cd frontend
export VITE_FIREBASE_API_KEY=your-api-key
export VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
export VITE_FIREBASE_PROJECT_ID=your-project-id
export VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
export VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
export VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
npm run build
npx cap sync
```

## Verify Configuration

After rebuilding, check the Xcode console. You should see:
- ✅ `Firebase initialized successfully` - Firebase config is correct
- ❌ `Firebase configuration is missing required environment variables` - Missing variables
- ❌ `Firebase initialization failed` - Invalid config values

## Debugging with Safari Web Inspector

1. **Open Safari** (on your Mac)
2. **Enable Developer Menu:**
   - Safari → Settings → Advanced
   - Check "Show features for web developers"
3. **Connect to Simulator:**
   - Safari → Develop → Simulator → [Your App Name]
4. **Check Console:**
   - Look for Firebase initialization messages
   - Check for any error messages
   - Look for network errors

## Common Issues

### Issue 1: "Firebase configuration is missing"
**Solution:** Make sure `.env` file exists and contains all 6 Firebase variables, then rebuild.

### Issue 2: Firebase auth domain not authorized
**Solution:** In Firebase Console → Authentication → Settings → Authorized domains, add:
- `capacitor://localhost` (for iOS development)
- Your custom domain (for production)

### Issue 3: Variables not being picked up
**Solution:**
1. Make sure variable names start with `VITE_`
2. Make sure `.env` file is in the `frontend` directory (not root)
3. Rebuild completely: `npm run build && npx cap sync`
4. Clean build folder: Delete `frontend/dist` and rebuild

## Production Builds

For production builds (App Store), you still need to set these variables before building. Consider using:
- CI/CD environment variables
- Xcode build schemes with different configurations
- Or use a `.env.production` file

## Security Note

⚠️ **Important:** Never commit `.env` files to git! They should already be in `.gitignore`.

Firebase config values (especially API keys) are meant to be public in client-side apps, but it's still good practice to keep them in `.env` files for local development.

