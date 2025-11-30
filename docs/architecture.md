# Architecture notes

## High-level vision

MyNest delivers a family-facing SPA and a stateless REST API. Firebase Authentication issues ID tokens, which the backend verifies before authorizing access to Prisma-managed PostgreSQL data.

## Backend layers

- `src/index.ts`: bootstraps configuration, Prisma, and Express app.
- `src/routes`: REST endpoints grouped per resource (users, families, children, caregivers, schedules, journals).
- `src/controllers`: Request handlers with validation (Zod) and Prisma access.
- `src/middleware`: Authentication and error-parsing helpers.
- `src/lib/prisma.ts`: Singleton Prisma client.

## Frontend layers

- `src/pages`: Route-level screens (e.g., family dashboard, child detail).
- `src/components`: Presentational building blocks (schedule cards, journal entries, caregiver lists).
- `src/data`: Mock fixtures for local UI prototyping until the API is wired up.
- `src/types`: Shared TS interfaces matching Prisma models.
- `src/lib/api.ts`: Thin fetch wrapper for calling backend CRUD endpoints with Firebase ID tokens.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service client for admin verification |
| `FIREBASE_PRIVATE_KEY` | Private key for verifying ID tokens |
| `PORT` | Backend HTTP port (default 4000) |

Frontend uses Vite environment variables prefixed with `VITE_`, e.g. `VITE_API_BASE_URL` and `VITE_FIREBASE_CONFIG`.

