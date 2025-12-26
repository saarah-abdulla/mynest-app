# 🚨 Railway Fix: "No start command found"

## Quick Fix

Railway is looking in the wrong directory. Fix it in 2 steps:

### Step 1: Set Root Directory in Railway

1. Go to Railway Dashboard → Your Project → Backend Service
2. Click **"Settings"** tab
3. Find **"Root Directory"** field
4. Enter: `backend`
5. Save (auto-saves)

### Step 2: Wait for Redeploy

Railway will automatically redeploy. Check the logs to verify it's working.

## What This Does

Setting Root Directory to `backend` tells Railway:
- Look for `package.json` in `backend/` folder
- Use `backend/railway.json` for build config
- Run `npm start` from the `backend/` directory

## Verify It Worked

After redeploy, check:
- ✅ Build logs show `npm install` and `npm run build`
- ✅ Start command shows `npm start`
- ✅ Service is running (green status)

## Current Configuration

Your `backend/package.json` has:
```json
{
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js"
  }
}
```

This is correct! Railway just needs to know to look in the `backend/` folder.

---

**That's it!** Once you set the root directory, Railway will find everything it needs.


