import { useState, useMemo } from 'react'
import { useScheduleEntries, useChildren } from '../hooks/useApiData'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { NavigationBar } from '../components/NavigationBar'
import { EventFormModal } from '../components/EventFormModal'
import type { ScheduleEntry } from '../types/entities'

export function CalendarPage() {
  const { entries: scheduleEntries, loading, error, refetch } = useScheduleEntries()
  const { children } = useChildren()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEntry | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return scheduleEntries.filter((event) => {
      if (selectedChild !== 'all' && event.childId !== selectedChild) return false
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
      return true
    })
  }, [scheduleEntries, selectedChild, selectedCategory])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<{ date: Date; isCurrentMonth: boolean; events: ScheduleEntry[] }> = []

    // Add previous month's trailing days
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      })
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
      })
    }

    // Add next month's leading days to fill the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
      })
    }

    return days
  }, [year, month, filteredEvents])

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      medical: 'bg-pink-200 text-pink-800',
      school: 'bg-green-200 text-green-800',
      social: 'bg-blue-200 text-blue-800',
      activity: 'bg-purple-200 text-purple-800',
      appointment: 'bg-yellow-200 text-yellow-800',
      other: 'bg-gray-200 text-gray-800',
    }
    return colors[category] || 'bg-gray-200 text-gray-800'
  }


  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
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
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  // Event type colors matching the legend
  const eventTypeColors: Record<string, { bg: string; text: string }> = {
    medical: { bg: 'bg-pink-200', text: 'text-pink-800' },
    school: { bg: 'bg-green-200', text: 'text-green-800' },
    social: { bg: 'bg-blue-200', text: 'text-blue-800' },
    activity: { bg: 'bg-purple-200', text: 'text-purple-800' },
    appointment: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
    other: { bg: 'bg-gray-200', text: 'text-gray-800' },
  }

  const eventTypes = [
    { key: 'medical', label: 'Medical' },
    { key: 'school', label: 'School' },
    { key: 'social', label: 'Social' },
    { key: 'activity', label: 'Activity' },
    { key: 'appointment', label: 'Appointment' },
    { key: 'other', label: 'Other' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brown">Calendar</h1>
            <p className="mt-1 text-brown/70">View and manage your family&apos;s schedule</p>
          </div>
          {/* Filters in Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brown/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm font-medium"
              >
                <option value="all">All Children</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brown/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-sm font-medium"
              >
                <option value="all">All Types</option>
                <option value="school">School</option>
                <option value="activity">Activity</option>
                <option value="medical">Medical</option>
                <option value="appointment">Appointment</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </header>

        {/* Calendar Header */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-brown/10 mb-6">
          {/* Event Types Legend */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-brown mb-3">Event Types</h3>
            <div className="flex flex-wrap gap-4">
              {eventTypes.map((type) => {
                const colors = eventTypeColors[type.key] || eventTypeColors.other
                return (
                  <div key={type.key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${colors.bg}`}></div>
                    <span className="text-sm text-brown">{type.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg border border-brown/20 bg-card text-brown hover:bg-brown/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold text-brown">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg border border-brown/20 bg-card text-brown hover:bg-brown/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg bg-sage text-white font-medium hover:bg-sage-dark transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-center font-semibold text-brown py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 rounded-lg border ${
                  day.isCurrentMonth
                    ? 'border-brown/20 bg-card'
                    : 'border-brown/10 bg-background'
                } ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-sage' : ''}`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    day.isCurrentMonth ? 'text-brown' : 'text-brown/40'
                  } ${day.date.toDateString() === new Date().toDateString() ? 'text-sage' : ''}`}
                >
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.events.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event)
                        setEventModalOpen(true)
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate ${getCategoryColor(
                        event.category,
                      )} hover:opacity-80 transition-opacity`}
                      title={`${event.title} - ${formatTime(event.startTime)}`}
                    >
                      {formatTime(event.startTime)} {event.title}
                    </button>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-xs text-brown/60 px-2">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Event Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setSelectedEvent(null)
              setEventModalOpen(true)
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
            Add Event
          </button>
        </div>
      </div>

      {/* Event Modal */}
      <EventFormModal
        isOpen={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        children={children}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}

