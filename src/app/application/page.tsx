import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const params = await searchParams
  const search = params.search?.toLowerCase() ?? ''
  const status = params.status ?? ''

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const filteredApplications = (applications ?? []).filter((app) => {
    const matchesSearch =
      !search ||
      [app.company, app.role, app.location, app.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

    const matchesStatus = !status || app.status === status

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500">Manage your internship pipeline and follow-up plan.</p>
          </div>

          <a href="/application/addApplication" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            Add Application
          </a>
        </div>

        <form method="get" className="mb-6 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1.3fr_0.7fr_auto]">
          <input
            name="search"
            defaultValue={params.search ?? ''}
            placeholder="Search company, role, or notes"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />

          <select name="status" defaultValue={params.status ?? ''} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="">All statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="online_assessment">Online Assessment</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Filter
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Applied</th>
                <th className="p-4">Deadline</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className="border-b">
                  <td className="p-4 font-medium">
                    <a href={`/application/${app.id}`} className="font-medium text-blue-600 hover:underline">
                      {app.company}
                    </a>
                    <div className="mt-1 text-xs text-gray-500">{app.location || 'No location listed'}</div>
                  </td>
                  <td className="p-4">{app.role}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4">{app.deadline ? new Date(app.deadline).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No applications match your current filter.</div>
          ) : null}
        </div>
      </div>
    </main>
  )
}