import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '../components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

    const { data: allApplications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

    const {data: pastWeekApp } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return (<>
  <div> Welcome {user.email}</div>
  <div>
    <h2>Dashboard</h2>
    <p>Internship Search</p>
    <SignOutButton />
  </div>
  <div>
    <h2>Total applications</h2>
    <h1>{allApplications?.length ?? 0}</h1>
    <p>{"+" + (pastWeekApp?.length ?? "No")} applications from the past week</p>
  </div>
</>);
}