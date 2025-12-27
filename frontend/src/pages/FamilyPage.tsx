import { useState, useEffect } from 'react'
import { NavigationBar } from '../components/NavigationBar'
import { useChildren, useCaregivers, useFamilies } from '../hooks/useApiData'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { ChildFormModal } from '../components/ChildFormModal'
import { CaregiverFormModal } from '../components/CaregiverFormModal'
import { api } from '../lib/api'
import { formatDateDDMMYYYY } from '../lib/dateUtils'
import { useAuth } from '../contexts/AuthContext'
import type { Child, Caregiver } from '../types/entities'

export function FamilyPage() {
  const { currentUser } = useAuth()
  const { families, loading: familiesLoading } = useFamilies()
  const { children, loading: childrenLoading, error: childrenError, refetch: refetchChildren } =
    useChildren()
  const {
    caregivers,
    loading: caregiversLoading,
    error: caregiversError,
    refetch: refetchCaregivers,
  } = useCaregivers()

  const [childModalOpen, setChildModalOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [caregiverModalOpen, setCaregiverModalOpen] = useState(false)
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null)
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'parent' | 'caregiver' | null>(null)
  const [editingFamily, setEditingFamily] = useState(false)
  const [familyNameInput, setFamilyNameInput] = useState('')
  const [regionInput, setRegionInput] = useState('')
  const [timezoneInput, setTimezoneInput] = useState('')

  // Fetch user role
  useEffect(() => {
    async function fetchUserRole() {
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
        console.error('Error fetching user role:', err)
        setUserRole('parent')
      }
    }
    fetchUserRole()
  }, [currentUser])

  const isParent = userRole === 'parent'

  const isLoading = familiesLoading || childrenLoading || caregiversLoading
  const hasError = childrenError || caregiversError

  const family = families[0]
  const familyName = family?.name || 'Your Family'

  // Initialize form when editing
  useEffect(() => {
    if (editingFamily && family) {
      setFamilyNameInput(family.name)
      setRegionInput(family.region)
      setTimezoneInput(family.timezone)
    }
  }, [editingFamily, family])

  const getAge = (birthdate: string) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getSchoolAge = (age: number) => {
    if (age >= 3 && age <= 18) return 'School Age'
    return 'Pre-School'
  }

  const formatBirthdate = (birthdate: string) => {
    return formatDateDDMMYYYY(birthdate)
  }

  const getInitials = (child: Child) => {
    if (child.firstName && child.lastName) {
      return `${child.firstName[0]}${child.lastName[0]}`.toUpperCase()
    }
    return child.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteChild = async (childId: string) => {
    if (window.confirm('Are you sure you want to delete this child? This will also delete all associated schedule entries and journal entries.')) {
      try {
        await api.deleteChild(childId)
        refetchChildren()
      } catch (error: any) {
        console.error('Error deleting child:', error)
        const errorMessage = error?.message || error?.error || 'Failed to delete child. Please try again.'
        alert(errorMessage)
      }
    }
  }

  const handleDeleteCaregiver = async (caregiverId: string) => {
    if (window.confirm('Are you sure you want to remove this caregiver? This will remove all child assignments.')) {
      try {
        await api.deleteCaregiver(caregiverId)
        refetchCaregivers()
      } catch (error: any) {
        console.error('Error deleting caregiver:', error)
        const errorMessage = error?.message || error?.error || 'Failed to remove caregiver. Please try again.'
        alert(errorMessage)
      }
    }
  }

  const handleResendInvitation = async (caregiverId: string) => {
    try {
      setSendingInvitation(caregiverId)
      await api.sendInvitation(caregiverId)
      alert('Invitation email sent successfully!')
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      const errorMessage = error?.message || error?.error || 'Failed to send invitation. Please try again.'
      alert(errorMessage)
    } finally {
      setSendingInvitation(null)
    }
  }

  const handleSaveFamily = async () => {
    if (!family) return
    
    if (!familyNameInput.trim()) {
      alert('Family name is required')
      return
    }
    
    try {
      await api.updateFamily(family.id, {
        name: familyNameInput.trim(),
        region: regionInput.trim() || family.region,
        timezone: timezoneInput.trim() || family.timezone,
      })
      setEditingFamily(false)
      // Force page reload to refresh family data
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating family:', error)
      const errorMessage = error?.message || error?.error || 'Failed to update family. Please try again.'
      alert(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingFamily(false)
    if (family) {
      setFamilyNameInput(family.name)
      setRegionInput(family.region)
      setTimezoneInput(family.timezone)
    }
  }

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
            message={childrenError || caregiversError || 'Failed to load data'}
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
        {/* Main Heading */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {editingFamily ? (
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="familyName" className="block text-sm font-semibold text-brown mb-2">
                    Family Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="familyName"
                    type="text"
                    value={familyNameInput}
                    onChange={(e) => setFamilyNameInput(e.target.value)}
                    className="w-full max-w-md px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-2xl font-bold"
                    placeholder="Family Name"
                  />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-semibold text-brown mb-2">
                    Region
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    className="w-full max-w-md px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    placeholder="e.g., Dubai, UAE"
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-semibold text-brown mb-2">
                    Timezone
                  </label>
                  <input
                    id="timezone"
                    type="text"
                    value={timezoneInput}
                    onChange={(e) => setTimezoneInput(e.target.value)}
                    className="w-full max-w-md px-4 py-2 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                    placeholder="e.g., Asia/Dubai"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveFamily}
                    className="px-4 py-2 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-lg border border-brown/20 text-brown font-semibold hover:bg-brown/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-4xl font-bold text-brown mb-2">{familyName}</h1>
                  <p className="text-lg text-brown/70">Manage your family members and caregivers</p>
                  {family && (
                    <p className="text-sm text-brown/60 mt-1">
                      {family.region} • {family.timezone}
                    </p>
                  )}
                </div>
                {isParent && (
                  <button
                    onClick={() => setEditingFamily(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brown/20 text-brown font-semibold hover:bg-brown/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Family
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Two Cards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Children Card */}
          <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brown">Children</h2>
                <p className="text-sm text-brown/70">Family members</p>
              </div>
              {isParent && (
                <button
                  onClick={() => {
                    setSelectedChild(null)
                    setChildModalOpen(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Child
                </button>
              )}
            </div>

            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child) => {
                  const age = getAge(child.birthdate)
                  return (
                    <div
                      key={child.id}
                      className="flex items-start justify-between p-4 bg-background rounded-lg"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-white font-semibold">
                          {getInitials(child)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-brown text-lg">{child.fullName}</p>
                          <p className="text-sm text-brown/70 mt-1">
                            {age} years old • {getSchoolAge(age)}
                          </p>
                          <p className="text-sm text-brown/70">Born: {formatBirthdate(child.birthdate)}</p>
                        </div>
                      </div>
                    {isParent && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedChild(child)
                            setChildModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-sage hover:bg-sage/10 transition-colors"
                          title="Edit child"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          className="p-2 rounded-lg text-red-DEFAULT hover:bg-red/10 transition-colors"
                          title="Delete child"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-brown/70 mb-4">No children added yet</p>
                {isParent && (
                  <button
                    onClick={() => {
                      setSelectedChild(null)
                      setChildModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
                  >
                    Add Your First Child
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Caregivers Card */}
          <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brown">Caregivers</h2>
                <p className="text-sm text-brown/70">Trusted care providers</p>
              </div>
              {isParent && (
                <button
                  onClick={() => {
                    setSelectedCaregiver(null)
                    setCaregiverModalOpen(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Invite Caregiver
                </button>
              )}
            </div>

            {caregivers.length > 0 ? (
              <div className="space-y-4">
                {caregivers.map((caregiver) => {
                  // Parse notes to extract relationship (email is now a direct field)
                  const notes = caregiver.notes || ''
                  const relationshipMatch = notes.match(/Relationship:\s*([^\s|]+)/)
                  const relationship = relationshipMatch ? relationshipMatch[1] : ''
                  const hasEmail = !!caregiver.email

                  return (
                    <div
                      key={caregiver.id}
                      className="flex items-start justify-between p-4 bg-background rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-brown text-lg">{caregiver.fullName}</p>
                        {caregiver.email && <p className="text-sm text-brown/70 mt-1">{caregiver.email}</p>}
                        {relationship && (
                          <p className="text-sm text-brown/70 mt-1">{relationship}</p>
                        )}
                        {caregiver.phone && (
                          <p className="text-sm text-brown/70 mt-1">{caregiver.phone}</p>
                        )}
                        {!hasEmail && (
                          <p className="text-xs text-yellow-DEFAULT mt-1 italic">No email - invitation not sent</p>
                        )}
                      </div>
                    {isParent && (
                      <div className="flex items-center gap-2">
                        {hasEmail && (
                          <button
                            onClick={() => handleResendInvitation(caregiver.id)}
                            disabled={sendingInvitation === caregiver.id}
                            className="p-2 rounded-lg text-blue-DEFAULT hover:bg-blue/10 transition-colors disabled:opacity-50"
                            title="Resend invitation email"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCaregiver(caregiver)
                            setCaregiverModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-sage hover:bg-sage/10 transition-colors"
                          title="Edit caregiver"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCaregiver(caregiver.id)}
                          className="p-2 rounded-lg text-red-DEFAULT hover:bg-red/10 transition-colors"
                          title="Remove caregiver"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-brown/70 mb-4">No caregivers added yet</p>
                {isParent && (
                  <button
                    onClick={() => {
                      setSelectedCaregiver(null)
                      setCaregiverModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Invite Your First Caregiver
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChildFormModal
        isOpen={childModalOpen}
        onClose={() => {
          setChildModalOpen(false)
          setSelectedChild(null)
        }}
        child={selectedChild}
        onSuccess={() => {
          refetchChildren()
        }}
      />

      <CaregiverFormModal
        isOpen={caregiverModalOpen}
        onClose={() => {
          setCaregiverModalOpen(false)
          setSelectedCaregiver(null)
        }}
        caregiver={selectedCaregiver}
        onSuccess={() => {
          refetchCaregivers()
        }}
      />
    </div>
  )
}

