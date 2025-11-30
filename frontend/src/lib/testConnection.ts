// Utility to test backend connection
export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:4000/health')
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('Backend connection test failed:', error)
    return false
  }
}



