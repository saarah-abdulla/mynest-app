import { useEffect, useState } from 'react'
import { useChildren, useScheduleEntries, useFamilies } from '../hooks/useApiData'
import { api } from '../lib/api'
import { ChildrenCard } from '../components/ChildrenCard'
import { RecentActivitiesCard } from '../components/RecentActivitiesCard'
import { UpcomingEventsCard } from '../components/UpcomingEventsCard'
import { QuickActionsCard } from '../components/QuickActionsCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { NavigationBar } from '../components/NavigationBar'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { testBackendConnection } from '../lib/testConnection'
import { ChildFormModal } from '../components/ChildFormModal'
import { EventFormModal } from '../components/EventFormModal'
import { CaregiverFormModal } from '../components/CaregiverFormModal'
import { JournalFormModal } from '../components/JournalFormModal'
import type { Child, ScheduleEntry, Caregiver, JournalEntry } from '../types/entities'

export function DashboardPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { families, loading: familiesLoading } = useFamilies()
  const { children, loading: childrenLoading, error: childrenError, refetch: refetchChildren } =
    useChildren()
  const {
    entries: scheduleEntries,
    loading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useScheduleEntries()

  // Modal states
  const [childModalOpen, setChildModalOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEntry | null>(null)
  const [caregiverModalOpen, setCaregiverModalOpen] = useState(false)
  const [selectedCaregiver] = useState<Caregiver | null>(null)
  const [journalModalOpen, setJournalModalOpen] = useState(false)
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null)
  const [userFirstName, setUserFirstName] = useState<string>('')
  
  // Fetch user data to get first name and role
  const [userRole, setUserRole] = useState<'parent' | 'caregiver' | null>(null)

  const isLoading = childrenLoading || scheduleLoading || familiesLoading
  const hasError = childrenError || scheduleError
  // For caregivers, they should see the dashboard even if no family (they're part of a family)
  // For parents, show empty state if no family
  const hasNoFamily = !familiesLoading && families.length === 0 && userRole !== 'caregiver'
  
  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return
      try {
        const users = await api.listUsers()
        const currentUserData = users.find((u) => u.email === currentUser.email)
        if (currentUserData) {
          const firstName = currentUserData.displayName.split(' ')[0] || currentUserData.displayName
          setUserFirstName(firstName)
          setUserRole(currentUserData.role)
        } else {
          // Fallback to email username if user not found
          setUserFirstName(currentUser.email?.split('@')[0] || 'User')
          setUserRole('parent') // Default to parent if not found
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        // Fallback to email username on error
        setUserFirstName(currentUser.email?.split('@')[0] || 'User')
        setUserRole('parent')
      }
    }
    fetchUserData()
  }, [currentUser])

  // Test backend connection on mount (ONLY in development)
  // COMPLETELY DISABLED in production to avoid CORS errors and unnecessary requests
  useEffect(() => {
    // Double-check we're in development - use both DEV flag and MODE
    const isDev = import.meta.env.DEV === true || import.meta.env.MODE === 'development'
    const isProd = import.meta.env.PROD === true || import.meta.env.MODE === 'production'
    
    // Only run health check in development, never in production
    if (isDev && !isProd) {
      testBackendConnection().then((isConnected) => {
        if (!isConnected) {
          console.warn('Backend connection test failed. This is normal if the backend is not running locally.')
        }
      })
    }
    // In production builds, this entire block is tree-shaken out or never executes
  }, [])

  // Refetch children data when window gains focus (e.g., when returning from FamilyPage)
  useEffect(() => {
    const handleFocus = () => {
      refetchChildren()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetchChildren])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <ErrorMessage
            message={childrenError || scheduleError || 'Failed to load data'}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brown">
              Welcome back, {userFirstName || 'there'}!
            </h1>
            <p className="mt-1 text-brown/70">Managing My Family</p>
          </div>
        </header>

        {/* Empty State - No Family Setup */}
        {hasNoFamily ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-card rounded-2xl p-12 shadow-card border border-brown/10 max-w-md w-full text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-sage/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-sage"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-brown mb-3">Get Started</h2>
              <p className="text-brown/70 mb-8">
                Create your family profile to start coordinating care for your children. This will
                be your central hub for managing schedules, activities, and more.
              </p>
              <button
                onClick={() => navigate('/setup/family')}
                className="w-full px-6 py-4 rounded-xl bg-sage text-white font-semibold text-lg hover:bg-sage-dark transition-colors shadow-md"
              >
                Begin Creating Your Family
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: Three Cards */}
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <ChildrenCard
                children={children}
                onAddChild={() => {
                  setSelectedChild(null)
                  setChildModalOpen(true)
                }}
              />
              <RecentActivitiesCard />
              <UpcomingEventsCard
            events={scheduleEntries}
            children={children}
            onViewCalendar={() => navigate('/calendar')}
          />
            </div>

            {/* Bottom Row: Quick Actions */}
            <QuickActionsCard
              onLogActivity={() => {
                setSelectedJournal(null)
                setJournalModalOpen(true)
              }}
              onAddEvent={() => {
                setSelectedEvent(null)
                setEventModalOpen(true)
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <ChildFormModal
        isOpen={childModalOpen}
        onClose={() => setChildModalOpen(false)}
        child={selectedChild}
        onSuccess={() => {
          refetchChildren()
        }}
      />

      <EventFormModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={selectedEvent}
        children={children}
        onSuccess={() => {
          refetchSchedules()
        }}
      />

      <CaregiverFormModal
        isOpen={caregiverModalOpen}
        onClose={() => setCaregiverModalOpen(false)}
        caregiver={selectedCaregiver}
        onSuccess={() => {
          // Refetch if we add a useCaregivers hook later
          window.location.reload()
        }}
      />

      <JournalFormModal
        isOpen={journalModalOpen}
        onClose={() => {
          setJournalModalOpen(false)
          setSelectedJournal(null)
        }}
        entry={selectedJournal}
        children={children}
        onSuccess={() => {
          // The RecentActivitiesCard will automatically refetch via its hook
          // No need to reload the page
        }}
      />
    </div>
  )
}

