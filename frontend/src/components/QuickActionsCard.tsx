interface QuickActionsCardProps {
  onLogActivity?: () => void
  onAddEvent?: () => void
  onSendMessage?: () => void
  onUploadDocument?: () => void
}

export function QuickActionsCard({
  onLogActivity,
  onAddEvent,
  onSendMessage,
  onUploadDocument,
}: QuickActionsCardProps) {
  function CalendarIcon() {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center text-white">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 9h16" />
          <path d="M9 13h2.5" />
          <path d="M9 16h2.5" />
          <path d="M13.5 13H16" />
        </svg>
      </span>
    )
  }

  const actions = [
    {
      label: 'Log Activity',
      icon: '+',
      color: 'bg-coral hover:bg-coral/90 text-white',
      onClick: onLogActivity,
    },
    {
      label: 'Add Event',
      icon: <CalendarIcon />,
      color: 'bg-sage hover:bg-sage-dark text-white',
      onClick: onAddEvent,
    },
    {
      label: 'Send Message',
      icon: '💬',
      color: 'bg-card border border-brown/20 hover:bg-sage/10 text-brown',
      onClick: onSendMessage,
    },
    {
      label: 'Upload Document',
      icon: '📄',
      color: 'bg-card border border-brown/20 hover:bg-sage/10 text-brown',
      onClick: onUploadDocument,
    },
  ]

  return (
    <div className="rounded-2xl border border-brown/10 bg-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-brown">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-6 font-semibold transition-colors ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

