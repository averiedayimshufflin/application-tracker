'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FloatingSeal, MotionPanel, OceanShell, TideButton } from '@/app/components/OceanUI'

type ApplicationFormState = {
  company: string
  role: string
  status: string
  location: string
  jobUrl: string
  dateApplied: string
  deadline: string
  followUpDate: string
  salary: string
  resumeFile: string
  notes: string
}

type LoadedApplication = {
  id: string
  company: string | null
  role: string | null
  status: string | null
  location: string | null
  job_url: string | null
  date_applied: string | null
  deadline: string | null
  salary: string | null
  resume_file: string | null
  notes: string | null
}

const emptyForm: ApplicationFormState = {
  company: '',
  role: '',
  status: 'saved',
  location: '',
  jobUrl: '',
  dateApplied: '',
  deadline: '',
  followUpDate: '',
  salary: '',
  resumeFile: '',
  notes: '',
}

function parseMetadata(notes: string, label: string) {
  const match = notes.match(new RegExp(`${label}:\\s*(.+)`, 'i'))
  return match?.[1]?.trim() ?? ''
}

function stripMetadata(notes: string) {
  return notes
    .split('\n')
    .filter((line) => !/^(deadline|follow-up|salary|resume):/i.test(line))
    .join('\n')
    .trim()
}

function formatDateField(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const applicationId = typeof params.id === 'string' ? params.id : ''

  const [form, setForm] = useState<ApplicationFormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [application, setApplication] = useState<LoadedApplication | null>(null)

  useEffect(() => {
    let active = true

    async function loadApplication() {
      if (!applicationId) {
        setError('Missing application id.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/')
        return
      }

      const { data, error: loadError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (loadError) {
        setError(loadError.message)
        setLoading(false)
        return
      }

      if (!data) {
        setError('Application not found.')
        setLoading(false)
        return
      }

      const loadedApplication = data as LoadedApplication
      const notes = loadedApplication.notes ?? ''

      setApplication(loadedApplication)
      setForm({
        company: loadedApplication.company ?? '',
        role: loadedApplication.role ?? '',
        status: loadedApplication.status ?? 'saved',
        location: loadedApplication.location ?? '',
        jobUrl: loadedApplication.job_url ?? '',
        dateApplied: formatDateField(loadedApplication.date_applied),
        deadline: formatDateField(loadedApplication.deadline),
        followUpDate: parseMetadata(notes, 'Follow-up'),
        salary: loadedApplication.salary ?? '',
        resumeFile: loadedApplication.resume_file ?? '',
        notes: stripMetadata(notes),
      })
      setLoading(false)
    }

    loadApplication()

    return () => {
      active = false
    }
  }, [applicationId, router])

  function setField(field: keyof ApplicationFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)

    if (!applicationId) {
      setSaving(false)
      setError('Missing application id.')
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

    const metadata = [form.followUpDate ? `Follow-up: ${form.followUpDate}` : ''].filter(Boolean)
    const combinedNotes = [form.notes.trim(), ...metadata].filter(Boolean).join('\n')

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status.trim() || 'saved',
      location: form.location.trim() || null,
      job_url: form.jobUrl.trim() || null,
      date_applied: form.dateApplied || null,
      deadline: form.deadline || null,
      salary: form.salary.trim() || null,
      resume_file: form.resumeFile.trim() || null,
      notes: combinedNotes || null,
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update(payload)
      .eq('id', applicationId)
      .eq('user_id', user.id)

    if (updateError) {
      setSaving(false)
      setError(updateError.message)
      return
    }

    setSaving(false)
    router.push(`/application/${applicationId}`)
    router.refresh()
  }

  if (loading) {
    return (
      <OceanShell>
        <MotionPanel className="ocean-card mx-auto max-w-3xl p-8 text-center">
          <FloatingSeal className="mx-auto h-28 w-28" />
          <p className="mt-5 text-sm font-semibold text-[#587071]">Loading your application shell...</p>
        </MotionPanel>
      </OceanShell>
    )
  }

  return (
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-4xl overflow-hidden p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href={`/application/${applicationId}`} className="text-sm font-bold text-[#0a6871] hover:underline">
              &lt;- Back to application
            </Link>
            <p className="seal-pill mt-4">Tide tuner</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#103745]">Edit application</h1>
            <p className="mt-2 text-sm text-[#587071]">
              Update the details for {application?.company || 'this application'} and keep the reef tidy.
            </p>
          </div>

          <div className="rounded-3xl border border-[#b9ddd8]/70 bg-white/70 px-4 py-3 text-sm text-[#315965]">
            <p className="font-semibold text-[#103745]">{application?.company || 'Application'}</p>
            <p>{application?.role || 'Role not set'}</p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Company
              <input
                value={form.company}
                onChange={(event) => setField('company', event.target.value)}
                required
                className="ocean-input mt-1"
                placeholder="Google"
              />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Role
              <input
                value={form.role}
                onChange={(event) => setField('role', event.target.value)}
                required
                className="ocean-input mt-1"
                placeholder="Software Engineering Intern"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Status
              <select
                value={form.status}
                onChange={(event) => setField('status', event.target.value)}
                className="ocean-input mt-1"
              >
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
              <input
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                className="ocean-input mt-1"
                placeholder="New York, NY or Remote"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Application URL
              <input
                value={form.jobUrl}
                onChange={(event) => setField('jobUrl', event.target.value)}
                type="url"
                className="ocean-input mt-1"
                placeholder="https://..."
              />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Date applied
              <input
                value={form.dateApplied}
                onChange={(event) => setField('dateApplied', event.target.value)}
                type="date"
                className="ocean-input mt-1"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Deadline
              <input
                value={form.deadline}
                onChange={(event) => setField('deadline', event.target.value)}
                type="date"
                className="ocean-input mt-1"
              />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Follow-up date
              <input
                value={form.followUpDate}
                onChange={(event) => setField('followUpDate', event.target.value)}
                type="date"
                className="ocean-input mt-1"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#315965]">
              Salary
              <input
                value={form.salary}
                onChange={(event) => setField('salary', event.target.value)}
                className="ocean-input mt-1"
                placeholder="$20/hr"
              />
            </label>

            <label className="text-sm font-semibold text-[#315965]">
              Resume file
              <input
                value={form.resumeFile}
                onChange={(event) => setField('resumeFile', event.target.value)}
                className="ocean-input mt-1"
                placeholder="resume-v2.pdf"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-[#315965]">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setField('notes', event.target.value)}
              className="ocean-input mt-1 min-h-28"
              placeholder="Referral, recruiter name, interview notes, etc."
            />
          </label>

          <TideButton type="submit" disabled={saving} className="disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </TideButton>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
