import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (

    <>
    <a
  href="/applications/addApplication"
  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
>
  Add Application
</a>
    <main className="p-6">
      <h1 className="text-2xl font-bold">Applications</h1>

      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date Applied</th>
              <th className="p-4">Next Step</th>
            </tr>
          </thead>

          <tbody>
            {applications?.map((app) => (
              <tr key={app.id} className="border-b">
                <td className="p-4 font-medium"><a
  href={`/applications/${app.id}`}
  className="font-medium hover:underline"
>
  {app.company}
</a></td>
                <td className="p-4">{app.role}</td>
                <td className="p-4">{app.status}</td>
                <td className="p-4">
                  {app.date_applied
                    ? new Date(app.date_applied).toLocaleDateString()
                    : '—'}
                </td>
                <td className="p-4">{app.next_step || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
    </>
  )
}