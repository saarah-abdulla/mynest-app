import type {
  Caregiver,
  Child,
  Family,
  JournalEntry,
  ScheduleEntry,
  User,
} from '../types/entities'

export const mockFamily: Family = {
  id: 'fam_001',
  name: 'Hussein Family',
  region: 'Dubai, UAE',
  timezone: 'Asia/Dubai',
  createdAt: new Date().toISOString(),
}

export const mockUsers: User[] = [
  {
    id: 'user_parent',
    email: 'mariam@mynest.app',
    displayName: 'Mariam Al Mansoori',
    role: 'parent',
    familyId: mockFamily.id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_caregiver',
    email: 'aisha.caregiver@mynest.app',
    displayName: 'Aisha Khan',
    role: 'caregiver',
    familyId: mockFamily.id,
    createdAt: new Date().toISOString(),
  },
]

export const mockCaregivers: Caregiver[] = [
  {
    id: 'caregiver_001',
    fullName: 'Aisha Khan',
    phone: '+97150000000',
    notes: 'Specializes in toddlers',
    familyId: mockFamily.id,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'caregiver_002',
    fullName: 'Noor Al Shamsi',
    phone: '+97150111111',
    notes: 'Bilingual (Arabic/English)',
    familyId: mockFamily.id,
    createdAt: new Date().toISOString(),
  },
]

export const mockChildren: Child[] = [
  {
    id: 'child_001',
    firstName: 'Bader',
    lastName: 'Hussein',
    fullName: 'Bader Hussein',
    birthdate: '2018-06-15', // 6 years old
    gender: 'male',
    school: 'school_age',
    familyId: mockFamily.id,
    caregivers: mockCaregivers,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'child_002',
    firstName: 'Adam',
    lastName: 'Hussein',
    fullName: 'Adam Hussein',
    birthdate: '2019-08-20', // 5 years old
    gender: 'male',
    school: 'school_age',
    familyId: mockFamily.id,
    caregivers: mockCaregivers,
    createdAt: new Date().toISOString(),
  },
]

export const mockScheduleEntries: ScheduleEntry[] = [
  {
    id: 'schedule_001',
    childId: 'child_001',
    title: 'Pediatrician Appointment',
    category: 'medical',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T10:00:00'), // Tomorrow 10:00 AM
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T11:00:00'),
    createdBy: 'user_parent',
  },
  {
    id: 'schedule_002',
    childId: 'child_002',
    title: 'Soccer Practice',
    category: 'activity',
    startTime: new Date().toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T16:30:00'), // Today 4:30 PM
    endTime: new Date().toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T17:30:00'),
    createdBy: 'user_parent',
  },
  {
    id: 'schedule_003',
    childId: 'child_001',
    title: 'Parent-Teacher Conference',
    category: 'school',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T14:00:00'), // Friday 2:00 PM
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().replace(/T\d{2}:\d{2}:\d{2}/, 'T15:00:00'),
    createdBy: 'user_parent',
  },
]

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'journal_001',
    childId: 'child_001',
    authorId: 'user_caregiver',
    note: 'Latifa ate all her lunch and tried a new fruit.',
    mood: 'happy',
    createdAt: '2025-11-26T10:30:00.000Z',
  },
  {
    id: 'journal_002',
    childId: 'child_002',
    authorId: 'user_parent',
    note: 'Omar practiced reading Arabic letters after dinner.',
    mood: 'calm',
    createdAt: '2025-11-25T18:45:00.000Z',
  },
]

