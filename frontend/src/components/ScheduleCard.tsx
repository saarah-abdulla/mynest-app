import type { Child, ScheduleEntry } from '../types/entities'

const categoryStyles: Record<
  ScheduleEntry['category'],
  { label: string; color: string }
> = {
  school: { label: 'School', color: 'bg-primary/10 text-primary' },
  activity: { label: 'Activity', color: 'bg-emerald-100 text-emerald-700' },
  meal: { label: 'Meal', color: 'bg-amber-100 text-amber-700' },
  medication: { label: 'Medication', color: 'bg-rose-100 text-rose-700' },
  sleep: { label: 'Sleep', color: 'bg-sky-100 text-sky-700' },
  medical: { label: 'Medical', color: 'bg-red-light text-red-DEFAULT' },
  appointment: { label: 'Appointment', color: 'bg-yellow-light text-yellow-DEFAULT' },
  social: { label: 'Social', color: 'bg-blue-light text-blue-DEFAULT' },
  play: { label: 'Play', color: 'bg-pink-light text-pink-DEFAULT' },
  feeding: { label: 'Feeding', color: 'bg-yellow-light text-yellow-DEFAULT' },
  nap: { label: 'Nap', color: 'bg-gray-light text-gray-DEFAULT' },
  other: { label: 'Other', color: 'bg-zinc-100 text-zinc-700' },
}

interface Props {
  entry: ScheduleEntry
  child: Child
}

export function ScheduleCard({ entry, child }: Props) {
  const category = categoryStyles[entry.category]
  const start = new Date(entry.startTime).toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const end = new Date(entry.endTime).toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{child.fullName}</p>
          <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${category.color}`}>
          {category.label}
        </span>
      </header>
      <p className="mt-3 text-sm text-slate-600">
        {start} – {end}
      </p>
      {entry.notes && <p className="mt-2 text-sm text-slate-500">{entry.notes}</p>}
      <p className="mt-3 text-xs text-slate-400">Added by {entry.createdBy}</p>
    </article>
  )
}

