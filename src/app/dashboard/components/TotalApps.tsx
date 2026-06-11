import { createClient } from '@/lib/supabase/client'

export default TotalApps = async () => {
  const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()

  const { data: allApplications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="bg-white rounded-lg shadow p-4"> 
        <h2 className="text-lg font-semibold mb-2">Total Applications</h2>
          <h1>{allApplications?.length ?? 0}</h1>
    </div>
  );
}