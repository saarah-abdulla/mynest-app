import type { Caregiver, Child } from '../types/entities'

interface Props {
  child: Child
}

export function ChildOverviewCard({ child }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Child overview
          </p>
          <h3 className="text-lg font-semibold text-slate-900">{child.fullName}</h3>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {child.school ?? 'Home'}
        </span>
      </header>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Age</dt>
          <dd className="font-medium text-slate-900">{getAge(child.birthdate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Care team</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {child.caregivers.map((caregiver: Caregiver) => (
              <span
                key={caregiver.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {caregiver.fullName}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function getAge(birthdate: string) {
  const diff = Date.now() - new Date(birthdate).getTime()
  const ageDate = new Date(diff)
  return Math.abs(ageDate.getUTCFullYear() - 1970) + ' yrs'
}

