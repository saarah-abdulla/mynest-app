# Firebase Admin SDK Setup Guide

## Step 1: Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/mynest-ae/settings/serviceaccounts/adminsdk)
   - Direct link: https://console.firebase.google.com/project/mynest-ae/settings/serviceaccounts/adminsdk

2. Make sure you're in the **mynest-ae** project

3. Click **"Generate new private key"** button

4. A JSON file will download (e.g., `mynest-ae-firebase-adminsdk-xxxxx.json`)

5. **DO NOT commit this file to git!** It contains sensitive credentials.

## Step 2: Extract Values from JSON

Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "mynest-ae",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

You need these three values:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

## Step 3: Update backend/.env

Open `backend/.env` and update these values:

```env
FIREBASE_PROJECT_ID="mynest-ae"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the quotes around the values
- For `FIREBASE_PRIVATE_KEY`, keep the `\n` characters as-is (they represent newlines)
- The private key should be on a single line with `\n` characters

## Step 4: Enable Authentication

In `backend/.env`, either:
- Remove the `SKIP_AUTH=true` line, OR
- Set `SKIP_AUTH=false`

## Step 5: Restart Backend

```bash
cd backend
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 6: Verify It Works

1. Try to access an API endpoint without a token - should get 401 error
2. Login through the frontend - should work with token
3. Check backend logs - should see Firebase initialized

## Troubleshooting

### "Firebase credentials not set"
- Check that all three env variables are set
- Make sure there are no extra spaces
- Verify the private key includes the BEGIN/END markers

### "Invalid Firebase token"
- Make sure frontend `.env` has correct Firebase config
- Check that Email/Password auth is enabled in Firebase Console

### "Firebase not configured"
- Restart the backend server after updating `.env`
- Check that `FIREBASE_PROJECT_ID` matches your project



