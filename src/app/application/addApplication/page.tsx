import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

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
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-3xl p-6 sm:p-8">
        <div className="mb-6">
          <Link href="/application" className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back to applications
          </Link>
          <p className="seal-pill mt-4">New shell</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Add application</h1>
          <p className="mt-2 text-sm text-[#587071]">Capture the essentials for a new internship application.</p>
        </div>

        <form action={addApplication} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Company
              <input name="company" required className="ocean-input mt-1" placeholder="Google" />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Role
              <input name="role" required className="ocean-input mt-1" placeholder="Software Engineering Intern" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Status
              <select name="status" defaultValue="saved" className="ocean-input mt-1">
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="online_assessment">Online Assessment</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Location
              <input name="location" className="ocean-input mt-1" placeholder="New York, NY or Remote" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Application URL
              <input name="application_url" type="url" className="ocean-input mt-1" placeholder="https://..." />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Date applied
              <input name="date_applied" type="date" className="ocean-input mt-1" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Deadline
              <input name="deadline" type="date" className="ocean-input mt-1" />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Follow-up date
              <input name="follow_up_date" type="date" className="ocean-input mt-1" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Salary
              <input name="salary" className="ocean-input mt-1" placeholder="$20/hr" />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Resume version
              <input name="resume_version" className="ocean-input mt-1" placeholder="v2" />
            </label>
          </div>

          <label className="block text-sm font-semibold text-[#315965]">
            Notes
            <textarea
              name="notes"
              className="ocean-input mt-1 min-h-28"
              placeholder="Referral, recruiter name, interview notes, etc."
            />
          </label>

          <button type="submit" className="ocean-button">
            Save application
          </button>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
