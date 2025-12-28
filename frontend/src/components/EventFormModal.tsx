import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { api } from '../lib/api'
import type { ScheduleEntry, Child } from '../types/entities'
import { useAuth } from '../contexts/AuthContext'

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  event?: ScheduleEntry | null
  children: Child[]
  onSuccess: () => void
}

const scheduleCategories = [
  'school',
  'medical',
  'social',
  'other',
] as const

export function EventFormModal({
  isOpen,
  onClose,
  event,
  children,
  onSuccess,
}: EventFormModalProps) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ScheduleEntry['category']>('school')
  const [childId, setChildId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setCategory(event.category)
      setChildId(event.childId)
      const start = new Date(event.startTime)
      setDate(start.toISOString().split('T')[0])
      setTime(start.toTimeString().slice(0, 5))
      setLocation(event.location || '')
      setNotes(event.notes || '')
    } else {
      setTitle('')
      setCategory('school')
      setChildId(children[0]?.id || '')
      setDate('')
      setTime('')
      setLocation('')
      setNotes('')
    }
    setError(null)
  }, [event, isOpen, children])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childId) {
      setError('Please select a child')
      return
    }

    if (!currentUser?.uid) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user ID from backend
      const users = await api.listUsers()
      const user = users.find((u) => u.email === currentUser.email)
      if (!user) {
        throw new Error('User not found in database')
      }

      // Combine date and time for start, end is start + 1 hour by default
      const startDateTime = new Date(`${date}T${time}`)
      const endDateTime = new Date(startDateTime)
      endDateTime.setHours(endDateTime.getHours() + 1)

      const data = {
        title,
        category,
        childId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
        createdById: user.id,
      }

      if (event) {
        await api.updateSchedule(event.id, data)
      } else {
        await api.createSchedule(data)
        
        // Track event creation (no personal data logged)
        try {
          const { trackEvent } = await import('../lib/analytics')
          trackEvent('add_event')
        } catch (error) {
          // Analytics is optional, don't fail if it fails
          console.warn('Failed to track add_event:', error)
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event' : 'Add Event'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-brown mb-2">
            Title <span className="text-red-DEFAULT">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            placeholder="e.g. Dr Ahmed (ENT)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="childId" className="block text-sm font-semibold text-brown mb-2">
              Child <span className="text-red-DEFAULT">*</span>
            </label>
            <select
              id="childId"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-brown mb-2">
              Category <span className="text-red-DEFAULT">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduleEntry['category'])}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            >
              {scheduleCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-brown mb-2">
              Date <span className="text-red-DEFAULT">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-semibold text-brown mb-2">
              Time <span className="text-red-DEFAULT">*</span>
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-brown mb-2">
            Location <span className="text-brown/70">(optional)</span>
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            placeholder="Enter event location"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-brown mb-2">
            Notes <span className="text-brown/70">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-brown bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : event ? 'Update' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

