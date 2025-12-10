import { useState, useEffect } from 'react'

export function MyNestLogo({ className = "w-10 h-10" }: { className?: string }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Use absolute URL to ensure it works in all environments
  // Try multiple possible paths for the logo
  const imageSrc = '/mynest-logo.png'
  
  // Also try with base URL for production
  const getImageSrc = () => {
    // In production, try the absolute path first
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/mynest-logo.png`
    }
    return imageSrc
  }

  useEffect(() => {
    // Preload the image to check if it exists
    const img = new Image()
    const src = getImageSrc()
    
    img.onload = () => {
      console.log('Logo image preloaded successfully from:', src)
      setImageLoaded(true)
      setImageError(false)
    }
    img.onerror = () => {
      console.error('Logo image failed to preload from:', src)
      console.error('Trying fallback path:', imageSrc)
      // Try the relative path as fallback
      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        console.log('Logo loaded from fallback path:', imageSrc)
        setImageLoaded(true)
        setImageError(false)
      }
      fallbackImg.onerror = () => {
        console.error('Logo failed from both paths, showing fallback icon')
        setImageError(true)
        setImageLoaded(false)
      }
      fallbackImg.src = imageSrc
    }
    img.src = src
  }, [])

  // Don't show fallback until we've confirmed the image failed
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

  // Show image once loaded, or show nothing while loading (to prevent flash)
  return (
    <img
      src={getImageSrc()}
      alt="MyNest Logo"
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
      onError={(e) => {
        console.error('Logo image failed to load from:', getImageSrc())
        // Try fallback path
        const target = e.target as HTMLImageElement
        if (target.src !== imageSrc) {
          console.log('Trying fallback path:', imageSrc)
          target.src = imageSrc
        } else {
          console.error('Both image paths failed, showing fallback icon')
          setImageError(true)
          setImageLoaded(false)
        }
      }}
      onLoad={() => {
        console.log('Logo image loaded successfully')
        setImageLoaded(true)
        setImageError(false)
      }}
    />
  )
}
