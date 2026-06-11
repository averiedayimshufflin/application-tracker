import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default function NewApplicationPage() {
  async function addApplication(formData: FormData) {
    'use server'

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const company = formData.get('company') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string
    const applicationUrl = formData.get('application_url') as string
    const dateApplied = formData.get('date_applied') as string
    const location = formData.get('location') as string
    const notes = formData.get('notes') as string

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      company,
      role,
      status,
      application_url: applicationUrl,
      date_applied: dateApplied || null,
      location,
      notes,
    })

    if (error) {
      console.error(error)
      return
    }

    redirect('/applications')
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Application</h1>
        <p className="text-sm text-gray-500">
          Track a new internship or job application.
        </p>
      </div>

      <form action={addApplication} className="max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium">Company</label>
          <input
            name="company"
            required
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Google"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Role</label>
          <input
            name="role"
            required
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Software Engineering Intern"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue="saved"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="online_assessment">Online Assessment</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Application URL</label>
          <input
            name="application_url"
            type="url"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date Applied</label>
          <input
            name="date_applied"
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input
            name="location"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="New York, NY or Remote"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Referral, recruiter name, interview notes, etc."
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Save Application
        </button>
      </form>
    </main>
  )
}