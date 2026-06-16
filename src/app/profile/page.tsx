'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FloatingSeal, MotionPanel, OceanShell, TideButton } from '../components/OceanUI'

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

      if (data.user?.user_metadata?.display_name || data.user?.user_metadata?.name) {
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      router.replace('/')
      return
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: name.trim(),
      },
    })

    if (authError) {
      setSaving(false)
      setError(authError.message)
      return
    }

    setSaving(false)

    router.push('/dashboard')
  }

  if (loading) {
    return (
      <OceanShell>
        <MotionPanel className="ocean-card mx-auto max-w-2xl p-10 text-center">
          <FloatingSeal className="mx-auto h-32 w-32" />
          <p className="mt-5 text-sm font-semibold text-[#587071]">Checking your sign in...</p>
        </MotionPanel>
      </OceanShell>
    )
  }

  return (
    <OceanShell>
      <MotionPanel className="ocean-card mx-auto max-w-2xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <FloatingSeal className="mx-auto h-28 w-28" />
          <p className="seal-pill mx-auto mt-5">Welcome aboard</p>
          <h1 className="mt-4 text-4xl font-semibold text-[#103745]">What should we call you?</h1>
          <p className="mt-3 text-sm leading-6 text-[#587071]">
            Tell us your name so the app can greet you and personalize your harbor dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm font-semibold text-[#315965]">
            Preferred name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="ocean-input mt-2"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

          <TideButton type="submit" disabled={saving} className="disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save name'}
          </TideButton>
        </form>
      </MotionPanel>
    </OceanShell>
  )
}
