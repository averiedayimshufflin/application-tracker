import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NewGeneralEventPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: applications } = await supabase
    .from('applications')
    .select('id, company, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  async function addEvent(formData: FormData) {
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

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      application_id: applicationId || null,
      title,
      type,
      date,
      notes,
    })

    if (error) {
      console.error(error)
      return
    }

    redirect('/event')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Task</h1>
          <p className="text-sm text-gray-500">Add a reminder, deadline, interview, or follow-up tied to one of your applications.</p>
        </div>

        <form action={addEvent} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input name="title" required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Apply to 5 internships" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select name="type" defaultValue="general" className="mt-1 w-full rounded-lg border px-3 py-2">
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
              <label className="text-sm font-medium text-gray-700">Related application</label>
              <select name="application_id" defaultValue="" className="mt-1 w-full rounded-lg border px-3 py-2">
                <option value="">None — general task</option>
                {applications?.map((app) => (
                  <option key={app.id} value={app.id}>{app.company} — {app.role}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input name="date" type="datetime-local" required className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Optional details..." />
          </div>

          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            Save Task
          </button>
        </form>
      </div>
    </main>
  )
}