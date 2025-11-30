# MyNest

AI-assisted childcare coordination platform for families and caregivers across the UAE and GCC.

## Monorepo layout

```
mynest_app/
├── frontend/         # React + Vite + Tailwind SPA
│   ├── src/components
│   ├── src/pages
│   ├── src/data
│   └── src/types
├── backend/          # Express + TypeScript API
│   ├── src/routes
│   ├── src/controllers
│   ├── src/middleware
│   └── src/lib       # Prisma client, config helpers
├── prisma/           # Shared Prisma schema & migrations
└── docs/             # Product and architecture notes
```

Each app maintains its own `package.json` so frontend and backend can be deployed independently.

## Getting started

### 1. Firebase Setup (Required)

1. Create a `.env` file in `frontend/` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Get your Firebase config from [Firebase Console](https://console.firebase.google.com/project/mynest-ae/settings/general)
   - Project: **mynest-ae**
   - Copy values from "Your apps" → Web app config
   - Paste into `frontend/.env`

3. Enable Authentication in Firebase Console:
   - Go to Authentication → Get Started
   - Enable **Email/Password** sign-in method

See `docs/firebase-setup.md` for detailed instructions.

### 2. Database Setup

1. Ensure PostgreSQL is running
2. Create `.env` in `backend/` directory (see `backend/.env.example`)
3. Run migrations and seed:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init --schema ../prisma/schema.prisma
   npm run seed
   ```

### 3. Start Development Servers

**Backend:**
```bash
cd backend
npm install
SKIP_AUTH=true npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Environment Variables

- **Frontend**: See `frontend/.env.example` (Firebase config required)
- **Backend**: See `backend/.env.example` (Database URL required)

## Deployment

For cloud deployment instructions, see:
- **Quick Start**: `DEPLOYMENT.md`
- **Detailed Guide**: `docs/cloud-deployment-steps.md`
- **Testing Guide**: `docs/testing-deployment-guide.md`

