# 🚀 Quick Deployment Guide

## Prerequisites

**Before deploying, push your code to GitHub:**
1. See `docs/github-setup.md` for instructions
2. Or run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/mynest-app.git
   git push -u origin main
   ```

## Fastest Path to Deploy

### 1. Backend → Railway (5 minutes)

1. **Sign up**: https://railway.app (use GitHub)
2. **New Project** → **"Deploy from GitHub repo"**
3. **Add PostgreSQL**: Click "+ New" → "Database" → "PostgreSQL"
4. **Deploy Backend**:
   - Click "+ New" → "GitHub Repo" → Select your repo
   - In service settings, set **Root Directory**: `backend`
   - Railway will auto-detect the config from `railway.json`
5. **Add Environment Variables** (in backend service → Variables):
   ```
   DATABASE_URL=<from_postgres_service>
   FIREBASE_PROJECT_ID=mynest-ae
   FIREBASE_CLIENT_EMAIL=<from_firebase>
   FIREBASE_PRIVATE_KEY=<from_firebase_with_\n>
   PORT=4000
   NODE_ENV=production
   ```
6. **Get Backend URL**: Settings → Generate Domain

### 2. Frontend → Vercel (3 minutes)

1. **Sign up**: https://vercel.com (use GitHub)
2. **New Project** → Import your GitHub repo
3. **Configure**:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. **Deploy** → Get your Vercel URL

### 3. Update Backend CORS

In Railway backend service → Variables:
```
ALLOW_ORIGINS=https://your-frontend.vercel.app
```

### 4. Update Firebase

Firebase Console → Authentication → Settings → Authorized domains:
- Add: `your-frontend.vercel.app`

### 5. Done! 🎉

Share your Vercel URL with testers.

---

## Detailed Guide

See `docs/cloud-deployment-steps.md` for complete instructions.

---

## Environment Variables Checklist

### Backend (Railway)
- [ ] `DATABASE_URL` (from PostgreSQL service)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (with `\n` for newlines)
- [ ] `PORT=4000`
- [ ] `NODE_ENV=production`
- [ ] `ALLOW_ORIGINS` (add after frontend is deployed)

### Frontend (Vercel)
- [ ] `VITE_API_BASE_URL` (your Railway backend URL + `/api`)
- [ ] All Firebase config variables (6 total)

---

## Quick Test

```bash
# Test backend
curl https://your-backend.railway.app/health

# Visit frontend
open https://your-frontend.vercel.app
```

