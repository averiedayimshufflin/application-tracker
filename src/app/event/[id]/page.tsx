import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

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
    .select(
      `
      *,
      applications (
        id,
        company,
        role
      )
    `,
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  async function completeTask() {
    'use server'

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const { error } = await supabase
      .from('events')
      .update({ completed: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    redirect('/event')
  }

  if (!event) notFound()

  return (
    <OceanShell>
      <div className="mx-auto max-w-4xl">
        <MotionPanel className="mb-6">
          <Link href="/event" className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back to tide marks
          </Link>
        </MotionPanel>

        <MotionPanel delay={0.05} className="ocean-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="seal-pill">Task current</p>
              <h1 className="mt-3 text-3xl font-semibold text-[#103745]">{event.title}</h1>

              <p className="mt-2 text-sm text-[#587071]">
                {event.applications ? `${event.applications.company} · ${event.applications.role}` : 'General task'}
              </p>
            </div>

            <span className="rounded-full bg-[#d8f0ea] px-3 py-1 text-sm font-bold text-[#0a6871]">{event.type}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Date</p>
              <p className="mt-1 text-[#103745]">{new Date(event.date).toLocaleDateString()}</p>
            </div>

            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Time</p>
              <p className="mt-1 text-[#103745]">
                {new Date(event.date).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Related application</p>

              {event.applications ? (
                <Link href={`/application/${event.applications.id}`} className="mt-1 inline-flex font-bold text-[#0a6871] hover:underline">
                  {event.applications.company} - {event.applications.role}
                </Link>
              ) : (
                <p className="mt-1 text-[#103745]">None</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
            <h2 className="font-semibold text-[#103745]">Notes</h2>
            <p className="mt-2 text-sm text-[#587071]">{event.notes || 'No notes yet.'}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/event/${event.id}/edit`} className="ocean-button">
              Edit task
            </Link>

            <form action={completeTask}>
              <button type="submit" className="ocean-button-secondary">
                Mark complete
              </button>
            </form>
          </div>
        </MotionPanel>
      </div>
    </OceanShell>
  )
}
