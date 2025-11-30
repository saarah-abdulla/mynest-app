export function MyNestLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src="/mynest-logo.png"
      alt="MyNest Logo"
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'block',
        maxWidth: '100%',
        height: 'auto'
      }}
      onError={(e) => {
        console.error('Logo image failed to load. Check if /mynest-logo.png exists in public folder.')
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
      }}
    />
  )
}
