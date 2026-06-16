import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '../components/OceanUI'

const statusStyles: Record<string, string> = {
  saved: 'bg-cyan-100 text-cyan-800',
  applied: 'bg-amber-100 text-amber-800',
  online_assessment: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-indigo-100 text-indigo-800',
  offer: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  withdrawn: 'bg-slate-100 text-slate-700',
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const params = await searchParams
  const search = params.search?.toLowerCase() ?? ''
  const status = params.status ?? ''

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const filteredApplications = (applications ?? []).filter((app) => {
    const matchesSearch =
      !search ||
      [app.company, app.role, app.location, app.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

    const matchesStatus = !status || app.status === status

    return matchesSearch && matchesStatus
  })

  return (
    <OceanShell>
      <div className="space-y-6">
        <MotionPanel className="ocean-card relative overflow-hidden p-6">
          <div className="absolute -right-8 bottom-0 h-24 w-48 rounded-t-full bg-[#7bbca4]/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm font-bold text-[#0a6871] hover:underline">
                &lt;- Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Application reef</h1>
              <p className="mt-2 text-sm text-[#587071]">
                Organize internship opportunities by stage, date, and next action.
              </p>
            </div>

            <Link href="/application/addApplication" className="ocean-button">
              <span aria-hidden="true">+</span>
              Add application
            </Link>
          </div>
        </MotionPanel>

        <MotionPanel
          delay={0.06}
          className="ocean-card grid gap-3 p-5 sm:grid-cols-[1.6fr_0.9fr_auto]"
        >
          <form method="get" className="contents">
            <input
              name="search"
              defaultValue={params.search ?? ''}
              placeholder="Search company, role, or notes"
              className="ocean-input"
            />
            <select name="status" defaultValue={params.status ?? ''} className="ocean-input">
              <option value="">All statuses</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="online_assessment">Online Assessment</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
            <button type="submit" className="ocean-button">
              Filter
            </button>
          </form>
        </MotionPanel>

        <MotionPanel delay={0.12} className="ocean-card overflow-hidden">
          <div className="grid gap-4 p-5 text-sm font-bold text-[#587071] sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] sm:p-4">
            <span>Company</span>
            <span>Role</span>
            <span>Status</span>
            <span>Date applied</span>
            <span>Deadline</span>
          </div>
          <div className="divide-y divide-[#b9ddd8]/70 border-t border-[#b9ddd8]/70">
            {filteredApplications.map((app) => (
              <Link
                key={app.id}
                href={`/application/${app.id}`}
                className="grid gap-4 p-5 transition hover:bg-white/70 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="font-semibold text-[#103745]">{app.company}</p>
                  <p className="mt-1 text-sm text-[#587071]">{app.location || 'No location'}</p>
                </div>
                <span className="text-[#315965]">{app.role}</span>
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[app.status ?? ''] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {app.status?.replace(/_/g, ' ') ?? 'Unknown'}
                </span>
                <span className="text-[#315965]">
                  {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '-'}
                </span>
                <span className="text-[#315965]">{app.deadline ? new Date(app.deadline).toLocaleDateString() : '-'}</span>
              </Link>
            ))}
          </div>
          {filteredApplications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#587071]">No applications match your current filter.</div>
          ) : null}
        </MotionPanel>
      </div>
    </OceanShell>
  )
}
