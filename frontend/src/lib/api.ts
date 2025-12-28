import type {
  Child,
  Family,
  JournalEntry,
  ScheduleEntry,
  Caregiver,
  User,
} from '../types/entities'

// Get API base URL from environment variable
// In production (Vercel), this MUST be set to your Railway backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

// Debug logging - always log in production to help diagnose issues
console.log('[API] Environment check:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL: API_BASE_URL,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  mode: import.meta.env.MODE,
})

// Warn if using localhost in production web browser (but allow it in Capacitor for local dev)
const isCapacitor = typeof (window as any).Capacitor !== 'undefined'
if (import.meta.env.PROD && API_BASE_URL.includes('localhost') && !isCapacitor) {
  console.error(
    '❌ CRITICAL ERROR: VITE_API_BASE_URL is not set correctly in Vercel!\n' +
    'Current value:', import.meta.env.VITE_API_BASE_URL, '\n' +
    'The app is trying to connect to localhost, which will not work.\n' +
    'Please:\n' +
    '1. Go to Vercel → Settings → Environment Variables\n' +
    '2. Set VITE_API_BASE_URL = https://your-railway-backend.up.railway.app/api\n' +
    '3. Make sure it\'s set for "Production" environment\n' +
    '4. Redeploy WITHOUT build cache'
  )
} else if (isCapacitor && API_BASE_URL.includes('localhost')) {
  console.log('ℹ️ Running in Capacitor with localhost backend. Make sure your backend is running at http://localhost:4000')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  
  try {
    const token = await getFirebaseToken()
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      // Create error object with details for better error handling
      const errorObj = new Error(error.error ?? `Request failed with status ${res.status}`) as any
      if (error.details) {
        errorObj.details = error.details
      }
      throw errorObj
    }

    // Handle 204 No Content responses (for DELETE requests)
    if (res.status === 204) {
      return undefined as T
    }

    return res.json()
  } catch (err) {
    // More specific error handling
    if (err instanceof TypeError) {
      // Network error - could be CORS, connection refused, etc.
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        console.error('Network error connecting to:', url)
        const isLocalhost = url.includes('localhost')
        if (isLocalhost) {
          throw new Error('Unable to connect to the server. Please make sure the backend is running at http://localhost:4000, or set VITE_API_BASE_URL in Vercel environment variables to your Railway backend URL.')
        } else {
          throw new Error(`Unable to connect to the backend at ${url}. Please check that:\n1. The backend is running on Railway\n2. VITE_API_BASE_URL is set correctly in Vercel\n3. CORS is configured to allow your Vercel domain`)
        }
      }
    }
    // Re-throw other errors as-is
    throw err
  }
}

async function getFirebaseToken(): Promise<string | null> {
  try {
    // First check sessionStorage (workaround for Capacitor Firebase Auth issue)
    const storedToken = sessionStorage.getItem('firebase_id_token')
    if (storedToken) {
      console.log('[API] Using token from sessionStorage (Firebase Auth workaround)')
      return storedToken
    }
    
    // Use the already-initialized auth instance
    const { auth } = await import('./firebase')
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  } catch (error) {
    // Silently fail if Firebase isn't initialized yet (e.g., on login page)
    // This is expected when user is not logged in
    return null
  }
}

export const api = {
  // Families
  listFamilies: () => request<Family[]>('/families'),
  getFamily: (id: string) => request<Family>(`/families/${id}`),
  createFamily: (data: Omit<Family, 'id' | 'createdAt'>) =>
    request<Family>('/families', { method: 'POST', body: JSON.stringify(data) }),
  updateFamily: (id: string, data: Partial<Family>) =>
    request<Family>(`/families/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFamily: (id: string) => request(`/families/${id}`, { method: 'DELETE' }),

  // Children
  listChildren: () => request<Child[]>('/children'),
  getChild: (id: string) => request<Child>(`/children/${id}`),
  createChild: (data: Omit<Child, 'id' | 'createdAt' | 'caregivers'>) =>
    request<Child>('/children', { method: 'POST', body: JSON.stringify(data) }),
  updateChild: (id: string, data: Partial<Omit<Child, 'id' | 'createdAt' | 'caregivers'>>) =>
    request<Child>(`/children/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChild: (id: string) => request(`/children/${id}`, { method: 'DELETE' }),

  // Caregivers
  listCaregivers: () => request<Caregiver[]>('/caregivers'),
  getCaregiver: (id: string) => request<Caregiver>(`/caregivers/${id}`),
  createCaregiver: (data: Omit<Caregiver, 'id' | 'createdAt'>) =>
    request<Caregiver>('/caregivers', { method: 'POST', body: JSON.stringify(data) }),
  updateCaregiver: (id: string, data: Partial<Omit<Caregiver, 'id' | 'createdAt'>>) =>
    request<Caregiver>(`/caregivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCaregiver: (id: string) => request(`/caregivers/${id}`, { method: 'DELETE' }),

  // Schedule Entries
  listSchedules: () => request<ScheduleEntry[]>('/schedule'),
  getSchedule: (id: string) => request<ScheduleEntry>(`/schedule/${id}`),
  createSchedule: (data: {
    title: string
    category: ScheduleEntry['category']
    childId: string
    startTime: string
    endTime: string
    location?: string
    notes?: string
    createdById: string
  }) =>
    request<ScheduleEntry>('/schedule', { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: Partial<{
    title: string
    category: ScheduleEntry['category']
    childId: string
    startTime: string
    endTime: string
    location?: string
    notes?: string
    createdById: string
  }>) =>
    request<ScheduleEntry>(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => request(`/schedule/${id}`, { method: 'DELETE' }),

  // Journal Entries
  listJournalEntries: () => request<JournalEntry[]>('/journal'),
  getJournalEntry: (id: string) => request<JournalEntry>(`/journal/${id}`),
  createJournalEntry: (data: Omit<JournalEntry, 'id' | 'createdAt'>) =>
    request<JournalEntry>('/journal', { method: 'POST', body: JSON.stringify(data) }),
  updateJournalEntry: (id: string, data: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) =>
    request<JournalEntry>(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJournalEntry: (id: string) => request(`/journal/${id}`, { method: 'DELETE' }),

  // Users
  listUsers: () => request<User[]>('/users'),
  getUser: (id: string) => request<User>(`/users/${id}`),
  createUser: (data: Omit<User, 'id' | 'createdAt'>) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),

  // Invitations
  getInvitation: (token: string) => request<{
    id: string
    token: string
    email: string
    caregiverName: string
    familyName: string
    expiresAt: string
  }>(`/invitations/${token}`),
  getInvitationByEmail: (email: string) => request<{
    id: string
    token: string
    email: string
    caregiverName: string
    familyName: string
    expiresAt: string
  }>(`/invitations/email/${encodeURIComponent(email)}`),
  acceptInvitation: (token: string) =>
    request<{
      message: string
      caregiverId: string
      familyId: string
    }>(`/invitations/${token}/accept`, { method: 'POST' }),
  sendInvitation: (caregiverId: string) =>
      request<{
        id: string
        token: string
        email: string
        status: string
        expiresAt: string
      }>('/invitations', { method: 'POST', body: JSON.stringify({ caregiverId }) }),
  inviteParent: (familyId: string, email: string) =>
      request<{
        id: string
        token: string
        email: string
        status: string
        expiresAt: string
        invitationType: 'parent'
      }>(`/families/${familyId}/invite-parent`, { method: 'POST', body: JSON.stringify({ email }) }),
}

