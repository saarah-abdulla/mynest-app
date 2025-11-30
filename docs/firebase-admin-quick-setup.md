# Firebase Admin SDK Quick Setup

## Step 1: Get Service Account Key

1. **Go to Firebase Console:**
   - Direct link: https://console.firebase.google.com/project/mynest-ae/settings/serviceaccounts/adminsdk
   - Or: Firebase Console → Project Settings → Service Accounts tab

2. **Generate Private Key:**
   - Click **"Generate new private key"** button
   - Confirm the dialog
   - A JSON file will download (e.g., `mynest-ae-firebase-adminsdk-xxxxx-xxxxx.json`)

## Step 2: Extract Values

Open the downloaded JSON file. You need these 3 values:

```json
{
  "project_id": "mynest-ae",                    ← FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com",  ← FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  ← FIREBASE_PRIVATE_KEY
}
```

## Step 3: Update backend/.env

Open `backend/.env` and replace these lines:

```env
FIREBASE_PROJECT_ID="mynest-ae"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Important:**
- Keep the quotes around values
- Keep `\n` in the private key (don't convert to actual newlines)
- Copy the entire private key including BEGIN/END markers

## Step 4: Enable Authentication (Optional)

To enforce authentication, remove or comment out:
```env
# SKIP_AUTH=true
```

Or set it to false:
```env
SKIP_AUTH=false
```

## Step 5: Restart Backend

```bash
cd backend
# Stop current server (Ctrl+C if running)
npm run dev
```

## Step 6: Verify

Check backend logs - you should see:
- No "Firebase credentials not set" warnings
- Server starts successfully
- API endpoints work with authentication

## Security Note

⚠️ **NEVER commit the service account JSON file or .env file to git!**
- The JSON file contains sensitive credentials
- Add to `.gitignore` if not already there



