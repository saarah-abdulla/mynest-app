export function MyNestLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src="/mynest-logo.png"
      alt="MyNest Logo"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
