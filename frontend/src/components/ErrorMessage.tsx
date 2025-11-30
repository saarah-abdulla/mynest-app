interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-light bg-red-light/50 p-4 text-center">
      <p className="text-sm font-medium text-red-DEFAULT">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-dark transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}



