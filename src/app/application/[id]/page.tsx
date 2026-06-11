import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ApplicationDetailPage({
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

  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!application) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('application_id', id)
    .eq('user_id', user.id)

  return (
    <main className="p-6">
      <a href="/applications" className="text-sm text-gray-500">
        ← Back to applications
      </a>

        <a
  href={`/applications/${application.id}/edit`}
  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
>
  Edit
</a>
      <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{application.company}</h1>
            <p className="text-gray-500">{application.role}</p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {application.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p>{application.location || '—'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date Applied</p>
            <p>
              {application.date_applied
                ? new Date(application.date_applied).toLocaleDateString()
                : '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Application URL</p>
            {application.application_url ? (
              <a
                href={application.application_url}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                View posting
              </a>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Notes</h2>
          <p className="mt-2 text-sm text-gray-600">
            {application.notes || 'No notes yet.'}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Events</h2>

        <div className="mt-4 space-y-3">
          {events && events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="rounded-lg border p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {event.type} · {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No events yet.</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Contacts</h2>

        <div className="mt-4 space-y-3">
          {contacts && contacts.length > 0 ? (
            contacts.map((contact) => (
              <div key={contact.id} className="rounded-lg border p-3">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-500">
                  {contact.role || 'Contact'} · {contact.email || 'No email'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No contacts yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}