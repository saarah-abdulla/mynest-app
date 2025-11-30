# Cloud Deployment Steps - MyNest App

This guide walks you through deploying MyNest to the cloud for testing.

## Recommended Stack
- **Backend**: Railway.app (easiest) or Render.com
- **Frontend**: Vercel.com (recommended) or Netlify
- **Database**: PostgreSQL (included with Railway/Render)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. Click "New Project"

### Step 2: Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for database to provision
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` value (you'll need this later)

### Step 3: Deploy Backend Service
1. In Railway project, click **"+ New"**
2. Select **"GitHub Repo"** (connect your GitHub account if needed)
3. Select your `mynest_app` repository
4. Railway will detect it's a Node.js project
5. Click on the newly created service
6. Go to **"Settings"** tab:
   - **Root Directory**: Set to `backend`
   - **Build Command**: Already configured in `railway.json`
   - **Start Command**: Already configured in `railway.json`

### Step 4: Configure Environment Variables
1. In the backend service, go to **"Variables"** tab
2. Click **"+ New Variable"** and add each of these:

```
DATABASE_URL=<paste_from_postgres_service>
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key_with_escaped_newlines
PORT=4000
NODE_ENV=production
ALLOW_ORIGINS=https://your-frontend-url.vercel.app
```

**Important Notes:**
- `DATABASE_URL`: Copy from PostgreSQL service variables
- `FIREBASE_PRIVATE_KEY`: Must have `\n` for newlines (e.g., `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`)
- `ALLOW_ORIGINS`: Add this after deploying frontend (use your Vercel URL)

### Step 5: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button in Railway dashboard
3. Wait for build to complete
4. Once deployed, click on the service → **"Settings"** → **"Generate Domain"**
5. Copy the generated URL (e.g., `https://mynest-backend-production.up.railway.app`)

### Step 6: Run Database Migrations
1. In Railway backend service, go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"**
4. Or use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   cd backend
   railway run npx prisma migrate deploy --schema ../prisma/schema.prisma
   ```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### Step 2: Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

### Step 3: Deploy via CLI
```bash
cd frontend
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (select your account)
- Link to existing project? **No**
- What's your project's name? **mynest-frontend**
- In which directory is your code located? **./** (current directory)

### Step 4: Configure Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your `mynest-frontend` project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add each variable:

```
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Important:**
- Replace `your-backend-url.railway.app` with your actual Railway backend URL
- Get Firebase values from Firebase Console → Project Settings → Your apps

### Step 5: Redeploy
After adding environment variables:
```bash
vercel --prod
```

Or trigger a new deployment from Vercel dashboard.

### Step 6: Update Backend CORS
1. Go back to Railway backend service
2. Update `ALLOW_ORIGINS` variable:
   ```
   ALLOW_ORIGINS=https://your-frontend-url.vercel.app
   ```
3. Redeploy backend (Railway auto-redeploys on variable change)

---

## Part 3: Configure Firebase

### Step 1: Add Authorized Domain
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project (`mynest-ae`)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain (e.g., `mynest-frontend.vercel.app`)

### Step 2: Verify OAuth Settings (if using Google Sign-In)
1. In Firebase Console → **Authentication** → **Sign-in method**
2. If Google is enabled, verify redirect URIs include your Vercel domain

---

## Part 4: Final Verification

### Test Backend
```bash
curl https://your-backend-url.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend
1. Visit your Vercel URL: `https://your-frontend-url.vercel.app`
2. Try to sign up/login
3. Check browser console for errors
4. Verify API calls are working

### Common Issues

**CORS Errors:**
- Ensure `ALLOW_ORIGINS` in backend includes your Vercel URL
- Check that URL matches exactly (including https://)

**Database Connection:**
- Verify `DATABASE_URL` is correct in Railway
- Check that migrations ran successfully

**Firebase Auth Errors:**
- Verify authorized domains in Firebase Console
- Check Firebase config in Vercel environment variables

---

## Alternative: Deploy to Render

If you prefer Render over Railway:

### Backend on Render
1. Go to https://render.com
2. Create account → **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Settings:
   - **Name**: `mynest-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate --schema ../prisma/schema.prisma`
   - **Start Command**: `npm start`
5. Add PostgreSQL database (separate service)
6. Add environment variables (same as Railway)
7. Deploy

### Frontend on Netlify
1. Go to https://netlify.com
2. **"Add new site"** → **"Import an existing project"**
3. Connect GitHub repo
4. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables (same as Vercel)
6. Deploy

---

## Environment Variables Reference

### Backend (Railway/Render)
```env
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_PROJECT_ID=mynest-ae
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mynest-ae.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
PORT=4000
NODE_ENV=production
ALLOW_ORIGINS=https://your-frontend-url.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@mynest.app
```

### Frontend (Vercel/Netlify)
```env
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=mynest-ae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mynest-ae
VITE_FIREBASE_STORAGE_BUCKET=mynest-ae.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Quick Commands Reference

### Railway CLI
```bash
# Install
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run migrations
railway run npx prisma migrate deploy --schema ../prisma/schema.prisma

# View logs
railway logs
```

### Vercel CLI
```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs
```

---

## Next Steps After Deployment

1. **Test all features**:
   - Sign up as parent
   - Create family
   - Add children
   - Invite caregiver
   - Log activities
   - Test calendar

2. **Share with testers**:
   - Provide Vercel frontend URL
   - Create test accounts or let them sign up
   - Monitor Railway logs for errors

3. **Set up monitoring** (optional):
   - Railway provides basic logs
   - Consider adding error tracking (Sentry, etc.)

---

## Troubleshooting

### Build Fails
- Check Railway/Render build logs
- Verify `package.json` scripts are correct
- Ensure Prisma schema path is correct: `../prisma/schema.prisma`

### Database Connection Fails
- Verify `DATABASE_URL` format
- Check database is running in Railway/Render
- Run migrations: `npx prisma migrate deploy`

### Frontend Can't Connect to Backend
- Check `VITE_API_BASE_URL` is correct
- Verify backend is deployed and accessible
- Check CORS settings in backend

### Firebase Auth Fails
- Verify authorized domains in Firebase Console
- Check Firebase config in frontend env vars
- Ensure Firebase project is active

---

## Support

For issues, check:
- Railway logs: Dashboard → Service → Deployments → View Logs
- Vercel logs: Dashboard → Project → Deployments → View Function Logs
- `docs/troubleshooting.md`

