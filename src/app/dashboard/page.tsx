import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '../components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const totalApplications = applications?.length ?? 0
  const recentApplications = applications?.filter((application) => {
    const createdAt = application.created_at ? new Date(application.created_at) : null
    return createdAt && createdAt >= sevenDaysAgo
  }).length ?? 0
  const interviewingCount = applications?.filter((application) =>
    ['interviewing', 'online_assessment'].includes(application.status),
  ).length ?? 0
  const offerCount = applications?.filter((application) => application.status === 'offer').length ?? 0
  const rejectedCount = applications?.filter((application) => application.status === 'rejected').length ?? 0
  const upcomingDeadlineCount = applications?.filter((application) => {
    if (!application.deadline) return false
    const deadline = new Date(application.deadline)
    return deadline >= now && deadline <= thirtyDaysAhead
  }).length ?? 0

  const { data: upcomingTasks } = await supabase
    .from('events')
    .select(`
      *,
      applications (
        company,
        role
      )
    `)
    .eq('user_id', user.id)
    .eq('completed', false)
    .gte('date', now.toISOString())
    .order('date', { ascending: true })
    .limit(5)

  const statusBreakdown = [
    { label: 'Saved', value: applications?.filter((item) => item.status === 'saved').length ?? 0, color: 'bg-slate-100 text-slate-700' },
    { label: 'Applied', value: applications?.filter((item) => item.status === 'applied').length ?? 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'Interviewing', value: interviewingCount, color: 'bg-amber-100 text-amber-700' },
    { label: 'Offer', value: offerCount, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Rejected', value: rejectedCount, color: 'bg-rose-100 text-rose-700' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(234,244,255,0.9))] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Arctic dashboard</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Welcome back, {user.email}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your application pipeline, interview tasks, and follow-up reminders all in one polished view.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/application" className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                View applications
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Total applications</h2>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{totalApplications}</p>
            <p className="mt-3 text-sm text-sky-700">+{recentApplications} this week</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Interviewing</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">{interviewingCount}</h1>
            <p className="mt-2 text-sm text-gray-500">Active interview pipeline</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Offers</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">{offerCount}</h1>
            <p className="mt-2 text-sm text-gray-500">Successful outcomes</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Rejected</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">{rejectedCount}</h1>
            <p className="mt-2 text-sm text-gray-500">Closed out</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">Upcoming deadlines</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">{upcomingDeadlineCount}</h1>
            <p className="mt-2 text-sm text-gray-500">Next 30 days</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Status overview</h2>
                <p className="mt-1 text-gray-500">A quick snapshot of your pipeline stages.</p>
              </div>
              <Link href="/application" className="text-sm font-medium text-blue-600 hover:underline">
                Manage applications
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Upcoming tasks</h2>
                <p className="mt-1 text-gray-500">Keep follow-ups and interviews on schedule.</p>
              </div>
              <Link href="/event" className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingTasks && upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {task.applications ? `${task.applications.company} · ${task.applications.role}` : 'General task'}
                        </p>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{task.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{new Date(task.date).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming tasks yet.</p>
              )}
            </div>

            <Link href="/event/add_event?from=/dashboard" className="mt-4 inline-flex rounded-lg bg-black px-3 py-2 text-sm font-medium text-white">
              Add task
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}