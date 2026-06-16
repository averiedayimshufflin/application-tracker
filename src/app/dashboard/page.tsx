import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '../components/OceanUI'
import SignOutButton from '../components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const displayName = user.user_metadata?.display_name ?? user.user_metadata?.name
  if (!displayName) redirect('/profile')

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const totalApplications = applications?.length ?? 0
  const recentApplications =
    applications?.filter((application) => {
      const createdAt = application.created_at ? new Date(application.created_at) : null
      return createdAt && createdAt >= sevenDaysAgo
    }).length ?? 0
  const interviewingCount =
    applications?.filter((application) => ['interviewing', 'online_assessment'].includes(application.status)).length ?? 0
  const offerCount = applications?.filter((application) => application.status === 'offer').length ?? 0
  const rejectedCount = applications?.filter((application) => application.status === 'rejected').length ?? 0
  const upcomingDeadlineCount =
    applications?.filter((application) => {
      if (!application.deadline) return false
      const deadline = new Date(application.deadline)
      return deadline >= now && deadline <= thirtyDaysAhead
    }).length ?? 0

  const { data: upcomingTasks } = await supabase
    .from('events')
    .select(
      `
      *,
      applications (
        company,
        role
      )
    `,
    )
    .eq('user_id', user.id)
    .eq('completed', false)
    .gte('date', now.toISOString())
    .order('date', { ascending: true })
    .limit(5)

  const statusBreakdown = [
    { label: 'Saved', value: applications?.filter((item) => item.status === 'saved').length ?? 0, color: 'bg-cyan-100 text-cyan-800' },
    { label: 'Applied', value: applications?.filter((item) => item.status === 'applied').length ?? 0, color: 'bg-amber-100 text-amber-800' },
    { label: 'Interviewing', value: interviewingCount, color: 'bg-blue-100 text-blue-800' },
    { label: 'Offer', value: offerCount, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Rejected', value: rejectedCount, color: 'bg-rose-100 text-rose-800' },
  ]

  const metricCards = [
    {
      label: 'Total applications',
      value: totalApplications,
      note: `+${recentApplications} this week`,
      detail: `Keep the current moving, ${displayName}.`,
      accent: 'bg-[#0f8f93]',
    },
    {
      label: 'Interviewing',
      value: interviewingCount,
      note: 'Active interview pipeline',
      detail: 'Seal crew on standby.',
      accent: 'bg-[#2f80c1]',
    },
    {
      label: 'Offers',
      value: offerCount,
      note: 'Successful outcomes',
      detail: 'Bright surface wins.',
      accent: 'bg-[#43a66f]',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      note: 'Closed out',
      detail: 'Cleared from the harbor.',
      accent: 'bg-[#ff8f7a]',
    },
    {
      label: 'Upcoming deadlines',
      value: upcomingDeadlineCount,
      note: 'Next 30 days',
      detail: 'Watch the tide line.',
      accent: 'bg-[#f5c55f]',
    },
  ]

  return (
    <OceanShell>
      <div className="space-y-8">
        <MotionPanel className="ocean-card relative overflow-hidden p-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border border-white/70 bg-white/30" />
          <div className="absolute bottom-0 left-10 h-12 w-28 rounded-t-full bg-[#75b69b]/25" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="seal-pill">Harbor dashboard</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#103745]">Welcome back, {displayName}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#587071]">
                Your application reef, interview currents, and deadline tide pools are gathered into one calm view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/application" className="ocean-button-secondary">
                View applications
              </Link>
              <SignOutButton />
            </div>
          </div>
        </MotionPanel>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricCards.map((item, index) => (
            <MotionPanel key={item.label} delay={index * 0.05} className="ocean-tile relative overflow-hidden p-6">
              <span className={`absolute right-5 top-5 h-3 w-3 rounded-full ${item.accent}`} />
              <h2 className="text-xs font-bold uppercase text-[#587071]">{item.label}</h2>
              <p className="mt-4 text-4xl font-semibold text-[#103745]">{item.value}</p>
              <p className="mt-3 text-sm font-semibold text-[#0a6871]">{item.note}</p>
              <p className="mt-2 text-sm text-[#587071]">{item.detail}</p>
            </MotionPanel>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <MotionPanel delay={0.12} className="ocean-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#103745]">Status reef</h2>
                <p className="mt-1 text-[#587071]">A quick snapshot of your pipeline stages.</p>
              </div>
              <Link href="/application" className="text-sm font-bold text-[#0a6871] hover:underline">
                Manage applications
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#b9ddd8]/70 bg-white/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#315965]">{item.label}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </MotionPanel>

          <MotionPanel delay={0.18} className="ocean-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#103745]">Upcoming tide marks</h2>
                <p className="mt-1 text-[#587071]">Keep follow-ups and interviews on schedule.</p>
              </div>
              <Link href="/event" className="text-sm font-bold text-[#0a6871] hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingTasks && upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#b9ddd8]/70 bg-white/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#103745]">{task.title}</p>
                        <p className="text-sm text-[#587071]">
                          {task.applications ? `${task.applications.company} · ${task.applications.role}` : 'General task'}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#d8f0ea] px-2 py-1 text-xs font-semibold text-[#0a6871]">
                        {task.type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#587071]">{new Date(task.date).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#587071]">No upcoming tasks yet.</p>
              )}
            </div>

            <Link href="/event/add_event?from=/dashboard" className="ocean-button mt-4">
              Add task
            </Link>
          </MotionPanel>
        </div>
      </div>
    </OceanShell>
  )
}
