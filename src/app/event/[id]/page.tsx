import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      applications (
        id,
        company,
        role
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!event) notFound()

  return (
    <main className="p-6">
      <a href="/events" className="text-sm text-gray-500">
        ← Back to tasks
      </a>

      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>

            <p className="mt-1 text-sm text-gray-500">
              {event.applications
                ? `${event.applications.company} · ${event.applications.role}`
                : 'General task'}
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {event.type}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p>{new Date(event.date).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p>
              {new Date(event.date).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Related Application</p>

            {event.applications ? (
              <a
                href={`/applications/${event.applications.id}`}
                className="text-blue-600 hover:underline"
              >
                {event.applications.company} — {event.applications.role}
              </a>
            ) : (
              <p>None</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Notes</h2>
          <p className="mt-2 text-sm text-gray-600">
            {event.notes || 'No notes yet.'}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`/events/${event.id}/edit`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Edit Task
          </a>
        </div>
      </div>
    </main>
  )
}