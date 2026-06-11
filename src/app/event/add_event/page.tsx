import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NewGeneralEventPage() {
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

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      application_id: null,
      title,
      type,
      date,
      notes,
    })

    if (error) {
      console.error(error)
      return
    }

    redirect('/dashboard')
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Task</h1>
        <p className="text-sm text-gray-500">
          Add a general task, reminder, event, or internship-search activity.
        </p>
      </div>

      <form action={addEvent} className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Apply to 5 internships"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            defaultValue="general"
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
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Optional details..."
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save Task
        </button>
      </form>
    </main>
  )
}