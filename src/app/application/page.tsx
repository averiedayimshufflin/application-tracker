import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const statusStyles: Record<string, string> = {
  saved: 'bg-sky-100 text-sky-700',
  applied: 'bg-amber-100 text-amber-700',
  online_assessment: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,255,1),_rgba(219,234,254,0.9))] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm font-medium text-sky-700 hover:text-sky-900">
                ← Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Applications</h1>
              <p className="mt-2 text-sm text-slate-600">Organize internship opportunities by stage, date, and next action.</p>
            </div>

            <Link
              href="/application/addApplication"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add application
            </Link>
          </div>
        </div>

        <form method="get" className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm sm:grid-cols-[1.6fr_0.9fr_auto]">
          <input
            name="search"
            defaultValue={params.search ?? ''}
            placeholder="Search company, role, or notes"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
          />
          <select
            name="status"
            defaultValue={params.status ?? ''}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">All statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="online_assessment">Online Assessment</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Filter
          </button>
        </form>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-sm">
          <div className="grid gap-4 p-5 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] text-sm font-semibold text-slate-500 sm:p-4">
            <span>Company</span>
            <span>Role</span>
            <span>Status</span>
            <span>Date applied</span>
            <span>Deadline</span>
          </div>
          <div className="divide-y border-t border-slate-200">
            {filteredApplications.map((app) => (
              <Link
                key={app.id}
                href={`/application/${app.id}`}
                className="grid gap-4 p-5 transition hover:bg-slate-50 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="font-semibold text-slate-950">{app.company}</p>
                  <p className="mt-1 text-sm text-slate-500">{app.location || 'No location'}</p>
                </div>
                <span className="text-slate-700">{app.role}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[app.status ?? ''] ?? 'bg-slate-100 text-slate-700'}`}>
                  {app.status?.replace(/_/g, ' ') ?? 'Unknown'}
                </span>
                <span className="text-slate-700">{app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '—'}</span>
                <span className="text-slate-700">{app.deadline ? new Date(app.deadline).toLocaleDateString() : '—'}</span>
              </Link>
            ))}
          </div>
          {filteredApplications.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No applications match your current filter.</div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
