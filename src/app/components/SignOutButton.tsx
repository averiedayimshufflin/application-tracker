'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function SignOutButton() {
  return (
    <form action={signOut} className="inline">
      <button
        type="submit"
        aria-label="Sign out"
        className="ocean-button-secondary focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white"
      >
        Sign out
      </button>
    </form>
  )
}
