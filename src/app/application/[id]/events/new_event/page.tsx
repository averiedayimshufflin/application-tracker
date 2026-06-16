import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function NewApplicationEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const returnTo = query.from && query.from.startsWith('/') ? query.from : `/application/${id}`

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: application } = await supabase
    .from('applications')
    .select('id, company, role')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!application) redirect('/application')

  async function addEvent(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const title = (formData.get('title') as string | null)?.trim() ?? ''
    const type = (formData.get('type') as string | null) ?? 'general'
    const date = (formData.get('date') as string | null) ?? ''
    const notes = (formData.get('notes') as string | null) ?? ''

    if (!title || !date) return

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      application_id: id,
      title,
      type,
      date,
      notes,
    })

    if (error) {
      console.error(error)
      return
    }

    redirect(returnTo)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link href={returnTo} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Add Task for {application.company}</h1>
          <p className="text-sm text-gray-500">Capture a follow-up, interview, or reminder for this application.</p>
        </div>

        <form action={addEvent} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input name="title" required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Follow up with recruiter" />
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
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input name="date" type="datetime-local" required className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
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
