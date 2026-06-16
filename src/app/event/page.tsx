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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,255,1),_rgba(219,234,254,0.9))] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm font-medium text-sky-700 hover:text-sky-900">
                ← Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Tasks</h1>
              <p className="mt-2 text-sm text-slate-600">Upcoming interviews, follow-ups, and deadlines to keep your search moving.</p>
            </div>

            <Link
              href="/event/add_event?from=/event"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add task
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="block rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{event.title}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {event.applications ? `${event.applications.company} · ${event.applications.role}` : 'General task'}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
                    {event.type}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-600">{new Date(event.date).toLocaleString()}</p>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 text-center text-sm text-slate-600 shadow-sm">
              No upcoming tasks yet.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
