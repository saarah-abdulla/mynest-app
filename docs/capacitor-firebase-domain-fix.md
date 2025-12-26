# Firebase Domain Configuration for Capacitor

## Problem: "Valid domain name required for Firebase"

When using Firebase Authentication with Capacitor, you must use the **Firebase project's default domain** for `authDomain`, NOT a custom URL scheme like `capacitor://localhost`.

## ✅ Correct Configuration

### In your `.env` file:

```env
VITE_FIREBASE_AUTH_DOMAIN=mynest-ae.firebaseapp.com
```

**✅ Correct formats:**
- `your-project.firebaseapp.com` (Firebase default domain)
- `your-project.web.app` (Firebase default domain)

**❌ Incorrect formats:**
- `capacitor://localhost` (This is NOT a valid authDomain)
- `http://localhost:5173` (This is NOT a valid authDomain)
- Any custom URL scheme

## Why This Works

Firebase Authentication's `authDomain` must be a **real domain** that Firebase recognizes. For Capacitor apps:
- You still use your Firebase project's standard domain for `authDomain`
- Capacitor handles the authentication flow internally
- Firebase doesn't need to know about `capacitor://localhost` in the config

## Firebase Console Configuration

### Step 1: Verify Authorized Domains (Optional)

While not strictly required for Capacitor apps, you can verify your Firebase project settings:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`mynest-ae`)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. You should see your Firebase domain (`mynest-ae.firebaseapp.com`)
5. **You do NOT need to add `capacitor://localhost`** - Capacitor apps don't use this list

### Step 2: Verify Firebase Config Values

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on your web app
4. Verify the `authDomain` matches what's in your `.env` file:
   - Should be: `mynest-ae.firebaseapp.com`
   - Should NOT be: `capacitor://localhost` or any URL scheme

## Current Configuration Check

Your `.env` file should have:

```env
VITE_FIREBASE_AUTH_DOMAIN=mynest-ae.firebaseapp.com
```

If it's set to anything else (like `capacitor://localhost`), change it back to the Firebase domain.

## Rebuild After Changes

After ensuring your `.env` has the correct `authDomain`:

```bash
cd frontend
npm run build
npx cap sync
```

Then run the app in Xcode again.

## How Capacitor + Firebase Works

1. **Config**: Use Firebase's standard domain (`your-project.firebaseapp.com`)
2. **Runtime**: Capacitor intercepts Firebase Auth calls and handles them natively
3. **Result**: Authentication works seamlessly in the mobile app

## Common Mistakes

❌ **Wrong**: Setting `authDomain` to `capacitor://localhost`
- Firebase requires a valid domain name
- Capacitor doesn't need a custom domain in the config

✅ **Correct**: Using your Firebase project domain
- `your-project.firebaseapp.com`
- This is what Firebase expects

## Verification

After rebuilding, check the Xcode console. You should see:
- ✅ `Firebase initialized successfully`
- ✅ `Firebase Auth initialized successfully`
- ✅ No domain validation errors

If you still see domain errors:
1. Double-check your `.env` file has the correct `authDomain`
2. Verify it matches Firebase Console → Project Settings
3. Rebuild and sync: `npm run build && npx cap sync`

