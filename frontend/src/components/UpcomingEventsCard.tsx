import type { ScheduleEntry, Child } from '../types/entities'
import { formatDateDDMMYYYY } from '../lib/dateUtils'

interface UpcomingEventsCardProps {
  events: ScheduleEntry[]
  children: Child[]
  onViewCalendar?: () => void
}

export function UpcomingEventsCard({
  events,
  children,
  onViewCalendar,
}: UpcomingEventsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      medical: 'bg-red-light text-red-DEFAULT',
      activity: 'bg-blue-light text-blue-DEFAULT',
      school: 'bg-green-light text-green-DEFAULT',
      appointment: 'bg-yellow-light text-yellow-DEFAULT',
      social: 'bg-blue-light text-blue-DEFAULT',
      other: 'bg-gray-light text-gray-DEFAULT',
    }
    return colors[category] || 'bg-gray-light text-gray-DEFAULT'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const dateStr = date.toDateString()
    const todayStr = today.toDateString()
    const tomorrowStr = tomorrow.toDateString()
    const dayAfterStr = dayAfterTomorrow.toDateString()

    if (dateStr === todayStr) return 'Today'
    if (dateStr === tomorrowStr) return 'Tomorrow'
    if (dateStr === dayAfterStr) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[date.getDay()]
    }
    // For dates beyond tomorrow, show the date in dd/mm/yyyy format
    return formatDateDDMMYYYY(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getChildName = (childId: string) => {
    return children.find((c) => c.id === childId)?.fullName || 'Unknown'
  }

  // Sort events by date, showing upcoming ones first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )

  return (
    <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-brown">Upcoming Events</h3>
        <p className="text-sm text-brown/70">Don&apos;t miss these important appointments</p>
      </div>
      <div className="mb-4 space-y-3">
        {sortedEvents.slice(0, 3).map((event) => (
          <div key={event.id} className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-brown">{event.title}</p>
              <p className="text-sm text-brown/70">
                {getChildName(event.childId)} • {formatDate(event.startTime)}{' '}
                {formatTime(event.startTime)}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(event.category)}`}
            >
              {event.category}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onViewCalendar}
        className="w-full rounded-xl bg-sage-dark px-4 py-3 font-semibold text-white shadow-md hover:bg-sage transition-colors"
      >
        View Full Calendar
      </button>
    </div>
  )
}

