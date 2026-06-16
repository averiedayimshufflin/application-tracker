import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '../components/OceanUI'

export default async function EventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: events } = await supabase
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
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })

  return (
    <OceanShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <MotionPanel className="ocean-card relative overflow-hidden p-6">
          <div className="absolute right-10 top-6 h-16 w-16 rounded-full border border-white/70 bg-white/35" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/dashboard" className="text-sm font-bold text-[#0a6871] hover:underline">
                &lt;- Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Tide marks</h1>
              <p className="mt-2 text-sm text-[#587071]">
                Upcoming interviews, follow-ups, and deadlines to keep your search moving.
              </p>
            </div>

            <Link href="/event/add_event?from=/event" className="ocean-button">
              <span aria-hidden="true">+</span>
              Add task
            </Link>
          </div>
        </MotionPanel>

        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <MotionPanel key={event.id} delay={index * 0.04}>
                <Link
                  href={`/event/${event.id}`}
                  className="ocean-tile block p-6 transition hover:-translate-y-0.5 hover:bg-white/85"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[#103745]">{event.title}</p>
                      <p className="mt-2 text-sm text-[#587071]">
                        {event.applications ? `${event.applications.company} · ${event.applications.role}` : 'General task'}
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-[#d8f0ea] px-3 py-1 text-xs font-bold uppercase text-[#0a6871]">
                      {event.type}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-[#587071]">{new Date(event.date).toLocaleString()}</p>
                </Link>
              </MotionPanel>
            ))
          ) : (
            <MotionPanel className="ocean-card p-6 text-center text-sm text-[#587071]">No upcoming tasks yet.</MotionPanel>
          )}
        </div>
      </div>
    </OceanShell>
  )
}
