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
    // Start with relative path first (works better with Vite/Vercel)
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Logo image loaded successfully from:', img.src)
      setImageLoaded(true)
      setImageError(false)
    }
    
    img.onerror = () => {
      console.error('❌ Logo image failed to load from:', img.src)
      // Try absolute URL as fallback
      const absoluteSrc = typeof window !== 'undefined' 
        ? `${window.location.origin}/mynest-logo.png`
        : imageSrc
      
      if (img.src !== absoluteSrc) {
        console.log('🔄 Trying absolute URL:', absoluteSrc)
        img.src = absoluteSrc
      } else {
        console.error('❌ Both paths failed, showing fallback icon')
        setImageError(true)
        setImageLoaded(false)
      }
    }
    
    // Start with relative path
    img.src = imageSrc
  }, [imageSrc])

  // Don't show fallback until we've confirmed the image failed
  if (imageError) {
    // Fallback: Show a simple nest icon instead of text
    // Using a more visible icon that definitely renders
    return (
      <div className={`${className} rounded-lg bg-sage flex items-center justify-center flex-shrink-0`} style={{ minWidth: className.includes('w-') ? undefined : '48px', minHeight: className.includes('h-') ? undefined : '48px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          style={{ padding: '8px' }}
        >
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    )
  }

  // Show image once loaded, or show nothing while loading (to prevent flash)
  return (
    <img
      src={imageSrc}
      alt="MyNest Logo"
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        console.error('❌ Image onError - failed to load from:', target.src)
        
        // Try absolute URL if we're using relative
        if (target.src.endsWith('/mynest-logo.png') && typeof window !== 'undefined') {
          const absoluteSrc = `${window.location.origin}/mynest-logo.png`
          console.log('🔄 Retrying with absolute URL:', absoluteSrc)
          target.src = absoluteSrc
        } else {
          console.error('❌ All image load attempts failed')
          setImageError(true)
          setImageLoaded(false)
        }
      }}
      onLoad={() => {
        console.log('✅ Image onLoad - logo loaded successfully')
        setImageLoaded(true)
        setImageError(false)
      }}
    />
  )
}
