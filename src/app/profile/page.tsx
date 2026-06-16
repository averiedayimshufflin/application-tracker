'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/')
        return
      }

      if (data.user.user_metadata?.display_name) {
        router.replace('/dashboard')
        return
      }

      setLoading(false)
    })
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: name.trim(),
      },
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,255,1),_rgba(219,234,254,0.9))] px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
          <p className="text-center text-sm text-slate-500">Checking your sign in…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,255,1),_rgba(219,234,254,0.9))] px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Welcome to Arctic</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">What should we call you?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Tell us your name so the app can greet you and personalize your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm font-medium text-slate-700">
            Preferred name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Saving…' : 'Save name'}
          </button>
        </form>
      </div>
    </main>
  )
}
