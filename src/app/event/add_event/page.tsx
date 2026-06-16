import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

export default async function NewGeneralEventPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const params = await searchParams
  const returnTo = params.from && params.from.startsWith('/') ? params.from : '/event'

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

    redirect(returnTo)
  }

  return (
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-3xl p-6 sm:p-8">
        <div className="mb-6">
          <Link href={returnTo} className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back
          </Link>
          <p className="seal-pill mt-4">New tide mark</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Add task</h1>
          <p className="mt-2 text-sm text-[#587071]">
            Add a reminder, deadline, interview, or follow-up tied to one of your applications.
          </p>
        </div>

        <form action={addEvent} className="space-y-4">
          <label className="block text-sm font-semibold text-[#315965]">
            Title
            <input name="title" required className="ocean-input mt-1" placeholder="Apply to 5 internships" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Type
              <select name="type" defaultValue="general" className="ocean-input mt-1">
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

            <label className="text-sm font-semibold text-[#315965]">
              Related application
              <select name="application_id" defaultValue="" className="ocean-input mt-1">
                <option value="">None - general task</option>
                {applications?.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} - {app.role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold text-[#315965]">
            Date
            <input name="date" type="datetime-local" required className="ocean-input mt-1" />
          </label>

          <label className="block text-sm font-semibold text-[#315965]">
            Notes
            <textarea name="notes" className="ocean-input mt-1 min-h-28" placeholder="Optional details..." />
          </label>

          <button type="submit" className="ocean-button">
            Save task
          </button>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
