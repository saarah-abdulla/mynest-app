# Deployment Checklist

Use this checklist as you deploy to ensure nothing is missed.

## Pre-Deployment

### Backend Preparation
- [ ] Code is committed and pushed to GitHub
- [ ] All tests pass locally
- [ ] `railway.json` is configured correctly
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Prisma client generates: `npx prisma generate --schema ../prisma/schema.prisma`

### Frontend Preparation
- [ ] Code is committed and pushed to GitHub
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Logo image exists in `frontend/public/mynest-logo.png`
- [ ] `vercel.json` is configured correctly

### Firebase Preparation
- [ ] Firebase project is active (`mynest-ae`)
- [ ] Email/Password authentication is enabled
- [ ] Firebase Admin SDK credentials are ready
- [ ] Firebase Web App config is ready

### Database Preparation
- [ ] All migrations are in `prisma/migrations/`
- [ ] Database schema is up to date

---

## Step 1: Deploy Backend to Railway

### Railway Setup
- [ ] Created Railway account
- [ ] Created new project
- [ ] Added PostgreSQL database
- [ ] Copied `DATABASE_URL` from PostgreSQL service

### Backend Service
- [ ] Created backend service from GitHub repo
- [ ] Set Root Directory to `backend`
- [ ] Verified build command includes Prisma migrations

### Environment Variables (Backend)
- [ ] `DATABASE_URL` = (from PostgreSQL service)
- [ ] `FIREBASE_PROJECT_ID` = `mynest-ae`
- [ ] `FIREBASE_CLIENT_EMAIL` = (from Firebase)
- [ ] `FIREBASE_PRIVATE_KEY` = (with `\n` for newlines)
- [ ] `PORT` = `4000`
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOW_ORIGINS` = (will add after frontend is deployed)

### Deployment
- [ ] Backend deployed successfully
- [ ] Generated Railway domain
- [ ] Tested health endpoint: `curl https://your-backend.railway.app/health`
- [ ] Database migrations ran successfully
- [ ] Backend logs show no errors

**Backend URL**: `https://____________________.railway.app`

---

## Step 2: Deploy Frontend to Vercel

### Vercel Setup
- [ ] Created Vercel account
- [ ] Connected GitHub account
- [ ] Created new project from GitHub repo

### Project Configuration
- [ ] Root Directory: `frontend`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Environment Variables (Frontend)
- [ ] `VITE_API_BASE_URL` = `https://your-backend.railway.app/api`
- [ ] `VITE_FIREBASE_API_KEY` = (from Firebase)
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = (from Firebase)
- [ ] `VITE_FIREBASE_PROJECT_ID` = (from Firebase)
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = (from Firebase)
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = (from Firebase)
- [ ] `VITE_FIREBASE_APP_ID` = (from Firebase)

### Deployment
- [ ] Frontend deployed successfully
- [ ] Got Vercel URL
- [ ] Tested frontend loads without errors
- [ ] Checked browser console for errors

**Frontend URL**: `https://____________________.vercel.app`

---

## Step 3: Update Backend CORS

- [ ] Updated `ALLOW_ORIGINS` in Railway backend service
- [ ] Value: `https://your-frontend.vercel.app`
- [ ] Backend redeployed automatically
- [ ] Verified CORS works (no CORS errors in browser console)

---

## Step 4: Configure Firebase

- [ ] Opened Firebase Console
- [ ] Went to Authentication → Settings → Authorized domains
- [ ] Added Vercel domain: `your-frontend.vercel.app`
- [ ] Verified domain is listed

---

## Step 5: Final Testing

### Authentication
- [ ] Can sign up as new user
- [ ] Can log in with email/password
- [ ] Can log out

### Core Features
- [ ] Can create family profile
- [ ] Can add children
- [ ] Can invite caregivers
- [ ] Can view dashboard
- [ ] Can add calendar events
- [ ] Can log activities (meals, naps, medication, etc.)
- [ ] Can view journal entries
- [ ] Can edit entries (test both parent and caregiver permissions)

### Permissions
- [ ] Parent can edit/delete all entries
- [ ] Caregiver can edit any entry
- [ ] Caregiver can only update medication status (not other fields)

### Email (if configured)
- [ ] Caregiver invitation emails are sent
- [ ] Email links work correctly

---

## Post-Deployment

### Monitoring
- [ ] Set up Railway monitoring (check logs regularly)
- [ ] Set up Vercel monitoring (check function logs)
- [ ] Test error scenarios

### Documentation
- [ ] Documented deployment URLs
- [ ] Shared URLs with testers
- [ ] Created test accounts (if needed)

### Backup
- [ ] Database backups are enabled (Railway auto-backups)
- [ ] Environment variables are documented securely

---

## Troubleshooting Notes

**If backend fails to deploy:**
- Check Railway build logs
- Verify Prisma schema path: `../prisma/schema.prisma`
- Check environment variables are set correctly

**If frontend can't connect:**
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running (test `/health` endpoint)
- Verify CORS settings

**If authentication fails:**
- Check Firebase authorized domains
- Verify Firebase config in Vercel env vars
- Check browser console for specific errors

---

## URLs Reference

**Backend API**: `https://____________________.railway.app`  
**Frontend App**: `https://____________________.vercel.app`  
**Database**: Managed by Railway (internal connection)

---

## Next Steps

1. Share frontend URL with testers
2. Monitor logs for errors
3. Collect feedback
4. Iterate based on testing results

