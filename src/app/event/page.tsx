import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: events } = await supabase
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

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-500">Upcoming interviews, deadlines, follow-ups, and planning reminders.</p>
          </div>

          <Link href="/event/add_event?from=/event" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            Add Task
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {events && events.length > 0 ? (
            <div className="divide-y">
              {events.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`} className="block p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {event.applications ? `${event.applications.company} · ${event.applications.role}` : 'General task'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-700">{new Date(event.date).toLocaleDateString()}</p>
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{event.type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-gray-500">No upcoming tasks yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}