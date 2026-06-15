import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parseMetadata(notes: string, label: string) {
  const match = notes.match(new RegExp(`${label}:\\s*(.+)`, 'i'))
  return match?.[1]?.trim() ?? ''
}

function stripMetadata(notes: string) {
  return notes
    .split('\n')
    .filter((line) => !/^(deadline|follow-up|salary|resume):/i.test(line))
    .join('\n')
    .trim()
}

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

  async function deleteApplication() {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    await supabase.from('applications').delete().eq('id', id).eq('user_id', user.id)
    redirect('/application')
  }

  async function addContact(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const notes = formData.get('notes') as string

    if (!name) return

    await supabase.from('contacts').insert({
      user_id: user.id,
      application_id: id,
      name,
      email,
      role,
      notes,
    })

    redirect(`/application/${id}`)
  }

  const notesText = application.notes || ''
  const deadline = parseMetadata(notesText, 'Deadline')
  const followUpDate = parseMetadata(notesText, 'Follow-up')
  const salary = parseMetadata(notesText, 'Salary')
  const resumeVersion = parseMetadata(notesText, 'Resume')
  const cleanNotes = stripMetadata(notesText)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/application" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to applications
          </a>

          <div className="flex gap-3">
            <a href={`/application/${application.id}/edit`} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
              Edit
            </a>
            <form action={deleteApplication}>
              <button type="submit" className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{application.company}</h1>
              <p className="text-gray-500">{application.role}</p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{application.status}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="mt-1">{application.location || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Applied</p>
              <p className="mt-1">{application.date_applied ? new Date(application.date_applied).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="mt-1">{deadline || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Follow-up</p>
              <p className="mt-1">{followUpDate || '—'}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Application URL</p>
              {application.application_url ? (
                <a href={application.application_url} target="_blank" className="mt-1 text-blue-600 hover:underline">
                  View posting
                </a>
              ) : (
                <p className="mt-1">—</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Resume Version</p>
              <p className="mt-1">{resumeVersion || '—'}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">Notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{cleanNotes || 'No notes yet.'}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Events</h2>
              <a href="/event/add_event" className="text-sm font-medium text-blue-600 hover:underline">
                Add task
              </a>
            </div>

            <div className="mt-4 space-y-3">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.type} · {new Date(event.date).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No events yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>

            <form action={addContact} className="mt-4 space-y-3">
              <input name="name" required className="w-full rounded-lg border px-3 py-2" placeholder="Contact name" />
              <input name="email" type="email" className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
              <input name="role" className="w-full rounded-lg border px-3 py-2" placeholder="Recruiter, interviewer, etc." />
              <textarea name="notes" className="w-full rounded-lg border px-3 py-2" placeholder="Notes about this contact" />
              <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
                Save contact
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div key={contact.id} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.role || 'Contact'} · {contact.email || 'No email'}</p>
                    {contact.notes ? <p className="mt-2 text-sm text-gray-600">{contact.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No contacts yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}