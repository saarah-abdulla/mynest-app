import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Caregiver } from '../types/entities'

export function SetupReviewPage() {
  const [setupData, setSetupData] = useState<any>(null)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(false)
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
      
      // Get Firebase token for authenticated request
      const token = await currentUser.getIdToken()
      
      // Create family in backend
      const family = await fetch('http://localhost:4000/api/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: setupData.name,
          region: setupData.address?.city || 'Dubai, UAE',
          timezone: 'Asia/Dubai',
        }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to create family')
        return res.json()
      })

      // Create or update user record with familyId
      // POST will handle both create and update
      const userResponse = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firebaseUid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          role: 'parent',
          familyId: family.id,
        }),
      })
      
      if (!userResponse.ok) {
        const error = await userResponse.json().catch(() => ({}))
        console.error('Failed to create/update user:', error)
        throw new Error(error.error || 'Failed to create user record')
      }
      
      const userData = await userResponse.json()
      console.log('User record created/updated:', userData)

      // Create children
      if (setupData.children && setupData.children.length > 0) {
        for (const child of setupData.children) {
          await fetch('http://localhost:4000/api/children', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              firstName: child.firstName,
              lastName: child.lastName,
              birthdate: child.dateOfBirth,
              gender: child.gender,
              school: '',
              familyId: family.id,
            }),
          })
        }
      }

      // Create caregivers
      if (caregivers && caregivers.length > 0) {
        for (const caregiver of caregivers) {
          await fetch('http://localhost:4000/api/caregivers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: `${caregiver.firstName} ${caregiver.lastName}`,
              phone: caregiver.phone || undefined,
              notes: `Relationship: ${caregiver.relationship}${caregiver.email ? ` | Email: ${caregiver.email}` : ''}`,
              familyId: family.id,
            }),
          })
        }
      }

      // Clear setup data
      localStorage.removeItem('familySetup')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing setup:', error)
      alert('Failed to complete setup. Please try again.')
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
                      {caregiver.firstName} {caregiver.lastName}
                    </p>
                    <p className="text-sm text-brown/70">
                      {caregiver.email} • {caregiver.relationship}
                      {caregiver.phone && ` • ${caregiver.phone}`}
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

