'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit">Sign Out</button>
    </form>
  )
}