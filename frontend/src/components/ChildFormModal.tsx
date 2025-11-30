import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { api } from '../lib/api'
import type { Child } from '../types/entities'
import { useFamilies } from '../hooks/useApiData'

interface ChildFormModalProps {
  isOpen: boolean
  onClose: () => void
  child?: Child | null
  onSuccess: () => void
}

export function ChildFormModal({ isOpen, onClose, child, onSuccess }: ChildFormModalProps) {
  const { families } = useFamilies()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState('')
  const [school, setSchool] = useState('')

  const familyId = families[0]?.id || ''

  useEffect(() => {
    if (child) {
      setFirstName(child.firstName)
      setLastName(child.lastName)
      setBirthdate(child.birthdate)
      setGender(child.gender || '')
      setSchool(child.school || '')
    } else {
      setFirstName('')
      setLastName('')
      setBirthdate('')
      setGender('')
      setSchool('')
    }
    setError(null)
  }, [child, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId) {
      setError('No family found. Please complete family setup first.')
      return
    }

    if (!gender) {
      setError('Please select a gender')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthdate: new Date(birthdate).toISOString(),
        gender,
        school: school || undefined,
        familyId,
      }

      if (child) {
        await api.updateChild(child.id, data)
      } else {
        await api.createChild(data)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save child')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={child ? 'Edit Child' : 'Add Child'}
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
              placeholder="Enter first name"
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
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-semibold text-brown mb-2">
            Birthdate <span className="text-red-DEFAULT">*</span>
          </label>
          <input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-semibold text-brown mb-2">
            Gender <span className="text-red-DEFAULT">*</span>
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-semibold text-brown mb-2">
            School <span className="text-brown/70">(optional)</span>
          </label>
          <input
            id="school"
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
            placeholder="Enter school name"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : child ? 'Update' : 'Add Child'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

