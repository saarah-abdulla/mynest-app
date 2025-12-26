# Firebase Auth Hanging in Capacitor iOS - Fix Guide

## Problem

Firebase `signInWithEmailAndPassword` is being called but hangs indefinitely - no success or error response.

## Root Cause

Firebase Auth requests may be blocked or not completing due to:
1. Missing authorized domains in Firebase Console
2. Network connectivity issues in Capacitor
3. Firebase Auth configuration not compatible with Capacitor

## Solutions

### Solution 1: Add localhost to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`mynest-ae`)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add: `localhost`
6. Click **"Add"**

### Solution 2: Check Network Connectivity

Verify the iOS app can reach Firebase servers:

1. Open Safari Web Inspector:
   - Safari → Develop → Simulator → [Your App Name]
2. Go to **Network** tab
3. Try to sign in
4. Look for requests to:
   - `identitytoolkit.googleapis.com`
   - `securetoken.googleapis.com`
5. Check if requests are:
   - ✅ **Pending/Failed** → Network issue
   - ✅ **Completed** → Should see response

### Solution 3: Verify iOS Network Permissions

Make sure the iOS app has network permissions:

1. Open `frontend/ios/App/App/Info.plist`
2. Verify it includes network permissions (should be automatic in Capacitor)
3. If needed, add:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key>
     <true/>
   </dict>
   ```

### Solution 4: Check Firebase Console API Status

1. Check [Firebase Status Page](https://status.firebase.google.com/)
2. Verify Authentication service is operational

### Solution 5: Test with Safari Web Inspector Console

1. Open Safari Web Inspector → Console tab
2. Try signing in
3. Look for:
   - Network errors (CORS, connection refused, timeout)
   - JavaScript errors
   - Firebase-specific errors

## Debugging Steps

### Step 1: Check Current Logs

After rebuilding with the timeout fix, try signing in and check console:

```
[LoginPage] Attempting to sign in with email: ...
[AuthContext] login called with email: ...
[AuthContext] auth object: ...
```

If you see:
- **Nothing after "login called"** → Request is hanging
- **Timeout error after 15 seconds** → Network/connectivity issue
- **Firebase error** → Check error code and message

### Step 2: Test Network Connectivity

1. In Safari Web Inspector → Network tab
2. Filter for: `identitytoolkit` or `firebase`
3. Try signing in
4. Check if requests appear and their status

### Step 3: Test with curl (to verify Firebase is reachable)

```bash
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword",
    "returnSecureToken": true
  }'
```

Replace `YOUR_API_KEY` with your Firebase API key from `.env`.

## Common Error Codes

If you see errors after timeout:

- **Network timeout** → Check internet connection, Firebase status
- **auth/network-request-failed** → Network connectivity issue
- **auth/invalid-api-key** → API key incorrect
- **auth/invalid-credential** → Wrong email/password (but request completed)

## Expected Behavior After Fix

1. Login call completes within 1-3 seconds
2. Either success or clear error message
3. User redirected to dashboard on success
4. Error message displayed on failure

## Next Steps

1. ✅ Add `localhost` to Firebase authorized domains
2. ✅ Rebuild app: `npm run build && npx cap sync`
3. ✅ Try signing in again
4. ✅ Check Safari Web Inspector for network requests
5. ✅ Check console for timeout or error messages

If still hanging after these steps, check:
- Firebase project settings
- iOS simulator network connectivity
- Firewall/network restrictions

