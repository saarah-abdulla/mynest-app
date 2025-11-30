import type { Child, JournalEntry, User } from '../types/entities'

interface Props {
  entry: JournalEntry
  child: Child
  author?: User
}

export function JournalEntryCard({ entry, child, author }: Props) {
  const createdAt = new Date(entry.createdAt).toLocaleString('en-AE', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{child.fullName}</p>
      <p className="mt-2 text-base text-slate-800">{entry.note}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{createdAt}</span>
        <span>{author?.displayName ?? 'Unknown caregiver'}</span>
      </div>
    </article>
  )
}



