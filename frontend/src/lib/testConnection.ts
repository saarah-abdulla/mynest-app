// Utility to test backend connection
// Use the same API_BASE_URL as the rest of the app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
// Health endpoint is at root, not /api
const HEALTH_URL = API_BASE_URL.replace('/api', '') + '/health'

export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL)
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('Backend connection test failed:', error)
    console.error('Attempted to connect to:', HEALTH_URL)
    return false
  }
}



