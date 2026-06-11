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
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-gray-500">
            View your upcoming interviews, deadlines, follow-ups, and general tasks.
          </p>
        </div>

        <a
          href="/events/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Add Task
        </a>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {events && events.length > 0 ? (
          <div className="divide-y">
            {events.map((event) => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="block p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.title}
                    </p>

                    <p className="text-sm text-gray-500">
                      {event.applications
                        ? `${event.applications.company} · ${event.applications.role}`
                        : 'General task'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-700">
                      {new Date(event.date).toLocaleDateString()}
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {event.type}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-gray-500">
            No upcoming tasks yet.
          </p>
        )}
      </div>
    </main>
  )
}