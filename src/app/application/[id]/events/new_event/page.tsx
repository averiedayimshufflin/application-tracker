import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

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
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-3xl p-6 sm:p-8">
        <div className="mb-6">
          <Link href={returnTo} className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back
          </Link>
          <p className="seal-pill mt-4">Application tide mark</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Add task for {application.company}</h1>
          <p className="mt-2 text-sm text-[#587071]">Capture a follow-up, interview, or reminder for this application.</p>
        </div>

        <form action={addEvent} className="space-y-4">
          <label className="block text-sm font-semibold text-[#315965]">
            Title
            <input name="title" required className="ocean-input mt-1" placeholder="Follow up with recruiter" />
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
              Date
              <input name="date" type="datetime-local" required className="ocean-input mt-1" />
            </label>
          </div>

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
