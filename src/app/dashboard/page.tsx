import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '../components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: allApplications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

  const { data: pastWeekApp } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: interviews } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'interview')

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('user_id', user.id)

  const { data: follow_ups } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'follow_up')

  const { data: overdue_follow_ups } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'follow_up')
    .lte('date', new Date().toISOString())

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
  .gte('date', new Date().toISOString())
  .order('date', { ascending: true })
  .limit(5)

  function ProgressBar({ value }: { value: number }) {
    return (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    )
  }
  

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-sm text-gray-600">
          Welcome <span className="font-medium text-gray-900">{user.email}</span>
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm border border-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-gray-500">Internship Search</p>
          </div>

          <SignOutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Total applications</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">
              {allApplications?.length ?? 0}
            </h1>
            <p className="mt-2 text-sm text-green-600">
              {"+" + (pastWeekApp?.length ?? "No")} applications from the past week
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Upcoming Interviews</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">
              {interviews?.length ?? 0}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {allApplications?.length && interviews
                ? (interviews.length / allApplications.length * 100).toFixed(2)
                : '0'}% response rate
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Offers</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">
              {offers?.length ?? 0}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {allApplications && offers
                ? (offers.length / allApplications.length * 100).toFixed(2)
                : '0'}% offer rate
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Follow-ups</h2>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">
              {follow_ups?.length ?? 0}
            </h1>
            <p className="mt-2 text-sm text-red-600">
              {overdue_follow_ups?.length ?? 0} overdue
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Application Timeline</h2>
            <p className="mt-1 text-gray-500">
              Visualize your application history and upcoming events.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-400">
            Timeline coming soon
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700 border border-blue-100">
          <p>Saved {allApplications?.length ?? 0} applications</p>
        </div>
      </div>
      <section className="rounded-xl border bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">
    Upcoming Tasks
  </h2>

  <div className="mt-4 space-y-3">
    {upcomingTasks && upcomingTasks.length > 0 ? (
      upcomingTasks.map((task) => (
        <>
        <div
          key={task.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium text-gray-900">
              {task.title}
            </p>

            <p className="text-sm text-gray-500">
              {task.applications?.company} · {task.applications?.role}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
  {task.type}
</span>
          <p className="text-sm text-gray-500">
            {new Date(task.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
  {task.applications
    ? `${task.applications.company} · ${task.applications.role}`
    : 'General task'}
</p>
        </div>
        </>
      ))
      
    ) : (
      <p className="text-sm text-gray-500">
        No upcoming tasks.
      </p>
    
  )
    }
    <a href="/event" className="text-sm text-gray-500 hover:text-gray-900">
  View all
</a>
    <a
  href="/event/add_event"
  className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white"
>
  Add Task
</a>

  </div>
</section>
    </div>
  )
}