# Firebase Setup Guide for MyNest

## Project: mynest-ae

### Step 1: Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mynest-ae**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **Your apps** section
6. If you don't have a web app yet:
   - Click **Add app** → Select **Web** (</> icon)
   - Register your app with a nickname (e.g., "MyNest Web")
   - Click **Register app**
7. Copy the Firebase configuration object values

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable the following sign-in methods:
   - **Email/Password** → Enable
   - **Google** → Enable (optional, but recommended)

### Step 3: Create Environment File

1. In `frontend/` directory, create a `.env` file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Open `frontend/.env` and fill in your Firebase config values:
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   VITE_FIREBASE_API_KEY=AIza... (your actual API key)
   VITE_FIREBASE_AUTH_DOMAIN=mynest-ae.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mynest-ae
   VITE_FIREBASE_STORAGE_BUCKET=mynest-ae.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 (your actual sender ID)
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123 (your actual app ID)
   ```

### Step 4: Verify Setup

1. Restart your frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Visit `http://localhost:5173`
3. You should see the login page
4. Try creating an account - it should work!

### Firebase Console URLs

- **Project Dashboard**: https://console.firebase.google.com/project/mynest-ae
- **Authentication**: https://console.firebase.google.com/project/mynest-ae/authentication
- **Project Settings**: https://console.firebase.google.com/project/mynest-ae/settings/general

### Troubleshooting

- **"Firebase: Error (auth/invalid-api-key)"**: Check that your API key in `.env` is correct
- **"Firebase: Error (auth/domain-not-authorized)"**: Add `localhost` to authorized domains in Firebase Console > Authentication > Settings > Authorized domains
- **Environment variables not loading**: Make sure `.env` is in `frontend/` directory and restart the dev server



