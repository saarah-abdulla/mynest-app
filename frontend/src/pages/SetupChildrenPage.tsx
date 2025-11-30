import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Child {
  firstName: string
  lastName: string
  nickname: string
  dateOfBirth: string
  gender: string
}

export function SetupChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [currentChild, setCurrentChild] = useState<Child>({
    firstName: '',
    lastName: '',
    nickname: '',
    dateOfBirth: '',
    gender: '',
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const navigate = useNavigate()

  function handleAddChild() {
    if (
      !currentChild.firstName ||
      !currentChild.lastName ||
      !currentChild.dateOfBirth ||
      !currentChild.gender
    ) {
      return
    }

    if (editingIndex !== null) {
      // Update existing child
      const updatedChildren = [...children]
      updatedChildren[editingIndex] = currentChild
      setChildren(updatedChildren)
      setEditingIndex(null)
    } else {
      // Add new child
      setChildren([...children, currentChild])
    }

    // Reset form
    setCurrentChild({
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: '',
      gender: '',
    })
  }

  function handleEditChild(index: number) {
    const childToEdit = children[index]
    setCurrentChild({ ...childToEdit })
    setEditingIndex(index)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingIndex(null)
    setCurrentChild({
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: '',
      gender: '',
    })
  }

  function handleNext() {
    const setupData = JSON.parse(localStorage.getItem('familySetup') || '{}')
    setupData.children = children
    localStorage.setItem('familySetup', JSON.stringify(setupData))
    navigate('/setup/caregivers')
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

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-brown/70 mb-2">Step 2 of 4</p>
            <div className="w-64 h-2 bg-brown/10 rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
          <p className="text-sm font-medium text-brown">50% Complete</p>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-brown/10">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-coral/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-coral"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-brown mb-2">Add Your Children</h2>
            <p className="text-brown/70">
              Add the children you&apos;ll be coordinating care for. You can always add more later.
            </p>
          </div>

          {/* Add/Edit Child Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-brown mb-4">
              {editingIndex !== null ? 'Edit Child:' : 'Add Child:'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  First Name <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  value={currentChild.firstName}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, firstName: e.target.value })
                  }
                  placeholder="Emma"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Last Name <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="text"
                  value={currentChild.lastName}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, lastName: e.target.value })
                  }
                  placeholder="Smith"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Nickname <span className="text-brown/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={currentChild.nickname}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, nickname: e.target.value })
                  }
                  placeholder="Emmy"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Date of Birth <span className="text-red-DEFAULT">*</span>
                </label>
                <input
                  type="date"
                  value={currentChild.dateOfBirth}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, dateOfBirth: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Gender <span className="text-red-DEFAULT">*</span>
                </label>
                <select
                  value={currentChild.gender}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, gender: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddChild}
                className="px-6 py-3 rounded-lg bg-coral text-white font-semibold hover:bg-coral/90 transition-colors"
              >
                {editingIndex !== null ? 'Update Child' : 'Add Child'}
              </button>
              {editingIndex !== null && (
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-lg border border-brown/20 bg-card text-brown font-medium hover:bg-brown/5 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Added Children List */}
          {children.length > 0 && (
            <div className="border-t border-brown/10 pt-6">
              <h3 className="text-lg font-semibold text-brown mb-4">
                Added Children ({children.length})
              </h3>
              <div className="space-y-3">
                {children.map((child, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-brown">
                        {child.firstName} {child.lastName}
                        {child.nickname && ` "${child.nickname}"`}
                      </p>
                      <p className="text-sm text-brown/70">
                        {getAge(child.dateOfBirth)} years old • {child.gender || 'Not specified'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditChild(index)}
                        className="text-sage hover:text-sage-dark transition-colors"
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
                        onClick={() => {
                          if (editingIndex === index) {
                            handleCancelEdit()
                          }
                          const newChildren = children.filter((_, i) => i !== index)
                          setChildren(newChildren)
                        }}
                        className="text-red-DEFAULT hover:text-red-DEFAULT/80 transition-colors"
                        title="Remove child"
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate('/setup/family')}
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

