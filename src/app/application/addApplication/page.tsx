'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

export default function NewApplicationPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function addApplication(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(formEvent.currentTarget)

    const company = ((formData.get('company') as string | null) ?? '').trim()
    const role = ((formData.get('role') as string | null) ?? '').trim()
    const status = ((formData.get('status') as string | null) ?? 'saved').trim()
    const jobUrl = ((formData.get('job_url') as string | null) ?? '').trim()
    const dateApplied = ((formData.get('date_applied') as string | null) ?? '').trim()
    const deadline = ((formData.get('deadline') as string | null) ?? '').trim()
    const followUpDate = ((formData.get('follow_up_date') as string | null) ?? '').trim()
    const salary = ((formData.get('salary') as string | null) ?? '').trim()
    const resumeFile = ((formData.get('resume_file') as string | null) ?? '').trim()
    const location = ((formData.get('location') as string | null) ?? '').trim()
    const notes = ((formData.get('notes') as string | null) ?? '').trim()

    if (!company || !role) {
      setSaving(false)
      setError('Company and role are required.')
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      router.replace('/')
      return
    }

    const metadata = [followUpDate ? `Follow-up: ${followUpDate}` : ''].filter(Boolean)
    const combinedNotes = [notes, ...metadata].filter(Boolean).join('\n')

    const payload = {
      user_id: user.id,
      company,
      role,
      status,
      job_url: jobUrl || null,
      date_applied: dateApplied || null,
      deadline: deadline || null,
      salary: salary || null,
      resume_file: resumeFile || null,
      location: location || null,
      notes: combinedNotes || null,
    }

    const { error: insertError } = await supabase.from('applications').insert(payload)

    if (insertError) {
      const isFK = insertError.code === '23503' || /foreign key/i.test(insertError.message || '')

      if (isFK) {
        setSaving(false)
        setError('Your account profile is not ready yet. Sign out and back in, then try again.')
        return
      } else {
        setSaving(false)
        setError(insertError.message)
        return
      }
    }

    setSaving(false)
    router.push('/application')
    router.refresh()
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

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={addApplication} className="space-y-4">
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
              <input name="job_url" type="url" className="ocean-input mt-1" placeholder="https://..." />
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
              Resume file
              <input name="resume_file" className="ocean-input mt-1" placeholder="resume-v2.pdf" />
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

          <button type="submit" disabled={saving} className="ocean-button disabled:opacity-60">
            {saving ? 'Saving...' : 'Save application'}
          </button>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
