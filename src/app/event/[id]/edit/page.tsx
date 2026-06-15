import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EditEventPage({
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
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!event) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, company, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  async function updateEvent(formData: FormData) {
    'use server'

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const title = formData.get('title') as string
    const type = formData.get('type') as string
    const date = formData.get('date') as string
    const notes = formData.get('notes') as string
    const applicationId = formData.get('application_id') as string

    const { error } = await supabase
      .from('events')
      .update({
        title,
        type,
        date,
        notes,
        application_id: applicationId || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    redirect(`/event/${id}`)
  }

  return (
    <main className="p-6">
      <a href={`/event/${id}`} className="text-sm text-gray-500">
        ← Back to task
      </a>

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-bold">Edit Task</h1>
        <p className="text-sm text-gray-500">
          Update this task, reminder, deadline, or interview.
        </p>
      </div>

      <form action={updateEvent} className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            required
            defaultValue={event.title}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            defaultValue={event.type}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="interview">Interview</option>
            <option value="deadline">Deadline</option>
            <option value="online_assessment">Online Assessment</option>
            <option value="follow_up">Follow-up</option>
            <option value="coffee_chat">Coffee Chat</option>
            <option value="career_fair">Career Fair</option>
            <option value="study">Study</option>
            <option value="resume">Resume</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            name="date"
            type="datetime-local"
            required
            defaultValue={
              event.date
                ? new Date(event.date).toISOString().slice(0, 16)
                : ''
            }
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Related Application</label>
          <select
            name="application_id"
            defaultValue={event.application_id || ''}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="">None — general task</option>

            {applications?.map((app) => (
              <option key={app.id} value={app.id}>
                {app.company} — {app.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            defaultValue={event.notes || ''}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save Changes
        </button>
      </form>
    </main>
  )
}