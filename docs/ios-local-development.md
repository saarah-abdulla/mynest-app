# iOS Local Development - API Configuration

## Overview

When developing the iOS app locally, you have two options for connecting to the backend:

1. **Option A: Local Backend** - Connect to `http://localhost:4000` (backend running on your Mac)
2. **Option B: Production Backend** - Connect to your Railway backend URL

## Option A: Local Backend (Recommended for Development)

### Setup

1. **Start your local backend:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend should be running at `http://localhost:4000`

2. **Build and sync the iOS app:**
   ```bash
   cd frontend
   npm run build
   npx cap sync
   ```

3. **Open in Xcode and run:**
   ```bash
   npx cap open ios
   ```

### Important Notes

- ✅ The iOS simulator **CAN** connect to `localhost:4000` on your Mac
- ✅ This is perfect for local development and testing
- ✅ The warning about localhost has been disabled for Capacitor apps
- ⚠️ Make sure your backend CORS settings allow requests from the iOS app

### Backend CORS Configuration

Make sure your backend allows requests from Capacitor. Check `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'capacitor://localhost',   // Capacitor iOS
    'ionic://localhost',       // Alternative Capacitor scheme
    // Add your Vercel domain here too
  ],
  credentials: true,
}))
```

## Option B: Production Backend (For Testing Production API)

### Setup

1. **Set environment variable before building:**
   ```bash
   cd frontend
   export VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
   npm run build
   npx cap sync
   ```

   Or create a `.env.local` file:
   ```
   VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
   ```

2. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```

3. **Open in Xcode and run:**
   ```bash
   npx cap open ios
   ```

### Important Notes

- ✅ This connects to your production backend on Railway
- ✅ Good for testing against production data
- ⚠️ Make sure CORS is configured on Railway backend to allow Capacitor requests

## Troubleshooting

### "Failed to connect" errors

1. **Check if backend is running:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Check CORS configuration** - Make sure `capacitor://localhost` is in allowed origins

3. **Check iOS console** - Look for specific error messages in Xcode console

### API calls not working

1. **Verify API_BASE_URL in console:**
   - The console should show `[API] Environment check:` with the current URL
   - In Capacitor, localhost is allowed without warnings

2. **Check network permissions:**
   - iOS should have network access by default
   - Verify `Info.plist` doesn't restrict network access

3. **Test with curl:**
   ```bash
   curl http://localhost:4000/api/health
   ```

## Development Workflow

### When using local backend:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: After making frontend changes
cd frontend
npm run build
npx cap sync

# Then in Xcode, just click Run (no need to rebuild)
```

### Quick rebuild script

Create `frontend/build-and-sync.sh`:

```bash
#!/bin/bash
npm run build && npx cap sync && echo "✅ Build complete! Open Xcode and run the app."
```

Make it executable:
```bash
chmod +x build-and-sync.sh
```

Then use:
```bash
./build-and-sync.sh
```

## Summary

- **For local development**: Use Option A (localhost) - it's simpler and faster
- **For production testing**: Use Option B (Railway URL) - test against real data
- The code now properly detects Capacitor and won't show false warnings about localhost
- Always run `npm run build && npx cap sync` after making frontend changes

