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
    const deadline = formData.get('deadline') as string
    const followUpDate = formData.get('follow_up_date') as string
    const salary = formData.get('salary') as string
    const resumeVersion = formData.get('resume_version') as string
    const location = formData.get('location') as string
    const notes = formData.get('notes') as string

    const metadata = [
      deadline ? `Deadline: ${deadline}` : '',
      followUpDate ? `Follow-up: ${followUpDate}` : '',
      salary ? `Salary: ${salary}` : '',
      resumeVersion ? `Resume: ${resumeVersion}` : '',
    ].filter(Boolean)

    const combinedNotes = [notes, ...metadata].filter(Boolean).join('\n')

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      company,
      role,
      status,
      application_url: applicationUrl || null,
      date_applied: dateApplied || null,
      deadline: deadline || null,
      location,
      notes: combinedNotes,
    })

    if (error) {
      console.error(error)
      return
    }

    redirect('/application')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Application</h1>
          <p className="text-sm text-gray-500">Capture the essentials for a new internship application.</p>
        </div>

        <form action={addApplication} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Company</label>
              <input name="company" required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Google" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <input name="role" required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Software Engineering Intern" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select name="status" defaultValue="saved" className="mt-1 w-full rounded-lg border px-3 py-2">
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
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input name="location" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="New York, NY or Remote" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Application URL</label>
              <input name="application_url" type="url" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="https://..." />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date Applied</label>
              <input name="date_applied" type="date" className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Deadline</label>
              <input name="deadline" type="date" className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Follow-up date</label>
              <input name="follow_up_date" type="date" className="mt-1 w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Salary</label>
              <input name="salary" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="$20/hr" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Resume version</label>
              <input name="resume_version" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="v2" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Referral, recruiter name, interview notes, etc." />
          </div>

          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            Save Application
          </button>
        </form>
      </div>
    </main>
  )
}