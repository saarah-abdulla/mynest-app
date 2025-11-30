# Troubleshooting Guide

## "Unable to connect to the server" Error

### Quick Checks

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:4000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Verify Frontend is Running:**
   - Check browser console for errors
   - Frontend should be at: `http://localhost:5173`
   - Backend API at: `http://localhost:4000/api`

3. **Check CORS Configuration:**
   - Backend `.env` should have: `ALLOW_ORIGINS="http://localhost:5173"`
   - Restart backend after changing `.env`

### Common Solutions

#### Solution 1: Restart Backend
```bash
cd backend
# Stop any running process (Ctrl+C)
SKIP_AUTH=true npm run dev
```

#### Solution 2: Restart Frontend
```bash
cd frontend
# Stop any running process (Ctrl+C)
npm run dev
```

#### Solution 3: Check Port Conflicts
```bash
# Check if ports are in use
lsof -ti:4000  # Backend port
lsof -ti:5173  # Frontend port
```

#### Solution 4: Verify Environment Variables
- Frontend: Check `frontend/.env` has correct `VITE_API_BASE_URL`
- Backend: Check `backend/.env` has correct `DATABASE_URL` and `ALLOW_ORIGINS`

#### Solution 5: Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or open in incognito/private window

### Testing the Connection

Open browser console and run:
```javascript
fetch('http://localhost:4000/api/children')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this works, the backend is accessible. If not, check backend logs for errors.



