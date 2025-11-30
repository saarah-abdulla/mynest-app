import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Caregiver {
  firstName: string
  lastName: string
  email: string
  phone?: string
  relationship: string
}

export function SetupCaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [currentCaregiver, setCurrentCaregiver] = useState<Caregiver>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Load caregivers from localStorage if they exist
    const setupData = localStorage.getItem('familySetup')
    if (setupData) {
      const parsed = JSON.parse(setupData)
      if (parsed.caregivers) {
        setCaregivers(parsed.caregivers)
      }
    }
  }, [])

  function handleAddCaregiver() {
    if (
      !currentCaregiver.firstName ||
      !currentCaregiver.lastName ||
      !currentCaregiver.email ||
      !currentCaregiver.relationship
    ) {
      return
    }
    const newCaregivers = [...caregivers, currentCaregiver]
    setCaregivers(newCaregivers)

    // Update localStorage
    const setupData = JSON.parse(localStorage.getItem('familySetup') || '{}')
    setupData.caregivers = newCaregivers
    localStorage.setItem('familySetup', JSON.stringify(setupData))

    // Reset form
    setCurrentCaregiver({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: '',
    })
  }

  function handleRemoveCaregiver(index: number) {
    const newCaregivers = caregivers.filter((_, i) => i !== index)
    setCaregivers(newCaregivers)

    // Update localStorage
    const setupData = JSON.parse(localStorage.getItem('familySetup') || '{}')
    setupData.caregivers = newCaregivers
    localStorage.setItem('familySetup', JSON.stringify(setupData))
  }

  function handleNext() {
    navigate('/setup/review')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-brown/70 mb-2">Step 3 of 4</p>
            <div className="w-64 h-2 bg-brown/10 rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <p className="text-sm font-medium text-brown">75% Complete</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-sage/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-brown mb-2">Invite Caregivers</h2>
            <p className="text-brown/70">
              Invite caregivers who will help coordinate care for your children. You can always add
              more later.
            </p>
          </div>

          {/* Add Caregiver Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-brown mb-4">Add Caregiver:</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    First Name <span className="text-red-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentCaregiver.firstName}
                    onChange={(e) =>
                      setCurrentCaregiver({ ...currentCaregiver, firstName: e.target.value })
                    }
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Last Name <span className="text-red-DEFAULT">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentCaregiver.lastName}
                    onChange={(e) =>
                      setCurrentCaregiver({ ...currentCaregiver, lastName: e.target.value })
                    }
                    placeholder="Smith"
                    className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Email Address <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="email"
                  value={currentCaregiver.email}
                  onChange={(e) =>
                    setCurrentCaregiver({ ...currentCaregiver, email: e.target.value })
                  }
                  placeholder="john.smith@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Phone Number <span className="text-brown/60">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={currentCaregiver.phone}
                    onChange={(e) =>
                      setCurrentCaregiver({ ...currentCaregiver, phone: e.target.value })
                    }
                    placeholder="+971 50 123 4567"
                    className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Relationship <span className="text-red-DEFAULT">*</span>
                  </label>
                  <select
                    value={currentCaregiver.relationship}
                    onChange={(e) =>
                      setCurrentCaregiver({ ...currentCaregiver, relationship: e.target.value })
                    }
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
              <button
                onClick={handleAddCaregiver}
                className="w-full mt-4 px-6 py-3 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors"
              >
                Add Caregiver
              </button>
            </div>
          </div>

          {/* Added Caregivers List */}
          {caregivers.length > 0 && (
            <div className="border-t border-brown/10 pt-6">
              <h3 className="text-lg font-semibold text-brown mb-4">
                Added Caregivers ({caregivers.length})
              </h3>
              <div className="space-y-3">
                {caregivers.map((caregiver, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-brown">
                        {caregiver.firstName} {caregiver.lastName}
                      </p>
                      <p className="text-sm text-brown/70">
                        {caregiver.email} • {caregiver.relationship}
                        {caregiver.phone && ` • ${caregiver.phone}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveCaregiver(index)}
                      className="text-red-DEFAULT hover:text-red-DEFAULT/80 transition-colors"
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/setup/children')}
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
            onClick={handleNext}
            className="px-6 py-3 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors flex items-center gap-2"
          >
            Next
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
      </div>
    </div>
  )
}



