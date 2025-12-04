import { useState } from 'react'

export function MyNestLogo({ className = "w-10 h-10" }: { className?: string }) {
  const [imageError, setImageError] = useState(false)

  // Try multiple paths in case of deployment issues
  const imageSrc = '/mynest-logo.png'

  if (imageError) {
    // Fallback: Show a simple nest icon instead of text
    return (
      <div className={`${className} rounded-lg bg-sage flex items-center justify-center flex-shrink-0`}>
        <svg
          className="w-full h-full p-2 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt="MyNest Logo"
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'block',
        maxWidth: '100%',
        height: 'auto'
      }}
      onError={() => {
        console.error('Logo image failed to load from:', imageSrc)
        console.error('Check if mynest-logo.png exists in frontend/public folder and is deployed to Vercel')
        setImageError(true)
      }}
      onLoad={() => {
        // Image loaded successfully
        setImageError(false)
      }}
    />
  )
}
