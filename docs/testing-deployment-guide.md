# Testing Deployment Guide

This guide covers different options for sharing the MyNest app with testers.

## Option 1: Local Network Testing (Quickest for Internal Testing)

### Prerequisites
- All testers must be on the same local network (WiFi)
- Your development machine must be running
- Backend and database must be accessible

### Steps

#### 1. Configure Backend for Network Access

Update `backend/src/index.ts` to listen on all network interfaces:

```typescript
const PORT = process.env.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
```

Or set in `backend/.env`:
```
PORT=4000
HOST=0.0.0.0
```

#### 2. Find Your Local IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# or
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (usually 192.168.x.x or 10.x.x.x)
```

#### 3. Update Frontend API URL

Create or update `frontend/.env`:
```env
VITE_API_BASE_URL=http://YOUR_LOCAL_IP:4000/api
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Replace `YOUR_LOCAL_IP` with your actual IP (e.g., `192.168.1.100`)

#### 4. Build Frontend

```bash
cd frontend
npm run build
```

#### 5. Start Backend

```bash
cd backend
npm run dev
# or for production
npm run build
npm start
```

#### 6. Serve Frontend

**Option A: Using Vite Preview (Recommended)**
```bash
cd frontend
npm run preview -- --host 0.0.0.0
```

**Option B: Using a Simple HTTP Server**
```bash
cd frontend/dist
# Install http-server globally: npm install -g http-server
http-server -p 5173 -a 0.0.0.0
```

#### 7. Share Access

Share these URLs with testers:
- **Frontend**: `http://YOUR_LOCAL_IP:5173`
- **Backend API**: `http://YOUR_LOCAL_IP:4000/api`

**Note**: Testers must be on the same WiFi network.

---

## Option 2: Cloud Deployment (For Remote Testing)

### A. Deploy Backend to Railway/Render/Heroku

#### Railway (Recommended - Easy Setup)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` from the database service
4. **Configure Backend Service**:
   - Set root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Add environment variables:
     ```
     DATABASE_URL=<from_postgres_service>
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_CLIENT_EMAIL=your_client_email
     FIREBASE_PRIVATE_KEY=your_private_key
     PORT=4000
     NODE_ENV=production
     ```
5. **Deploy** - Railway will auto-deploy on git push

#### Render

1. **Create Account**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add PostgreSQL Database** (separate service)
5. **Environment Variables**: Same as Railway above
6. **Deploy**

### B. Deploy Frontend to Vercel/Netlify

#### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. **Redeploy** after adding env vars:
   ```bash
   vercel --prod
   ```

#### Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Add Environment Variables** in Netlify Dashboard (same as Vercel)

### C. Run Database Migrations

After deploying backend, run migrations:

```bash
cd backend
npx prisma migrate deploy --schema ../prisma/schema.prisma
```

Or add to Railway/Render build command:
```bash
npm install && npm run build && npx prisma migrate deploy --schema ../prisma/schema.prisma
```

---

## Option 3: Docker Deployment (Advanced)

### Create Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../prisma ./prisma

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema ../prisma/schema.prisma

# Build
RUN npm run build

# Expose port
EXPOSE 4000

CMD ["npm", "start"]
```

### Create Dockerfile for Frontend

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Full Stack)

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: mynest
      POSTGRES_PASSWORD: mynest_password
      POSTGRES_DB: mynest
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://mynest:mynest_password@postgres:5432/mynest
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      VITE_API_BASE_URL: http://localhost:4000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY` (with newlines escaped as `\n`)
- [ ] `PORT` (default: 4000)
- [ ] `NODE_ENV=production` (for production)
- [ ] SMTP settings (for email invitations):
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASS`
  - [ ] `SMTP_FROM_EMAIL`

### Frontend (.env)
- [ ] `VITE_API_BASE_URL` - Backend API URL
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

---

## Firebase Configuration for Production

1. **Add Authorized Domains**:
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `your-app.vercel.app`)

2. **Update OAuth Redirect URLs** (if using Google Sign-In):
   - Add production URL to authorized redirect URIs

3. **CORS Configuration**:
   - Backend should allow your frontend domain in CORS settings

---

## Pre-Deployment Checklist

### Backend
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Prisma client generated
- [ ] Firebase Admin SDK configured
- [ ] CORS allows frontend domain
- [ ] Email service configured (for invitations)

### Frontend
- [ ] Build completes without errors
- [ ] Environment variables set
- [ ] API base URL points to deployed backend
- [ ] Firebase config updated
- [ ] Logo image exists in `public/` folder

### Database
- [ ] PostgreSQL database created
- [ ] Migrations applied
- [ ] Connection string configured
- [ ] Database accessible from backend

---

## Testing Checklist for Testers

Share this with your testers:

1. **Account Creation**
   - [ ] Can create parent account
   - [ ] Can create caregiver account (via invitation)
   - [ ] Can sign in with email/password

2. **Family Setup**
   - [ ] Can create family profile
   - [ ] Can add children
   - [ ] Can invite caregivers
   - [ ] Caregivers receive invitation emails

3. **Core Features**
   - [ ] Can view dashboard
   - [ ] Can add calendar events
   - [ ] Can log activities (meals, naps, medication, etc.)
   - [ ] Can view journal entries
   - [ ] Can edit entries (with proper permissions)

4. **Permissions**
   - [ ] Parents can edit/delete all entries
   - [ ] Caregivers can only edit their own entries (except medication status)
   - [ ] Caregivers can update medication status

---

## Quick Start Commands

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm run preview
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS allows frontend domain
   - Check `VITE_API_BASE_URL` matches backend URL

2. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from backend
   - Run migrations: `npx prisma migrate deploy`

3. **Firebase Authentication Errors**
   - Check authorized domains in Firebase Console
   - Verify Firebase config in frontend `.env`

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run lint`

---

## Recommended Deployment Stack

**For Quick Testing:**
- Backend: Railway or Render
- Frontend: Vercel
- Database: Railway PostgreSQL or Render PostgreSQL

**For Production:**
- Backend: Railway, Render, or AWS
- Frontend: Vercel or Netlify
- Database: Managed PostgreSQL (Railway, Render, or AWS RDS)
- CDN: Cloudflare (optional)

---

## Support

For issues during deployment, check:
- `docs/troubleshooting.md`
- `docs/firebase-setup.md`
- `docs/architecture.md`

