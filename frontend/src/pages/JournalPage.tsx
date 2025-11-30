import { useState, useMemo, useEffect } from 'react'
import { NavigationBar } from '../components/NavigationBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { JournalFormModal } from '../components/JournalFormModal'
import { useJournalEntries, useChildren } from '../hooks/useApiData'
import { api } from '../lib/api'
import { formatDateDDMMYYYY } from '../lib/dateUtils'
import { useAuth } from '../contexts/AuthContext'
import type { JournalEntry } from '../types/entities'

interface HourGroup {
  hour: number
  label: string
  entries: JournalEntry[]
}

export function JournalPage() {
  const { currentUser } = useAuth()
  const { entries, loading, error, refetch } = useJournalEntries()
  const { children } = useChildren()
  const [journalModalOpen, setJournalModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [selectedChild, setSelectedChild] = useState<string>('all')
  // Default to today in local timezone (YYYY-MM-DD format)
  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString()) // Default to today
  const [userRole, setUserRole] = useState<'parent' | 'caregiver' | null>(null)

  // Fetch user role and ID
  useEffect(() => {
    async function fetchUserInfo() {
      if (!currentUser) return
      try {
        const users = await api.listUsers()
        const currentUserData = users.find((u) => u.email === currentUser.email)
        if (currentUserData) {
          setUserRole(currentUserData.role)
        } else {
          setUserRole('parent') // Default to parent if not found
        }
      } catch (err) {
        console.error('Error fetching user info:', err)
        setUserRole('parent')
      }
    }
    fetchUserInfo()
  }, [currentUser])

  const canEditEntry = (_entry: JournalEntry) => {
    // Parents can edit any entry, caregivers can edit any entry in their family
    return userRole === 'parent' || userRole === 'caregiver'
  }

  // Extract activity time from entry based on its type
  const getActivityTime = (entry: JournalEntry): Date | null => {
    // Check for medication scheduled time
    if (entry.medication) {
      // Handle both array and object formats (in case JSON parsing returns different structures)
      const medicationArray = Array.isArray(entry.medication) ? entry.medication : [entry.medication]
      
      if (medicationArray.length > 0) {
        const med = medicationArray[0]
        // Debug logging - always enabled to help diagnose issues
        console.log('[JournalPage] Checking medication entry:', {
          entryId: entry.id,
          notePreview: entry.note?.substring(0, 50),
          medication: entry.medication,
          med,
          scheduledDate: med?.scheduledDate,
          scheduledTime: med?.scheduledTime,
          medType: typeof med,
        })
        
        if (med && med.scheduledDate && med.scheduledTime) {
          try {
            // Parse date and time in local timezone to avoid UTC conversion issues
            const [year, month, day] = med.scheduledDate.split('-').map(Number)
            const [hours, minutes] = med.scheduledTime.split(':').map(Number)
            
            // Create date in local timezone (not UTC)
            const activityDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0)
            
            if (!isNaN(activityDate.getTime())) {
              console.log(`[JournalPage] Found medication activity time: ${activityDate.toISOString()} (local: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}) for entry ${entry.id}`)
              return activityDate
            } else {
              console.warn(`[JournalPage] Invalid medication date: ${med.scheduledDate} ${med.scheduledTime} for entry ${entry.id}`)
            }
          } catch (e) {
            console.error('[JournalPage] Error parsing medication time:', e, med)
          }
        } else {
          console.log(`[JournalPage] No scheduledDate/scheduledTime found in medication for entry ${entry.id}`, med)
        }
    }
    }

    // Check for meals
    if (entry.meals) {
      const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> = ['breakfast', 'lunch', 'dinner', 'snacks']
      for (const mealType of mealTypes) {
        const meal = entry.meals[mealType]
        if (meal?.eaten && meal.date && meal.time) {
          try {
            const dateStr = meal.date.includes('T') ? meal.date : `${meal.date}T${meal.time}`
            const activityDate = new Date(dateStr)
            if (!isNaN(activityDate.getTime())) {
              return activityDate
            }
          } catch (e) {
            console.error('Error parsing meal time:', e, meal)
          }
        }
      }
    }

    // Check for naps
    if (entry.naps && Array.isArray(entry.naps) && entry.naps.length > 0) {
      const nap = entry.naps[0]
      if (nap.date && nap.startTime) {
        try {
          const dateStr = nap.date.includes('T') ? nap.date : `${nap.date}T${nap.startTime}`
          const activityDate = new Date(dateStr)
          if (!isNaN(activityDate.getTime())) {
            return activityDate
          }
        } catch (e) {
          console.error('Error parsing nap time:', e, nap)
        }
      }
    }

    // Check for activities
    if (entry.activities) {
      if (entry.activities.activityDate && entry.activities.activityTime) {
        try {
          const dateStr = entry.activities.activityDate.includes('T') 
            ? entry.activities.activityDate 
            : `${entry.activities.activityDate}T${entry.activities.activityTime}`
          const activityDate = new Date(dateStr)
          if (!isNaN(activityDate.getTime())) {
            return activityDate
          }
        } catch (e) {
          console.error('Error parsing activity time:', e, entry.activities)
        }
      }
    }

    // Fallback: Try to parse activity time from note text
    // This is useful if structured data isn't available (e.g., old entries before JSON fields were added)
    if (entry.note) {
      // Try to parse medication scheduled time from note
      // Format: "Scheduled: 2025-11-29 at 09:00" or "Scheduled: 2025-11-29 at 9:00 AM" or "Scheduled: 2025-11-29 09:00"
      const scheduledMatch = entry.note.match(/Scheduled:\s*(\d{4}-\d{2}-\d{2})(?:\s+at\s+|\s+)(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)/i)
      if (scheduledMatch) {
        try {
          const [, date, time] = scheduledMatch
          let time24 = time.trim()
          // Convert 12-hour to 24-hour if needed
          if (time24.match(/\s*(AM|PM)/i)) {
            time24 = convertTo24Hour(time24)
          } else {
            // Ensure time is in HH:MM format
            const [hours, minutes] = time24.split(':')
            time24 = `${hours.padStart(2, '0')}:${minutes}`
          }
          const activityDate = new Date(`${date}T${time24}`)
          if (!isNaN(activityDate.getTime())) {
            console.log(`[JournalPage] ✅ Parsed activity time from note: ${activityDate.toISOString()} (hour: ${activityDate.getHours()}) for entry ${entry.id}`)
            return activityDate
          }
        } catch (e) {
          console.error('[JournalPage] Error parsing scheduled time from note:', e, scheduledMatch)
        }
      } else {
        // Check if note has "Scheduled:" but incomplete (for debugging)
        if (entry.note.includes('Scheduled:')) {
          console.warn(`[JournalPage] Note contains "Scheduled:" but no valid date/time found for entry ${entry.id}:`, entry.note.substring(0, 200))
        }
      }

      // Try to parse meal time from note
      // Format: "Lunch (2025-11-29 at 12:30)"
      const mealMatch = entry.note.match(/(Breakfast|Lunch|Dinner|Snacks)\s*\((\d{4}-\d{2}-\d{2})\s+at\s+(\d{2}:\d{2})\)/i)
      if (mealMatch) {
        try {
          const [, , date, time] = mealMatch
          const activityDate = new Date(`${date}T${time}`)
          if (!isNaN(activityDate.getTime())) {
            console.log(`[JournalPage] Parsed meal time from note: ${activityDate.toISOString()} for entry ${entry.id}`)
            return activityDate
          }
        } catch (e) {
          console.error('[JournalPage] Error parsing meal time from note:', e)
        }
      }

      // Try to parse nap time from note
      // Format: "Nap 1: 2025-11-29 10:00 AM - 11:30 AM"
      const napMatch = entry.note.match(/Nap\s+\d+:\s*(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}\s+(?:AM|PM))/i)
      if (napMatch) {
        try {
          const [, date, time] = napMatch
          // Convert 12-hour to 24-hour format
          const time24 = convertTo24Hour(time)
          const activityDate = new Date(`${date}T${time24}`)
          if (!isNaN(activityDate.getTime())) {
            console.log(`[JournalPage] Parsed nap time from note: ${activityDate.toISOString()} for entry ${entry.id}`)
            return activityDate
          }
        } catch (e) {
          console.error('[JournalPage] Error parsing nap time from note:', e)
        }
      }

      // Try to parse activity time from note
      // Format: "Activities: ... (2025-11-29 at 14:00)"
      const activityMatch = entry.note.match(/Activities:.*\((\d{4}-\d{2}-\d{2})\s+at\s+(\d{2}:\d{2})\)/i)
      if (activityMatch) {
        try {
          const [, date, time] = activityMatch
          const activityDate = new Date(`${date}T${time}`)
          if (!isNaN(activityDate.getTime())) {
            console.log(`[JournalPage] Parsed activity time from note: ${activityDate.toISOString()} for entry ${entry.id}`)
            return activityDate
          }
        } catch (e) {
          console.error('[JournalPage] Error parsing activity time from note:', e)
        }
      }
    }

    // Debug: Log if no activity time found
    console.log('[JournalPage] No activity time found for entry:', {
      id: entry.id,
      note: entry.note?.substring(0, 100),
      medication: entry.medication,
      meals: entry.meals,
      naps: entry.naps,
      activities: entry.activities,
      createdAt: entry.createdAt,
    })

    // Fall back to null if no activity time found (will use createdAt)
    return null
  }

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, period] = time12h.trim().split(/\s+(AM|PM)/i)
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours, 10)
    
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`
  }

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries
    console.log(`[JournalPage] Filtering ${entries.length} entries. Selected date: ${selectedDate}, Selected child: ${selectedChild}`)

    // Filter by child
    if (selectedChild !== 'all') {
      filtered = filtered.filter((entry) => entry.childId === selectedChild)
      console.log(`[JournalPage] After child filter: ${filtered.length} entries`)
    }

    // Filter by date (using activity time, not creation time)
    // Only show activities scheduled for the selected date (exact match)
    if (selectedDate) {
      // Normalize selectedDate to YYYY-MM-DD format
      const selectedDateNormalized = selectedDate.includes('T') 
        ? selectedDate.split('T')[0] 
        : selectedDate
      
      filtered = filtered.filter((entry) => {
        const activityTime = getActivityTime(entry)
        
        // If no activity time, use createdAt
        if (!activityTime) {
          const entryDate = new Date(entry.createdAt).toISOString().split('T')[0]
          return entryDate === selectedDateNormalized
        }
        
        // Get the activity date in YYYY-MM-DD format (using local date, not UTC)
        // This ensures we compare dates correctly regardless of timezone
        const activityYear = activityTime.getFullYear()
        const activityMonth = String(activityTime.getMonth() + 1).padStart(2, '0')
        const activityDay = String(activityTime.getDate()).padStart(2, '0')
        const activityDate = `${activityYear}-${activityMonth}-${activityDay}`
        
        // Only show if activity date exactly matches selected date
        const matches = activityDate === selectedDateNormalized
        if (!matches) {
          console.log(`[JournalPage] Entry ${entry.id} filtered out (activityDate: ${activityDate} !== selected: ${selectedDateNormalized}, activityTime: ${activityTime.toISOString()})`)
        }
        return matches
      })
      console.log(`[JournalPage] After date filter: ${filtered.length} entries`)
    }

    // Remove duplicates based on entry ID
    const uniqueEntries = Array.from(
      new Map(filtered.map((entry) => [entry.id, entry])).values()
    )
    
    console.log(`[JournalPage] Removed ${filtered.length - uniqueEntries.length} duplicate entries`)
    
    return uniqueEntries.sort((a, b) => {
      const timeA = getActivityTime(a) || new Date(a.createdAt)
      const timeB = getActivityTime(b) || new Date(b.createdAt)
      return timeA.getTime() - timeB.getTime()
    })
  }, [entries, selectedChild, selectedDate])

  // Group entries by hour of activity time
  const entriesByHour = useMemo(() => {
    console.log(`[JournalPage] Grouping ${filteredEntries.length} filtered entries by hour`)
    const hourGroups: HourGroup[] = []
    
    // Initialize all 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const hourLabel = new Date(2000, 0, 1, hour, 0).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      hourGroups.push({
        hour,
        label: hourLabel,
        entries: [],
      })
    }

    // Group entries by activity hour
    filteredEntries.forEach((entry) => {
      const activityTime = getActivityTime(entry)
      if (activityTime) {
        // Use activity time to determine hour
        const hour = activityTime.getHours()
        if (hour >= 0 && hour < 24) {
          hourGroups[hour].entries.push(entry)
          console.log(`[JournalPage] Entry ${entry.id} grouped into hour ${hour} (${activityTime.toISOString()})`)
        }
      } else {
        // Fall back to creation time if no activity time
        const createdAt = new Date(entry.createdAt)
        const hour = createdAt.getHours()
        if (hour >= 0 && hour < 24) {
          hourGroups[hour].entries.push(entry)
          console.log(`[JournalPage] Entry ${entry.id} grouped into hour ${hour} using createdAt (no activity time)`)
        }
      }
    })

    // Filter out hours with no entries and sort entries within each hour
    return hourGroups
      .filter((group) => group.entries.length > 0)
      .map((group) => ({
        ...group,
        entries: group.entries.sort((a, b) => {
          const timeA = getActivityTime(a) || new Date(a.createdAt)
          const timeB = getActivityTime(b) || new Date(b.createdAt)
          return timeA.getTime() - timeB.getTime()
        }),
      }))
      .sort((a, b) => a.hour - b.hour) // Sort hour groups by hour number
  }, [filteredEntries])

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      calm: '😌',
      tired: '😴',
      fussy: '😣',
    }
    return mood ? moodMap[mood] || '' : ''
  }

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await api.deleteJournalEntry(entryId)
        refetch()
      } catch (error: any) {
        console.error('Error deleting journal entry:', error)
        alert(error?.message || 'Failed to delete journal entry')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <ErrorMessage message={error} onRetry={() => refetch()} />
        </div>
      </div>
    )
  }

  const displayDate = selectedDate ? formatDateDDMMYYYY(new Date(selectedDate)) : formatDateDDMMYYYY(new Date())

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brown">Daily Journal</h1>
            <p className="mt-1 text-brown/70">View and manage daily activities and observations</p>
          </div>
          <button
            onClick={() => {
              setSelectedEntry(null)
              setJournalModalOpen(true)
            }}
            className="px-6 py-3 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Log Activity
          </button>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-brown mb-2">Filter by Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-brown mb-2">Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>
          {(selectedChild !== 'all' || selectedDate !== new Date().toISOString().split('T')[0]) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedChild('all')
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }}
                className="px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown hover:bg-brown/5 transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Date Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-brown">{displayDate}</h2>
        </div>

        {/* Journal Entries by Hour */}
        <div className="space-y-6">
          {entriesByHour.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 shadow-card border border-brown/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-brown/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-brown/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-brown mb-2">No journal entries found</p>
              <p className="text-brown/70 mb-6">
                {selectedChild !== 'all' || selectedDate
                  ? 'Try adjusting your filters or log a new activity'
                  : 'Start logging daily activities to see them here'}
              </p>
              <button
                onClick={() => {
                  setSelectedEntry(null)
                  setJournalModalOpen(true)
                }}
                className="px-6 py-3 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors"
              >
                Log Your First Activity
              </button>
            </div>
          ) : (
            entriesByHour.map((hourGroup) => (
              <div key={hourGroup.hour} className="bg-card rounded-2xl shadow-card border border-brown/10 overflow-hidden">
                {/* Hour Header */}
                <div className="bg-sage/10 px-6 py-4 border-b border-brown/10">
                  <h3 className="text-lg font-semibold text-brown flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {hourGroup.label}
                    <span className="text-sm font-normal text-brown/60 ml-2">
                      ({hourGroup.entries.length} {hourGroup.entries.length === 1 ? 'activity' : 'activities'})
                    </span>
                  </h3>
                </div>

                {/* Entries for this hour */}
                <div className="p-6 space-y-4">
                  {hourGroup.entries.map((entry) => {
                    const child = children.find((c) => c.id === entry.childId)
                    const activityTime = getActivityTime(entry)
                    const timeToDisplay = activityTime || new Date(entry.createdAt)
                    const formattedTime = timeToDisplay.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })

                    return (
                      <div
                        key={entry.id}
                        className="bg-background rounded-lg p-4 border border-brown/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-base font-semibold text-brown">
                                {child?.fullName || 'Unknown Child'}
                              </h4>
                              {entry.mood && (
                                <span className="text-xl" title={entry.mood}>
                                  {getMoodEmoji(entry.mood)}
                                </span>
                              )}
                              <span className="text-sm text-brown/60">{formattedTime}</span>
                            </div>
                          </div>
                          {canEditEntry(entry) && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEntry(entry)
                                  setJournalModalOpen(true)
                                }}
                                className="p-2 rounded-lg text-sage hover:bg-sage/10 transition-colors"
                                title="Edit entry"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              {userRole === 'parent' && (
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-2 rounded-lg text-red-DEFAULT hover:bg-red/10 transition-colors"
                                  title="Delete entry"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="prose max-w-none">
                          <p className="text-sm text-brown whitespace-pre-line">{entry.note}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Journal Modal */}
      <JournalFormModal
        isOpen={journalModalOpen}
        onClose={() => {
          setJournalModalOpen(false)
          setSelectedEntry(null)
        }}
        entry={selectedEntry}
        children={children}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
