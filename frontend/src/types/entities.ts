export type Role = 'parent' | 'caregiver'

export interface User {
  id: string
  email: string
  displayName: string
  role: Role
  phone?: string
  familyId?: string | null
  createdAt: string
}

export interface Family {
  id: string
  name: string
  region: string
  timezone: string
  createdAt: string
}

export interface Caregiver {
  id: string
  fullName: string
  email?: string
  phone?: string
  notes?: string
  familyId: string
  createdAt: string
}

export interface Child {
  id: string
  firstName: string
  lastName: string
  fullName: string
  birthdate: string
  gender: string
  school?: string
  familyId: string
  caregivers: Caregiver[]
  createdAt: string
}

export interface ScheduleEntry {
  id: string
  childId: string
  title: string
  category: 'school' | 'activity' | 'meal' | 'medication' | 'sleep' | 'medical' | 'appointment' | 'social' | 'play' | 'feeding' | 'nap' | 'other'
  location?: string
  startTime: string
  endTime: string
  notes?: string
  createdBy: string
}

export interface JournalEntry {
  id: string
  childId: string
  authorId: string
  note: string
  mood?: 'happy' | 'calm' | 'tired' | 'fussy'
  moodDetails?: string
  meals?: {
    breakfast?: { eaten: boolean; notes?: string; date?: string; time?: string }
    lunch?: { eaten: boolean; notes?: string; date?: string; time?: string }
    dinner?: { eaten: boolean; notes?: string; date?: string; time?: string }
    snacks?: { eaten: boolean; notes?: string; date?: string; time?: string }
  }
  naps?: Array<{ date: string; startTime: string; endTime: string; quality?: string }>
  activities?: {
    playTime?: boolean
    outdoorTime?: boolean
    bathTime?: boolean
    other?: boolean
    otherText?: string
    activityDate?: string
    activityTime?: string
  }
  medication?: Array<{
    name: string
    amount: string
    frequency: string
    startDate?: string
    startTime?: string
    endDate?: string
    status: 'pending' | 'given' | 'missed'
    scheduledDate?: string
    scheduledTime?: string
    givenDate?: string
    givenTime?: string
  }>
  createdAt: string
  updatedAt?: string
}

