import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

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
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-2xl p-6 sm:p-8">
        <div className="mb-6">
          <Link href={`/event/${id}`} className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back to task
          </Link>
          <p className="seal-pill mt-4">Tune current</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Edit task</h1>
          <p className="mt-2 text-sm text-[#587071]">Update this reminder, deadline, or interview.</p>
        </div>

        <form action={updateEvent} className="space-y-4">
          <label className="block text-sm font-semibold text-[#315965]">
            Title
            <input name="title" required defaultValue={event.title} className="ocean-input mt-1" />
          </label>

          <label className="block text-sm font-semibold text-[#315965]">
            Type
            <select name="type" defaultValue={event.type} className="ocean-input mt-1">
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
          </label>

          <label className="block text-sm font-semibold text-[#315965]">
            Date
            <input
              name="date"
              type="datetime-local"
              required
              defaultValue={event.date ? new Date(event.date).toISOString().slice(0, 16) : ''}
              className="ocean-input mt-1"
            />
          </label>

          <label className="block text-sm font-semibold text-[#315965]">
            Related application
            <select name="application_id" defaultValue={event.application_id || ''} className="ocean-input mt-1">
              <option value="">None - general task</option>

              {applications?.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} - {app.role}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-[#315965]">
            Notes
            <textarea name="notes" defaultValue={event.notes || ''} className="ocean-input mt-1 min-h-28" />
          </label>

          <button type="submit" className="ocean-button">
            Save changes
          </button>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
