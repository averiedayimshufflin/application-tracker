import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileRow } from '@/lib/supabase/ensureProfile'
import { MotionPanel, OceanShell } from '@/app/components/OceanUI'

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

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: application } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!application) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('application_id', id)
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('application_id', id)
    .eq('user_id', user.id)

  async function deleteApplication() {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    if (!user.id) {
      console.error('Missing user id for contact insert', { user })
      return
    }

    await supabase.from('applications').delete().eq('id', id).eq('user_id', user.id)
    redirect('/application')
  }

  async function addContact(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const { error: profileError } = await ensureProfileRow(supabase, user)
    if (profileError) {
      console.error('Profile sync failed before contact insert', { userId: user.id, profileError })
      return
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    const notes = formData.get('notes') as string

    if (!name) return

    const payload = {
      user_id: user.id,
      application_id: id,
      name,
      email,
      role,
      company: application.company,
      notes,
    }

    const { error } = await supabase.from('contacts').insert(payload)
    if (error) {
      console.error('Contact insert failed for user:', user.id, { payload, error })
      return
    }

    redirect(`/application/${id}`)
  }

  const notesText = application.notes || ''
  const followUpDate = parseMetadata(notesText, 'Follow-up')
  const legacySalary = parseMetadata(notesText, 'Salary')
  const legacyResumeFile = parseMetadata(notesText, 'Resume')
  const cleanNotes = stripMetadata(notesText)

  return (
    <OceanShell>
      <div className="space-y-6">
        <MotionPanel className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/application" className="text-sm font-bold text-[#0a6871] hover:underline">
            &lt;- Back to applications
          </Link>

          <div className="flex gap-3">
            <Link href={`/application/${application.id}/edit`} className="ocean-button">
              Edit
            </Link>
            <form action={deleteApplication}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
              >
                Delete
              </button>
            </form>
          </div>
        </MotionPanel>

        <MotionPanel delay={0.05} className="ocean-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="seal-pill">Application shell</p>
              <h1 className="mt-3 text-3xl font-semibold text-[#103745]">{application.company}</h1>
              <p className="text-[#587071]">{application.role}</p>
            </div>

            <span className="rounded-full bg-[#d8f0ea] px-3 py-1 text-sm font-bold text-[#0a6871]">{application.status}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Location', application.location || '-'],
              ['Date applied', application.date_applied ? new Date(application.date_applied).toLocaleDateString() : '-'],
              ['Deadline', application.deadline ? new Date(application.deadline).toLocaleDateString() : '-'],
              ['Follow-up', followUpDate || '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
                <p className="text-sm font-semibold text-[#587071]">{label}</p>
                <p className="mt-1 text-[#103745]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Application URL</p>
              {application.job_url ? (
                <a href={application.job_url} target="_blank" className="mt-1 inline-flex font-bold text-[#0a6871] hover:underline">
                  View posting
                </a>
              ) : (
                <p className="mt-1 text-[#103745]">-</p>
              )}
            </div>
            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Salary</p>
              <p className="mt-1 text-[#103745]">{application.salary || legacySalary || '-'}</p>
            </div>
            <div className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
              <p className="text-sm font-semibold text-[#587071]">Resume file</p>
              <p className="mt-1 text-[#103745]">{application.resume_file || legacyResumeFile || '-'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-4">
            <h2 className="font-semibold text-[#103745]">Notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-[#587071]">{cleanNotes || 'No notes yet.'}</p>
          </div>
        </MotionPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <MotionPanel delay={0.1} className="ocean-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#103745]">Tide marks</h2>
              <Link href={`/event/add_event?from=/application/${application.id}`} className="text-sm font-bold text-[#0a6871] hover:underline">
                Add task
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-3">
                    <p className="font-semibold text-[#103745]">{event.title}</p>
                    <p className="text-sm text-[#587071]">
                      {event.type} · {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#587071]">No events yet.</p>
              )}
            </div>
          </MotionPanel>

          <MotionPanel delay={0.15} className="ocean-card p-6">
            <h2 className="text-lg font-semibold text-[#103745]">Contacts</h2>

            <form action={addContact} className="mt-4 space-y-3">
              <input name="name" required className="ocean-input" placeholder="Contact name" />
              <input name="email" type="email" className="ocean-input" placeholder="Email" />
              <input name="role" className="ocean-input" placeholder="Recruiter, interviewer, etc." />
              <textarea name="notes" className="ocean-input min-h-24" placeholder="Notes about this contact" />
              <button type="submit" className="ocean-button">
                Save contact
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div key={contact.id} className="rounded-2xl border border-[#b9ddd8]/70 bg-white/58 p-3">
                    <p className="font-semibold text-[#103745]">{contact.name}</p>
                    <p className="text-sm text-[#587071]">{contact.role || 'Contact'} · {contact.email || 'No email'}</p>
                    {contact.notes ? <p className="mt-2 text-sm text-[#587071]">{contact.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#587071]">No contacts yet.</p>
              )}
            </div>
          </MotionPanel>
        </div>
      </div>
    </OceanShell>
  )
}
