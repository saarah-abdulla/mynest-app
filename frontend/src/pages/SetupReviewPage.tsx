import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { Caregiver } from '../types/entities'

export function SetupReviewPage() {
  const [setupData, setSetupData] = useState<any>(null)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const data = localStorage.getItem('familySetup')
    if (data) {
      const parsed = JSON.parse(data)
      setSetupData(parsed)
      if (parsed.caregivers) {
        setCaregivers(parsed.caregivers)
      }
    }
  }, [])

  async function handleComplete() {
    if (!setupData || !currentUser) return

    try {
      setLoading(true)
      setError(null)
      
      // Create family in backend
      const family = await api.createFamily({
        name: setupData.name,
        region: setupData.address?.city || 'Dubai, UAE',
        timezone: 'Asia/Dubai',
      })

      // Create or update user record with familyId
      // POST will handle both create and update
      try {
        // First try to get existing user
        const users = await api.listUsers()
        const existingUser = users.find((u) => u.email === currentUser.email)
        
        if (existingUser) {
          // Update existing user with familyId
          await api.updateUser(existingUser.id, {
            familyId: family.id,
          })
        } else {
          // Create new user (but api.createUser doesn't accept firebaseUid directly)
          // The backend should handle this via the auth middleware
          // For now, we'll just update the user if they exist after creation
          try {
            await api.createUser({
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              role: 'parent',
              familyId: family.id,
            })
          } catch (createErr: any) {
            // If creation fails, try to find and update
            const usersAfter = await api.listUsers()
            const userAfter = usersAfter.find((u) => u.email === currentUser.email)
            if (userAfter) {
              await api.updateUser(userAfter.id, {
                familyId: family.id,
              })
            } else {
              throw createErr
            }
          }
        }
      } catch (userErr: any) {
        // User might already exist, try to update
        if (userErr.message?.includes('already exists') || userErr.message?.includes('unique')) {
          const users = await api.listUsers()
          const existingUser = users.find((u) => u.email === currentUser.email)
          if (existingUser) {
            await api.updateUser(existingUser.id, {
              familyId: family.id,
            })
          }
        } else {
          throw userErr
        }
      }

      // Create children
      if (setupData.children && setupData.children.length > 0) {
        for (const child of setupData.children) {
          try {
            await api.createChild({
              firstName: child.firstName,
              lastName: child.lastName,
              fullName: `${child.firstName} ${child.lastName}`.trim(),
              birthdate: child.dateOfBirth,
              gender: child.gender,
              school: '',
              familyId: family.id,
            })
          } catch (childErr) {
            console.error('Error creating child:', childErr)
            // Continue with other children even if one fails
          }
        }
      }

      // Create caregivers
      if (caregivers && caregivers.length > 0) {
        for (const caregiver of caregivers) {
          try {
            await api.createCaregiver({
              fullName: caregiver.fullName,
              phone: caregiver.phone || undefined,
              email: caregiver.email || undefined,
              notes: caregiver.email ? `Email: ${caregiver.email}` : undefined,
              familyId: family.id,
            })
          } catch (caregiverErr) {
            console.error('Error creating caregiver:', caregiverErr)
            // Continue with other caregivers even if one fails
          }
        }
      }

      // Clear setup data
      localStorage.removeItem('familySetup')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error completing setup:', error)
      const errorMessage = error?.message || 'Failed to complete setup. Please try again.'
      setError(errorMessage)
      // Also show alert for immediate feedback
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function getAge(dateOfBirth: string) {
    if (!dateOfBirth) return ''
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (!setupData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brown">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-brown/70 mb-2">Step 4 of 4</p>
            <div className="w-64 h-2 bg-brown/10 rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <p className="text-sm font-medium text-brown">100% Complete</p>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-light rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-DEFAULT"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-brown mb-2">Review & Complete</h2>
          <p className="text-brown/70">
            Review your family setup and complete the process.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-light text-red-DEFAULT border border-red-DEFAULT/20">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Review Cards */}
        <div className="space-y-4 mb-8">
          {/* Family Information */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-brown/10">
            <h3 className="text-lg font-semibold text-brown mb-4">Family Information</h3>
            <p className="text-brown">
              <span className="font-medium">Name:</span> {setupData.name}
            </p>
            {setupData.description && (
              <p className="text-brown/70 mt-2">{setupData.description}</p>
            )}
          </div>

          {/* Children */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-brown/10">
            <h3 className="text-lg font-semibold text-brown mb-4">
              Children ({setupData.children?.length || 0})
            </h3>
            {setupData.children && setupData.children.length > 0 ? (
              <div className="space-y-3">
                {setupData.children.map((child: any, index: number) => (
                  <div key={index} className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-brown">
                      {child.firstName} {child.lastName}
                      {child.nickname && ` "${child.nickname}"`}
                    </p>
                    <p className="text-sm text-brown/70">
                      {getAge(child.dateOfBirth)} years old • {child.gender || 'Not specified'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brown/70">No children added yet</p>
            )}
          </div>

          {/* Caregivers Summary */}
          {caregivers.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-card border border-brown/10">
              <h3 className="text-lg font-semibold text-brown mb-4">
                Caregivers ({caregivers.length})
              </h3>
              <div className="space-y-3">
                {caregivers.map((caregiver: Caregiver, index: number) => (
                  <div key={index} className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-brown">
                      {caregiver.fullName}
                    </p>
                    <p className="text-sm text-brown/70">
                      {caregiver.email && `${caregiver.email}`}
                      {caregiver.email && caregiver.phone && ' • '}
                      {caregiver.phone && caregiver.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/setup/caregivers')}
            className="px-6 py-3 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Completing...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  )
}

