# Railway Firebase Setup

## ✅ Current Status

- ✅ Database migrations: **SUCCESS**
- ✅ Server is running on port 8080
- ⚠️ Firebase credentials: **MISSING**

## Add Firebase Environment Variables

Your server is running but Firebase authentication won't work without credentials. Add these to your **backend service** in Railway:

### Step 1: Get Firebase Admin SDK Credentials

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **mynest-ae**
3. Go to **Project Settings** (gear icon)
4. Click **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Download the JSON file

### Step 2: Extract Values from JSON

Open the downloaded JSON file. You'll need these values:

```json
{
  "project_id": "mynest-ae",
  "client_email": "firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
}
```

### Step 3: Add to Railway Backend Service

1. Go to Railway Dashboard → Your Project → **Backend Service**
2. Go to **"Variables"** tab
3. Add these three variables:

#### Variable 1: FIREBASE_PROJECT_ID
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: `mynest-ae` (or the `project_id` from JSON)

#### Variable 2: FIREBASE_CLIENT_EMAIL
- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: The `client_email` from JSON (e.g., `firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com`)

#### Variable 3: FIREBASE_PRIVATE_KEY
- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: The `private_key` from JSON
  - **IMPORTANT**: 
    - ✅ **YES** - Keep `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
    - ✅ Keep the `\n` characters (not actual line breaks)
    - ✅ The entire key should be on one line with `\n` for line breaks
    - Example: `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`
  
  See `FIREBASE_PRIVATE_KEY_FORMAT.md` for detailed formatting instructions.

### Step 4: Redeploy

Railway will automatically redeploy when you add variables. Check logs to verify:
- ✅ Firebase credentials loaded
- ✅ Server restarted successfully

## Complete Environment Variables Checklist

Make sure all these are set in your **backend service**:

- [x] `DATABASE_URL` - ✅ Already configured
- [ ] `FIREBASE_PROJECT_ID` - ⚠️ **Add this**
- [ ] `FIREBASE_CLIENT_EMAIL` - ⚠️ **Add this**
- [ ] `FIREBASE_PRIVATE_KEY` - ⚠️ **Add this**
- [ ] `PORT` - Optional (defaults to 4000, Railway sets it automatically)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `ALLOW_ORIGINS` - Your frontend URL (add after deploying frontend)

## Verify Firebase is Working

After adding credentials, check the logs. You should see:
```
[auth] Firebase initialized successfully
```

Instead of:
```
[auth] Firebase credentials not set – skipping initialization
```

## Troubleshooting

**"Firebase credentials not set"**
- Verify all three variables are added (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)
- Check that PRIVATE_KEY includes `\n` characters
- Make sure variable names are exactly as shown (case-sensitive)

**"Invalid credentials"**
- Verify the private key is complete (includes BEGIN and END lines)
- Check that `\n` characters are preserved in PRIVATE_KEY
- Ensure CLIENT_EMAIL matches the one in the JSON file

**Server not restarting**
- Railway auto-redeploys on variable changes
- Check "Deployments" tab for new deployment
- View logs to see if server restarted

