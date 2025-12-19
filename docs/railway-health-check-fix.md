# Fixing Railway Container Restart Issues

## Problem

Railway is stopping your container with `SIGTERM` even though the server starts successfully. This is usually because Railway's health check is failing.

## Solution Applied

1. **Added health check path to `railway.json`**:
   - `healthcheckPath: "/health"`
   - `healthcheckTimeout: 100` (milliseconds)

2. **Improved health endpoint**:
   - Returns 200 status code explicitly
   - Includes uptime for monitoring
   - Placed before auth middleware so it's always accessible

## How Railway Health Checks Work

Railway automatically checks the health endpoint:
- **Path**: `/health` (configured in `railway.json`)
- **Frequency**: Every few seconds
- **Timeout**: 100ms (configured)
- **Expected**: HTTP 200 response with JSON `{ status: 'ok' }`

If the health check fails:
- Railway marks the service as unhealthy
- Railway stops the container (SIGTERM)
- Railway restarts the container (up to 10 times based on restart policy)

## Verify It's Working

After Railway redeploys:

1. **Check Railway Dashboard**:
   - Go to your backend service
   - Status should be "Running" (green)
   - Should not be restarting repeatedly

2. **Check Logs**:
   - Should see: `MyNest API listening on http://0.0.0.0:8080`
   - Should NOT see: `Stopping Container` followed by `SIGTERM`
   - Should see health check requests (if logging is enabled)

3. **Test Health Endpoint Manually**:
   ```bash
   curl https://mynest-app-production.up.railway.app/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-19T06:30:00.000Z",
     "uptime": 123.45
   }
   ```

## Troubleshooting

### Still Getting SIGTERM?

1. **Check Health Endpoint**:
   - Try accessing `/health` directly
   - Should return 200 OK
   - Should not require authentication

2. **Check Port Configuration**:
   - Railway uses `PORT` environment variable
   - Server should listen on `0.0.0.0:${PORT}`
   - Default Railway port is usually `8080` or `$PORT`

3. **Check Startup Time**:
   - If server takes too long to start, health check might timeout
   - Health check timeout is 100ms - server should respond quickly
   - Consider increasing timeout if startup is slow

4. **Check Railway Settings**:
   - Go to Railway Dashboard → Your Service → Settings
   - Verify health check path is set to `/health`
   - Check if there are any custom health check settings

### Health Check Timing Out?

If health checks are timing out:

1. **Increase Timeout** (in `railway.json`):
   ```json
   "healthcheckTimeout": 500
   ```

2. **Make Health Endpoint Faster**:
   - Don't do database queries in health check
   - Don't do external API calls
   - Keep it simple and fast

3. **Check Server Startup**:
   - Make sure server starts quickly
   - Don't block startup with slow operations
   - Move slow initialization to after server starts

## Current Configuration

Your `railway.json` now has:
```json
{
  "deploy": {
    "startCommand": "npm run start:migrate",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

This tells Railway:
- Use `/health` endpoint for health checks
- Wait up to 100ms for response
- Restart on failure (up to 10 times)

## After Fix

Once Railway redeploys with the new configuration:
- ✅ Container should stay running
- ✅ Health checks should pass
- ✅ No more SIGTERM errors
- ✅ Service should be stable

