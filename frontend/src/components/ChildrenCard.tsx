import type { Child } from '../types/entities'

interface ChildrenCardProps {
  children: Child[]
  onAddChild?: () => void
}

export function ChildrenCard({ children, onAddChild }: ChildrenCardProps) {
  const getInitials = (child: Child) => {
    if (child.firstName && child.lastName) {
      return `${child.firstName[0]}${child.lastName[0]}`.toUpperCase()
    }
    // Fallback to fullName if firstName/lastName not available
    return child.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAge = (birthdate: string) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getAvatarColor = (_index: number) => {
    return 'bg-coral'
  }

  return (
    <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brown">Children</h3>
          <p className="text-sm text-brown/70">Family members</p>
        </div>
        <button
          onClick={onAddChild}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-xl font-light text-white hover:bg-sage-dark transition-colors"
        >
          +
        </button>
      </div>
      <div className="space-y-3">
        {children.map((child, index) => (
          <div key={child.id} className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${getAvatarColor(index)} text-white font-semibold`}
            >
              {getInitials(child)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-brown">{child.fullName}</p>
              <p className="text-sm text-brown/70">
                {getAge(child.birthdate)} years old • {child.school || 'No school'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

