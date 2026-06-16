import 'server-only'

type ProfileUser = {
  id: string
  email?: string | null
  user_metadata?: {
    name?: string | null
    display_name?: string | null
  } | null
}

export async function ensureProfileRow(supabase: unknown, user: ProfileUser) {
  const client = supabase as {
    from: (table: string) => {
      upsert: (
        value: { id: string; email: string | null; name: string | null },
        options?: { onConflict?: string }
      ) => Promise<{
        error: { code?: string; message?: string; details?: string | null; hint?: string | null } | null
      }>
    }
  }

  const { error } = await client.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      name:
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        user.email ??
        user.id,
    },
    { onConflict: 'id' }
  )

  return { error }
}
