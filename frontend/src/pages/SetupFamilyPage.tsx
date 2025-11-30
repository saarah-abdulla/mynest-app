import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SetupFamilyPage() {
  const [familyName, setFamilyName] = useState('')
  const [description, setDescription] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const navigate = useNavigate()

  function handleNext() {
    // Save family data (will be sent to backend in step 3)
    const familyData = {
      name: familyName,
      description,
      address: {
        street: streetAddress,
        city,
        state,
        zipCode,
      },
    }
    localStorage.setItem('familySetup', JSON.stringify(familyData))
    navigate('/setup/children')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-brown mb-3">Step 1 of 4</p>
            <div className="w-full max-w-xs h-3 bg-brown/10 rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full transition-all" style={{ width: '25%' }}></div>
            </div>
          </div>
          <p className="text-sm font-semibold text-brown ml-4">25% Complete</p>
        </div>

        {/* Email Verification Notice */}
        {showVerificationNotice && (
          <div className="bg-sage/10 border border-sage rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brown mb-1">Verification email sent!</p>
                <p className="text-sm text-brown/70">
                  We've sent a verification email to <strong>{location.state?.email}</strong>. Please check your inbox and verify your email address to complete your account setup.
                </p>
              </div>
              <button
                onClick={() => setShowVerificationNotice(false)}
                className="text-brown/60 hover:text-brown"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Card - More Compact */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-brown/10 mb-6">
          {/* Icon and Title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-sage/20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-sage"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-brown mb-2">Create Your Family</h2>
            <p className="text-sm text-brown/80">
              Let&apos;s start by setting up your family profile. This will be your central hub for
              coordinating care.
            </p>
          </div>

          <div className="space-y-5">
            {/* Family Name */}
            <div>
              <label htmlFor="familyName" className="block text-sm font-semibold text-brown mb-2">
                Family Name <span className="text-red-DEFAULT">*</span>
              </label>
              <input
                id="familyName"
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smith Family"
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                required
              />
              <p className="mt-1.5 text-xs text-brown/70">
                This is how your family will be identified in the app
              </p>
            </div>

            {/* Family Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-brown mb-2">
                Family Description <span className="text-brown/60 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your family..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
              />
            </div>

            {/* Primary Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-sage"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <label className="block text-sm font-semibold text-brown">Primary Address</label>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street Address"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                  className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-card text-brown placeholder-brown/40 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-brown/10 px-4 py-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-lg border border-brown/20 bg-card text-brown/80 font-medium hover:bg-brown/5 hover:text-brown transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!familyName}
              className="px-6 py-2.5 rounded-lg bg-sage text-white font-semibold hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

