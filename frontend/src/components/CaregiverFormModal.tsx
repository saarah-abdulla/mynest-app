import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { api } from '../lib/api'
import type { Caregiver } from '../types/entities'
import { useFamilies } from '../hooks/useApiData'

interface CaregiverFormModalProps {
  isOpen: boolean
  onClose: () => void
  caregiver?: Caregiver | null
  onSuccess: () => void
}

export function CaregiverFormModal({
  isOpen,
  onClose,
  caregiver,
  onSuccess,
}: CaregiverFormModalProps) {
  const { families } = useFamilies()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')

  const familyId = families[0]?.id || ''

  useEffect(() => {
    if (caregiver) {
      // Parse fullName into firstName and lastName
      const nameParts = caregiver.fullName.split(' ')
      setFirstName(nameParts[0] || '')
      setLastName(nameParts.slice(1).join(' ') || '')
      setPhone(caregiver.phone || '')
      // Parse notes to extract email and relationship
      const notes = caregiver.notes || ''
      const emailMatch = notes.match(/Email:\s*([^\s|]+)/)
      const relationshipMatch = notes.match(/Relationship:\s*([^\s|]+)/)
      setEmail(emailMatch ? emailMatch[1] : '')
      setRelationship(relationshipMatch ? relationshipMatch[1] : '')
    } else {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setRelationship('')
    }
    setError(null)
  }, [caregiver, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId) {
      setError('No family found. Please complete family setup first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Validate required fields before sending
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required')
        setLoading(false)
        return
      }

      const fullName = `${firstName} ${lastName}`.trim()
      
      if (fullName.length < 2) {
        setError('Full name must be at least 2 characters')
        setLoading(false)
        return
      }

      if (!familyId || familyId.trim() === '') {
        setError('Family ID is required. Please complete family setup first.')
        setLoading(false)
        return
      }

      const notes = `Relationship: ${relationship}${email ? ` | Email: ${email}` : ''}`

      const data = {
        fullName,
        email: email && email.trim() ? email.trim() : undefined,
        phone: phone && phone.trim() ? phone.trim() : undefined,
        notes: notes.trim() || undefined,
        familyId: familyId.trim(),
      }

      if (caregiver) {
        await api.updateCaregiver(caregiver.id, data)
      } else {
        await api.createCaregiver(data)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      // Extract detailed error message
      let errorMessage = 'Failed to save caregiver'
      if (err.message) {
        errorMessage = err.message
      }
      // If there are validation details, show them
      if (err.details && Array.isArray(err.details)) {
        const validationErrors = err.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
        errorMessage = `Validation failed: ${validationErrors}`
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caregiver ? 'Edit Caregiver' : 'Add Caregiver'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red/10 border border-red/20 p-3 text-sm text-red">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-brown mb-2">
              First Name <span className="text-red-DEFAULT">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-brown mb-2">
              Last Name <span className="text-red-DEFAULT">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brown mb-2">
            Email Address <span className="text-red-DEFAULT">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            placeholder="john.smith@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-brown mb-2">
              Phone Number <span className="text-brown/70">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
              placeholder="+971 50 123 4567"
            />
          </div>
          <div>
            <label htmlFor="relationship" className="block text-sm font-semibold text-brown mb-2">
              Relationship <span className="text-red-DEFAULT">*</span>
            </label>
            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            >
              <option value="">Select relationship</option>
              <option value="Babysitter">Babysitter</option>
              <option value="Nanny">Nanny</option>
              <option value="Daycare provider">Daycare provider</option>
              <option value="Family member">Family member</option>
              <option value="Family friend">Family friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
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
            {loading ? 'Saving...' : caregiver ? 'Update' : 'Add Caregiver'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

